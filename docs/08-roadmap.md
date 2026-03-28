# 🗺️ TripFlow - Development Roadmap

> **Project Deadline**: June 2026
>
> This roadmap outlines the development phases and tasks for the TripFlow TFG project.
> Each phase might be modified based on project progress and requirements.

---

## 📅 Basic Functionality - MVP (deadline: 15 December 2025)

### 🔧 Backend

- [x] {API} Health Check endpoint - `GET /api/health`
- [x] {DB} PostgreSQL database setup and integration with Spring Boot JPA
- [x] Spring Boot security configuration with JWT
  - [x] {Model} User entity with roles
  - [x] {API} Register endpoint - `POST /api/auth/register`
  - [x] {API} Login endpoint - `POST /api/auth/login`
  - [x] {API} Logout endpoint - `POST /api/auth/logout`
  - [x] {API} Refresh Token endpoint - `POST /api/auth/refresh`
- [x] Itinerary management logic
  - [x] {Model} Itinerary entity
  - [x] {Model} Itinerary Day entity
  - [x] {Model} Activity entity
  - [x] {Model} Location entity
  - [x] {API} Create Itinerary endpoint - `POST /api/v1/itineraries`
  - [x] {API} Get Itineraries endpoint - `GET /api/v1/itineraries`
  - [x] {API} Get Itinerary by ID endpoint - `GET /api/v1/itineraries/{id}`
  - [x] {API} Update Itinerary endpoint - `PUT /api/v1/itineraries/{id}`
  - [x] {API} Delete Itinerary endpoint - `DELETE /api/v1/itineraries/{id}`
- [x] Stats logic
  - [x] {API} User Stats endpoint - `GET /api/v1/stats/user`

### ⚛️ Frontend

- [x] {UI} Landing page with basic information - `/`
- [x] {UI} User registration form - `/signup`
- [x] {UI} User login form - `/login`
- [x] {UI} User dashboard - `/dashboard`
- [x] {UI} Itineraries list view - `/itineraries`
- [x] {UI} Itinerary details view - `/itineraries/{id}`
- [x] {UI} Itinerary edit form - `/itineraries/{id}/edit`
- [x] {UI} Itinerary creation form - `/itineraries/new`
- [x] {UI} Profile page (simplified) for logout - `/profile`
- [x] {UI} 404 Not Found page - `/404`
- [x] {UI} Demo mode
- [x] {API} Integration with backend endpoints

### ⚙️ Testing

- [x] {Unit-Backend} User service tests (registration, login, logout, token refresh)
- [x] {Unit-Backend} Itinerary service tests (CRUD operations)
- [x] {Unit-Backend} JWT Security tests (token generation, validation)
- [x] {Unit-Frontend} Component tests for landing page, buttons, headers, etc.
- [x] {Unit-Frontend} Authentication form validation tests
- [x] {Unit-Frontend} Itinerary creation and editing tests
- [x] {Component-Frontend} Navigation and routing tests
- [x] {Integration-Backend} API endpoint tests (RestAssured + Postman)
  - [x] {Integration-Backend} User authentication endpoints
  - [x] {Integration-Backend} Itinerary endpoints
- [x] {Integration-Frontend} Frontend-backend communication tests
- [x] {E2E} User flow tests (Puppeteer)
- [x] {Security} Authorization tests for protected resources

---

## 📦 Docker + CI/CD (deadline: 15 December 2025)

- [x] {Docker} Dockerfile for backend service
- [x] {Docker} Dockerfile for frontend service
- [x] {Docker} Docker Compose setup for development environment
- [x] {CI/CD} GitHub Actions pipeline for testing
- [x] {CI/CD} GitHub Actions pipeline for building and deploying Docker images

---

## 🚀 Advanced Features V1 (deadline: 1 March 2026)

### 🔧 Backend

- [x] {Feature} AI-Powered Itinerary Generation
  - [x] {API} AI Generation endpoint - `POST /api/v1/ai`
  - [x] {API} AI Status endpoint - `GET /api/v1/ai/status`
  - [x] {Model} AI Logs entity for tracking requests and usage
  - [x] {Pattern} AI response rate limiting (daily limit per user)
- [x] {Feature} User profile management
  - [x] {API} Avatar upload endpoint - `POST /api/v1/users/{username}/avatar`
  - [x] {API} Avatar retrieval endpoint - `GET /api/v1/users/{username}/avatar`
  - [x] {API} User profile endpoint - `GET /api/v1/users/{username}`
  - [x] {API} User profile update endpoint - `PUT /api/v1/users/{username}`
  - [x] {API} User account deletion endpoint - `DELETE /api/v1/users/{username}`
