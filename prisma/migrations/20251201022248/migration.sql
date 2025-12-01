/*
  Warnings:

  - A unique constraint covering the columns `[job_id,name]` on the table `skill` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `skill_name_key` ON `skill`;

-- CreateIndex
CREATE UNIQUE INDEX `skill_job_id_name_key` ON `skill`(`job_id`, `name`);
