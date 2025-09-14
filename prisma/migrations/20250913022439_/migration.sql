-- CreateTable
CREATE TABLE `FormEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `name_evaluation` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Evaluator_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `formEvaluationId` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED') NOT NULL DEFAULT 'PENDING',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,

    UNIQUE INDEX `EvaluationAssignment_formEvaluationId_evaluatorId_key`(`formEvaluationId`, `evaluatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FormQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `formEvaluationId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'NUMBER', 'RATING', 'BOOLEAN', 'SINGLE_SELECT', 'MULTI_SELECT') NOT NULL,
    `options` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EvaluationAnswer_assignmentId_questionId_key`(`assignmentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationSummary` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `overallScore` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EvaluationSummary_assignmentId_key`(`assignmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FormEvaluation` ADD CONSTRAINT `FormEvaluation_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationAssignment` ADD CONSTRAINT `EvaluationAssignment_formEvaluationId_fkey` FOREIGN KEY (`formEvaluationId`) REFERENCES `FormEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationAssignment` ADD CONSTRAINT `EvaluationAssignment_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `Evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormQuestion` ADD CONSTRAINT `FormQuestion_formEvaluationId_fkey` FOREIGN KEY (`formEvaluationId`) REFERENCES `FormEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationAnswer` ADD CONSTRAINT `EvaluationAnswer_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `EvaluationAssignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationAnswer` ADD CONSTRAINT `EvaluationAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `FormQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationSummary` ADD CONSTRAINT `EvaluationSummary_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `EvaluationAssignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
