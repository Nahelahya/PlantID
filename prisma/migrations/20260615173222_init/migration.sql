-- CreateTable
CREATE TABLE "Plant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "kingdom" TEXT NOT NULL DEFAULT 'Plantae',
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CareGuide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "watering" TEXT NOT NULL,
    "sunlight" TEXT NOT NULL,
    "temperature" TEXT NOT NULL,
    "soil" TEXT NOT NULL,
    "fertilizer" TEXT NOT NULL,
    "humidity" TEXT,
    "toxicity" TEXT,
    "pruning" TEXT,
    "repotting" TEXT,
    "difficulty" TEXT,
    CONSTRAINT "CareGuide_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'native',
    CONSTRAINT "Distribution_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Disease" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT,
    "symptoms" TEXT NOT NULL,
    "cause" TEXT,
    "treatment" TEXT NOT NULL,
    "prevention" TEXT,
    CONSTRAINT "Disease_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CareGuide_plantId_key" ON "CareGuide"("plantId");
