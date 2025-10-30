/*
  Warnings:

  - You are about to drop the `MatriksAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MatriksAnswer` DROP FOREIGN KEY `MatriksAnswer_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `MatriksAnswer` DROP FOREIGN KEY `MatriksAnswer_questionId_fkey`;

-- DropTable
DROP TABLE `MatriksAnswer`;

-- CreateTable
CREATE TABLE `matriks_answer` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `matriks_answer_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matriks_answer` ADD CONSTRAINT `matriks_answer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriks_answer` ADD CONSTRAINT `matriks_answer_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
