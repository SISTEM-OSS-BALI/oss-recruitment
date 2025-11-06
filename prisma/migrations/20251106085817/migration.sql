/*
  Warnings:

  - Added the required column `type_job` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` ADD COLUMN `type_job` ENUM('TEAM_MEMBER', 'REFFERAL') NOT NULL;
