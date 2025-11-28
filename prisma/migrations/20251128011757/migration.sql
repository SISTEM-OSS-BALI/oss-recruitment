/*
  Warnings:

  - You are about to drop the column `employment` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `work_type` on the `job` table. All the data in the column will be lost.
  - Added the required column `arrangement` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commitment` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_role` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_title` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_max` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_min` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `employment`,
    DROP COLUMN `name`,
    DROP COLUMN `salary`,
    DROP COLUMN `work_type`,
    ADD COLUMN `arrangement` ENUM('ONSITE', 'HYBRID', 'REMOTE') NOT NULL,
    ADD COLUMN `commitment` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE') NOT NULL,
    ADD COLUMN `description_sections` JSON NULL,
    ADD COLUMN `is_draft` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `is_have_domicile` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `job_role` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_title` VARCHAR(191) NOT NULL,
    ADD COLUMN `requirement` JSON NULL,
    ADD COLUMN `salary_max` INTEGER NOT NULL,
    ADD COLUMN `salary_min` INTEGER NOT NULL,
    ADD COLUMN `step` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `user_id` VARCHAR(191) NULL,
    MODIFY `type_job` ENUM('TEAM_MEMBER', 'REFFERAL') NOT NULL DEFAULT 'TEAM_MEMBER';

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
