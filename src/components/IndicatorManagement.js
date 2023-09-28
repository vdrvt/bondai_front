import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig';

function IndicatorManagement() {
    const [indicatorName, setIndicatorName] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check if the input is empty
        if (!indicatorName.trim()) {
            alert("Indicator name can't be empty");
            return;
        }
        
        if (indicatorsList.some(indicator => indicator.name.toLowerCase() === indicatorName.toLowerCase())) {
            alert('This indicator already exists.');
            return;
        }
        
        try {
            // Make a POST request to your backend to save the new indicator name
            const response = await api.post('/indicators', {  // Assuming endpoint is /indicators/add for adding a new indicator
                name: indicatorName,
            });

            if (response.data && response.status === 201) {
                //console.log('Indicator added successfully:', response.data);
                
                // Fetch the updated list of indicators from the server
                fetchData();  // <-- Invoke fetchData here

                setIndicatorName('');  // Reset the input field
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === "Indicator already exists") {
                alert('This indicator already exists.');
            } else {
                console.error('Error adding indicator:', error);
                // Handle other types of errors
            }
        }    
    };

    const [indicatorsList, setIndicatorsList] = useState([]);

    const fetchData = async () => {
        //const response = await api.get('/indicators');
        //console.log("Fetched indicators:", response.data);
        try {
            const response = await api.get('/indicators');
            setIndicatorsList(response.data.data);
            //setIndicatorsList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    // Fetch data when the component mounts
    useEffect(() => {
        fetchData();
    }, []);

    // Function to delete the indicator
    const deleteIndicator = async (id) => {
        try {
            const response = await api.delete(`/indicators/${id}`);
            if (response.status === 200) {
                console.log('Indicator deleted successfully:', response.data);

                // Refresh the list to reflect the deletion
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting indicator:', error);
            // Handle errors, e.g., show a notification to the user
        }
    };    

    return (
        <div className="container mt-5">
            <h2>Add a New Indicator</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="indicatorName">Indicator Name:</label>
                    <input 
                        type="text"
                        className="form-control"
                        id="indicatorName"
                        placeholder="Enter indicator name"
                        value={indicatorName}
                        onChange={(e) => setIndicatorName(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Add Indicator</button>
            </form>
            
            {/* Display the list of indicators */}
            <div className="list-group mt-3">
                {indicatorsList.map((indicator) => (
                    <div key={indicator._id} className="indicator-item d-flex justify-content-between align-items-center">
                        {indicator.name}
                        <span role="img" aria-label="delete" style={{cursor: 'pointer'}} onClick={() => deleteIndicator(indicator._id)}>🗑️</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default IndicatorManagement;
