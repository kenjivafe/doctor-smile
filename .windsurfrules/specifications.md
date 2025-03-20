Doctor Smile – Dental Clinic Appointment System

1. Overview
   Doctor Smile is a modern dental clinic appointment system designed to streamline scheduling, patient management, and decision-making for dental professionals. The system allows patients to book appointments, dentists to manage availability, and both parties to track records efficiently.

2. Tech Stack
   Backend: Laravel 12, MySQL
   Frontend: React (Vibe Coding)
   UI: ShadCN UI + Tailwind CSS
   Icons: Lucide React
   Authentication: Basic auth with role-based access control (Admin (optional), Dentist, Patient)
   Real-time updates: WebSockets for instant status updates
   Mobile-friendly & responsive: Fully optimized for mobile and desktop

3. Core Features
   A. Appointment Management
   ✅ Patients can book appointments based on available time slots
   ✅ Dentists can approve, suggest a new time, or reject appointments
   ✅ Patients must confirm or cancel the dentist’s suggested time
   ✅ Appointment status updates in real time

B. Time Availability & Scheduling
✅ Dentists can manually set available working hours
✅ Supports appointment reallocation and rescheduling
✅ Integrates with Google Calendar for seamless scheduling

C. Cancellations & Reminders
✅ Patients can cancel their appointments before a set deadline
✅ Email reminders via SMTP for upcoming appointments

D. Payments & Billing
✅ Stripe integration (starting with test mode)
✅ Option for future expansion to include insurance payments

E. Decision Support & Analytics
✅ Admin dashboard with insights (appointment trends, peak hours, patient stats)
✅ Data-driven recommendations for better time management

F. Patient Record Management
✅ Patients can log in and view their appointment history & personal details
✅ Dentists can update patient records if needed

4. User Roles & Permissions
   Role Permissions
   Admin (Optional) Full system control, access all data, manage users, and view analytics
   Dentist Approve/reject appointments, manage availability, access patient records, view analytics
   Patient Book/cancel appointments, view appointment history, receive reminders

5. Data Models
   Patient Table
   Column Name Data Type Description
   id UUID Unique identifier
   name String Full name
   address String Residential address
   contact_number String Phone number
   gender Enum Male, Female, Other
   age Integer Patient’s age
   email String Login email
   Appointment Table
   Column Name Data Type Description
   id UUID Unique identifier
   patient_id UUID References patients.id
   dentist_id UUID References users.id (dentist)
   reason Text Reason for appointment
   date Date Scheduled date
   time Time Scheduled time
   status Enum Pending, Approved, Rejected, Cancelled

6. Integrations
   ✅ Google Calendar – Sync appointments
   ✅ Stripe – Process payments
   ✅ SMTP Email – Send reminders & notifications
   ✅ WebSockets – Real-time updates

7. Future Enhancements (Optional)
   AI-powered appointment recommendations based on past trends
   Video consultation for remote dental checkups
   Multi-clinic support
