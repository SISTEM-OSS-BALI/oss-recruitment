/*
  Warnings:

  - You are about to drop the `EvaluatorReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EvaluatorReview` DROP FOREIGN KEY `EvaluatorReview_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `EvaluatorReview` DROP FOREIGN KEY `EvaluatorReview_questionId_fkey`;

-- DropTable
DROP TABLE `EvaluatorReview`;

-- CreateTable
CREATE TABLE `evaluator_review` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `evaluator_review_assignmentId_questionId_key`(`assignmentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `evaluator_review` ADD CONSTRAINT `evaluator_review_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `evaluator_assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_review` ADD CONSTRAINT `evaluator_review_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
