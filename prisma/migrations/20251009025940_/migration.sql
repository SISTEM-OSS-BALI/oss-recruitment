-- CreateTable
CREATE TABLE `matriks_question_option` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matriks_question_option_questionId_order_idx`(`questionId`, `order`),
    UNIQUE INDEX `matriks_question_option_questionId_value_key`(`questionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matriks_question_option` ADD CONSTRAINT `matriks_question_option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
