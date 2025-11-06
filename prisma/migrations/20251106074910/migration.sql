/*
  Warnings:

  - Added the required column `employment` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_type` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` ADD COLUMN `employment` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE') NOT NULL,
    ADD COLUMN `salary` VARCHAR(191) NOT NULL,
    ADD COLUMN `show_salary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `work_type` ENUM('ONSITE', 'HYBRID', 'REMOTE') NOT NULL;

-- CreateTable
CREATE TABLE `user_interest_tag` (
    `user_id` VARCHAR(191) NOT NULL,
    `interest` VARCHAR(191) NOT NULL,

    INDEX `user_interest_tag_interest_idx`(`interest`),
    PRIMARY KEY (`user_id`, `interest`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_interest_tag` ADD CONSTRAINT `user_interest_tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
