import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [indicator, setIndicator] = useState('');
  const [value, setValue] = useState('');  // <-- New state for the value

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Indicator:', indicator, 'Value:', value);
    
    try {
        // Make a POST request to your backend to save the indicator and its value
        const response = await axios.post('/indicators', {
            name: indicator,  // Assuming your backend expects "indicatorName"
        });

        // Handle the response, for instance, you can set some state or show a notification
        if (response.data && response.status === 200) {
            console.log('Data saved successfully:', response.data);

            // Fetch the updated list of indicators from the server
            fetchData();  // <-- Invoke fetchData here

            // Optionally reset the input fields after successful submission
            setIndicator('');  // Assuming you use setIndicator to manage the indicator state
            setValue('');      // Assuming you use setValue to manage the value state
        }
    } catch (error) {
        console.error('Error saving data:', error);
        // Handle errors, for instance, you can set some state or show an error notification to the user
    }
};

  const [indicatorsList, setIndicatorsList] = useState([]);

const fetchData = async () => {
    try {
        const response = await axios.get('/indicators');
        setIndicatorsList(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


  return (
    <div className="container mt-5">
      <h2>Input Indicator and Value</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="indicator">Indicator:</label>
          <input 
            type="text" 
            className="form-control" 
            id="indicator" 
            placeholder="Enter indicator" 
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
          />
        </div>
        <div className="form-group">  {/* New input field for the value */}
          <label htmlFor="value">Value:</label>
          <input 
            type="text" 
            className="form-control" 
            id="value" 
            placeholder="Enter value" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      <div className="list-group mt-3">
        {indicatorsList.map((indicator) => (
          <div key={indicator._id} className="indicator-item">
            {indicator.name}
            <span className="indicator-value">{indicator.value}</span>
          </div>
        ))}
      </div>
    </div>

  );
}

export default App;
