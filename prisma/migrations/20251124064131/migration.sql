-- CreateTable
CREATE TABLE `applicant_employee_setup` (
    `id` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `employeeSetupId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `applicant_employee_setup_applicantId_employeeSetupId_key`(`applicantId`, `employeeSetupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicant_employee_setup` ADD CONSTRAINT `applicant_employee_setup_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant_employee_setup` ADD CONSTRAINT `applicant_employee_setup_employeeSetupId_fkey` FOREIGN KEY (`employeeSetupId`) REFERENCES `employee_setup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
