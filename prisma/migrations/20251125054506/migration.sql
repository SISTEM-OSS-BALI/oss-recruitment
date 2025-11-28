/*
  Warnings:

  - You are about to drop the column `address` on the `profil_company` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `profil_company` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `profil_company` table. All the data in the column will be lost.
  - Added the required column `industry` to the `profil_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_employee` to the `profil_company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profil_company` DROP COLUMN `address`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`,
    ADD COLUMN `facebook_url` VARCHAR(191) NULL,
    ADD COLUMN `industry` VARCHAR(191) NOT NULL,
    ADD COLUMN `instagram_url` VARCHAR(191) NULL,
    ADD COLUMN `linkedin_url` VARCHAR(191) NULL,
    ADD COLUMN `total_employee` INTEGER NOT NULL,
    ADD COLUMN `twitter_url` VARCHAR(191) NULL,
    ADD COLUMN `website_url` VARCHAR(191) NULL;
