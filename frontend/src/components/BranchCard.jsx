import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Calendar, Users, ChevronRight } from 'lucide-react';

const BranchCard = ({ branch }) => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  const tutorials = {
    viewSchedule: {
      title: "View Schedule",
      description: "View and monitor therapist schedules in a calendar format.",
      features: [
        "Two-week schedule view",
        "Color-coded shift indicators",
        "Leave request status",
        "Filter by therapist or shift"
      ],
      icon: Calendar
    },
    manageSchedule: {
      title: "Manage Schedule",
      description: "Create and modify therapist schedules with complete control.",
      features: [
        "Drag-and-drop scheduling",
        "Automatic rule validation",
        "Leave request management",
        "Shift distribution overview"
      ],
      rules: [
        "Weekdays: 2-3 therapists per shift",
        "Weekends: 4-5 therapists per shift",
        "At least 1 male therapist in Shift 1 and Middle shift",
        "Maximum 2 male therapists on leave per day"
      ],
      shifts: [
        { code: "1", time: "09:00 - 18:00" },
        { code: "M", time: "11:30 - 20:30" },
        { code: "2", time: "13:00 - 22:00" },
        { code: "X", time: "Leave Request" }
      ],
      icon: Calendar
    },
    therapists: {
      title: "Manage Therapists",
      description: "Add, edit, and organize therapists for this branch.",
      features: [
        "Therapist profiles",
        "Skill management",
        "Availability settings",
        "Performance tracking"
      ],
      icon: Users
    }
  };

  const handleNavigation = (tutorialType) => {
    switch (tutorialType) {
      case 'viewSchedule':
        navigate(`/schedule/${branch.branchCode}`);
        break;
      case 'manageSchedule':
        navigate(`/schedule/manage/${branch.branchCode}`);
        break;
      case 'therapists':
        navigate(`/therapists/${branch.branchCode}`);
        break;
      default:
        console.log('Unknown tutorial type');
        break;
    }
  };

  const Tutorial = ({ content, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <content.icon className="w-6 h-6 text-blue-500" />
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">{content.description}</p>

        <div className="space-y-4">
          {content.features && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Features</h3>
              <ul className="grid grid-cols-2 gap-2">
                {content.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.rules && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Scheduling Rules</h3>
              <ul className="space-y-2">
                {content.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500 font-medium">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.shifts && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Shift Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {content.shifts.map((shift, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-blue-500">{shift.code}</span>
                    <span className="text-gray-600 ml-2">{shift.time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <button
          onClick={() => {
            onClose();
            handleNavigation(showTutorial);
          }}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{branch.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{branch.branchCode}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">{branch.address}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">
            Max Shift 1 Therapists: {branch.maxShift1Therapists}
          </p>
          <p className="text-sm text-gray-500">
            Gender Restricted: {branch.genderRestricted ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-500">
            Weekend Only Male: {branch.weekendOnlyMale ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowTutorial('viewSchedule')}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex-1"
        >
          <Calendar className="w-4 h-4" />
          View Schedule
        </button>
        <button
          onClick={() => setShowTutorial('manageSchedule')}
          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex-1"
        >
          <Calendar className="w-4 h-4" />
          Manage Schedule
        </button>
        <button
          onClick={() => setShowTutorial('therapists')}
          className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm flex-1"
        >
          <Users className="w-4 h-4" />
          Therapists
        </button>
        <button
          onClick={() => navigate(`/branches/${branch.branchCode}/shift-settings`)}
          className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          Shift Settings
        </button>
      </div>

      {showTutorial && (
        <Tutorial
          content={tutorials[showTutorial]}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

BranchCard.propTypes = {
  branch: PropTypes.shape({
    branchCode: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    // maxShift1Therapists: PropTypes.number.isRequired,
    // genderRestricted: PropTypes.bool.isRequired,
    // weekendOnlyMale: PropTypes.bool.isRequired
  }).isRequired
};

export default BranchCard;