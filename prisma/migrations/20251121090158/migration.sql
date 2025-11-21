/*
  Warnings:

  - You are about to drop the `EmployeeSetupAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeSetupQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EmployeeSetupAnswer` DROP FOREIGN KEY `EmployeeSetupAnswer_employeeSetupQuestionId_fkey`;

-- DropForeignKey
ALTER TABLE `EmployeeSetupQuestion` DROP FOREIGN KEY `EmployeeSetupQuestion_employeeSetupId_fkey`;

-- DropTable
DROP TABLE `EmployeeSetupAnswer`;

-- DropTable
DROP TABLE `EmployeeSetupQuestion`;

-- CreateTable
CREATE TABLE `employee_setup_question` (
    `id` VARCHAR(191) NOT NULL,
    `name_activity` VARCHAR(191) NOT NULL,
    `executor` VARCHAR(191) NOT NULL,
    `method` ENUM('CHECK', 'INPUT', 'LINK', 'UPLOAD') NOT NULL,
    `description` VARCHAR(191) NULL,
    `default_link` VARCHAR(191) NULL,
    `input_label` VARCHAR(191) NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `employeeSetupId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_setup_answer` (
    `id` VARCHAR(191) NOT NULL,
    `employeeSetupQuestionId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,
    `value_text` VARCHAR(191) NULL,
    `value_link` VARCHAR(191) NULL,
    `value_file_url` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_setup_question` ADD CONSTRAINT `employee_setup_question_employeeSetupId_fkey` FOREIGN KEY (`employeeSetupId`) REFERENCES `employee_setup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_setup_answer` ADD CONSTRAINT `employee_setup_answer_employeeSetupQuestionId_fkey` FOREIGN KEY (`employeeSetupQuestionId`) REFERENCES `employee_setup_question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
