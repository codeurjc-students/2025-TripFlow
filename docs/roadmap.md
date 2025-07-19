# 🗺️ TripFlow - Development Roadmap

> **Project Deadline**: June 2026
> 
> This roadmap outlines the development phases and tasks for the TripFlow TFG project.
> Each phase might be modified based on project progress and requirements.

---

## 📅 Basic Functionality - MVP (deadline: 1 December 2025)

### 🔧 Backend

- [X] {API} Health Check endpoint - `GET /api/health`
- [X] {DB} PostgreSQL database setup and integration with Spring Boot JPA
- [X] Spring Boot security configuration with JWT
    - [X] {Model} User entity with roles
    - [X] {API} Register endpoint - `POST /api/auth/register`
    - [X] {API} Login endpoint - `POST /api/auth/login`
    - [X] {API} Logout endpoint - `POST /api/auth/logout`
    - [X] {API} Refresh Token endpoint - `POST /api/auth/refresh`
- [ ] Itinerary management logic
    - [ ] {Model} Itinerary entity
    - [ ] {Model} Itinerary Day entity
    - [ ] {Model} Activity entity
    - [ ] {Model} Location entity
    - [ ] {API} Create Itinerary endpoint - `POST /api/v1/itineraries`
    - [ ] {API} Get Itineraries endpoint - `GET /api/v1/itineraries`
    - [ ] {API} Get Itinerary by ID endpoint - `GET /api/v1/itineraries/{id}`
    - [ ] {API} Update Itinerary endpoint - `PUT /api/v1/itineraries/{id}`
    - [ ] {API} Delete Itinerary endpoint - `DELETE /api/v1/itineraries/{id}`

### ⚛️ Frontend

- [ ] {UI} Landing page with basic information - `/`
- [ ] {UI} User registration form - `/signup`
- [ ] {UI} User login form - `/login`
- [ ] {UI} User dashboard - `/dashboard`
- [ ] {UI} Itineraries list view - `/itineraries`
- [ ] {UI} Itinerary details view - `/itineraries/{id}`
- [ ] {UI} Itinerary edit form - `/itineraries/{id}/edit`
- [ ] {UI} Itinerary creation form - `/itineraries/new`
- [ ] {UI} Profile page (simplified) for logout - `/profile`
- [ ] {UI} 404 Not Found page - `/404`
- [ ] {API} Integration with backend endpoints using Axios

### ⚙️ Testing

- [X] {Unit-Backend} User service tests (registration, login, logout, token refresh)
- [ ] {Unit-Backend} Itinerary service tests (CRUD operations)
- [X] {Unit-Backend} JWT Security tests (token generation, validation)
- [ ] {Unit-Frontend} Authentication form validation tests
- [ ] {Unit-Frontend} Itinerary creation and editing tests
- [ ] {Component-Frontend} Navigation and routing tests
- [ ] {Integration-Backend} API endpoint tests (RestAssured + Postman)
    - [X] {Integration-Backend} User authentication endpoints
    - [ ] {Integration-Backend} Itinerary endpoints
- [ ] {Integration-Frontend} Frontend-backend communication tests
- [ ] {E2E} User flow tests (Puppeteer)
- [ ] {Security} Authorization tests for protected resources

---

## 📦 Docker + CI/CD (deadline: 15 December 2025)

- [ ] {Docker} Dockerfile for backend service
- [ ] {Docker} Dockerfile for frontend service
- [ ] {Docker} Docker Compose setup for development environment
- [ ] {CI/CD} GitHub Actions pipeline for testing
- [ ] {CI/CD} GitHub Actions pipeline for building and deploying Docker images
- [ ] {Deployment} Vercel + Render

---

## 🚀 Advanced Features V1 (deadline: 15 March 2026)

### 🔧 Backend

- [ ] {Feature} AI-Powered Itinerary Generation (OpenRouter)
    - [ ] {API} AI Generation endpoint - `POST /api/v1/ai/generate`
    - [ ] {Model} AI Logs entity for tracking requests and usage
    - [ ] {Pattern} AI response caching and rate limiting (Decorator)
    - [ ] {API} AI logs endpoint - `GET /api/v1/ai/logs`
- [ ] {Feature} User profile management
    - [ ] {API} Avatar upload endpoint - `POST /api/v1/users/{id}/avatar`
    - [ ] {API} Avatar retrieval endpoint - `GET /api/v1/users/{id}/avatar`
    - [ ] {API} User profile endpoint - `GET /api/v1/users/{id}`
    - [ ] {API} User profile update endpoint - `PUT /api/v1/users/{id}`
    - [ ] {API} User account deletion endpoint - `DELETE /api/v1/users/{id}`
