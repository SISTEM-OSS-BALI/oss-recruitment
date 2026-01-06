/*
  Warnings:

  - The values [NEW_APLICANT] on the enum `procedure_document_stage` will be removed. If these variants are still used in the database, this will fail.
  - The values [NEW_APLICANT] on the enum `procedure_document_stage` will be removed. If these variants are still used in the database, this will fail.
  - The values [NEW_APLICANT] on the enum `procedure_document_stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `applicant` MODIFY `stage` ENUM('NEW_APPLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE `history_candidate` MODIFY `stage` ENUM('NEW_APPLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NOT NULL;

-- AlterTable
ALTER TABLE `procedure_document` MODIFY `stage` ENUM('NEW_APPLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NOT NULL;
