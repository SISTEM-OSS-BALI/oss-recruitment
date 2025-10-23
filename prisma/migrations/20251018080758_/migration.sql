-- DropForeignKey
ALTER TABLE `evaluator_review` DROP FOREIGN KEY `evaluator_review_questionId_fkey`;

-- DropIndex
DROP INDEX `evaluator_review_questionId_fkey` ON `evaluator_review`;

-- AddForeignKey
ALTER TABLE `evaluator_review` ADD CONSTRAINT `evaluator_review_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
