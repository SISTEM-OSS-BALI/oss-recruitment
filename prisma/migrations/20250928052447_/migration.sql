/*
  Warnings:

  - Added the required column `test_id` to the `mbti_test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `mbti_test` ADD COLUMN `test_id` VARCHAR(191) NOT NULL;
