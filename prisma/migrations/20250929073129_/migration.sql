/*
  Warnings:

  - Added the required column `schedule_id` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule_interview` ADD COLUMN `schedule_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedule_evaluator`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;
