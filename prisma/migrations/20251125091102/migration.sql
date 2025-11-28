/*
  Warnings:

  - Added the required column `user_id` to the `profil_company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profil_company` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `profil_company` ADD CONSTRAINT `profil_company_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
