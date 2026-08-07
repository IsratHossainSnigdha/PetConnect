# 🐾 PetConnect

> **Connecting Loving Homes with Shelters, One Adoption at a Time.**

PetConnect is a **database-driven web application** designed to connect potential pet adopters with animal shelters through a centralized platform. The system allows adopters to discover pets available for adoption, while shelters can manage pet listings and handle adoption applications efficiently.

The platform also includes an **Admin** role for managing and overseeing the overall system.

---

## 📚 Problem Statement

People who want to adopt pets often have difficulty finding reliable information about animals available for adoption. They may have to search through different social media pages, websites, or contact shelters individually.

At the same time, animal shelters need an organized way to manage their pets, adoption applications, and shelter information.

PetConnect addresses these challenges by providing a centralized database-based platform where:

- Adopters can discover pets from registered shelters.
- Shelters can manage their pets and adoption applications.
- Administrators can manage and monitor the platform.

---

## 💡 Solution

PetConnect provides a centralized platform connecting **Adopters**, **Shelters**, and **Administrators**.

### 👤 Adopters

Adopters can:

- Create an account
- Browse available pets
- Search and filter pets
- View detailed pet information
- Submit adoption requests
- Track adoption request status
- Manage their profile

### 🏠 Shelters

Shelters can:

- Create and manage shelter accounts
- Manage shelter information
- Add pets available for adoption
- Update pet information
- Remove or update pet listings
- View adoption applications
- Approve or reject adoption requests
- Manage adoption records

### 🛠️ Administrators

Administrators can:

- Manage users
- Manage shelters
- Manage pet listings
- Monitor adoption activities
- Manage system data
- Maintain the overall platform

---

# ✨ Features

## 👤 Adopter

- User Registration & Login
- Browse Available Pets
- Search & Filter Pets
- View Pet Details
- Submit Adoption Requests
- Track Adoption Request Status
- Manage Personal Profile

## 🏠 Shelter

- Shelter Registration & Login
- Shelter Dashboard
- Manage Shelter Profile
- Add New Pets
- Update Pet Information
- Manage Pet Availability
- View Adoption Applications
- Approve or Reject Adoption Requests
- Manage Adoption Records

## 🛠️ Admin

- Admin Login
- Admin Dashboard
- Manage Users
- Manage Shelters
- Manage Pets
- Monitor Adoption Requests
- Manage System Data

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- React Router DOM
- CSS
- JavaScript

## Backend

- Laravel
- PHP
- RESTful API

## Database

- MySQL

---

# 📁 Project Structure

```text
PetConnect/
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   ├── composer.lock
│   ├── package.json
│   ├── phpunit.xml
│   └── vite.config.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   │   ├── DashboardPages/
│   │   │   │   ├── adminDashboard.jsx
│   │   │   │   ├── adopterDashboard.jsx
│   │   │   │   └── shelterDashboard.jsx
│   │   │   ├── LandingPage/
│   │   │   │   └── landingPage.jsx
│   │   │   └── SignupPages/
│   │   │       ├── adminSignup.jsx
│   │   │       ├── adopterSignup.jsx
│   │   │       ├── globalSignup.jsx
│   │   │       └── shelterSignup.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed on your system:

- Node.js
- npm
- PHP 8.x
- Composer
- MySQL
- Git

---

## 📥 Clone the Repository

```bash
git clone <repository-url>
cd PetConnect
```

---

# 🎨 Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Laravel dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

---

## 🗄️ Database Configuration

Create a MySQL database named:

```text
petconnect
```

Then configure the database connection in the `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=petconnect
DB_USERNAME=root
DB_PASSWORD=
```

Run the database migrations:

```bash
php artisan migrate
```

If the project contains seeders, run:

```bash
php artisan db:seed
```

Or run migrations and seeders together:

```bash
php artisan migrate --seed
```

---

## ▶️ Run the Backend

Start the Laravel development server:

```bash
php artisan serve
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

---

# 🗄️ Database

PetConnect is a **database-based application** built using a relational MySQL database.

The database is responsible for storing and managing information related to:

- Users
- Adopters
- Shelters
- Pets
- Species
- Breeds
- Adoption Applications
- Adoption Records

The relational database design allows the system to maintain relationships between users, shelters, pets, and adoption applications while ensuring data consistency and integrity.

---

# 📄 Current Pages

| Page | Route |
|------|-------|
| Landing Page | `/` |
| Adopter Sign Up | `/signup/adopter` |
| Shelter Sign Up | `/signup/shelter` |
| Admin Sign Up | `/signup/admin` |
| Adopter Dashboard | `/adopter-dashboard` |
| Shelter Dashboard | `/shelter-dashboard` |
| Admin Dashboard | `/admin-dashboard` |

> Additional pages and routes will be added as development progresses.

---

# 🔐 User Roles

PetConnect supports three main user roles:

| Role | Description |
|------|-------------|
| 👤 Adopter | Searches for pets and submits adoption requests |
| 🏠 Shelter | Manages pets and handles adoption applications |
| 🛠️ Admin | Manages and monitors the overall platform |

---

# 🔄 Adoption Workflow

The general adoption workflow is:

```text
Adopter
   │
   ▼
Browse Available Pets
   │
   ▼
View Pet Details
   │
   ▼
Submit Adoption Request
   │
   ▼
Shelter Reviews Request
   │
   ├── Reject ──► Request Rejected
   │
   └── Approve ─► Adoption Approved
                         │
                         ▼
                  Adoption Record
```

---

# 👥 Team

- **Israt Hossain Snigdha**
- **Ishrat Jahan Ifa**
- **Shaikh Tashrik Halim Samudra**

---

# 🤝 Contributing

Before starting any task, make sure your local repository is up to date:

```bash
git pull origin main
```

Create a new feature branch:

```bash
git checkout -b feature/your-feature-name
```

After completing your work:

```bash
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature-name
```

Then create a Pull Request for review.

---

# 📌 Git Ignore

The following files and directories should not be committed to the repository:

```gitignore
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.vite/

# Backend
backend/vendor/
backend/.env

# General
.DS_Store
coverage/
```

---

# 📜 License

This project is developed as part of a **Database Management System (DBMS)** course project.

---

# 🎯 Vision

Our vision is to create a reliable and user-friendly platform that bridges the gap between animal shelters and potential adopters.

PetConnect aims to make pet adoption **more accessible, organized, and transparent**, while helping shelters efficiently manage their animals and adoption processes and giving more pets the opportunity to find safe and loving forever homes.