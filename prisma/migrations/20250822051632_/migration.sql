-- CreateTable
CREATE TABLE `schedule_interview` (
    `id` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `location` ENUM('DENPASAR', 'SINGARAJA') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
