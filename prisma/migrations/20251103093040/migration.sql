-- AlterTable
ALTER TABLE `offering_contract` ADD COLUMN `candidateSignedPdfUrl` VARCHAR(191) NULL,
    ADD COLUMN `directorSignaturePath` VARCHAR(191) NULL,
    ADD COLUMN `directorSignatureSignedAt` DATETIME(3) NULL,
    ADD COLUMN `directorSignatureUrl` LONGTEXT NULL,
    ADD COLUMN `notifyEmail` VARCHAR(191) NULL;
