-- CreateTable
CREATE TABLE `employee_setup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeSetupQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `name_activity` VARCHAR(191) NOT NULL,
    `executor` VARCHAR(191) NOT NULL,
    `employeeSetupId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeSetupAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `employeeSetupQuestionId` VARCHAR(191) NOT NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployeeSetupQuestion` ADD CONSTRAINT `EmployeeSetupQuestion_employeeSetupId_fkey` FOREIGN KEY (`employeeSetupId`) REFERENCES `employee_setup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSetupAnswer` ADD CONSTRAINT `EmployeeSetupAnswer_employeeSetupQuestionId_fkey` FOREIGN KEY (`employeeSetupQuestionId`) REFERENCES `EmployeeSetupQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
