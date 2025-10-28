CREATE TYPE user_role AS ENUM ('GLOBAL_ADMIN', 'ORG_ADMIN', 'EMPLOYEE');

CREATE TABLE "Organization" (
    "organization_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL
);

CREATE TABLE "User" (
    "user_id" SERIAL PRIMARY KEY,
    "organization_id" INTEGER REFERENCES "Organization"("organization_id") ON DELETE SET NULL, 
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL, 
    "password" VARCHAR(255) NOT NULL,
    "role" user_role NOT NULL DEFAULT 'EMPLOYEE',
    "position" VARCHAR(255)
);

CREATE INDEX idx_user_email ON "User" ("email");

CREATE TABLE "Shift" (
    "shift_id" SERIAL PRIMARY KEY,
    "organization_id" INTEGER REFERENCES "Organization"("organization_id") ON DELETE SET NULL, 
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "place" VARCHAR(255) 
);

CREATE TABLE "Availability" (
    "availability_id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "User"("user_id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "comments" VARCHAR(500),
    "status" VARCHAR(50)
);

CREATE TABLE "Assignment" (
    "assignment_id" SERIAL PRIMARY KEY,
    "shift_id" INTEGER NOT NULL REFERENCES "Shift"("shift_id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "User"("user_id") ON DELETE CASCADE, 
    "role_on_shift" VARCHAR(255)
);

CREATE INDEX idx_availability_user_id ON "Availability" ("user_id");
CREATE INDEX idx_assignment_shift_id ON "Assignment" ("shift_id");
CREATE INDEX idx_assignment_user_id ON "Assignment" ("user_id");
