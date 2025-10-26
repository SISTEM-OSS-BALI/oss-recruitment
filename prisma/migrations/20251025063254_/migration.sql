-- CreateTable
CREATE TABLE `offering_contract` (
    `id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `offering_contract` ADD CONSTRAINT `offering_contract_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
