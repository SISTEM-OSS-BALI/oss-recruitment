/*
  Warnings:

  - You are about to drop the `MatriksBaseQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatriksColumn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionMatriks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MatriksColumn` DROP FOREIGN KEY `MatriksColumn_baseId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionMatriks` DROP FOREIGN KEY `QuestionMatriks_baseId_fkey`;

-- DropTable
DROP TABLE `MatriksBaseQuestion`;

-- DropTable
DROP TABLE `MatriksColumn`;

-- DropTable
DROP TABLE `QuestionMatriks`;

-- CreateTable
CREATE TABLE `matriks_base_question` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriks_column` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matriks_column_baseId_order_idx`(`baseId`, `order`),
    UNIQUE INDEX `matriks_column_baseId_value_key`(`baseId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_matriks` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `inputType` ENUM('SINGLE_CHOICE', 'TEXT') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `helpText` VARCHAR(191) NULL,
    `placeholder` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matriks_column` ADD CONSTRAINT `matriks_column_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_matriks` ADD CONSTRAINT `question_matriks_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
