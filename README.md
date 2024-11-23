# Therapist Scheduling System

A comprehensive web application for managing therapist schedules across multiple branches with specific business rules and requirements.

## Features

### 1. Shift Management
- Support for three shift types:
  - Shift 1 (Morning): 09:00 - 18:00
  - Shift Middle: 11:30 - 20:30
  - Shift 2 (Evening): 13:00 - 22:00
- Six working days per week (excluding national holidays and weekends)
- Shift codes: 1 (Shift 1), M (Middle), 2 (Shift 2), X (Leave Request)

### 2. Leave Request Management
- Leave requests blocked for:
  - Saturdays
  - Sundays
  - National holidays
- Flexible leave request system without rigid limits
- Visual indication for leave requests (yellow highlighting)
- Branch-specific prefix/suffix rules for "X" entries
- Maximum 2 male therapists allowed to take leave on the same day

### 3. Staffing Requirements
- Weekdays: 2-3 therapists per shift
- Weekends: 4-5 therapists per shift
- Minimum requirements:
  - Shift 1 and Middle: At least 1 male therapist each
  - Shift 2: Must exceed combined therapist count of Shift 1 and Middle

### 4. Branch-Specific Rules
- Darmo Branch:
  - Maximum 3 therapists in Shift 1 regardless of gender
- Dieng Branch:
  - Maximum 3 therapists in Shift 1
  - Male therapists only scheduled on weekends

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- shadcn/ui components
- React Router for navigation
- Context API for state management

### Backend Dependencies
- Node.js
- Express.js
- PostgreSQL database

## Installation

1. Clone the repository:
```bash
git clone https://github.com/theoxgn/Therapist-Scheduling-System.git
```

2. Install dependencies:
```bash
cd [directory]
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### Branch Management
- View all branches
- Add new branches with specific rules
- Configure branch-specific settings

### Therapist Management
- Add/Edit therapists
- Assign therapists to branches
- Manage therapist availability

### Schedule Management
- Create and modify schedules
- Handle leave requests
- Validate scheduling rules
- View schedule conflicts

## Business Rules Implementation

### Schedule Creation Rules
- System validates all minimum staffing requirements
- Prevents schedule conflicts
- Enforces branch-specific maximums
- Blocks invalid leave requests
- Ensures male therapist distribution rules
- Handles branch-specific notations

### Gender-Based Scheduling
- Mandatory male therapist presence in shift 1 and Middle
- Tracks gender distribution across shifts
- Implements branch-specific gender maximums

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- shadcn/ui for the component library
- Lucide React for icons
- Tailwind CSS for styling
- React development team
