import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig';

function SetManagement() {
    const [indicators, setIndicators] = useState([]);
    const [weights, setWeights] = useState({});
    const [clientName, setClientName] = useState('');
    const [sets, setSets] = useState([]);
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

        const fetchSets = async () => {
            try {
                const response = await api.get('/sets');
                setSets(response.data.data);
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
        };

        fetchIndicators();
        fetchSets();
    }, []);

    const handleWeightChange = (indicatorId, event) => {
        setWeights(prevWeights => ({
            ...prevWeights,
            [indicatorId]: event.target.value
        }));
    };

    const totalWeight = Object.values(weights).reduce((acc, weight) => acc + Number(weight), 0);

    const handleSubmit = async () => {

        if (totalWeight > 100) {
            alert('Total weight cannot exceed 100.');
            return;
        }

        try {
            const dataToSend = {
                clientName: clientName,
                indicators: Object.entries(weights).map(([id, weight]) => ({ indicator: id, weight: Number(weight) }))
            };
            const response = await api.post('/sets', dataToSend);
            if (response.status === 201) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 1500); // reset after 1.5 seconds

                // Reset the client name and weights
                setClientName('');
                setWeights({});

                // Fetch and update sets after the submission
                const updatedSets = await api.get('/sets');
                setSets(updatedSets.data.data);

            }
            console.log('Set saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving set:', error);
        }
    };

    return (
        <div className="value-management-container">
            <h2 className="value-management-header">Calculation Set Management</h2>
            
            <div style={{ marginBottom: '20px' }}>
            <label htmlFor="clientName">Client Name:</label>
                <input 
                    type="text"
                    className="form-control"
                    id="clientName"
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                />
            </div>
            <table className="value-management-table">
                <thead>
                    <tr>
                        <th>Indicator</th>
                        <th>Weight</th>
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
                                    value={weights[indicator._id] || ''}
                                    onChange={(e) => handleWeightChange(indicator._id, e)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                Total Weight: {totalWeight}
            </div>

            <button 
                className={`value-submit-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSubmit}>
                Submit Set
            </button>

            {/* Display the list of sets */}
            <div className="list-group mt-3">
                {sets.map((set) => (
                    <div key={set._id} className="indicator-item d-flex justify-content-between align-items-center">
                        {set.clientName}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SetManagement;


