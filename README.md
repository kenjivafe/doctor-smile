# Doctor Smile - Dental Clinic Appointment System

![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

## Overview
Doctor Smile is a modern dental clinic appointment system designed to streamline scheduling, patient management, and decision-making for dental professionals. The system allows patients to book appointments, dentists to manage availability, and both parties to track records efficiently.

> **Note:** This project is currently under active development and not yet ready for production use.
![Screenshot 2025-03-20 165010](https://github.com/user-attachments/assets/d736bb74-93c6-4356-be05-5e27e0321ee3)
![Screenshot 2025-03-20 165035](https://github.com/user-attachments/assets/c40664be-7829-4a55-86b8-812ef26c9cf1)
![Screenshot 2025-03-20 165100](https://github.com/user-attachments/assets/16392286-486f-4fd3-9a10-2d7f4b16cb66)
![Screenshot 2025-03-20 165211](https://github.com/user-attachments/assets/d9bcaabc-bd8b-4278-8b4c-81fc78048a8e)
![Screenshot 2025-03-20 154430](https://github.com/user-attachments/assets/b3ee4493-9365-447f-91a2-8f398e76b247)

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
