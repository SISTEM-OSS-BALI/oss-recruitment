-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `applicantId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
