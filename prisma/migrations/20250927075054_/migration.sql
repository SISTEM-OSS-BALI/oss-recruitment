/*
  Warnings:

  - You are about to drop the column `mbti_test` on the `applicant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mbti_test_id]` on the table `applicant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `applicant` DROP COLUMN `mbti_test`,
    ADD COLUMN `mbti_test_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `applicant_mbti_test_id_key` ON `applicant`(`mbti_test_id`);

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_mbti_test_id_fkey` FOREIGN KEY (`mbti_test_id`) REFERENCES `mbti_test`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
