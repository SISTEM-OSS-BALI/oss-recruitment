-- CreateTable
CREATE TABLE `evaluator_assignment` (
    `id` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `candidate_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_candidate_id_fkey` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
