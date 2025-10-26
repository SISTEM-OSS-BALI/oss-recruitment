/*
  Warnings:

  - Added the required column `name` to the `offering_contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `offering_contract` ADD COLUMN `name` VARCHAR(191) NOT NULL;
