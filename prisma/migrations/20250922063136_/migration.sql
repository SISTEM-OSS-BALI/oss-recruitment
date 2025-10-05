/*
  Warnings:

  - You are about to drop the `ScheduleDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleEvaluator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleTime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ScheduleDay` DROP FOREIGN KEY `ScheduleDay_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleEvaluator` DROP FOREIGN KEY `ScheduleEvaluator_evaluator_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleTime` DROP FOREIGN KEY `ScheduleTime_day_id_fkey`;

-- DropTable
DROP TABLE `ScheduleDay`;

-- DropTable
DROP TABLE `ScheduleEvaluator`;

-- DropTable
DROP TABLE `ScheduleTime`;

-- CreateTable
CREATE TABLE `schedule_evaluator` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `evaluator_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `evaluatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_day` (
    `day_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`day_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_time` (
    `time_id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`time_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule_evaluator` ADD CONSTRAINT `schedule_evaluator_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_day` ADD CONSTRAINT `schedule_day_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedule_evaluator`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_time` ADD CONSTRAINT `schedule_time_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `schedule_day`(`day_id`) ON DELETE CASCADE ON UPDATE CASCADE;
