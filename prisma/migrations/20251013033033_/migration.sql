/*
  Warnings:

  - Added the required column `applicant_id` to the `evaluator_assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `evaluator_assignment` ADD COLUMN `applicant_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
