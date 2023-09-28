import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';

// Importing your components
import HomePage from './components/HomePage';
import IndicatorManagement from './components/IndicatorManagement';
import ValueManagement from './components/ValueManagement';
import IndustryValueManagement from './components/IndustryValueManagement';
import SetManagement from './components/SetManagement';
import Dashboard from './components/Dashboard';

import './App.css';

function App() {
  return (
    <Router>
      <div className="container mt-5">
        <Routes>
          {/* The homepage route */}
          <Route path="/" element={<HomePage />} />

          {/* The indicator management route */}
          <Route path="/indicator-management" element={<IndicatorManagement />} />

          {/* The value management route */}
          <Route path="/value-management" element={<ValueManagement />} />

          {/* The industry value management route */}
          <Route path="/industry-value-management" element={<IndustryValueManagement />} />

          {/* The sets management route */}
          <Route path="/set-management" element={<SetManagement />} />

          {/* The sets management route */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
