# Doctor Smile - Dental Clinic Appointment System

![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

## Overview
Doctor Smile is a modern dental clinic appointment system designed to streamline scheduling, patient management, and decision-making for dental professionals. The system allows patients to book appointments, dentists to manage availability, and both parties to track records efficiently.

> **Note:** This project is currently under active development and not yet ready for production use.

## Tech Stack

### Backend
- Laravel 12 with React Starter Kit
- MySQL database
- Basic Auth + Role-Based Access Control (Admin, Dentist, Patient)
- WebSockets for real-time updates

### Frontend
- React with TypeScript
- ShadCN UI + Tailwind CSS
- Lucide React icons
- Mobile-friendly & responsive design

## Current Development Status

### Completed
- ✅ Basic Laravel 12 with React setup
- ✅ User authentication system implementation
- ✅ Role-based access control (Admin, Dentist, Patient)
- ✅ Role-specific dashboard components

### In Progress
- 🔄 Database schema implementation
- 🔄 Models and relationships development
- 🔄 Appointment management functionality

### Planned
- 📝 Patient appointment booking interface
- 📝 Dentist appointment approval workflow
- 📝 Google Calendar integration
- 📝 Stripe payment integration
- 📝 Email reminder system

## Installation (Development Environment)

> ⚠️ **Warning:** These instructions are for development purposes only as the application is not yet complete.

1. Clone the repository
```bash
git clone https://github.com/yourusername/doctor-smile.git
cd doctor-smile
```

2. Install dependencies
```bash
composer install
npm install
```

3. Copy the environment file and configure your database
```bash
cp .env.example .env
php artisan key:generate
```

4. Set up the database
```bash
php artisan migrate
php artisan db:seed
```

5. Start the development server
```bash
# Using Laravel Herd or your preferred server

# For front-end development
npm run dev
```

## Features & Roadmap

### Core Features (In Development)
- Appointment Management
  - Patients select date/time
  - Dentists approve, suggest a new time, or reject
  - Patients confirm or cancel suggested time
  - Payment happens when the patient confirms

- Time Availability & Scheduling
  - Dentists manually set available working hours
  - Support for appointment reallocation
  - Google Calendar integration

- Analytics & Decision Support
  - Admin dashboard with insights
  - Data-driven recommendations

## License
This project is licensed under the [MIT License](LICENSE).
