<div align="center">
  <img src="docs/assets/banner.svg" alt="TripFlow Banner" />
</div>

---

> **🧭 Overview**
> 
> **TripFlow** is an innovative Progressive Web App (PWA) designed for comprehensive travel itinerary management and intelligent route optimization. Built with modern web technologies, it empowers travelers to create, customize, and optimize their journeys with the help of artificial intelligence and advanced algorithms.
> 
> This **Final Degree Project (TFG)** develops a travel planning application using Spring Boot and React, with AI-powered itinerary generation and route optimization algorithms. The project demonstrates the integration of modern web technologies to solve real-world travel planning challenges.
> 
> See the [Roadmap](docs/roadmap.md) for detailed project features and timelines.

---

## 👥 Project Team

| Role        | Name                 | GitHub                                                   | LinkedIn                                                            |
| ----------- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| **Student** | Diego Sánchez Rincón | [@CuB1z](https://github.com/CuB1z)                       | [Diego Sánchez Rincón](https://www.linkedin.com/in/cub1z/)          |
| **Tutor**   | Óscar Soto Sánchez   | [@OscarSotoSanchez](https://github.com/OscarSotoSanchez) | [Óscar Soto Sánchez](https://www.linkedin.com/in/oscarsotosanchez/) |

---

## 🧪 Development Environment

> **🚀 Running a SQL PostgreSQL Database**
>
> To run the application locally, you need to have a PostgreSQL database set up. You can use Docker to quickly create a PostgreSQL container. Here’s how to do it:
>
> ```bash
> docker run --name tripflow-postgres -e POSTGRES_USER=YOUR_USER -e POSTGRES_PASSWORD=YOUR_PASSWORD -e POSTGRES_DB=tripflow_db -p 5432:5432 -d postgres:latest
> ```
>
> This command will create a new PostgreSQL container with the specified user, password, and database name.
> 
> Make sure to replace `application.properties` file in the backend with your database credentials:
> ```properties
> spring.datasource.url=${POSTGRES_URL:jdbc:postgresql://localhost:5432/tripflow_db}
> spring.datasource.username=${POSTGRES_USER:YOUR_USER}
> spring.datasource.password=${POSTGRES_PASSWORD:YOUR_PASSWORD}
> spring.datasource.driver-class-name=org.postgresql.Driver
> spring.jpa.hibernate.ddl-auto=create-drop // for development, change to 'update' for production
> ```

> ---

> **🛠️ Environment Variables**
>
> In order to use environment variables from a `.env` file, you need to have the `dotenv-java` dependency in your backend project.
> This allows to define sensitive information and configuration settings without hardcoding them into the source code.
> A `.env.example` file is provided in the backend directory. You can create a `.env` file based on this example and fill in your specific values.

---

## 📋 Phase 0 - Functionality Definition

> **TripFlow**
> The application to be developed is a Progressive Web App (PWA) for travel itinerary management and optimized route planning.
>
> It will allow users to create, visualize, and modify personalized trips, add activities manually or through automatic generation by Artificial Intelligence, and optimize daily routes using TSP (Traveling Salesman Problem) type algorithms.
>
> The system will feature a backend developed in Spring Boot, frontend in React with Vite, and PostgreSQL storage.

> ---

> **🎯 Core Objectives**
> - 🧳 *Travel Itinerary Planning*: Comprehensive trip planning and route management for travelers
> - 📱 *Progressive Web App*: Full offline capabilities with responsive, native-like experience
> - 🔐 *Secure User Management*: JWT-based authentication with comprehensive user profiles
> - 🗺️ *Intelligent Route Planning*: Advanced TSP (Traveling Salesman Problem) algorithms for optimal daily routes
> - 🤖 *AI-Powered Generation*: Automatic itinerary creation based on user preferences and constraints
> - 📊 *Gamified Experience*: Achievement system and detailed travel statistics

> ---

> **🛠️ Technology Stack**
> 
> *🔧 Backend*
> - **Framework**: Spring Boot with Spring Security (JWT)
> - **Database**: PostgreSQL with JPA Repository
> - **Testing**: JUnit 5, Mockito, RestAssured
> - **AI Integration**: OpenRouter API
> - **Algorithms**: TSP optimization (Greedy, 2-Opt)
>
> *⚛️ Frontend*
> - **Framework**: React with TypeScript + Vite
> - **Routing**: React Router
> - **HTTP Client**: Axios
> - **Testing**: Vitest, React Testing Library, Puppeteer
> - **PWA**: Service Workers, vite-plugin-pwa
>
> *🗄️ Storage*
> - **Database**: PostgreSQL
> - **Local Storage**: localStorage, IndexedDB
> - **Caching**: AI responses and API calls
>
> *🐳 DevOps*
> - **Containerization**: Docker + Docker Compose

> ---

> **✨ Features**
> 
> *🔐 Users and Authentication*
> - 📝 New users registration
> - 🚪 Secure login through JWT tokens
> - 🚫 Session management with token invalidation on logout
> - 🖼️ Avatar management - upload and retrieve user profile pictures
> - 👤 Profile visualization
> - ❌ Account deletion
> - 🛡️ JWT-based security for all protected resources
> 
> *🗺️ Itineraries*
> - ➕ Create new itineraries
> - 📋 View all itineraries in an organized dashboard
> - 🔍Detailed itinerary view
> - ✏️ Edit existing itineraries
> - 🗑️ Delete itineraries
> - 🎯 Activity management - add, edit, and remove activities
> - 📅 Time organization - structure activities by days, dates, and hours
> 
> *📊 User Statistics*
> - ✅ Completed activities tracking
> - 📍 Places visited
> - 📆 Total planned days accumulation
> - 🛣️ Total distance traveled
> 
> *🤖 AI Itinerary Generation*
> - 🎨 Automatic generation of itineraries based on preferences
> - 🌐 OpenRouter integration by FREE Tier AI models
> - ⚡ Response caching for identical requests optimization
> - 📝 Query history storage with rate limiting capabilities
> 
> *🏆 Achievements and Gamification*
> - 🎖️ Achievement visualization with progress tracking
> - 🔓 Unlocked achievements personal gallery
> 
> *📱 PWA (Progressive Web App)*
> - 🌐 Offline access
> - 💾 Local storage using localStorage and IndexedDB
> 
> *🚀 Advanced Features*
> - 🧮 TSP optimization for efficient route planning
> - 📄 Advanced PDF export with customizable styling and branding

> ---

> **📦 Entities**
> 
> *👤 User*
> - id: Long (Primary key, auto-increment)
> - username: String (Unique, not null)
> - hashedPassword: String (Not null)
> - role: UserType (Not null)
> - name: String (Nullable)
> - description: String (Nullable)
> - location: String (Nullable)
> - avatar: Blob (Nullable)
> - createdAt: Timestamp (Not null, auto-generated)
> 
> *🤖 AILog*
> - id: Long (Primary key, auto-increment)
> - place: String (Not null)
> - days: int (Positive, default: 1)
> - createdAt: Timestamp (Not null, auto-generated)
> - user: User (Foreign key)
>
> *🏆 Achievement*
> - id: Long (Primary key, auto-increment)
> - type: AchievementType (Enum)
> - createdAt: Timestamp (Not null, auto-generated)
> - user: User (Foreign key)
>
> *🗺️ Itinerary*
> - id: Long (Primary key, auto-increment)
> - place: String (Not null)
> - updatedCount: long (Default: 0)
> - status: ItineraryStatus (Enum, default: DRAFT)
> - createdAt: Timestamp (Not null, auto-generated)
> - user: User (Foreign key)
> 
> *📅 ItineraryDay*
> - id: Long (Primary key, auto-increment)
> - day: int (Positive)
> - itinerary: Itinerary (Foreign key)
> 
> *🎯 Activity*
> - id: Long (Primary key, auto-increment)
> - activity: String (Not null)
> - details: String (Nullable)
> - time: String (Nullable)
> - duration: String (Nullable)
> - itineraryDay: ItineraryDay (Foreign key)
> - location: Location (Foreign key)
> 
> *📍 Location*
> - id: Long (Primary key, auto-increment)
> - name: String (Not null)
> - latitude: double (Not null)
> - longitude: double (Not null)
> - address: String (Nullable)

> ---

> **🔒 User Permissions**
> 
> *🛜 Public*
> - Access to the landing page and general information
> - Demo of the application
> 
> *🔐 Registered Users*
> - Full access to all features
> - Ability to create, edit, and delete itineraries
> - AI itinerary generation and advanced route optimization
> - Achievement tracking

> ---

> **🧭 Navigation Diagram**
> ---
> ![Navigation Diagram](/docs/assets/navigation.svg)

---

## 📄 License

> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
> 
>     http://www.apache.org/licenses/LICENSE-2.0
> 
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.

---
