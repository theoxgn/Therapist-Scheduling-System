import React from 'react';

function ScheduleGuide({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">How to Use Schedule Management</h2>
        
        <div className="space-y-4">
          <section>
            <h3 className="font-semibold text-lg mb-2">Basic Navigation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the calendar picker to select a date</li>
              <li>Navigate between weeks using the arrow buttons</li>
              <li>View two weeks of schedule at a time</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">Managing Shifts</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Click on any cell to cycle through shifts: 1 → M → 2 → X</li>
              <li>Shift 1: 09:00 - 18:00</li>
              <li>Shift M (Middle): 11:30 - 20:30</li>
              <li>Shift 2: 13:00 - 22:00</li>
              <li>X: Leave Request</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">Rules & Restrictions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Weekdays: 2-3 therapists per shift required</li>
              <li>Weekends: 4-5 therapists per shift required</li>
              <li>At least 1 male therapist in Shift 1 and Middle shift</li>
              <li>Maximum 2 male therapists can take leave on the same day</li>
              <li>Leave requests not allowed for weekends</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">Branch-Specific Rules</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium mb-2">Darmo Branch:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Maximum 3 therapists in Shift 1</li>
              </ul>
              
              <p className="font-medium mb-2 mt-4">Dieng Branch:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Male therapists can only be scheduled on weekends</li>
              </ul>
            </div>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default ScheduleGuide;