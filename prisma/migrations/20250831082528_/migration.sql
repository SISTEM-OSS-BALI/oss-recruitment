-- DropForeignKey
ALTER TABLE `job` DROP FOREIGN KEY `job_locationId_fkey`;

-- DropIndex
DROP INDEX `job_locationId_fkey` ON `job`;

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
