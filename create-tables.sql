-- Create all tables for Focus Group Simulation
-- Run this in Supabase SQL Editor

-- Project table
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "demographics" TEXT,
    "researchGoal" TEXT NOT NULL,
    "panelSize" INTEGER NOT NULL DEFAULT 8
);

-- Settings table
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL UNIQUE,
    "tone" INTEGER NOT NULL DEFAULT 50,
    "skepticism" INTEGER NOT NULL DEFAULT 50,
    "detailLevel" INTEGER NOT NULL DEFAULT 50,
    "analysisDepth" TEXT NOT NULL DEFAULT 'standard',
    CONSTRAINT "Settings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ProjectDetails table
CREATE TABLE IF NOT EXISTS "ProjectDetails" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL UNIQUE,
    "category" TEXT,
    "panelSize" INTEGER NOT NULL DEFAULT 8,
    "researchGoal" TEXT,
    "customQuestions" TEXT,
    "priceExpected" DOUBLE PRECISION,
    "priceMin" DOUBLE PRECISION,
    "priceMax" DOUBLE PRECISION,
    "pricingModel" TEXT,
    "coreFeatures" TEXT,
    "premiumFeatures" TEXT,
    "futureFeatures" TEXT,
    "conjointFeatures" TEXT,
    "competitors" TEXT,
    "personaConstraints" TEXT,
    "toneFormality" INTEGER DEFAULT 50,
    "toneSkepticism" INTEGER DEFAULT 50,
    "analysisDepth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Persona table
CREATE TABLE IF NOT EXISTS "Persona" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "income" TEXT,
    "location" TEXT,
    "bio" TEXT NOT NULL,
    "traits" TEXT,
    CONSTRAINT "Persona_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Response table
CREATE TABLE IF NOT EXISTS "Response" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Insight table
CREATE TABLE IF NOT EXISTS "Insight" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "citations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Settings_projectId_idx" ON "Settings"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectDetails_projectId_idx" ON "ProjectDetails"("projectId");
CREATE INDEX IF NOT EXISTS "Persona_projectId_idx" ON "Persona"("projectId");
CREATE INDEX IF NOT EXISTS "Session_projectId_idx" ON "Session"("projectId");
CREATE INDEX IF NOT EXISTS "Response_sessionId_idx" ON "Response"("sessionId");
CREATE INDEX IF NOT EXISTS "Response_personaId_idx" ON "Response"("personaId");
CREATE INDEX IF NOT EXISTS "Insight_sessionId_idx" ON "Insight"("sessionId");
