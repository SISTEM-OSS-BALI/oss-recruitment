/*
  Warnings:

  - You are about to drop the `Evaluator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EvaluationAssignment` DROP FOREIGN KEY `EvaluationAssignment_evaluatorId_fkey`;

-- DropIndex
DROP INDEX `EvaluationAssignment_evaluatorId_fkey` ON `EvaluationAssignment`;

-- DropTable
DROP TABLE `Evaluator`;

-- CreateTable
CREATE TABLE `evaluator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evaluator_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EvaluationAssignment` ADD CONSTRAINT `EvaluationAssignment_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
