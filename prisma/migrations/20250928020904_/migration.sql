/*
  Warnings:

  - You are about to drop the column `user_id` on the `mbti_test` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `mbti_test` DROP FOREIGN KEY `mbti_test_user_id_fkey`;

-- DropIndex
DROP INDEX `mbti_test_user_id_fkey` ON `mbti_test`;

-- AlterTable
ALTER TABLE `mbti_test` DROP COLUMN `user_id`;
