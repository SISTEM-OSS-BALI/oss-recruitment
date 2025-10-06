/*
  Warnings:

  - You are about to drop the `answer_question_screening` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `answer_question_screening` DROP FOREIGN KEY `answer_question_screening_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `answer_question_screening` DROP FOREIGN KEY `answer_question_screening_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `answer_selected_option` DROP FOREIGN KEY `answer_selected_option_answerId_fkey`;

-- DropTable
DROP TABLE `answer_question_screening`;

-- CreateTable
CREATE TABLE `AnswerQuestionScreening` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `AnswerQuestionScreening_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnswerQuestionScreening` ADD CONSTRAINT `AnswerQuestionScreening_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_screening`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerQuestionScreening` ADD CONSTRAINT `AnswerQuestionScreening_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_selected_option` ADD CONSTRAINT `answer_selected_option_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `AnswerQuestionScreening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
