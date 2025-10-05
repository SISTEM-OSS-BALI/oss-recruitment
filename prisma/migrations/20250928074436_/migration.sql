/*
  Warnings:

  - You are about to drop the column `candidate_id` on the `history_candidate` table. All the data in the column will be lost.
  - Added the required column `applicant_id` to the `history_candidate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `history_candidate` DROP FOREIGN KEY `history_candidate_candidate_id_fkey`;

-- DropIndex
DROP INDEX `history_candidate_candidate_id_fkey` ON `history_candidate`;

-- AlterTable
ALTER TABLE `history_candidate` DROP COLUMN `candidate_id`,
    ADD COLUMN `applicant_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `history_candidate` ADD CONSTRAINT `history_candidate_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_candidate` ADD CONSTRAINT `history_candidate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
