/*
  Warnings:

  - You are about to drop the column `status` on the `candidate` table. All the data in the column will be lost.
  - You are about to drop the `stage_recruitment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `stage_recruitment` DROP FOREIGN KEY `stage_recruitment_candidate_id_fkey`;

-- AlterTable
ALTER TABLE `candidate` DROP COLUMN `status`,
    ADD COLUMN `stage` ENUM('NEW_APLICANT', 'SCREENING', 'QUALIFIED', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL DEFAULT 'NEW_APLICANT';

-- DropTable
DROP TABLE `stage_recruitment`;
