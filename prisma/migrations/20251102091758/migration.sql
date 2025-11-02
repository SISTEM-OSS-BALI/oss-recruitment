/*
  Warnings:

  - The values [HIRING] on the enum `history_candidate_stage` will be removed. If these variants are still used in the database, this will fail.
  - The values [HIRING] on the enum `history_candidate_stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `applicant` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE `history_candidate` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NOT NULL;
