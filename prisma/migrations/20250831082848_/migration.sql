/*
  Warnings:

  - You are about to drop the column `locationId` on the `job` table. All the data in the column will be lost.
  - Added the required column `location_id` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `job` DROP FOREIGN KEY `job_locationId_fkey`;

-- DropIndex
DROP INDEX `job_locationId_fkey` ON `job`;

-- AlterTable
ALTER TABLE `job` DROP COLUMN `locationId`,
    ADD COLUMN `location_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
