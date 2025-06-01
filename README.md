# Doctor Smile - Dental Clinic Appointment System

![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

## Overview
Doctor Smile is a modern dental clinic appointment system designed to streamline scheduling, patient management, and decision-making for dental professionals. The system allows patients to book appointments, dentists to manage availability, and both parties to track records efficiently.

> **Note:** This project is currently under active development and not yet ready for production use.

![Screenshot 2025-03-20 154430](https://github.com/user-attachments/assets/b3ee4493-9365-447f-91a2-8f398e76b247)
![Screenshot 2025-03-20 165010](https://github.com/user-attachments/assets/d736bb74-93c6-4356-be05-5e27e0321ee3)
![Screenshot 2025-03-20 165035](https://github.com/user-attachments/assets/c40664be-7829-4a55-86b8-812ef26c9cf1)
![Screenshot 2025-03-20 165100](https://github.com/user-attachments/assets/16392286-486f-4fd3-9a10-2d7f4b16cb66)
![Screenshot 2025-03-20 165211](https://github.com/user-attachments/assets/d9bcaabc-bd8b-4278-8b4c-81fc78048a8e)

## Tech Stack

### Backend
- Laravel 12 with React Starter Kit
- MySQL database
- Basic Auth + Role-Based Access Control (Admin, Dentist, Patient)
- WebSockets for real-time updates
- Inertia.js for frontend-backend integration

### Frontend
- React with TypeScript
- ShadCN UI + Tailwind CSS v4.0.0
- Lucide React icons
- Mobile-friendly & responsive design
- Nunito font from Google Fonts

## Current Development Status

### Completed
- ✅ Basic Laravel 12 with React setup
- ✅ User authentication system implementation
- ✅ Role-based access control (Admin, Dentist, Patient)
- ✅ Role-specific middleware for route protection
- ✅ Role-specific dashboard components with real data
- ✅ Database schema implementation (User, Patient, Appointment, DentalService)
- ✅ Models and relationships development
- ✅ User seeding with admin and dentist test accounts
- ✅ Custom Nunito font integration
- ✅ Patient profile completion and management
- ✅ Patient appointment booking interface
- ✅ Dentist working hours management
- ✅ Appointment collision prevention
- ✅ Integration of appointment booking with dentist's schedule
- ✅ Patient balance tracking and update functionality
- ✅ Enhanced patient details page with proper data display
- ✅ Complete appointment approval workflow with confirmation dialogs
- ✅ Appointment cancellation system with reason tracking
- ✅ Email notification system for appointments and reminders
- ✅ Comprehensive cancellation dialogs for both patients and dentists
- ✅ Removed specialty field from dentist forms to align with database schema
- ✅ Improved dentist form layouts for better user experience
- ✅ Added Dental Services to Admin Panel

### In Progress
- 🔄 Admin panel implementation with enhanced permissions
- 🔄 Advanced admin analytics and reporting
- 🔄 Real-time updates via WebSockets

### Planned
- 📝 Google Calendar integration
- 📝 Multi-clinic support (future expansion)

## Installation (Development Environment)

> ⚠️ **Warning:** These instructions are for development purposes only as the application is not yet complete.

1. Clone the repository
```bash
git clone https://github.com/kenjivafe/doctor-smile.git
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

## Default Users

The database seeder creates the following test accounts:

### Admin User
- Email: admin@doctorsmile.com
- Password: password

### Dentist Users
- Dr. John Smith (john.smith@doctorsmile.com) - Password: password
- Dr. Sarah Johnson (sarah.johnson@doctorsmile.com) - Password: password
- Dr. Michael Chen (michael.chen@doctorsmile.com) - Password: password
- Dr. Emily Rodriguez (emily.rodriguez@doctorsmile.com) - Password: password

## Features & Roadmap

### Core Features
- Appointment Management
  - Patients select date/time
  - Dentists approve, suggest a new time, or reject
  - Patients confirm or cancel suggested time
  - Payment happens when patient confirms

- Time Availability & Scheduling
  - Dentists manually set available working hours
  - Support for appointment reallocation

- Patient Record Management
  - Patient profiles with medical history
  - Appointment history tracking
  - Balance tracking and update functionality

- Analytics & Decision Support
  - Admin dashboard with insights
  - Data-driven recommendations
  - Appointment trends visualization

## License
This project is licensed under the [MIT License](LICENSE).
