-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('AGRICOLA', 'GANADERO', 'MIXTO', 'ARROCERO', 'FORESTAL');

-- CreateEnum
CREATE TYPE "ListingModality" AS ENUM ('VENTA', 'ALQUILER');

-- CreateEnum
CREATE TYPE "WaterSource" AS ENUM ('TAJAMAR', 'ARROYO', 'RIO', 'POZO', 'NINGUNO');

-- CreateEnum
CREATE TYPE "SlopeRange" AS ENUM ('P0_2', 'P2_5', 'P5_10', 'P10_PLUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "locationText" TEXT,
    "department" TEXT,
    "district" TEXT,
    "hectaresTotal" DOUBLE PRECISION,
    "type" "ListingType",
    "modality" "ListingModality",
    "description" TEXT,
    "phoneWhatsapp" TEXT,
    "contactEmail" TEXT,
    "salePriceTotalUsd" DOUBLE PRECISION,
    "salePriceUsdPerHa" DOUBLE PRECISION,
    "rentUsdPerHaPerYear" DOUBLE PRECISION,
    "rentCropSharePercent" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "productiveAptitude" TEXT,
    "currentUse" TEXT,
    "rotationsHistory" TEXT,
    "soilType" TEXT,
    "productivityIndex" DOUBLE PRECISION,
    "waterSources" "WaterSource"[] DEFAULT ARRAY[]::"WaterSource"[],
    "hasElectricity" BOOLEAN,
    "hasInternalRoads" BOOLEAN,
    "hasFences" BOOLEAN,
    "hasCorrals" BOOLEAN,
    "hasSilos" BOOLEAN,
    "hasSheds" BOOLEAN,
    "distanceToPavedRouteKm" DOUBLE PRECISION,
    "distanceToTownKm" DOUBLE PRECISION,
    "yearRoundAccess" BOOLEAN,
    "maxSlopePercentRange" "SlopeRange",
    "completenessScore" INTEGER NOT NULL DEFAULT 0,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_department_district_idx" ON "Listing"("department", "district");

-- CreateIndex
CREATE INDEX "Listing_type_idx" ON "Listing"("type");

-- CreateIndex
CREATE INDEX "Listing_modality_idx" ON "Listing"("modality");

-- CreateIndex
CREATE INDEX "Listing_hectaresTotal_idx" ON "Listing"("hectaresTotal");

-- CreateIndex
CREATE INDEX "Listing_completenessScore_idx" ON "Listing"("completenessScore");

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
