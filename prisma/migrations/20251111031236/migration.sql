/*
  Warnings:

  - You are about to drop the column `member_card` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `member_card`,
    ADD COLUMN `member_card_url` VARCHAR(191) NULL;
