# Technical Documentation

This document provides a technical overview of the Life Time project, a web application with a Django backend and a React frontend.

## 1. Project Overview

The Life Time project is a social platform that allows users to create detailed profiles, likely for matchmaking or social networking purposes. Users can register, log in, and manage their profiles, including personal information, education, work experience, and preferences.

## 2. Backend (Django)

The backend is built using the Django framework and Django REST Framework to provide a RESTful API for the frontend.

### 2.1. Technologies

- **Framework:** Django
- **API:** Django REST Framework
- **Database:** PostgreSQL (using `psycopg2-binary`)
- **CORS:** `django-cors-headers`
- **Authentication:** Token-based authentication

### 2.2. Project Structure

```
backend/
├── api/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── life_time/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
└── requirements.txt
```

### 2.3. Data Models (`api/models.py`)

The application uses several Django models to represent the data:

- **`Profile`**: The main model, containing detailed information about a user. It has a one-to-one relationship with the `User` model.
- **`Education`**: Stores the user's educational background.
- **`WorkExperience`**: Stores the user's work history.
- **`UserLanguage`**: Stores the languages a user knows.
- **`Preference`**: Stores the user's preferences for a potential match.
- **`AdditionalImage`**: Stores additional images for a user's profile.

### 2.4. API Endpoints (`api/urls.py`, `api/views.py`)

The backend exposes the following API endpoints:

- **`POST /api/register/`**: Creates a new user and returns an authentication token.
- **`POST /api/login/`**: Authenticates a user and returns an authentication token.
- **`GET /api/user/`**: Retrieves information about the currently authenticated user.
- **`/api/profiles/`**: A `ModelViewSet` that provides full CRUD (Create, Read, Update, Delete) functionality for the `Profile` model.
  - `GET /api/profiles/`: List the profiles for the current user.
  - `POST /api/profiles/`: Create a new profile for the current user.
  - `GET /api/profiles/{id}/`: Retrieve a specific profile.
  - `PUT /api/profiles/{id}/`: Update a specific profile.
  - `PATCH /api/profiles/{id}/`: Partially update a specific profile.
  - `DELETE /api/profiles/{id}/`: Delete a specific profile.

## 3. Frontend (React)

The frontend is a single-page application (SPA) built using React.

### 3.1. Technologies

- **Framework:** React
- **Routing:** `react-router-dom`
- **HTTP Client:** `axios`
- **Styling:** Tailwind CSS
- **UI Components:** `lucide-react`, `react-icons`
- **Animation:** `framer-motion`

### 3.2. Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── ...
```

### 3.3. Components

The `src/components/` directory contains reusable UI components used throughout the application.

### 3.4. Pages and Routing (`src/App.js`)

The application consists of the following main pages:

- **`/login`**: The login page.
- **`/register`**: The user registration page.
- **`/profile`**: The user's profile page. This is a private route, accessible only to authenticated users.
- **`/profile/edit/:id`**: A page for editing a user's profile. This is also a private route.

The application uses a `PrivateRoute` component to protect routes that require authentication.

### 3.5. State Management (`src/context/AuthContext.js`)

The application uses a React Context (`AuthContext`) to manage the user's authentication state (the authentication token) across the application.

### 3.6. API Communication (`src/services/api.js`)

The `axios` library is used to communicate with the backend API. The base URL for the API is configured in `package.json` using the `proxy` setting:

`"proxy": "http://127.0.0.1:8000"`

## 4. Setup and Running the Project

### 4.1. Backend

1.  Navigate to the `backend` directory.
2.  Install the required Python packages: `pip install -r requirements.txt`
3.  Set up the database in `life_time/settings.py`.
4.  Run database migrations: `python manage.py migrate`
5.  Start the Django development server: `python manage.py runserver`

### 4.2. Frontend

1.  Navigate to the `frontend` directory.
2.  Install the required Node.js packages: `npm install`
3.  Start the React development server: `npm start`
