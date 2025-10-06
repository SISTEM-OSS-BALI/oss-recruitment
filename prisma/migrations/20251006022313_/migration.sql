/*
  Warnings:

  - You are about to drop the `AnswerQuestionScreening` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnswerSelectedOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionBaseScreening` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionScreening` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AnswerQuestionScreening` DROP FOREIGN KEY `AnswerQuestionScreening_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `AnswerQuestionScreening` DROP FOREIGN KEY `AnswerQuestionScreening_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `AnswerSelectedOption` DROP FOREIGN KEY `AnswerSelectedOption_answerId_fkey`;

-- DropForeignKey
ALTER TABLE `AnswerSelectedOption` DROP FOREIGN KEY `AnswerSelectedOption_optionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionOption` DROP FOREIGN KEY `QuestionOption_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionScreening` DROP FOREIGN KEY `QuestionScreening_baseId_fkey`;

-- DropForeignKey
ALTER TABLE `applicant` DROP FOREIGN KEY `applicant_screeningBaseId_fkey`;

-- DropIndex
DROP INDEX `applicant_screeningBaseId_fkey` ON `applicant`;

-- DropTable
DROP TABLE `AnswerQuestionScreening`;

-- DropTable
DROP TABLE `AnswerSelectedOption`;

-- DropTable
DROP TABLE `QuestionBaseScreening`;

-- DropTable
DROP TABLE `QuestionOption`;

-- DropTable
DROP TABLE `QuestionScreening`;

-- CreateTable
CREATE TABLE `question_base_screening` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_screening` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `inputType` ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `helpText` VARCHAR(191) NULL,
    `placeholder` VARCHAR(191) NULL,
    `minLength` INTEGER NULL,
    `maxLength` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_option` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `question_option_questionId_order_idx`(`questionId`, `order`),
    UNIQUE INDEX `question_option_questionId_value_key`(`questionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_question_screening` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `answer_question_screening_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_selected_option` (
    `answerId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`answerId`, `optionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_screeningBaseId_fkey` FOREIGN KEY (`screeningBaseId`) REFERENCES `question_base_screening`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_screening` ADD CONSTRAINT `question_screening_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `question_base_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_option` ADD CONSTRAINT `question_option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_question_screening` ADD CONSTRAINT `answer_question_screening_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_screening`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_question_screening` ADD CONSTRAINT `answer_question_screening_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_selected_option` ADD CONSTRAINT `answer_selected_option_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `answer_question_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_selected_option` ADD CONSTRAINT `answer_selected_option_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `question_option`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
