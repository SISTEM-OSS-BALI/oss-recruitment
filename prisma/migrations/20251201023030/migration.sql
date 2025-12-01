/*
  Warnings:

  - You are about to drop the `skill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_job_id_fkey`;

-- DropTable
DROP TABLE `skill`;