- [x] {Feature} Admin Panel Backend
  - [x] {API} Get all users - `GET /api/v1/users`
  - [x] {API} Delete user - `DELETE /api/v1/users/{username}`
  - [x] {Security} Role-based access control `ROLE_ADMIN`
- [x] {Feature} Microservices Architecture (Kafka + WebSocket)
  - [x] {Infra} Kafka setup in Docker Compose
  - [x] {Service} API Service (main REST API)
  - [x] {Service} AI Service (AI generation microservice)
  - [x] {Service} Notification Service (WebSocket notifications)
  - [x] {Module} Common module for shared DTOs and utilities
  - [x] {Event} `AIRequestMessage` (API → AI Service)
  - [x] {Event} `AIGenerationMessage` (AI Service → API Service)
  - [x] {Event} `NotificationMessage` (API Service → Notification Service)
  - [x] {Event} `EmailMessage` (API Service → Notification Service)
  - [x] {Kafka} API Service: Produces `ai-request`, `notification`, `email`; Consumes `ai-generation`
  - [x] {Kafka} AI Service: Consumes `ai-request`; Produces `ai-generation`
  - [x] {Kafka} Notification Service: Consumes `notification`, `email`
  - [x] {DB} H2 database for secondary microservices (AI Service, Notification Service)
- [x] {Feature} Email System
  - [x] {Service} Email service for sending emails
- [x] {Feature} Real-time Notifications System
  - [x] {Model} Notification entity (in Notification Service)
  - [x] {WebSocket} STOMP WebSocket configuration
  - [x] {WebSocket} JWT authentication for WebSocket connections
  - [x] {WebSocket} User-specific notification queues
  - [x] {Service} WebSocket notification push service
  - [x] {Optimization} Configurable heartbeat intervals (1000ms for low latency)
- [x] {Feature} Unsplash API Integration
  - [x] {Service} Unsplash API client for destination images
  - [x] {Cache} Results caching for image queries


### ⚛️ Frontend

- [x] {Feature} AI Itinerary Generation UI
  - [x] {UI} AI Generation form in dashboard - `/dashboard`
  - [x] {UI} Advanced options (budget, pace, accommodation)
  - [x] {UI} AI usage tracking and rate limit display
  - [x] {UI} Loading states and error handling
- [x] {Feature} User Profile Component
  - [x] {UI} Avatar upload and display
  - [x] {UI} User profile details and editable form
  - [x] {UI} Account deletion UI
- [x] {Feature} Real-time Notifications UI
  - [x] {Provider} WebSocket provider with STOMP client
  - [x] {Provider} Notification provider for UI notifications
  - [x] {Hook} `useWebSocketNotifications` - Generic hook for WebSocket subscriptions
  - [x] {Hook} `useNotifications` - Visual notification display
  - [x] {UI} Toast notifications with customizable duration
  - [x] {Feature} Auto-refresh on notifications
    - [x] Itineraries list auto-refresh on `ITINERARY_GENERATED`
    - [x] Recent itineraries auto-refresh on `ITINERARY_GENERATED`
    - [x] User stats auto-refresh on `ITINERARY_GENERATED`
- [x] {Feature} Verification Code UI
  - [x] {UI} Verification code flow when registering new user and email verification
- [x] {Feature} Admin Panel UI
  - [x] {UI} Admin dashboard - `/admin`
  - [x] {UI} Users table (delete, filter)
  - [x] {Security} Admin-only route guards
- [x] {Feature} Unsplash Integration UI
  - [x] {UI} Replace itinerary icons with Unsplash images
  - [x] {UI} Lazy loading + placeholders


### ⚙️ Testing

- [x] {Unit-Backend} AI Generation service tests (OpenRouter integration, rate limiting)
- [x] {Unit-Backend} AI Logs service tests (request tracking and retrieval)
- [x] {Unit-Backend} Kafka producer/consumer tests
- [x] {Unit-Backend} Notifications service tests
- [x] {Unit-Backend} User profile service tests (avatar upload, profile CRUD)
- [x] {Integration-Backend} AI Generation endpoint tests
- [x] {Integration-Backend} User profile endpoints tests (file upload, data validation)
- [x] {Unit-Frontend} User profile component tests (avatar upload, form handling)
- [x] {Unit-Frontend} Notifications component tests
- [x] {Unit-Frontend} Admin panel component tests
- [x] {E2E} Complete AI itinerary generation flow
- [x] {E2E} Complete user profile management flow
- [x] {E2E} Complete admin panel flow

