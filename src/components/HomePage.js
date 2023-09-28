import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="homepage-container">
            <h1>BOND Score Prototype</h1>
            <div className="options">
                <Link to="/indicator-management" className="option">
                    <h2>Indicators</h2>
                    <p>Click here to add or manage indicators</p>
                </Link>
                <Link to="/value-management" className="option">
                    <h2>Values</h2>
                    <p>Click here to add values to existing indicators</p>
                </Link>
                <Link to="/industry-value-management" className="option">
                    <h2>Industry Values</h2>
                    <p>Click here to add industry min and max values</p>
                </Link>
                <Link to="/set-management" className="option">   {/* New tile for Calculation Sets */}
                    <h2>Calculation Sets</h2>
                    <p>Click here to setup calculation sets</p>
                </Link>
                <Link to="/dashboard" className="option">  
                    <h2>Dashboard</h2>
                    <p>Click here to see the magic💫</p>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
