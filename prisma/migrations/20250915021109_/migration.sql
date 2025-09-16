/*
  Warnings:

  - You are about to drop the `candidate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `FormEvaluation` DROP FOREIGN KEY `FormEvaluation_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `candidate` DROP FOREIGN KEY `candidate_job_id_fkey`;

-- DropForeignKey
ALTER TABLE `evaluator_assignment` DROP FOREIGN KEY `evaluator_assignment_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `history_candidate` DROP FOREIGN KEY `history_candidate_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_hired` DROP FOREIGN KEY `schedule_hired_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_interview` DROP FOREIGN KEY `schedule_interview_candidate_id_fkey`;

-- DropIndex
DROP INDEX `FormEvaluation_candidate_id_fkey` ON `FormEvaluation`;

-- DropIndex
DROP INDEX `evaluator_assignment_candidate_id_fkey` ON `evaluator_assignment`;

-- DropIndex
DROP INDEX `history_candidate_candidate_id_fkey` ON `history_candidate`;

-- DropIndex
DROP INDEX `schedule_hired_candidate_id_fkey` ON `schedule_hired`;

-- DropIndex
DROP INDEX `schedule_interview_candidate_id_fkey` ON `schedule_interview`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `curiculum_vitae_url` VARCHAR(191) NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `job_id` VARCHAR(191) NULL,
    ADD COLUMN `no_identity` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `photo_url` VARCHAR(191) NULL,
    ADD COLUMN `portfolio_url` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'CANDIDATE') NOT NULL DEFAULT 'CANDIDATE',
    ADD COLUMN `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING';

-- DropTable
DROP TABLE `candidate`;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_candidate` ADD CONSTRAINT `history_candidate_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormEvaluation` ADD CONSTRAINT `FormEvaluation_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
