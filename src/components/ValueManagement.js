import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig'; 

function ValueManagement() {
    const [indicators, setIndicators] = useState([]);
    const [values, setValues] = useState({});
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

        const fetchValues = async () => {
            try {
                const response = await api.get('/values');
                const fetchedValues = response.data.data.reduce((acc, currentValue) => {
                    acc[currentValue.indicator._id] = currentValue.value;
                    return acc;
                }, {});
                setValues(fetchedValues);
            } catch (error) {
                console.error('Error fetching values:', error);
            }
        };
        fetchValues();
    }, []);

    const handleValueChange = (indicatorId, event) => {
        setValues(prevValues => ({
            ...prevValues,
            [indicatorId]: event.target.value
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await api.post('/values', values);
            if (response.status === 201) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 1500); // reset after 1.5 seconds
            }
            console.log('Values saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving values:', error);
        }
    };
    
    return (
        <div className="value-management-container">
            <h2 className="value-management-header">Value Management</h2>
            <table className="value-management-table">
                <thead>
                    <tr>
                        <th>Indicator</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {indicators.map(indicator => (
                        <tr key={indicator._id}>
                            <td className="indicator-cell">{indicator.name}</td>
                            <td className="value-input-cell">
                                <input 
                                    type="text"
                                    className="value-input"
                                    value={values[indicator._id] || ''}
                                    onChange={(e) => handleValueChange(indicator._id, e)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button 
                className={`value-submit-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSubmit}>
                Submit Values
            </button>
        </div>
    );
}

export default ValueManagement;
