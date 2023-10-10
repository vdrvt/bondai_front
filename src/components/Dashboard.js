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
            <div className="bond-score">
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





        </div>//BONDAI DASHBOARD
    );
}

export default Dashboard;
