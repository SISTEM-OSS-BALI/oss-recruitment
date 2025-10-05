/*
  Warnings:

  - You are about to drop the `MbtiTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MbtiTest` DROP FOREIGN KEY `MbtiTest_user_id_fkey`;

-- DropTable
DROP TABLE `MbtiTest`;

-- CreateTable
CREATE TABLE `mbti_test` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `link_url` VARCHAR(191) NOT NULL,
    `result` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mbti_test` ADD CONSTRAINT `mbti_test_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
