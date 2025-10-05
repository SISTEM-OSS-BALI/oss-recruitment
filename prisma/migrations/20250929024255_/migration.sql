/*
  Warnings:

  - You are about to drop the `EvaluationAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormEvaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluator_assignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EvaluationAnswer` DROP FOREIGN KEY `EvaluationAnswer_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationAnswer` DROP FOREIGN KEY `EvaluationAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationAssignment` DROP FOREIGN KEY `EvaluationAssignment_formEvaluationId_fkey`;

-- DropForeignKey
ALTER TABLE `FormEvaluation` DROP FOREIGN KEY `FormEvaluation_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `FormQuestion` DROP FOREIGN KEY `FormQuestion_formEvaluationId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluator_assignment` DROP FOREIGN KEY `evaluator_assignment_candidate_id_fkey`;

-- DropForeignKey
ALTER TABLE `evaluator_assignment` DROP FOREIGN KEY `evaluator_assignment_evaluatorId_fkey`;

-- DropIndex
DROP INDEX `FormQuestion_formEvaluationId_fkey` ON `FormQuestion`;

-- DropTable
DROP TABLE `EvaluationAnswer`;

-- DropTable
DROP TABLE `FormEvaluation`;

-- DropTable
DROP TABLE `evaluator_assignment`;

-- CreateTable
CREATE TABLE `base_form` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_evaluation` (
    `id` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `baseFormId` VARCHAR(191) NOT NULL,
    `name_evaluation` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationReview` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EvaluationReview_assignmentId_questionId_key`(`assignmentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `form_evaluation` ADD CONSTRAINT `form_evaluation_baseFormId_fkey` FOREIGN KEY (`baseFormId`) REFERENCES `base_form`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_evaluation` ADD CONSTRAINT `form_evaluation_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationAssignment` ADD CONSTRAINT `EvaluationAssignment_formEvaluationId_fkey` FOREIGN KEY (`formEvaluationId`) REFERENCES `form_evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormQuestion` ADD CONSTRAINT `FormQuestion_formEvaluationId_fkey` FOREIGN KEY (`formEvaluationId`) REFERENCES `form_evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationReview` ADD CONSTRAINT `EvaluationReview_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `EvaluationAssignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationReview` ADD CONSTRAINT `EvaluationReview_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `FormQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
