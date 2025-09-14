/*
  Warnings:

  - You are about to alter the column `status` on the `candidate` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.
  - The values [MANAGEMENT_INTERVIEW,USER_INTERVIEW] on the enum `stage_recruitment_stage` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `date_of_birth` to the `candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `candidate` ADD COLUMN `date_of_birth` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('NEW_APLICANT', 'SCREENING', 'QUALIFIED', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL DEFAULT 'NEW_APLICANT';

-- AlterTable
ALTER TABLE `stage_recruitment` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'QUALIFIED', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL;
