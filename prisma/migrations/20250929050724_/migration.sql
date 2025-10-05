/*
  Warnings:

  - You are about to drop the column `location_id` on the `schedule_interview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `schedule_interview` DROP FOREIGN KEY `schedule_interview_location_id_fkey`;

-- DropIndex
DROP INDEX `schedule_interview_location_id_fkey` ON `schedule_interview`;

-- AlterTable
ALTER TABLE `schedule_interview` DROP COLUMN `location_id`;
