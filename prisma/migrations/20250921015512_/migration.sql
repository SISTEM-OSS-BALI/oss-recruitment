/*
  Warnings:

  - You are about to drop the `Applicant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Applicant` DROP FOREIGN KEY `Applicant_job_id_fkey`;

-- DropForeignKey
ALTER TABLE `Applicant` DROP FOREIGN KEY `Applicant_user_id_fkey`;

-- DropTable
DROP TABLE `Applicant`;

-- CreateTable
CREATE TABLE `applicant` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
