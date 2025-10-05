-- CreateTable
CREATE TABLE `Schedule` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `evaluator_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `evaluatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleDay` (
    `day_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`day_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleTime` (
    `time_id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`time_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleDay` ADD CONSTRAINT `ScheduleDay_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleTime` ADD CONSTRAINT `ScheduleTime_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `ScheduleDay`(`day_id`) ON DELETE CASCADE ON UPDATE CASCADE;
