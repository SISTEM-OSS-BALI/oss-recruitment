-- CreateTable
CREATE TABLE `candidate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `curiculum_vitae_url` VARCHAR(191) NOT NULL,
    `status` ENUM('SCREENING', 'MANAGEMENT_INTERVIEW', 'QUALIFIED', 'USER_INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `candidate_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stage_recruitment` (
    `id` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `stage` ENUM('SCREENING', 'MANAGEMENT_INTERVIEW', 'QUALIFIED', 'USER_INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stage_recruitment` ADD CONSTRAINT `stage_recruitment_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
