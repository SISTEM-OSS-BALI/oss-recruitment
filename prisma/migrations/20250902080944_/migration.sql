/*
  Warnings:

  - You are about to drop the `HistoryCandidate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `HistoryCandidate` DROP FOREIGN KEY `HistoryCandidate_candidate_id_fkey`;

-- DropTable
DROP TABLE `HistoryCandidate`;

-- CreateTable
CREATE TABLE `history_candidate` (
    `id` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `history_candidate` ADD CONSTRAINT `history_candidate_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
