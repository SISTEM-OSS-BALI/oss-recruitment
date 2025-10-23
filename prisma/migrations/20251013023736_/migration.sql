/*
  Warnings:

  - You are about to drop the `EvaluationAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EvaluationReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EvaluationSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `base_form` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `form_evaluation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EvaluationAssignment` DROP FOREIGN KEY `EvaluationAssignment_evaluatorId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationAssignment` DROP FOREIGN KEY `EvaluationAssignment_formEvaluationId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationReview` DROP FOREIGN KEY `EvaluationReview_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationReview` DROP FOREIGN KEY `EvaluationReview_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluationSummary` DROP FOREIGN KEY `EvaluationSummary_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `FormQuestion` DROP FOREIGN KEY `FormQuestion_formEvaluationId_fkey`;

-- DropForeignKey
ALTER TABLE `form_evaluation` DROP FOREIGN KEY `form_evaluation_baseFormId_fkey`;

-- DropForeignKey
ALTER TABLE `form_evaluation` DROP FOREIGN KEY `form_evaluation_candidate_id_fkey`;

-- DropTable
DROP TABLE `EvaluationAssignment`;

-- DropTable
DROP TABLE `EvaluationReview`;

-- DropTable
DROP TABLE `EvaluationSummary`;

-- DropTable
DROP TABLE `FormQuestion`;

-- DropTable
DROP TABLE `base_form`;

-- DropTable
DROP TABLE `form_evaluation`;

-- CreateTable
CREATE TABLE `evaluator_assignment` (
    `id` VARCHAR(191) NOT NULL,
    `base_matriks_id` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED') NOT NULL DEFAULT 'PENDING',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluatorReview` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EvaluatorReview_assignmentId_questionId_key`(`assignmentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatriksAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `MatriksAnswer_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_base_matriks_id_fkey` FOREIGN KEY (`base_matriks_id`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluatorReview` ADD CONSTRAINT `EvaluatorReview_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `evaluator_assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluatorReview` ADD CONSTRAINT `EvaluatorReview_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatriksAnswer` ADD CONSTRAINT `MatriksAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatriksAnswer` ADD CONSTRAINT `MatriksAnswer_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
