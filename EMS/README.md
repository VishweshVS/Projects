# EMS - Employee Management System

EMS is a simple employee management portal built with a React/Vite frontend and a PHP/MySQL backend. The application provides authentication, role-based dashboard views, employee management screens, and a holiday calendar view for staff information.

## Features

- Secure login flow for employees and administrators
- Dashboard experience with role-based views for Admin, HR, Manager, and Employee
- Employee management UI for adding and editing records
- Holiday calendar view for displaying official holidays
- REST-style API endpoints served through a PHP entry point
- Responsive interface styled with modern React UI components

## Project Structure

- frontend/: React + Vite application
- backend/: PHP API layer, controllers, route handling, and database configuration
- package.json: root-level dependency metadata for the project workspace

## Tech Stack

- Frontend: React, Vite, React Router, Axios, lucide-react
- Backend: PHP, PDO, MySQL, Composer
- Authentication support: JWT-based token handling via firebase/php-jwt

## Prerequisites

Before running the project, make sure you have:

- PHP 8+
- Composer
- Node.js 18+
- MySQL server
- A local server stack such as XAMPP, WAMP, or MAMP

## Backend Setup

1. Start Apache and MySQL from your local server stack.
2. Create a MySQL database named ems_db.
3. Configure your database connection in backend/config/db.php if your credentials differ.
4. Place the project in your local web root (or adjust the API base URL if needed).

## Frontend Setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend will usually run at:

- http://localhost:5173

The backend API is expected to be available at:

- http://localhost/EMS/backend/index.php

If your local server root is different, update the base URL in frontend/src/services/api.js.

## Running the Application

- Start the PHP backend through your local web server.
- Start the Vite frontend with the command above.
- Open the frontend URL in your browser and sign in.

## Notes

- The current project is a working prototype and may still be under active refinement.
- Some features are UI-focused and may rely on matching backend endpoints and database tables.

## Updates in Progress

- Improving role-based access control and permissions
- Adding more employee management functionality and validation
- Expanding holiday management and calendar filtering
- Refining the dashboard layout and overall UI polish
