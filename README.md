# Scroll & Shop

Scroll & Shop is a full-stack social-commerce platform that combines product discovery, shopping, and social interactions.

## Features
- Product browsing and discovery
- Social-style shopping experience
- Secure backend APIs with Spring Boot
- MySQL-backed persistent storage
- Payment flow integration (Razorpay)
- Media hosting integration (Cloudinary)

## Technology Stack
- **Frontend:** React + Vite
- **Backend:** Java + Spring Boot
- **Database:** MySQL

## Repository Structure (Expected)
> Note: This repository should contain frontend and backend source directories. A common layout is:

```text
scroll-and-shop/
├── frontend/
├── backend/
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites
Install these before running locally:
- Node.js 18+
- npm 9+
- Java 17+ (or project-required version)
- Maven 3.9+
- MySQL 8+

## Environment Variables
Copy `.env.example` and set real values locally:

```bash
cp .env.example .env
```

Never commit `.env` or any real secrets.

## Frontend Setup (React + Vite)
From project root (or inside `frontend/`):

```bash
cd frontend
npm install
npm run dev
```

Build frontend for production:

```bash
npm run build
```

## Backend Setup (Spring Boot)
From project root (or inside `backend/`):

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## MySQL Database Configuration
1. Create a database (example):
   ```sql
   CREATE DATABASE scroll_and_shop;
   ```
2. Update `.env` values for:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`

3. Ensure backend reads env vars (for example in `application.properties`):
   ```properties
   spring.datasource.url=${SPRING_DATASOURCE_URL}
   spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
      spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
   ```

## API and Payment Integration Setup
Set these in `.env`:
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VITE_API_BASE_URL`
- `VITE_RAZORPAY_KEY_ID`

Use test keys in local development. Do not hardcode secrets.

## Run Full Application Locally
Open two terminals:

**Terminal 1 (backend)**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 (frontend)**
```bash
cd frontend
npm install
npm run dev
```

Frontend should call backend through `VITE_API_BASE_URL`.

## GitHub Publishing Checklist
- Git is already initialized in this repository (existing history preserved).
- `.gitignore` is configured for Node/Spring outputs, env files, IDE/OS junk, and logs/temp files.
- `.env.example` contains placeholders only.
- Verify before commit:
  ```bash
  git status
  git diff
  ```

## Commands to Connect and Push to a New GitHub Repository
If you have not added a remote yet:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

If `origin` already exists and you need to update it:

```bash
git remote set-url origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

Example URL formats:
- HTTPS: `https://github.com/<username>/<repo>.git`
- SSH: `git@github.com:<username>/<repo>.git`

No password or token should be shared in chat.
