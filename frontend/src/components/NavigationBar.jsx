import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavigationBar() {
  const location = useLocation();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Therapist Scheduling
        </Link>
        <div className="flex gap-4">
          <Link 
            to="/"
            className={`${location.pathname === '/' ? 'text-white' : 'text-blue-200'}`}
          >
            Branches
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;