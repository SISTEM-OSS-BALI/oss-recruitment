/*
  Warnings:

  - You are about to drop the column `locationId` on the `schedule_interview` table. All the data in the column will be lost.
  - Added the required column `location_id` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `schedule_interview` DROP FOREIGN KEY `schedule_interview_locationId_fkey`;

-- DropIndex
DROP INDEX `schedule_interview_locationId_fkey` ON `schedule_interview`;

-- AlterTable
ALTER TABLE `schedule_interview` DROP COLUMN `locationId`,
    ADD COLUMN `location_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
