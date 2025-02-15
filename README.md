# FindDoctor - Frontend

FindDoctor is a React-based frontend for the online doctor consultation platform. It provides user authentication, doctor profiles, appointment booking, real-time chat, and video call integration.

## Features

- **User Authentication** with JWT.
- **Email OTP Verification** for user registration.
- **Doctor Profiles** with availability slots.
- **Appointment Booking System** for easy scheduling.
- **Real-time Chat** using WebSockets.
- **Video Call Integration** with Ziggo Cloud.
- **Payment Integration** with Razorpay and VALET.
- **Redux Toolkit** for global state management.
- **Admin Dashboard** with graphical data representation using Apex Charts.
- **Fully Responsive UI** built with React, Tailwind CSS, and Material UI.

## Installation

### Prerequisites

- Node.js (>=14.x)
- npm or yarn

### Setup Instructions

1. Clone the repository:
   ```sh
   git clone https://github.com/bisher-muhammed/doctor-Find-frontend.git
   cd doctor-Find-frontend
   ```
2. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
3. Create a `.env` file and configure API endpoints:
   ```sh
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   REACT_APP_RAZORPAY_KEY=your_razorpay_key
   ```
4. Start the development server:
   ```sh
   npm run dev  # or yarn start
   ```

## Running with Docker

1. Build and start the container:
   ```sh
   docker-compose up --build
   ```
2. Stop the container:
   ```sh
   docker-compose down
   ```






