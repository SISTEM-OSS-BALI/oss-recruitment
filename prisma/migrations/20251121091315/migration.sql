/*
  Warnings:

  - You are about to drop the column `implementation_date` on the `employee_setup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee_setup` DROP COLUMN `implementation_date`;

-- AlterTable
ALTER TABLE `employee_setup_answer` ADD COLUMN `implementation_date` DATETIME(3) NULL;
