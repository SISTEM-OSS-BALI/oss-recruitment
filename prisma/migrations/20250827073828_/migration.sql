/*
  Warnings:

  - You are about to drop the column `location` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `schedule_hired` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `schedule_interview` table. All the data in the column will be lost.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `locationId` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `schedule_hired` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Contract` DROP FOREIGN KEY `Contract_templateId_fkey`;

-- AlterTable
ALTER TABLE `job` DROP COLUMN `location`,
    ADD COLUMN `locationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schedule_hired` DROP COLUMN `location`,
    ADD COLUMN `locationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schedule_interview` DROP COLUMN `location`,
    ADD COLUMN `locationId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Contract`;

-- DropTable
DROP TABLE `ContractTemplate`;

-- CreateTable
CREATE TABLE `location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `maps_url` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fields` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `outputPath` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CREATED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `contract_template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
