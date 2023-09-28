import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig';

function IndustryValueManagement() {
    const [indicators, setIndicators] = useState([]);
    const [industryValues, setIndustryValues] = useState({});
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                const response = await api.get('/indicators');
                setIndicators(response.data.data);
            } catch (error) {
                console.error('Error fetching indicators:', error);
            }
        };
        fetchIndicators();

        const fetchIndustryValues = async () => {
            try {
                const response = await api.get('/industryValues');
                const fetchedValues = response.data.data.reduce((acc, currentValue) => {
                    acc[currentValue.indicator._id] = {
                        industryMin: currentValue.industryMin,
                        industryMax: currentValue.industryMax
                    };
                    return acc;
                }, {});
                setIndustryValues(fetchedValues);
            } catch (error) {
                console.error('Error fetching industry values:', error);
            }
        };
        fetchIndustryValues();
    }, []);

    // const handleValueChange = (indicatorId, type, event) => {
    //     setIndustryValues(prevValues => ({
    //         ...prevValues,
    //         [indicatorId]: {
    //             ...prevValues[indicatorId],
    //             [type]: event.target.value
    //         }
        
    //     }));
    // };
    const handleValueChange = (indicatorId, type, event) => {
        setIndustryValues(prevValues => {
            const value = Number(event.target.value);  // Convert the value to a number
            
            const updatedValues = {
                ...prevValues,
                [indicatorId]: {
                    ...prevValues[indicatorId],
                    [type]: value
                }
            };
            
            console.log(updatedValues);  // Log the updated state
            return updatedValues;
        });
    };
    
    // const handleValueChange = (indicatorId, type, event) => {
    //     const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    
    //     setIndustryValues(prevValues => ({
    //         ...prevValues,
    //         [indicatorId]: {
    //             ...prevValues[indicatorId],
    //             [type]: value
    //         }
    //     }));
    // };
    

    const handleSubmit = async () => {
        try {
            const response = await api.post('/industryValues', industryValues);
            if (response.status === 201) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 1500); // reset after 1.5 seconds
            }
            console.log('Industry values saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving industry values:', error);
        }
    };
    
    return (
        <div className="value-management-container">
            <h2 className="value-management-header">Industry Value Management</h2>
            <table className="value-management-table">
                <thead>
                    <tr>
                        <th>Indicator</th>
                        <th>Industry Min</th>
                        <th>Industry Max</th>
                    </tr>
                </thead>
                <tbody>
                    {indicators.map(indicator => (
                        <tr key={indicator._id}>
                            <td className="indicator-cell">{indicator.name}</td>
                            <td className="value-input-cell">
                                <input 
                                    type="number"
                                    className="value-input"
                                    value={industryValues[indicator._id]?.industryMin || ''}
                                    onChange={(e) => handleValueChange(indicator._id, 'industryMin', e)}
                                />
                            </td>
                            <td className="value-input-cell">
                                <input 
                                    type="number"
                                    className="value-input"
                                    value={industryValues[indicator._id]?.industryMax || ''}
                                    onChange={(e) => handleValueChange(indicator._id, 'industryMax', e)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button 
                className={`value-submit-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSubmit}>
                Submit Industry Values
            </button>
        </div>
    );
}

export default IndustryValueManagement;
