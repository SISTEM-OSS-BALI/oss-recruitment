-- CreateTable
CREATE TABLE `job` (
    `id` VARCHAR(191) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `job_role` VARCHAR(191) NOT NULL,
    `until_at` DATETIME(3) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `description_sections` JSON NULL,
    `requirement` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `salary_min` INTEGER NOT NULL,
    `salary_max` INTEGER NOT NULL,
    `type_job` ENUM('TEAM_MEMBER', 'REFFERAL') NOT NULL DEFAULT 'TEAM_MEMBER',
    `arrangement` ENUM('ONSITE', 'HYBRID', 'REMOTE') NOT NULL,
    `commitment` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE') NOT NULL,
    `is_have_domicile` BOOLEAN NOT NULL DEFAULT false,
    `is_draft` BOOLEAN NOT NULL DEFAULT true,
    `show_salary` BOOLEAN NOT NULL DEFAULT false,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `step` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NULL,
    `location_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `maps_url` VARCHAR(191) NOT NULL,
    `type` ENUM('HEAD_OFFICE', 'BRANCH_OFFICE') NOT NULL DEFAULT 'HEAD_OFFICE',
    `address` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'CANDIDATE') NOT NULL DEFAULT 'CANDIDATE',
    `phone` VARCHAR(191) NULL,
    `curiculum_vitae_url` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `no_identity` VARCHAR(191) NULL,
    `no_identity_url` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `date_of_birth` DATETIME(3) NULL,
    `photo_url` VARCHAR(191) NULL,
    `portfolio_url` VARCHAR(191) NULL,
    `no_unique` VARCHAR(191) NULL,
    `member_card_url` VARCHAR(191) NULL,
    `team_member_card_url` VARCHAR(191) NULL,
    `job_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_interest_tag` (
    `user_id` VARCHAR(191) NOT NULL,
    `interest` VARCHAR(191) NOT NULL,

    INDEX `user_interest_tag_interest_idx`(`interest`),
    PRIMARY KEY (`user_id`, `interest`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applicant` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NOT NULL,
    `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `screeningBaseId` VARCHAR(191) NULL,
    `screeningSubmittedAt` DATETIME(3) NULL,
    `mbti_test_id` VARCHAR(191) NULL,

    UNIQUE INDEX `applicant_mbti_test_id_key`(`mbti_test_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_evaluator` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `evaluator_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_day` (
    `day_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`day_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_time` (
    `time_id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`time_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history_candidate` (
    `id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_interview` (
    `id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `is_online` BOOLEAN NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `meeting_link` VARCHAR(191) NULL,
    `start_time` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_hired` (
    `id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `location_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offering_contract` (
    `id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `filePath` LONGTEXT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `candidateDecision` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `candidateDecisionAt` DATETIME(3) NULL,
    `candidateSignatureUrl` LONGTEXT NULL,
    `candidateSignaturePath` VARCHAR(191) NULL,
    `candidateSignatureSignedAt` DATETIME(3) NULL,
    `candidateRejectionReason` LONGTEXT NULL,
    `candidateSignedPdfPath` VARCHAR(191) NULL,
    `candidateSignedPdfAt` DATETIME(3) NULL,
    `directorSignatureRequestedAt` DATETIME(3) NULL,
    `candidateSignedPdfUrl` VARCHAR(191) NULL,
    `directorSignatureUrl` LONGTEXT NULL,
    `directorSignaturePath` VARCHAR(191) NULL,
    `directorSignedPdfUrl` VARCHAR(191) NULL,
    `directorSignatureSignedAt` DATETIME(3) NULL,
    `card_member` VARCHAR(191) NULL,
    `notifyEmail` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `no_whatsapp` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image_url_front` VARCHAR(191) NOT NULL,
    `image_url_back` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_member_card_template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `outputPath` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CREATED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `position` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mbti_test` (
    `id` VARCHAR(191) NOT NULL,
    `test_id` VARCHAR(191) NOT NULL,
    `link_url` VARCHAR(191) NULL,
    `is_complete` BOOLEAN NULL DEFAULT false,
    `result` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_document` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'OFFERING', 'HIRED', 'REJECTED', 'WAITING') NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `link_schedule` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL,
    `is_default` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evaluator_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluator_assignment` (
    `id` VARCHAR(191) NOT NULL,
    `base_matriks_id` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED') NOT NULL DEFAULT 'PENDING',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicant_id` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `link_url` VARCHAR(191) NULL,
    `overallScore` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluator_review` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `evaluator_review_assignmentId_questionId_key`(`assignmentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_base_screening` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `type` ENUM('TEAM_MEMBER', 'REFFERAL') NOT NULL,
    `allowMultipleSubmissions` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_screening` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `inputType` ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `helpText` VARCHAR(191) NULL,
    `placeholder` VARCHAR(191) NULL,
    `minLength` INTEGER NULL,
    `maxLength` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_option` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `question_option_questionId_order_idx`(`questionId`, `order`),
    UNIQUE INDEX `question_option_questionId_value_key`(`questionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_question_screening` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `answer_question_screening_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_selected_option` (
    `answerId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`answerId`, `optionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriks_base_question` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriks_column` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matriks_column_baseId_order_idx`(`baseId`, `order`),
    UNIQUE INDEX `matriks_column_baseId_value_key`(`baseId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_matriks` (
    `id` VARCHAR(191) NOT NULL,
    `baseId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `inputType` ENUM('SINGLE_CHOICE', 'TEXT') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `helpText` VARCHAR(191) NULL,
    `placeholder` VARCHAR(191) NULL,
    `maxScore` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriks_question_option` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matriks_question_option_questionId_order_idx`(`questionId`, `order`),
    UNIQUE INDEX `matriks_question_option_questionId_value_key`(`questionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriks_answer` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,

    INDEX `matriks_answer_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `note_interview` (
    `id` VARCHAR(191) NOT NULL,
    `note` LONGTEXT NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `isGroup` BOOLEAN NOT NULL DEFAULT false,
    `lastMessageAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicantId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `conversation_updatedAt_idx`(`updatedAt`),
    INDEX `conversation_lastMessageAt_idx`(`lastMessageAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participant` (
    `userId` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `lastReadAt` DATETIME(3) NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `participant_conversationId_userId_idx`(`conversationId`, `userId`),
    PRIMARY KEY (`userId`, `conversationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `content` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `editedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NULL,

    INDEX `message_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    INDEX `message_senderId_createdAt_idx`(`senderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachment` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `size` INTEGER NULL,

    INDEX `attachment_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_read` (
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_read_userId_messageId_idx`(`userId`, `messageId`),
    PRIMARY KEY (`messageId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_setup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_setup_question` (
    `id` VARCHAR(191) NOT NULL,
    `name_activity` VARCHAR(191) NOT NULL,
    `executor` VARCHAR(191) NOT NULL,
    `method` ENUM('CHECK', 'INPUT', 'LINK', 'UPLOAD') NOT NULL,
    `description` VARCHAR(191) NULL,
    `default_link` VARCHAR(191) NULL,
    `input_label` VARCHAR(191) NULL,
    `config` JSON NULL,
    `employeeSetupId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_setup_answer` (
    `id` VARCHAR(191) NOT NULL,
    `employeeSetupQuestionId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,
    `implementation_date` DATETIME(3) NULL,
    `value_text` VARCHAR(191) NULL,
    `value_link` VARCHAR(191) NULL,
    `value_file_url` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applicant_employee_setup` (
    `id` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `employeeSetupId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `applicant_employee_setup_applicantId_employeeSetupId_key`(`applicantId`, `employeeSetupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profil_company` (
    `id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `total_employee` INTEGER NOT NULL,
    `industry` VARCHAR(191) NOT NULL,
    `website_url` VARCHAR(191) NULL,
    `instagram_url` VARCHAR(191) NULL,
    `facebook_url` VARCHAR(191) NULL,
    `linkedin_url` VARCHAR(191) NULL,
    `twitter_url` VARCHAR(191) NULL,
    `logo_url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `job_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interest_tag` ADD CONSTRAINT `user_interest_tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_screeningBaseId_fkey` FOREIGN KEY (`screeningBaseId`) REFERENCES `question_base_screening`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant` ADD CONSTRAINT `applicant_mbti_test_id_fkey` FOREIGN KEY (`mbti_test_id`) REFERENCES `mbti_test`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_evaluator` ADD CONSTRAINT `schedule_evaluator_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_day` ADD CONSTRAINT `schedule_day_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedule_evaluator`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_time` ADD CONSTRAINT `schedule_time_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `schedule_day`(`day_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_candidate` ADD CONSTRAINT `history_candidate_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_interview` ADD CONSTRAINT `schedule_interview_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedule_evaluator`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_hired` ADD CONSTRAINT `schedule_hired_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offering_contract` ADD CONSTRAINT `offering_contract_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `contract_template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_base_matriks_id_fkey` FOREIGN KEY (`base_matriks_id`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_assignment` ADD CONSTRAINT `evaluator_assignment_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `evaluator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_review` ADD CONSTRAINT `evaluator_review_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `evaluator_assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluator_review` ADD CONSTRAINT `evaluator_review_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_screening` ADD CONSTRAINT `question_screening_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `question_base_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_option` ADD CONSTRAINT `question_option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_question_screening` ADD CONSTRAINT `answer_question_screening_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_screening`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_question_screening` ADD CONSTRAINT `answer_question_screening_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_selected_option` ADD CONSTRAINT `answer_selected_option_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `answer_question_screening`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_selected_option` ADD CONSTRAINT `answer_selected_option_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `question_option`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriks_column` ADD CONSTRAINT `matriks_column_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_matriks` ADD CONSTRAINT `question_matriks_baseId_fkey` FOREIGN KEY (`baseId`) REFERENCES `matriks_base_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriks_question_option` ADD CONSTRAINT `matriks_question_option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriks_answer` ADD CONSTRAINT `matriks_answer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question_matriks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matriks_answer` ADD CONSTRAINT `matriks_answer_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `note_interview` ADD CONSTRAINT `note_interview_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participant` ADD CONSTRAINT `participant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participant` ADD CONSTRAINT `participant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_read` ADD CONSTRAINT `message_read_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_read` ADD CONSTRAINT `message_read_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_setup_question` ADD CONSTRAINT `employee_setup_question_employeeSetupId_fkey` FOREIGN KEY (`employeeSetupId`) REFERENCES `employee_setup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_setup_answer` ADD CONSTRAINT `employee_setup_answer_employeeSetupQuestionId_fkey` FOREIGN KEY (`employeeSetupQuestionId`) REFERENCES `employee_setup_question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant_employee_setup` ADD CONSTRAINT `applicant_employee_setup_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicant_employee_setup` ADD CONSTRAINT `applicant_employee_setup_employeeSetupId_fkey` FOREIGN KEY (`employeeSetupId`) REFERENCES `employee_setup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profil_company` ADD CONSTRAINT `profil_company_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
