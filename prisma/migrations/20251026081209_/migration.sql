/*
  Warnings:

  - You are about to drop the column `candidate_id` on the `schedule_hired` table. All the data in the column will be lost.
  - Added the required column `applicant_id` to the `schedule_hired` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `schedule_hired` DROP FOREIGN KEY `schedule_hired_candidate_id_fkey`;

-- DropIndex
DROP INDEX `schedule_hired_candidate_id_fkey` ON `schedule_hired`;

-- AlterTable
ALTER TABLE `schedule_hired` DROP COLUMN `candidate_id`,
    ADD COLUMN `applicant_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
