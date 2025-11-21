/*
  Warnings:

  - Added the required column `implementation_date` to the `employee_setup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee_setup` ADD COLUMN `implementation_date` DATETIME(3) NOT NULL;
