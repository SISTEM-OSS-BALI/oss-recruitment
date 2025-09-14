/*
  Warnings:

  - You are about to drop the column `locationId` on the `schedule_hired` table. All the data in the column will be lost.
  - Added the required column `location_id` to the `schedule_hired` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `schedule_hired` DROP FOREIGN KEY `schedule_hired_locationId_fkey`;

-- DropIndex
DROP INDEX `schedule_hired_locationId_fkey` ON `schedule_hired`;

-- AlterTable
ALTER TABLE `schedule_hired` DROP COLUMN `locationId`,
    ADD COLUMN `location_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
