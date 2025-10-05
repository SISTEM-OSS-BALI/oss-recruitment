/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `position` to the `evaluator` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_evaluator_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleDay` DROP FOREIGN KEY `ScheduleDay_schedule_id_fkey`;

-- DropIndex
DROP INDEX `ScheduleDay_schedule_id_fkey` ON `ScheduleDay`;

-- AlterTable
ALTER TABLE `evaluator` ADD COLUMN `position` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Schedule`;

-- CreateTable
CREATE TABLE `ScheduleEvaluator` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `evaluator_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `evaluatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `position` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleEvaluator` ADD CONSTRAINT `ScheduleEvaluator_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleDay` ADD CONSTRAINT `ScheduleDay_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `ScheduleEvaluator`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;
