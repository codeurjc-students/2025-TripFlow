## 🛠️ Development Guide

### 📊 Table of Contents

1. [Introduction](#-introduction)
2. [Technology Stack](#-technology-stack)
3. [Tools](#️-tools)
4. [Architecture](#️-architecture)
5. [Quality Assurance](#-quality-assurance)
6. [Development Process](#-development-process)
7. [Code Execution and Environment Setup](#️-code-execution-and-environment-setup)

---

### 🚀 Introduction

> **📖 Overview**
>
> This web application follows a Progressive Web App (PWA) model with a client-server architecture.
>
> As a PWA, it offers a smooth experience in the browser, including offline capabilities, installability, and fast performance.
>
> The client manages the user interface dynamically, while the server handles data processing, business logic, and persistence through RESTful APIs.
>
> The application consists of three main components:
>
> - **Client:** React + TypeScript + Vite PWA.
> - **Server:** Ecosystem of Spring Boot Microservices (API, AI, Notification).
> - **Infrastructure:** Apache Kafka (Event Bus) & PostgreSQL (Data).
>
> This architecture allows scalability and maintainability by separating concerns between the client and server.

> ---

> **📝 Summary**
>
> | Aspect              | Description                                                                                |
> | ------------------- | ------------------------------------------------------------------------------------------ |
> | Type                | Progressive Web App (PWA) with a client-server architecture (Microservices).               |
> | Technologies        | React, React Router, TypeScript, Spring Boot, PostgreSQL, Apache Kafka.                    |
> | Tools               | Visual Studio Code, Git, Docker, Postman.                                                  |
> | Quality Assurance   | Unit testing (JUnit, Vitest), Integration testing (RestAssured), E2E testing (Playwright). |
> | Deployment          | Dokploy on VPS with Traefik, Cloudflare DNS, and Let's Encrypt TLS.                       |
> | Development Process | Iterative and incremental, Git version control, GitHub Actions for CI/CD.                  |

---

### 🧰 Technology Stack

> **🔧 Backend**
>
> _🚀 Spring Boot_
>
> Java framework for building RESTful services with embedded server and production-ready features.
>
> [Spring Boot](https://spring.io/projects/spring-boot)
>
> _🔐 Spring Security_
>
> Framework for securing Spring Boot applications, providing authentication and authorization.
>
> [Spring Security](https://spring.io/projects/spring-security)
>
> _☕️ Java_
>
> Object-oriented programming language used for backend services.
>
> [Java](https://www.oracle.com/java/)
>
> _📦 Maven_
>
> Build automation tool for managing dependencies and building Java projects.
>
> [Maven](https://maven.apache.org/)
>
> _🐘 PostgreSQL_
>
> Relational database management system known for its robustness and scalability.
>
> [PostgreSQL](https://www.postgresql.org/)
>
> _📨 Apache Kafka_
>
> Distributed event streaming platform used for asynchronous communication between microservices.
>
> [Apache Kafka](https://kafka.apache.org/)

> ---

> **⚛️ Frontend**
>
> _⚛️ React_
>
> JavaScript library for building user interfaces, allowing the creation of dynamic and interactive web applications.
>
> [React](https://reactjs.org/)
>
> _🔗 React Router_
>
> Declarative routing for React applications, enabling navigation and URL management.
>
> [React Router](https://reactrouter.com/)
>
> _🛠️ TypeScript_
>
> Language that extends JavaScript with static types, enhancing code quality and maintainability.
>
> [TypeScript](https://www.typescriptlang.org/)
>
> _📦 Vite_
>
> Build tool that provides a fast development environment and optimized production builds for modern web applications.
>
> [Vite](https://vitejs.dev/)
>
> _📊 Lightweight Admin Chart_
>
> The admin panel includes a lightweight bar-visualization based on `GET /api/v1/stats/users-by-plan` to satisfy reporting/chart requirements without affecting normal user flows.

> ---

> **🐳 DevOps**
>
> _🐳 Docker_
>
> Containerization platform for packaging applications and their dependencies into portable containers.
>
> [Docker](https://www.docker.com/)
>
> _🐳 Docker Compose_
>
> Tool for defining and running multi-container Docker applications.
>
> [Docker Compose](https://docs.docker.com/compose/)

---

### 🛠️ Tools

> **🖥️ Visual Studio Code**
>
> IDE for code editing with support for TypeScript, Java, and Docker.
>
> [Visual Studio Code](https://code.visualstudio.com/)

> ---

> **📦 Postman**
>
> API Rest Client for testing and interacting with RESTful APIs.
>
> [Postman](https://www.postman.com/)

> ---

> **🔧 Git**
>
> Version control system for tracking changes in source code during software development.
>
> [Git](https://git-scm.com/)

> ---

> **📦 GitHub**
>
> Cloud-based repository hosting service for version control and collaboration.
>
> [GitHub](https://github.com/)

---

### 🏗️ Architecture

> **🪐 System Architecture Overview**
>
> Here is a high-level overview of the main components and their relationships in the TripFlow application.
>
> ![System Architecture Diagram](/docs/diagrams/png/system-architecture.png)

> ---

> **💈 Domain Model Overview**
> 
> Here is a high-level overview of the main entities and their relationships in the TripFlow application.
>
> ![Domain Model Diagram](/docs/diagrams/png/domain-model.png)

> ---

> **🌐 API REST**
>
> You can find the complete API documentation generated with SpringDoc OpenAPI by following this link:
>
> [API Documentation](https://raw.githack.com/codeurjc-students/2025-TripFlow/main/docs/api/api-docs.html)

> ---

> **💻 Server Architecture Overview**
>
> The backend has evolved into a **Microservices Architecture**, splitting responsibilities into specialized services:
>
> - **API Service:** Main entry point, handles user requests, authentication, and itinerary management.
> - **AI Service:** Dedicated service for interacting with AI models.
> - **Notification Service:** Manages real-time updates (WebSocket) and emails.
>
> The services communicate asynchronously via **Apache Kafka**.
>
> ![Backend Architecture Diagram](/docs/diagrams/png/architecture-backend.png)

> ---

> **🌐 Client Architecture Overview**
>
> The frontend follows a component-based architecture pattern, organizing the UI into reusable components:
>
> ![Frontend Architecture Diagram](/docs/diagrams/png/architecture-frontend.png)

---

### ✅ Quality Assurance

> **🧪 Types of Automated Tests**
> 
> TripFlow implements different types of automated tests to ensure the reliability and correctness of the application:
> 
> 1. _Unit Tests_
>  - Backend: They test individual components like services or dependency classes in isolation using JUnit and Mockito.
>  - Frontend: They test React components, utility functions, and hooks in isolation using Vitest and React Testing Library.
> 
> 2. _Integration Tests_
>  - Backend: They test interactions between components (controllers, services, repositories) and the PostgreSQL database using Spring Boot Test and RestAssured.
> 
> 3. _End-to-End (E2E) Tests_
>  - They simulate complete user workflows across the frontend and backend using Playwright.

> ---

> **📊 Test Coverage Summary (Rerun)**
> 
> | Layer        | Coverage (%) | Covered / Total | Branches (%) | Covered / Total |
> | ------------ | ------------ | --------------- | ------------ | --------------- |
> | **Backend**  |    76.57%    |   6,897 / 9,008 |    54.46%    |    330 / 606    |
> | **Frontend** |    57.72%    |   5,312 / 9,203 |    79.14%    |    727 / 918    |
> | **Overall**  |    67.04%    | 12,209 / 18,211 |    69.36%    |  1,057 / 1,524  |
>
> ✅ Frontend test suite status after rerun: **624 / 624 tests passing**.
>
> ⚠️ Full detailed reports are available in `index.html` files generated by JaCoCo (backend) and Vitest (frontend).
> In order to view them, open the files contained in the `docs/coverage` directory with your web browser.

---

### 📀 Deployment

> **🚀 Overview**
>
> The application uses **Dokploy**, a self-hosted implementation of a PaaS (Platform as a Service), running on a dedicated **VPS** (Virtual Private Server). This approach provides a robust, production-ready environment similar to Vercel or Netlify but with full control over the infrastructure and significantly lower costs.

> ---

> **🛠️ Infrastructure Stack**
>
> _🐳 Dokploy & Traefik_
>
> [Dokploy](https://dokploy.com/) simplifies the management of Docker containers and serves as a comprehensive dashboard for deployments. It utilizes **[Traefik](https://traefik.io/traefik)** under the hood as a powerful edge router and reverse proxy.
>
> **How it works:**
> - Traefik listens on ports 80 and 443 of the VPS.
> - It automatically discovers running Docker containers via the Docker socket.
> - Using labels defined in `docker-compose.dokploy.yaml`, Traefik routes external traffic (e.g., `tripflow.cub1z.es`) to the specific container within the internal `dokploy-network`.
> - This abstraction eliminates the need to expose ports like 8080 or 3000 to the public internet, enhancing security.
>
> _☁️ Cloudflare_
>
> **[Cloudflare](https://www.cloudflare.com/)** is used for DNS management and DDOS protection. It points the application domains to the VPS IP address. It serves as the first entry point for traffic, providing caching and an additional security layer.
>
> _🔒 SSL Certificates (Let's Encrypt)_
>
> Dokploy integrates natively with **[Let's Encrypt](https://letsencrypt.org/)**. It automatically handles the challenge/response process to generate and renew **SSL/TLS certificates** for all deployed domains. This ensures that all connections are secure (HTTPS) without manual certificate management.

> ---

> **📦 Deployment Configuration**
>
> The production deployment is defined in the `docker/docker-compose.dokploy.yaml` file. This file is specifically tailored for the Dokploy environment.
>
> _Key Configuration Files:_
>
> - **`docker/docker-compose.dokploy.yaml`**: Defines services, networks, and Traefik labels.
> - **`.env`**: Located on the server in the deployment directory. Contains sensitive variables (DB passwords, API keys).
> - **`.env.example`**: A reference template in the repository showing which variables are required.
>
> _Deployment Workflow:_
>
> 1.  **Build & Push**: The CI/CD pipeline (GitHub Actions) builds Docker images for all services and pushes them to DockerHub tagged as `:latest`.
> 2.  **Trigger**: Upon successful build, the pipeline uses the `benbristow/dokploy-deploy-action` to notify the Dokploy server via a secure webhook (if secrets are configured).
> 3.  **Pull & Deploy**: Dokploy receives the signal, pulls the latest images from DockerHub, and executes `docker compose up -d` using the `docker/docker-compose.dokploy.yaml` file.
> 4.  **Routing**: Traefik detects the new containers and instantly routes traffic to them, ensuring zero-downtime deployments.

---

### 🔄 Development Process

> **🎯 Development Methodology**
>
> TripFlow follows an **iterative and incremental development process** based on Agile principles from the Agile Manifesto. The development approach incorporates selected best practices from **Extreme Programming (XP)** and **Kanban** methodologies.
>
> _XP Practices Implemented:_
>
> - Continuous integration with automated testing.
> - Refactoring for code quality improvement.
> - Simple design and clean code principles.
>
> _Kanban Elements:_
>
> - Visual workflow management through GitHub Projects.
> - Work-in-progress (WIP) limits.

> ---

> **📋 Task Management**
>
> _GitHub Projects_
>
> Project organization is managed through GitHub Projects, providing progress tracking and reporting dashboards. The project board is divided into columns representing different stages of the development process:
>
> - **🎯 To Do:** Prioritized tasks ready for development. Limited to 15 TODO tasks.
> - **⚙️ In Progress:** Currently being worked on. Limited to 5 tasks in progress.
> - **✅ Done:** Completed and deployed features. Tasks are moved here after finishing and merging.

> ---

> **🌿 Git Workflow & Branching Strategy**
>
> _🔀 Branching Workflow_
>
> 1. **Feature Development:** Create `feat-*` branches from `develop`
> 2. **Integration:** Regular merges to `develop` branch
> 3. **Release:** Periodic merges from `develop` to `main`
>
> _📊 Git Metrics_
>
> | Metric                  | Value |
> | ----------------------- | ----- |
> | Total Commits           | 770 (current branch snapshot) |
> | Total Branches          | 51 (local + remote snapshot) |
> | Active Feature Branches | 3 (local snapshot) |
> | Contributors            | 4 |
> | Average Commits/Week    | N/A (initial history concentrated in the same period) |
> | Code Review Coverage    | Pull request-based workflow on GitHub |

> ---

> **🔄 Continuous Integration CI**
>
> _⚙️ GitHub Actions Workflows_
>
> The project implements automated CI pipelines using GitHub Actions with the following workflows:
>
> **1. Unit Tests Workflow (`ci-unit-tests.yaml`):**
>
> *Triggers:*
>
> - Push to `main`, `develop`, and `feat-*` branches
> - Pull requests to `main` and `develop`
> - Manual workflow dispatch
> - Path-based filtering for backend and frontend changes
>
> *Backend Unit Testing:*
>
> - ☕️ Java 21 with Temurin distribution setup
> - 📦 Maven dependency caching for faster builds
> - 🧪 Unit tests execution with `mvn test -Dgroups=unit`
> - 🔐 Secure environment variables (JWT_SECRET, POSTGRES_PASSWORD)
>
> *Frontend Unit Testing:*
>
> - 🟢 Node.js 24 environment setup
> - 📦 NPM dependency installation and caching
> - 🧪 Vitest test execution with `npm run test --watch=false`
>
> **2. Integration Tests Workflow (`ci-integration-tests.yaml`):**
>
> *Triggers:*
>
> - Push to `main` and `develop` branches
> - Pull requests to `main` branch
> - Backend code changes only (path filtering)
> - Manual workflow dispatch
>
> *Backend Integration Testing:*
>
> - 🐘 PostgreSQL database integration testing
> - 🧪 Integration tests with `mvn test -Dgroups=integration`
> - 🔐 Environment-specific configuration
> - 📊 Comprehensive test result reporting
>
> **3. End-to-End Tests Workflow (`ci-e2e-tests.yaml`):**
> 
> *Triggers:*
> 
> - Push to `main` and `develop` branches
> - Pull requests to `main` branch
> - Backend, frontend, or E2E code changes (path filtering)
> - Manual workflow dispatch
> 
> *E2E Testing Pipeline:*
> 
> - 🟢 Node.js LTS environment setup
> - 🐳 Docker Compose for test environment orchestration
> - 📦 E2E dependencies installation with `npm ci`
> - 🎭 Playwright browser installation with dependencies
> - ⏳ Health check waiting for services to be ready
> - 🧪 Full E2E test suite execution with Playwright
> - 🔗 Tests integration across frontend, backend, and database

> ---

> **🔄 Continuous Deployment CD**
>
> _⚙️ GitHub Actions Workflows_
>
> The project implements automated CD pipelines using GitHub Actions with the following workflows:
>
> **1. Development Deployment Workflow (`cd-dev.yaml`):**
> 
> *Triggers:*
> 
> - Push to `main` branch
> - Automatic deployment on successful merge
>
> *Development Build Pipeline:*
> 
> - 🔄 Reuses `cd-build.yaml` workflow with `dev` tag
> - 🐳 Builds and pushes Docker images to DockerHub
> - 📦 Uses `docker-compose-dev.yaml` for configuration
> - 🏷️ Tags images as: `cub1z/tripflow-api-service:dev`, `cub1z/tripflow-ai-service:dev`, `cub1z/tripflow-notification-service:dev`, and `cub1z/tripflow-frontend:dev`
> - 📦 Publishes docker-compose as OCI artifact with `dev` tag
>
> **2. Release Deployment Workflow (`cd-release.yaml`):**
>
> *Triggers:*
>
> - GitHub Release publication (event: `published`)
> - Manual release creation through GitHub UI
>
> *Release Build Pipeline:*
>
> - 🏷️ **Three-stage deployment:**
>   1. **Release Tag Job:** Builds with specific version tag (e.g., `1.0.0`)
>   2. **Latest Tag Job:** Updates `latest` tag to point to new release
>   3. **Dokploy Trigger Job:** Automatically deploys the new images to the Dokploy server
> - 🔄 Build jobs reuse `cd-build.yaml` workflow
> - 🐳 Pushes images to DockerHub with version and latest tags
> - 📦 Uses `docker-compose.yaml` for production configuration
> - 🤖 **Automated & Conditional Deployment:**
>   - The Dokploy trigger only runs if `DOKPLOY_URL`, `DOKPLOY_AUTH_TOKEN`, and `DOKPLOY_COMPOSE_ID` secrets are configured.
>   - Uses `benbristow/dokploy-deploy-action` to notify the VPS to pull and restart the stack.
>
> **3. Manual Deployment Workflow (`cd-manual.yaml`):**
>
> *Triggers:*
>
> - Manual workflow dispatch from GitHub Actions UI
> - Can be triggered from any branch at any commit
>
> *Manual Build Pipeline:*
>
> - 📋 **Prepare Stage:**
>   - Extracts branch name from `GITHUB_REF`
>   - Generates timestamp in format `YYYYMMDD-HHMM`
>   - Gets short commit SHA (7 characters)
>   - Creates dynamic tag: `<branch>-<timestamp>-<commit>`
>   - Updates `docker-compose-dev.yaml` with generated tag
> - 🏗️ **Build Stage:**
>   - Reuses `cd-build.yaml` workflow with dynamic tag
>   - Example tag: `feat-maps-20250113-1430-a7b3c9d`
>
> **4. Build and Publish OCI Artifacts Workflow (`cd-build.yaml`):**
>
> *Triggers:*
>
> - Reusable workflow called by other CD workflows
> - Not directly triggered by events
>
> *Inputs:*
>
> - `tag` (required): Docker image tag to use
> - `compose_file` (required): Path to docker-compose file
> - `services` (required): JSON array of services to build paths (e.g., `["backend/api-service", "frontend"]`)
>
> *Build and Publish Process:*
>
> - 🔐 Authenticates with DockerHub using secrets
> - 🏗️ Matrix strategy builds multiple services in parallel
> - 🏷️ **Dynamic Naming:**
>   - Computes image suffix from service path (e.g., `backend/api-service` → `api-service`)
>   - Sanitizes names to lowercase and standard format
> - 🐳 **Build & Push:**
>   - Context: Auto-detected (`./frontend` or `./backend`)
>   - Dockerfile: `./<service_path>/Dockerfile`
>   - Tag: `docker.io/cub1z/tripflow-<suffix>:<tag>`
> - 📤 **Publish Compose Artifact:**
>   - Uses native `docker compose publish`
>   - Pushes to: `docker.io/cub1z/tripflow-compose:<tag>`
>   - Optimized: Only executed once per workflow run

> ---

> **📦 Release Management**
>
> _🎯 Release Process_
>
> TripFlow follows a structured release process to ensure version consistency across all components and artifacts. Each release is tagged and published with corresponding Docker images and compose files.
>
> _📋 Pre-Release Checklist:_
>
> Before creating a release, ensure the following steps are completed:
>
> 1. ✅ All tests passing (unit, integration, E2E)
> 2. ✅ Code review completed and approved
> 3. ✅ Documentation updated
> 4. ✅ Changelog prepared with release notes
> 5. ✅ Version numbers updated in configuration files

> ---

> **🔄 Version Update Workflow**
>
> _Pre-Release Version Update:_
>
> Before creating a GitHub release, update version numbers in the following files:
>
> ```bash
> # Backend (pom.xml)
> <version>1.0.0</version>
>
> # Frontend (package.json)
> "version": "1.0.0"
>
> # Docker Compose (docker/docker-compose.yaml)
> image: cub1z/tripflow-api-service:1.0.0
> image: cub1z/tripflow-ai-service:1.0.0
> image: cub1z/tripflow-notification-service:1.0.0
> image: cub1z/tripflow-frontend:1.0.0
> ```
>
> _Post-Release Version Update:_
>
> After the release is created, immediately update versions for the next development cycle:
>
> ```bash
> # Backend (pom.xml)
> <version>1.1.0-SNAPSHOT</version>
>
> # Frontend (package.json)
> "version": "1.1.0"
>
> # Docker Compose (docker/docker-compose.yaml)
> image: cub1z/tripflow-api-service:1.1.0
> image: cub1z/tripflow-ai-service:1.1.0
> image: cub1z/tripflow-notification-service:1.1.0
> image: cub1z/tripflow-frontend:1.1.0
> ```

> ---

> **🏷️ Creating a GitHub Release**
>
> 1. Navigate to the repository on GitHub
> 2. Click on "Releases" → "Draft a new release"
> 3. Create a new tag (e.g., `1.0.0`)
> 4. Set the release title (e.g., `Release 1.0.0`)
> 5. Add release notes describing changes, features, and fixes
> 6. Publish the release
>
> The automated CI/CD pipeline will:
>
> - Build Docker images with the release tag
> - Push images to DockerHub with version tag and `latest` tag
> - Publish docker-compose.yaml as OCI artifact

> ---

> **🐳 Docker Artifacts**
>
> _Docker Compose Files:_
>
> | File                         | Purpose                        | Image Source    |
> | ---------------------------- | ------------------------------ | --------------- |
> | `docker-compose.yaml`        | Production deployment          | `latest` (Hub)  |
> | `docker-compose.dev.yaml`    | Development deployment         | `dev` (Hub)     |
> | `docker-compose.local.yaml`  | Local full stack dev           | `build` (Local) |
> | `docker-compose.test.yaml`   | E2E Testing environment        | `build` (Local) |
> | `docker-compose.infra.yaml`  | Infrastructure only (DB, Kafka)| Official Images |
>
> _DockerHub Repository Structure:_
>
> ```
> cub1z/tripflow-api-service
> cub1z/tripflow-ai-service
> cub1z/tripflow-notification-service
> cub1z/tripflow-frontend
> ├── 1.0.0 (release version)
> ├── latest (points to latest release)
> └── dev (development/unstable)
>
> cub1z/tripflow-compose (OCI Artifact)
> └── contains docker-compose.yaml with service references
> ```

> ---

> **🚀 Deployment Artifacts**
>
> After a successful release, the following artifacts are available:
>
> _GitHub:_
>
> - Release tag with source code snapshot
> - Release notes and changelog
> - Downloadable source archives (zip/tar.gz)
>
> _DockerHub:_
>
> - API Service image: `cub1z/tripflow-api-service:tag`
> - AI Service image: `cub1z/tripflow-ai-service:tag`
> - Notification Service image: `cub1z/tripflow-notification-service:tag`
> - Frontend image: `cub1z/tripflow-frontend:tag`
> - Docker compose OCI artifact: `cub1z/tripflow-compose:tag`
> - Latest tags updated to point to the new release

> ---

> **📊 Release History**
>
> | Version | Release Date | Highlights                                     |
> | ------- | ------------ | ---------------------------------------------- |
> | 0.1.0   | 15 Nov 2025  | Initial MVP release with core functionality            |
> | 0.2.0   | 08 Feb 2026  | AI generation, notifications, and profile expansion    |
> | 1.0.0   | 05 Apr 2026  | Maps, collaboration, share links, PWA, and PDF export |

---

### ▶️ Code Execution and Environment Setup

> **📥 Clone and access the Repository**
> You can clone the repository using the following command:
>
> ```bash
> git clone https://github.com/codeurjc-students/2025-TripFlow.git TripFlow
> cd TripFlow
> ```

> ---

> **💻 Running the Application Locally (Without Docker)**
>
> To run TripFlow locally for development purposes, you need to set up the database, backend, and frontend separately.
>
> _📋 Prerequisites:_
>
> - **Java 21** - [Download JDK](https://www.oracle.com/java/technologies/downloads/#java21)
> - **Node.js 24+** - [Download Node.js](https://nodejs.org/)
> - **PostgreSQL 15+** - [Download PostgreSQL](https://www.postgresql.org/download/)
> - **Apache Kafka** - (If running locally without Docker)
> - **Maven 3.9+** - Included with the project (Maven Wrapper)
>
> ---
>
> _🐘 Step 1: Setup PostgreSQL Database_
>
> You can set up PostgreSQL using Docker like this:

> ```bash
> docker run --name tripflow-postgres -e POSTGRES_USER=YOUR_USER -e POSTGRES_PASSWORD=YOUR_PASSWORD -e POSTGRES_DB=tripflow_db -p 5432:5432 -d postgres:latest
> ```
>
> ---
>
> _🛠️ Step 2: Configure Service Configuration_
>
> Each microservice has its own configuration file. You must ensure that the `application.properties` in each service is configured correctly, especially for Database and Kafka connections.
>
> **Configuration Files:**
>
> 1. **API Service:** `backend/api-service/src/main/resources/application.properties`
> 2. **AI Service:** `backend/ai-service/src/main/resources/application.properties`
> 3. **Notification Service:** `backend/notification-service/src/main/resources/application.properties`
>
> Ensure the following settings match your local environment:
> - **Database:** `spring.datasource.url`, `username`, `password`
> - **Kafka:** `spring.kafka.bootstrap-servers`
> - **JWT Secret:** `app.jwt.secret` (ensure it's consistent across services)
>
> ---

> _☕ Step 3: Run the Backend Services_
>
> Since the backend consists of multiple microservices, the recommended way to run the application is using **Docker Compose** (see below).
>
> If you wish to run services individually for development, you must first ensure **PostgreSQL** and **Kafka** are running. You can start these infrastructure services using:
>
> ```bash
> docker compose -f docker/docker-compose.infra.yaml up -d
> ```
>
> Then, start each service:
>
> ```bash
> # Linux / macOS
> # Terminal 1
> cd backend/api-service && ../mvnw spring-boot:run
>
> # Terminal 2
> cd backend/ai-service && ../mvnw spring-boot:run
>
> # Terminal 3
> cd backend/notification-service && ../mvnw spring-boot:run
> ```
>
> ```bash
> # Windows
> # Terminal 1
> cd backend/api-service
> ../mvnw.cmd spring-boot:run
>
> # Terminal 2
> cd backend/ai-service
> ../mvnw.cmd spring-boot:run
>
> # Terminal 3
> cd backend/notification-service
> ../mvnw.cmd spring-boot:run
> ```
>
> ---
>
> _⚛️ Step 4: Run the Frontend_
>
> Navigate to the `frontend` directory and start the Vite development server:
>
> ```bash
> # Install dependencies (first time only)
> npm install
>
> # Start development server
> npm run dev
> ```
>
> The frontend will start on **http://localhost:5173**
>
> ---
>
> _🌐 Step 5: Access the Application_
>
> Once both services are running:
>
> - **Frontend:** http://localhost:5173
> - **Backend API:** http://localhost:8080/api

> ---

> **🐳 Running the app with Docker Compose**
>
> You can also run the entire application using Docker Compose.
> 
> _📋 Prerequisites:_
> - **Docker Desktop** for Windows or MacOS - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
> - **Docker Engine** for Linux - [Install Docker Engine](https://docs.docker.com/engine/install/)
>
> ---
>
> _🚀 Start the application using Docker Compose_
>
> Navigate to the `docker` directory and run the following command:
>
> ```bash
> docker compose -f docker-compose.dev.yaml up -d
> ```
>
> This command will pull the necessary Docker images and start the services in detached mode.

> ---

> **🪧 Postman Usage**
>
> If you want to test the backend API endpoints, you can use Postman. Import the provided Postman collection root directory `TripFlow.postman_collection.json` into Postman and start testing the API endpoints.
>
> If you don't have Postman installed, you can download it from [here](https://www.postman.com/downloads/).

> ---

> **🧪 Running Tests**
>
> To run the following tests, we recommend having Docker Desktop installed and running for Windows or MacOS and Docker Engine for Linux.
> 
> Navigate to the `scripts` directory where you will find the test scripts for backend, frontend, and E2E tests.
> 
> Here are the commands to run the different types of tests included in the project:
>
> _Backend Tests:_
> ```bash
> # For Linux and MacOS
> ./run-backend-test.sh
>
> # For Windows
> run-backend-test.cmd
> ```
>
> _Frontend Tests:_
> ```bash
> # For Linux and MacOS
> ./run-frontend-test.sh
>
> # For Windows
> .\run-frontend-test.cmd
> ```
>
> _E2E Tests:_
> ```bash
> # For Linux and MacOS
> ./run-e2e-test.sh
>
> # For Windows
> .\run-e2e-test.cmd
> ```
>
> Backend and Frontend test scripts will generate coverage reports in the `docs/coverage` directory. You can open the `index.html` files in your web browser to view the coverage reports.

---

[👉 Go back](/README.md)
