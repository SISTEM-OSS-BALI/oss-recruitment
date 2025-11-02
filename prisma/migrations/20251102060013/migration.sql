/*
  Warnings:

  - The values [HIRED] on the enum `history_candidate_stage` will be removed. If these variants are still used in the database, this will fail.
  - The values [HIRED] on the enum `history_candidate_stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `applicant` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRING', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE `history_candidate` MODIFY `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRING', 'REJECTED', 'WAITING') NOT NULL;
