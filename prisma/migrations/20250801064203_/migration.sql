/*
  Warnings:

  - You are about to drop the column `duration` on the `job` table. All the data in the column will be lost.
  - Added the required column `until_at` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `duration`,
    ADD COLUMN `until_at` DATETIME(3) NOT NULL;
