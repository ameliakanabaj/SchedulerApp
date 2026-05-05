# Scheduler.pl

Scheduler.pl is a web application designed to simplify employee availability management and automatic work schedule generation for organizations.  
The system allows an organization administrator to create an organization, add employees, define shifts, collect availability, and automatically generate schedules for a selected time period.

---

## Features

### Organization & user management

- Creating and managing organizations
- Adding users to organizations
- Role-based access control

### Availability management

- Employees can provide detailed availability within selected time ranges
- Availability can include additional comments

### Shift & schedule management

- Creating shifts for specific days and time ranges
- Defining required number of workers per shift
- Automatic schedule generation for a chosen period
- Manual schedule editing and approval by an administrator

### Notifications

- Notification system displayed on the main application screen
- Admin notifications when a schedule has been generated

### Google Calendar integration

- Optional integration with Google Calendar
- Automatically creates calendar events for assigned shifts

### API Documentation

- Swagger documentation available at:  
  `GET /api-docs`

---

## Tech Stack

- **Frontend:** Angular
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM & migrations:** Prisma
- **Containerization:** Docker + Docker Compose
- **API documentation:** Swagger

---

## Getting Started

### Requirements

- Docker + Docker Compose

---

## Running the project (Docker Compose)

This project contains a `docker-compose.yml` file.

Start the full application:

```bash
docker compose up --build
```

After startup, services are available under:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8083`
- Swagger docs: `http://localhost:8083/api-docs`

> Ports may differ depending on your local configuration.

---

## Prisma migrations

Because the backend runs in Docker, Prisma commands should be executed inside the backend container.

Check migration status:

```bash
docker compose exec backend npx prisma migrate status
```

Apply migrations:

```bash
docker compose exec backend npx prisma migrate dev
```

---

## Running tests

### Backend tests

```bash
docker compose exec backend npm run test
```

### Frontend tests

```bash
docker compose exec frontend npm run test
```