---

## 🛠️ Advanced Features V2 (deadline: 15 April 2026)

### 🔧 Backend

- [x] {Feature} Collaborative Itineraries
  - [x] {Model} Collaboration entity (User-Itinerary-Role)
  - [x] {API} Invite user endpoint - `POST /api/v1/itineraries/{itineraryId}/collaborators`
  - [x] {API} Accept invitation endpoint - `PUT /api/v1/itineraries/{itineraryId}/collaborators/{username}/accept`
  - [x] {API} Decline invitation endpoint - `DELETE /api/v1/itineraries/{itineraryId}/collaborators/{username}/decline`
  - [x] {API} Pending invitations endpoint - `GET /api/v1/users/{username}/invitations`
  - [x] {API} Get collaborators endpoint - `GET /api/v1/itineraries/{itineraryId}/collaborators`
  - [x] {API} Update collaborator role endpoint - `PUT /api/v1/itineraries/{itineraryId}/collaborators/{username}`
  - [x] {API} Remove collaborator endpoint - `DELETE /api/v1/itineraries/{itineraryId}/collaborators/{username}`
  - [x] {Access} Permission logic (VIEWER, EDITOR, OWNER + invitation status PENDING/ACCEPTED)
  - [x] {Event} Collaboration events and notifications (invite, accept, decline)
  - [x] {WebSocket} Real-time collaboration refresh synchronization
  - [x] {Feature} Share Links
    - [x] {Model} Share link entity (token + expiration + revocation)
    - [x] {API} Generate share link endpoint - `POST /api/v1/itineraries/{itineraryId}/share-links`
    - [x] {API} Get active share links endpoint - `GET /api/v1/itineraries/{itineraryId}/share-links`
    - [x] {API} Revoke share link endpoint - `DELETE /api/v1/itineraries/{itineraryId}/share-links/{shareLinkId}`
    - [x] {API} Public shared itinerary endpoint - `GET /api/v1/share/{token}`
    - [x] {Security} Public read-only access via token + owner-only link management
    - [x] {Config} Fixed TTL policy for shared links
- [x] {Feature} Basic Backend Support for Maps
  - [x] {Model} Extension of Location entity to support coordinates (lat/lng)
- [ ] {Feature} Location Discovery
  - [ ] {Concept} Exploration of nearby places / points of interest (Implementation TBD)

### ⚛️ Frontend

- [x] {Feature} Interactive Maps Integration
  - [x] {UI} Map visualization component (Leaflet)
  - [x] {UI} Plotting daily itinerary routes
- [x] {Feature} Collaborative Itineraries UI
  - [x] {UI} Collaboration modal (invite, role update, remove/leave)
  - [x] {UI} Invitations center (pending invitations list + accept/decline)
  - [x] {UI} Real-time itinerary refresh on collaboration changes
  - [x] {UI} Share link generation
  - [x] {UI} Share link listing + revocation controls
  - [x] {UI} Copy share link action
  - [x] {Route} Public shared itinerary page - `/share/{token}`
  - [x] {Access} Read-only shared itinerary view
- [x] {PWA} Offline Access
  - [x] {Config} Service Worker configuration
  - [x] {Cache} Caching strategies for itinerary data
  - [x] {UI} Read-only access in offline mode
- [x] {Feature} Client-Side PDF Export
  - [x] {Library} Integration with PDF library (e.g., react-pdf / jsPDF)
  - [x] {UI} Export button and layout generation

### ⚙️ Testing

- [x] {Unit-Backend} Permission service tests (Roles logic)
- [x] {Unit-Backend} Collaboration service tests (invitations and role management)
- [x] {Integration-Backend} Collaboration endpoints (invite, accept, decline, list, update role, remove)
- [x] {Integration-Backend} Share link endpoints (generate/list/revoke/public access)
- [x] {Security} Share link expiration and revocation behavior
- [x] {Unit-Frontend} Collaboration hook tests for share links (list/generate/revoke flows)
- [x] {E2E} Share link lifecycle (generate, open in read-only mode, revoke)
- [ ] {E2E} Offline mode behavior
- [x] {E2E} Collaborative flow

---

## ⭐ Future & Nice-to-Have

- [ ] {Feature} Route Optimization Algorithms (TSP)
- [ ] {Feature} Travel Achievements & Gamification
- [ ] {Feature} User Travel Preferences
- [ ] {Feature} Advanced Location Discovery (Filters, Categories)

---

[👉 Go back](/README.md)
