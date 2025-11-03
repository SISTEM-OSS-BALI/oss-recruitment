-- AlterTable
ALTER TABLE `offering_contract`
    ADD COLUMN `candidateDecision` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `candidateDecisionAt` DATETIME(3) NULL,
    ADD COLUMN `candidateSignatureUrl` LONGTEXT NULL,
    ADD COLUMN `candidateSignaturePath` VARCHAR(191) NULL,
    ADD COLUMN `candidateSignatureSignedAt` DATETIME(3) NULL,
    ADD COLUMN `candidateRejectionReason` LONGTEXT NULL;
