-- Soccer Session Planner Database Schema
-- NOTE: You don't need to run this manually! 
-- Prisma will create these tables automatically when you run: npm run setup
-- This file is just for reference.

-- Create database (only if using local PostgreSQL)
-- CREATE DATABASE soccer_planner;

-- Users table
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Drills table
CREATE TABLE "Drill" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT,
    "ageGroup" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "diagramJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Drill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Sessions table
CREATE TABLE "Session" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "team" TEXT,
    "totalDuration" INTEGER NOT NULL,
    "theme" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Session Drills join table
CREATE TABLE "SessionDrill" (
    "id" SERIAL PRIMARY KEY,
    "sessionId" INTEGER NOT NULL,
    "drillId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "durationOverride" INTEGER,
    "sessionNotes" TEXT,
    CONSTRAINT "SessionDrill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionDrill_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for better query performance
CREATE INDEX "Drill_userId_idx" ON "Drill"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "SessionDrill_sessionId_idx" ON "SessionDrill"("sessionId");
CREATE INDEX "SessionDrill_drillId_idx" ON "SessionDrill"("drillId");

-- Comments
COMMENT ON TABLE "User" IS 'Coach accounts';
COMMENT ON TABLE "Drill" IS 'Training drills with diagram data stored as JSON';
COMMENT ON TABLE "Session" IS 'Training sessions';
COMMENT ON TABLE "SessionDrill" IS 'Join table linking sessions to drills with ordering';
COMMENT ON COLUMN "Drill"."diagramJson" IS 'Stores diagram objects (players, cones, arrows, etc.) as JSONB';
COMMENT ON COLUMN "Drill"."tags" IS 'Array of tags for filtering (e.g., passing, dribbling, tactical)';
