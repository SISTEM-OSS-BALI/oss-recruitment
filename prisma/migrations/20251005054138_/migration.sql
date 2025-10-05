-- AlterTable
ALTER TABLE `applicant` ADD COLUMN `screeningBaseId` VARCHAR(191) NULL,
    ADD COLUMN `screeningSubmittedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `QuestionBaseScreening` (
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
CREATE TABLE `QuestionScreening` (
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
CREATE TABLE `QuestionOption` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `QuestionOption_questionId_order_idx`(`questionId`, `order`),
    UNIQUE INDEX `QuestionOption_questionId_value_key`(`questionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnswerQuestionScreening` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `AnswerQuestionScreening_questionId_idx`(`questionId`),
    UNIQUE INDEX `AnswerQuestionScreening_sessionId_questionId_key`(`sessionId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnswerSelectedOption` (
    `answerId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`answerId`, `optionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_screeningBaseId_fkey` FOREIGN KEY (`screeningBaseId`) REFERENCES `QuestionBaseScreening`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionScreening` ADD CONSTRAINT `QuestionScreening_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `QuestionBaseScreening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOption` ADD CONSTRAINT `QuestionOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `QuestionScreening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerQuestionScreening` ADD CONSTRAINT `AnswerQuestionScreening_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `QuestionScreening`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerQuestionScreening` ADD CONSTRAINT `AnswerQuestionScreening_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerSelectedOption` ADD CONSTRAINT `AnswerSelectedOption_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `AnswerQuestionScreening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerSelectedOption` ADD CONSTRAINT `AnswerSelectedOption_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `QuestionOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
