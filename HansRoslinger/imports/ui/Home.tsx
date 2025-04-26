import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
    <div className="p-8">
      <h1 className="font-bold text-3xl mb-4">Hans Roslinger</h1>
  
      <div>
        <h2 className="text-xl font-bold mb-4">Welcome to the Hans Roslinger Application</h2>
        
        <Link to="/gesture-recognition">
          <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Gesture Recognition
          </button>
        </Link>
        <Link to="/background-removal">
          <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Background Removal
          </button>
        </Link>
      </div>
    </div>
);

export default Home;