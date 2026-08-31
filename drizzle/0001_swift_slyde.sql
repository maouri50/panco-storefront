CREATE TABLE `announcement_settings` (
	`id` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`messagesJson` text NOT NULL,
	`backgroundColor` varchar(24) NOT NULL DEFAULT '#18362a',
	`textColor` varchar(24) NOT NULL DEFAULT '#f6f5f2',
	`fontStyle` varchar(24) NOT NULL DEFAULT 'mono',
	`rotationSeconds` int NOT NULL DEFAULT 4,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcement_settings_id` PRIMARY KEY(`id`)
);
