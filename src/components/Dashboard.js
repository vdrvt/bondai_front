// Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactSpeedometer from "react-d3-speedometer";
import { Link } from 'react-router-dom';
import api from '../axiosConfig';

function Dashboard() {
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [indicatorsWithWeights, setIndicatorsWithWeights] = useState([]);
    const [error, setError] = useState(null);
    const [values, setValues] = useState({});
    const [industryValues, setIndustryValues] = useState({});
    const [bondScore, setBondScore] = useState(0);
    const [isCalculated, setIsCalculated] = useState(false);
    const [animatedBondScore, setAnimatedBondScore] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(false); // New state variable

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const response = await api.get('/sets');
                setSets(response.data.data);
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
        };
        fetchSets();
    }, []);

    useEffect(() => {
        if (indicatorsWithWeights.length && Object.keys(values).length && Object.keys(industryValues).length) {
            const calculatedBondScore = indicatorsWithWeights.reduce((totalScore, indicatorWithWeight) => {
                const indicatorValue = values[indicatorWithWeight.indicator._id] || 0;
                const industryMin = industryValues[indicatorWithWeight.indicator._id]?.industryMin || 0;
                const industryMax = industryValues[indicatorWithWeight.indicator._id]?.industryMax || 0;
                
                let normalizedValue = 0;

                if (industryMin === 0 && industryMax === 0) {
                    // Handle the case where industryMin and industryMax are both zero
                    // Set normalizedValue to a default value or handle it in some other way
                    normalizedValue = 0; 
                } else {
                    // Calculate normalized value
                    normalizedValue = Math.max((indicatorValue - industryMin) / (industryMax - industryMin), 0);
                }
                // Return the accumulated score
                return totalScore + (normalizedValue * indicatorWithWeight.weight);
            }, 0);
    
            setBondScore(calculatedBondScore);
            setIsCalculated(true);
            setShouldAnimate(true);
        }
    }, [indicatorsWithWeights, values, industryValues]);

    useEffect(() => {
        let timer;
        if (shouldAnimate) {
            let increment = bondScore / 100;
            setAnimatedBondScore(0); // Reset animated BOND score to zero
            const scoreElement = document.getElementById("animated-score");
    
            // Synchronized animation
            timer = setInterval(() => {
                setAnimatedBondScore((prev) => {
                    const newScore = prev + increment;
                    if (newScore >= bondScore) {
                        clearInterval(timer);
                        setShouldAnimate(false); // Reset the animation state
                        scoreElement.textContent = bondScore.toFixed(2);
                        return bondScore;
                    }
                    scoreElement.textContent = newScore.toFixed(2);
                    return newScore;
                });
            }, 15);
        }
    
        return () => clearInterval(timer); // Cleanup
    }, [shouldAnimate, bondScore]);
    
    

    const handleSetChange = (event) => {
        setSelectedSet(event.target.value);
    };

    const handleCalculate = async () => {
        console.log(selectedSet);
        try {
            const response = await api.get(`/sets/${selectedSet}/indicators`);
            setIndicatorsWithWeights(response.data.data);
    
            const valuesResponse = await api.get('/values');
            const fetchedValues = valuesResponse.data.data.reduce((acc, currentValue) => {
                acc[currentValue.indicator._id] = currentValue.value;
                return acc;
            }, {});
            setValues(fetchedValues);

            const indResponse = await api.get('/industryValues');
            const fetchedIndValues = indResponse.data.data.reduce((acc, currentValue) => {
                acc[currentValue.indicator._id] = {
                    industryMin: currentValue.industryMin,
                    industryMax: currentValue.industryMax
                };
                return acc;
            }, {});
            setIndustryValues(fetchedIndValues);
            console.log(fetchedIndValues);


        } catch (error) {
            setError("Error fetching data.");
            console.error('Error:', error);
        }
    };
    

    return (
        <div className="value-management-container">
            <h2 className="value-management-header">BONDAI Dashboard</h2>

            <div className="form-group">
                <label htmlFor="setSelection">Choose your set:</label>
                <select 
                    id="setSelection"
                    value={selectedSet}
                    onChange={handleSetChange}
                    className="form-control value-input"  // This class ensures consistent styling
                >
                    <option value="" disabled hidden>Select a set</option>
                    {sets.map(set => (
                        <option key={set._id} value={set._id}>
                            {set.clientName}
                        </option>
                    ))}
                </select>
            </div>
            
            <button 
                className="btn btn-primary value-submit-btn"
                onClick={handleCalculate}
                disabled={!selectedSet}
            >
                Calculate
            </button>


            <div className="tile-container">
                {indicatorsWithWeights.map((indicatorWithWeight, index) => {
                    const indicatorValue = values[indicatorWithWeight.indicator._id] || 0;
                    const industryMin = industryValues[indicatorWithWeight.indicator._id]?.industryMin;
                    const industryMax = industryValues[indicatorWithWeight.indicator._id]?.industryMax;  // default to 100 if no max value
                    console.log('Indicator:', indicatorWithWeight.indicator.name, 'Min:', industryMin, 'Max:', industryMax);

                    return (
                        <div key={index} className="gauge-meter">
                            <Link to={`/indicator/${indicatorWithWeight.indicator._id}`}>
                                <label>{indicatorWithWeight.indicator.name}</label>
                                <ReactSpeedometer 
                                    forceRender={true}
                                    needleTransitionDuration={600}
                                    value={indicatorValue}
                                    minValue={industryMin}
                                    maxValue={industryMax}
                                    width={220} 
                                    height={140}
                                    needleHeightRatio={0.8}
                                />
                            </Link>
                        </div>
                    );
                })}
            </div>
              
            {/* Displaying the BOND score */}
            <div className="bond-score" style={{ marginTop: '40px' }}>
                <h2 className="bond-score">
                    YOUR BOND SCORE is <span id="animated-score">0</span>
                </h2>
            </div>
            <div className="bond-gauge">
                <div 
                    className="bond-gauge-fill" 
                    style={{ transition: "width 1.5s ease-in-out", width: `${bondScore}%` }}
                >
                </div>
            </div>

            {isCalculated && (

                <div className="report-section" style={{ marginTop: '40px' }}>
                    <h2>Loyalty Program Analysis Report</h2>

                    <h3>BONDAI Insights:</h3>
                    <ul>
                        <li><strong>Strong Client Retention:</strong> The Client's Retention Rate of 75% is commendable, particularly in the wealth management industry where trust and consistent performance are paramount. This suggests that the loyalty program and other client relations strategies might be effective.</li>
                        <li><strong>Low Engagement with the Program:</strong> The Program Active Rate is only slightly above the industry minimum, indicating that a significant number of clients aren't actively participating in the loyalty program.</li>
                        <li><strong>Customer Satisfaction:</strong> A high CSAT score of 80% is indicative of general satisfaction with the services provided. However, there seems to be a mismatch between this satisfaction and program engagement, suggesting that while clients might be happy with wealth management services, the loyalty program itself might not be as appealing.</li>
                        <li><strong>Low Intended Redemption:</strong> The intended redemption rate is barely above the industry minimum. This implies that the rewards or benefits offered by the loyalty program might not be perceived as valuable by the clients.</li>
                        <li><strong>Data Gaps in Activity Metrics:</strong> Both the Activity Level and FA activity level are at 0, which could be due to data collection issues or genuine inactivity. This is concerning, especially for a wealth management firm, as regular activity often signifies client engagement and trust.</li>
                    </ul>

                    <h3>Recommendations:</h3>
                    <ul>
                        <li><strong>Enhance Loyalty Program Offerings:</strong> Given the low Program Active Rate and Intended Redemption Rate, it's crucial to revisit the rewards/benefits of the loyalty program. Consider conducting surveys or focus groups with clients to understand what they value.</li>
                        <li><strong>Correlation between CSAT and Engagement:</strong> Dive deeper to understand why there's a high CSAT score but low engagement with the loyalty program. If clients are satisfied with the primary service but not engaging with the program, there might be a disconnect in how the program aligns with client needs.</li>
                        <li><strong>Education and Awareness:</strong> It's possible clients aren't fully aware of the loyalty program or its benefits. Host webinars or workshops explaining the program and its advantages.</li>
                        <li><strong>Data Collection and Analysis:</strong> Address the data gaps in activity metrics. Regular activity is a vital indicator in wealth management. Investigate if it's a data collection issue or if clients genuinely aren't engaging. If it's the latter, strategies need to be implemented to increase activity.</li>
                        <li><strong>Tie Loyalty Rewards to Wealth Management Goals:</strong> Instead of generic rewards, consider offering benefits that align with wealth management objectives, such as exclusive market insights, access to premium investment opportunities, or personalized financial planning sessions.</li>
                    </ul>

                    <h3>Correlations and Interdependencies:</h3>
                    <ul>
                        <li><strong>Client Retention and CSAT:</strong> High CSAT might be contributing to the strong retention rate. Happy clients tend to stay. However, to ensure long-term retention, both service quality and loyalty program engagement are essential.</li>
                        <li><strong>Program Active Rate and Intended Redemption:</strong> Low engagement with the program can directly correlate with low intended redemption rates. If clients don't see value in the program, they won't engage or plan to redeem rewards.</li>
                        <li><strong>CSAT and Program Active Rate:</strong> The disconnect between these two suggests that while the core service (wealth management) is appreciated, the loyalty program isn't resonating with clients.</li>
                    </ul>

                    <p>In conclusion, the loyalty program's objective to reduce churn and retain clients seems to be somewhat achieved given the high retention rate. However, for it to be a holistic success, a more in-depth analysis of program offerings and client perceptions is needed.</p>
                </div>


            )}

        </div>//BONDAI DASHBOARD
    );
}

export default Dashboard;
