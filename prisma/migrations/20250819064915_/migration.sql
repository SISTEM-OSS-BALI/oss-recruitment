/*
  Warnings:

  - The values [QUALIFIED] on the enum `candidate_stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `candidate` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NOT NULL DEFAULT 'NEW_APLICANT';
