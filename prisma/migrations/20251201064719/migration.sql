/*
  Warnings:

  - You are about to drop the column `image_url_back` on the `team_member_card_template` table. All the data in the column will be lost.
  - You are about to drop the column `image_url_front` on the `team_member_card_template` table. All the data in the column will be lost.
  - Added the required column `image` to the `team_member_card_template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `team_member_card_template` DROP COLUMN `image_url_back`,
    DROP COLUMN `image_url_front`,
    ADD COLUMN `image` VARCHAR(191) NOT NULL;
