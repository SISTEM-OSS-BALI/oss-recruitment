/*
  Warnings:

  - Added the required column `no_whatsapp` to the `consultant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `consultant` ADD COLUMN `no_whatsapp` VARCHAR(191) NOT NULL;
