/*
  Warnings:

  - You are about to drop the column `document_url` on the `candidate` table. All the data in the column will be lost.
  - Added the required column `photo_url` to the `candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `candidate` DROP COLUMN `document_url`,
    ADD COLUMN `photo_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `portfolio_url` VARCHAR(191) NULL;
