/*
  Warnings:

  - You are about to drop the column `candidate_id` on the `schedule_interview` table. All the data in the column will be lost.
  - Added the required column `applicant_id` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `schedule_interview` DROP FOREIGN KEY `schedule_interview_candidate_id_fkey`;

-- DropIndex
DROP INDEX `schedule_interview_candidate_id_fkey` ON `schedule_interview`;

-- AlterTable
ALTER TABLE `schedule_interview` DROP COLUMN `candidate_id`,
    ADD COLUMN `applicant_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
