## 🧪 Analysis

### 📊 Table of Contents

1. [Entities](#-entities)
2. [Relationships](#-relationships)
3. [User Permissions](#-user-permissions)
4. [Images](#-images)
5. [Complementary Technologies](#-complementary-technologies)
6. [Algorithms](#-algorithms)
7. [Navigation Diagram](#-navigation-diagram)
8. [Page Prototypes](#-page-prototypes)

---

### 📦 Entities

> **👤 User**
> 
> User entity represents the application users, including their authentication details and profile information.
> 
> - id: Long (Primary key, auto-increment)
> - email: String (Unique, not null)
> - verified: Boolean (Default: false)
> - verificationCode: String (Nullable)
> - verificationCodeExpiresAt: Instant (Nullable)
> - username: String (Unique, not null, updatable = false)
> - hashedPassword: String (Not null)
> - name: String (Nullable)
> - description: String (Default: "")
> - location: String (Default: "¿?")
> - notificationsAllowed: Boolean (Default: true)
> - role: UserType (Not null)
> - avatar: byte[] (Nullable)
> - plan: PlanType (Default: FREE)
> - createdAt: LocalDateTime (Not null, auto-generated)
> - processingAI: boolean (Default: false)
> 
> *Relationships:*
> - Itineraries: One-to-many relationship with Itinerary
> - AI Usage: One-to-many relationship with AIUsage

> ---

> **🤖 AILog**
> 
> AI log entity stores the history of AI-generated itineraries for users. This entity belongs to the AI Service.
> 
> - id: Long (Primary key, auto-increment)
> - username: String (Not null)
> - destination: String (Nullable)
> - style: String (Nullable)
> - budget: Double (Nullable)
> - lodging: String (Nullable)
> - duration: String (Nullable)
> - interests: List<String> (Nullable)
> - response: String (Text, Nullable)
> - success: Boolean (Default: false)
> - createdAt: Instant (Not null, auto-generated)
> 
> *Relationships:*
> - Linked to User via `username` (Loose coupling)

> ---

> **🗺️ Itinerary**
>
> Itinerary entity represents a travel itinerary, including its days and activities.
>
> - id: Long (Primary key, auto-increment)
> - title: String (Nullable)
> - place: String (Nullable)
> - people: int (Default: 1)
> - budget: double (Default: 0.0)
> - date: String (Nullable)
> - tags: List<String> (Default: empty)
> - updatedCount: long (Default: 0)
> - status: ItineraryStatus (Enum, default: DRAFT)
> - createdAt: Timestamp (Not null, auto-generated)
> - updatedAt: Timestamp (Not null)
> - user: User (Foreign key)
> - coverImage: ExternalImage (Foreign key, nullable)
>
> *Relationships:*
> - user: User (Many-to-one relationship)
> - coverImage: ExternalImage (Many-to-one relationship)
> - days: One-to-many relationship with ItineraryDay

> ---

> **📅 ItineraryDay**
> 
> ItineraryDay entity represents a single day within an itinerary, including its activities.
> 
> - id: Long (Primary key, auto-increment)
> - day: int (Positive)
> - itinerary: Itinerary (Foreign key)
>
> *Relationships:*
> - itinerary: Itinerary (Many-to-one relationship)
> - activities: One-to-many relationship with Activity

> ---

> **🎯 Activity**
> 
> Activity entity represents an activity scheduled for a specific day in an itinerary.
> 
> - id: Long (Primary key, auto-increment)
> - activity: String (Text, Nullable)
> - details: String (Text, Nullable)
> - time: String (Nullable)
> - duration: String (Nullable)
> - itineraryDay: ItineraryDay (Foreign key)
> - location: Location (Foreign key)
>
> *Relationships:*
> - itineraryDay: ItineraryDay (Many-to-one relationship)
> - location: Location (One-to-one relationship)

> ---

> **📍 Location**
>
> Location entity represents a named location with an address.
> 
> - id: Long (Primary key, auto-increment)
> - name: String (Nullable)
> - address: String (Text, Nullable)
> - coordinates: GeographicPoint (Foreign key)
>
> *Relationships:*
> - coordinates: GeographicPoint (Many-to-one relationship)
> - activity: One-to-one relationship with Activity

> ---

> **🌍 GeographicPoint**
>
> GeographicPoint entity stores unique latitude and longitude coordinates to be reused across locations.
> 
> - id: Long (Primary key, auto-increment)
> - latitude: Double (Not null)
> - longitude: Double (Not null)
>
> *Relationships:*
> - locations: One-to-many relationship with Location

> ---

> **🔔 Notification**
>
> Notification entity stores user alerts and messages for the notification center. This entity belongs to the Notification Service.
>
> - id: Long (Primary key, auto-increment)
> - username: String (Not null)
> - message: String (Not null)
> - type: NotificationType (Enum)
> - timestamp: Instant (Not null, auto-generated)
>
> *Relationships:*
> - Linked to User via `username` (Loose coupling)

> ---

> **🖼️ ExternalImage**
>
> Stores metadata about images fetched from external APIs (Unsplash) to cache results and attribute authors.
>
> - id: Long (Primary key, auto-increment)
> - query: String (Nullable)
> - imageUrl: String (Not null)
> - altDescription: String (Not null)
> - authorUsername: String (Not null)
> - createdAt: LocalDate (Not null, auto-generated)

> ---

> **🚦 AIUsage**
>
> Tracks the daily usage of AI generation per user for rate limiting purposes.
>
> - id: Long (Primary key, auto-increment)
> - date: LocalDate (Not null)
> - usage: int (Not null)
> - user: User (Foreign key)
>
> *Relationships:*
> - user: User (Many-to-one relationship)
> ---

> **🗺️ Database Diagram**
>
> ![Database Diagram](/docs/assets/db-diagram.svg)
> 
> *Note: The diagram above may not reflect the latest schema changes (e.g., removal of UserPreferences, addition of GeographicPoints). Please refer to the entities section above for the authoritative structure.*

---

### 🔒 User Permissions

> **🛜 Public Users**
> - Access to the landing page and general information
> - Demo of the application

> ---

> **🔐 Registered Users**
> - Full access to all features
> - Ability to create, edit, and delete itineraries
> - AI itinerary generation, map exploration, and collaboration features

> ---

> **🔑 Admin Users**
> - User management (delete users)

---

### 🖼️ Images

> **🧑‍🦱 User Avatar**
>
> Users will have the ability to upload and manage their profile pictures.

> ---

> **🖼️ Itinerary Image**
>
> Itineraries will automatically fetch images from Unsplash based on the destination.

---

### 📈 Charts

> **📊 Users by Plan (Admin)**
>
> The application includes an admin-focused chart that visualizes user distribution by subscription plan (`FREE`, `PRO`, `PREMIUM`).
>
> The chart is powered by the endpoint `GET /api/v1/stats/users-by-plan` and rendered in the admin interface.
>
> Implementation references:
> - `backend/api-service/src/main/java/com/tripflow/controller/v1/RestStatsController.java`
> - `backend/api-service/src/main/java/com/tripflow/service/StatsService.java`
> - `frontend/src/components/dashboard/admin/UsersByPlanChart.tsx`

---

### 📶 Complementary Technologies

> **🌐 External API Rest**
> 
> The application integrates:
> - AI LLM providers to provide AI-powered itinerary generation capabilities.
> - Unsplash API to provide high-quality images for destinations.
> - Brevo to provide transactional email service for account verification and notifications.
> - Apache Kafka to handle asynchronous event-driven communication between microservices.

> ---

> **📝 PDF Generation**
>
> The application uses the PDFjs library to generate PDF summaries of itineraries, allowing users to export their travel plans in a portable format.

---

### 🧮 Algorithms

> **✅ Advanced Algorithm / Query Requirement Coverage**
>
> TripFlow includes implemented non-CRUD advanced processing over managed data:
>
> - Geospatial processing for nearby place exploration.
> - Rule-based AI daily quota logic by subscription plan.
> - Ownership/collaboration-aware filtering and sorting queries.

> ---

> **📏 Geospatial Distance & Nearby Search**
>
> The map experience applies geospatial processing in two steps:
> - Dynamic bounding-box computation from center coordinates + radius.
> - Haversine distance calculation for nearby place display.
>
> Implementation references:
> - `backend/api-service/src/main/java/com/tripflow/service/map/provider/search/MapTilerSearchProvider.java`
> - `frontend/src/utils/mapDistance.ts`
>
> ---
>
> **⏳ Rate Limiting (Daily Quota)**
>
> The AI Service implements a Daily Quota system to control the rate of AI generation requests per user, ensuring fair usage based on their subscription plan.
>
> Implementation reference: `backend/api-service/src/main/java/com/tripflow/service/ai/AIUsageService.java`.

> ---
>
> **🔎 Advanced Query (Ownership + Collaboration Search)**
>
> Itinerary search combines owner and accepted-collaborator visibility with text filtering over title/place/tags and ordered results by recency.
>
> Implementation reference: `backend/api-service/src/main/java/com/tripflow/repository/itinerary/ItineraryRepository.java`.

---

### 🧭 Navigation Diagram

> ![Navigation Diagram](/docs/assets/navigation.svg)

---

### 🎨 Page Prototypes

> **📄 Landing Page**
> 
> This is the initial page users see when they access the web application. It provides an overview of the application features and allows users to log in or register.
>
> ![Landing Page Prototype](/docs/assets/prototypes/01-landing.png)

> ---

> **📄 Login Page**
>
> The login page allows users to access their accounts by entering their credentials.
> 
> ![Login Page Prototype](/docs/assets/prototypes/02-login.png)

> ---

> **📄 Registration Page**
>
> The registration page allows new users to create an account by providing their information.
>
> ![Registration Page Prototype](/docs/assets/prototypes/03-register.png)

> ---

> **📄 Dashboard Page**
>
> The dashboard page provides users with an overview of their itineraries, statistics, and more.
>
> ![Dashboard Page Prototype](/docs/assets/prototypes/04-dashboard.png)

> ---

> **📄 Itineraries Page**
>
> The itineraries page allows users to view and manage their travel itineraries.
>
> ![Itineraries Page Prototype](/docs/assets/prototypes/05-itineraries.png)

> ---

> **📄 Itinerary Details Page**
>
> The itinerary details page provides users with a detailed view of a specific itinerary, including all associated activities, locations, and notes.
>
> ![Itinerary Details Page Prototype](/docs/assets/prototypes/06-itinerary-details.png)

> ---

> **📄 Create Itinerary Page**
>
> The create itinerary page allows users to create a new travel itinerary by providing all necessary details, including destinations, activities, and dates.
>
> ![Create Itinerary Page Prototype](/docs/assets/prototypes/07-create-itinerary.png)

> ---

> **📄 Edit Itinerary Page**
>
> The edit itinerary page allows users to modify an existing travel itinerary by updating its details, including destinations, activities, and dates.
>
> ![Edit Itinerary Page Prototype](/docs/assets/prototypes/08-edit-itinerary.png)

> ---

> **📄 Profile Page**
>
> The profile page allows users to view and edit their personal information, including their avatar, name, and description. Also, users can view their achievements and preferences.
>
> ![Profile Page Prototype](/docs/assets/prototypes/09-profile.png)

> ---

> **📄 Settings Page**
>
> The settings page allows users to configure their preferences or more advanced settings related to the application.
>
> ![Settings Page Prototype](/docs/assets/prototypes/10-settings.png)

---

[👉 Go back](/README.md)
