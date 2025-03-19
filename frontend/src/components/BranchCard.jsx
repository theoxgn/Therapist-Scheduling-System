import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const BranchCard = ({ branch, onScheduleClick, onTherapistsClick, onDelete }) => {
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
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
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
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
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
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  };

  const handleNavigation = (tutorialType) => {
    switch (tutorialType) {
      case 'viewSchedule':
        onScheduleClick();
        break;
      case 'manageSchedule':
        navigate(`/schedule/manage/${branch.branchCode}`);
        break;
      case 'therapists':
        onTherapistsClick();
        break;
      default:
        console.log('Unknown tutorial type');
        break;
    }
  };

  const Tutorial = ({ content, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            {content.icon}
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">{content.description}</p>

        <div className="space-y-6">
          {content.features && (
            <section className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-blue-800">Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.rules && (
            <section className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-purple-800">Scheduling Rules</h3>
              <ul className="space-y-2">
                {content.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 font-medium mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.shifts && (
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Shift Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {content.shifts.map((shift, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-200 bg-white">
                    <span className="font-medium text-blue-600 mr-2">{shift.code}</span>
                    <span className="text-gray-600">{shift.time}</span>
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
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Got it, let's go!
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{branch.name}</h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="bg-gray-100 rounded-md px-2 py-1 font-medium text-gray-700">
                {branch.branchCode}
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => onDelete(branch.branchCode)}
              className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600"
              title="Delete branch"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">{branch.address}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-sm text-blue-600">Max Shift 1</div>
              <div className="font-bold text-blue-800">{branch.maxTherapistsShift1 || 0}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <div className="text-sm text-purple-600">Restrictions</div>
              <div className="font-bold text-purple-800">{
                (branch.genderRestrictionFlag && branch.weekendOnlyMaleFlag) 
                  ? '2 Active' 
                  : (branch.genderRestrictionFlag || branch.weekendOnlyMaleFlag) 
                    ? '1 Active'
                    : 'None'
              }</div>
            </div>
          </div>
        </div>

        {/* Tags/Restrictions */}
        <div className="flex flex-wrap gap-2 mb-5">
          {branch.genderRestricted && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              Gender Restricted
            </span>
          )}
          {branch.weekendOnlyMale && (
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              Weekend Only Male
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowTutorial('viewSchedule')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>View Schedule</span>
          </button>
          <button
            onClick={() => setShowTutorial('manageSchedule')}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Manage Schedule</span>
          </button>
          <button
            onClick={() => setShowTutorial('therapists')}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Therapists</span>
          </button>
          <button
            onClick={() => navigate(`/branches/${branch.branchCode}/shift-settings`)}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>
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
    maxShift1Therapists: PropTypes.number,
    genderRestricted: PropTypes.bool,
    weekendOnlyMale: PropTypes.bool
  }).isRequired,
  onScheduleClick: PropTypes.func.isRequired,
  onTherapistsClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default BranchCard;