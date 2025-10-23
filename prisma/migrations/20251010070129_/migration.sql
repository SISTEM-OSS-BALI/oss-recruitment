/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Note` DROP FOREIGN KEY `Note_applicant_id_fkey`;

-- DropTable
DROP TABLE `Note`;

-- CreateTable
CREATE TABLE `note_interview` (
    `id` VARCHAR(191) NOT NULL,
    `note` LONGTEXT NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `note_interview` ADD CONSTRAINT `note_interview_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