- [ ] {Feature} User Statistics endpoint - `GET /api/v1/stats`

### ⚛️ Frontend

- [ ] {Feature} AI Itinerary Generation UI
    - [ ] {UI} AI Screen for prompting and displaying logs - `/ai`
    - [ ] {UI} AI Logs Component for displaying AI request history
- [ ] {UI} Stats Component for displaying user statistics
- [ ] {Feature} User Profile Component for displaying and editing user profile
    - [ ] {UI} Avatar upload and display
    - [ ] {UI} User profile details and edit form

### ⚙️ Testing

- [ ] {Unit-Backend} AI Generation service tests (OpenRouter integration, caching)
- [ ] {Unit-Backend} User profile service tests (avatar upload, profile CRUD)
- [ ] {Unit-Backend} User statistics service tests (data calculation and aggregation)
- [ ] {Unit-Backend} AI Logs service tests (request tracking and retrieval)
- [ ] {Unit-Frontend} AI Generation UI tests (form validation, API integration)
- [ ] {Unit-Frontend} User profile component tests (avatar upload, form handling)
- [ ] {Unit-Frontend} Stats component tests (data display and formatting)
- [ ] {Unit-Frontend} AI Logs component tests (history display and filtering)
- [ ] {Integration-Backend} AI Generation endpoint tests (with mocked OpenRouter)
- [ ] {Integration-Backend} User profile endpoints tests (file upload, data validation)
- [ ] {Integration-Backend} Statistics endpoint tests (database queries and responses)
- [ ] {Integration-Frontend} AI workflow tests (generate → display → save)
- [ ] {Integration-Frontend} Profile management workflow tests (upload → update → delete)
- [ ] {E2E} Complete AI itinerary generation flow
- [ ] {E2E} Complete user profile management flow
- [ ] {Security} Rate limiting tests for AI endpoint

---

## 🛠️ Advanced Features V2 (deadline: 15 April 2026)

### 🔧 Backend

- [ ] {Feature} Preferences management for AI generation
    - [ ] {Model} User Preferences entity
    - [ ] {API} Preferences endpoint - `GET /api/v1/users/{id}/preferences`
    - [ ] {API} Update Preferences endpoint - `PUT /api/v1/users/{id}/preferences`
- [ ] {Feature} Route optimization algorithms
    - [ ] {Algorithm} TSP optimization (?)
    - [ ] {API} Route optimization endpoint - `POST /api/v1/route/optimize`
- [ ] {Feature} Achievements and experience points system
    - [ ] {Model} Achievement entity
    - [ ] {API} Achievements endpoint - `GET /api/v1/achievements?status={ALL|USER}`
    - [ ] {API} Headers based achievement tracking

### ⚛️ Frontend

- [ ] {Feature} Preferences UI for AI generation
    - [ ] {UI} Preferences Component for managing user preferences - `settings`
- [ ] {Feature} Route optimization UI
    - [ ] {UI} Route optimization interface and controls
    - [ ] {Component} Route optimization results display
    - [ ] {Integration} Integration with route optimization API
- [ ] {Feature} Achievements and gamification UI
    - [ ] {Component} Achievement progress tracking and display
    - [ ] {Component} Achievement notification system
    - [ ] {UI} User experience points and level display
- [ ] {PWA} Progressive Web App features
    - [ ] {Feature} Available to install on mobile devices

### ⚙️ Testing

- [ ] {Unit-Backend} User Preferences service tests (CRUD operations)
- [ ] {Unit-Backend} Route optimization algorithm tests (TSP implementation)
- [ ] {Unit-Backend} Achievement service tests
- [ ] {Unit-Frontend} Preferences component tests
- [ ] {Unit-Frontend} Route optimization UI tests
- [ ] {Unit-Frontend} Achievement components tests
- [ ] {Integration-Backend} Preferences endpoints tests
- [ ] {Integration-Backend} Achievement system tests
- [ ] {Integration-Frontend} Preferences workflow tests
- [ ] {E2E} Complete preferences management flow
- [ ] {E2E} Complete route optimization flow (select → optimize → save)

---

## ⭐ Nice-to-Have Features (not prioritized)

- [ ] {Feature} PDF Export of itineraries
- [ ] {Feature} Offline access to itineraries
- [ ] {Feature} Nominatim integration for location search

---