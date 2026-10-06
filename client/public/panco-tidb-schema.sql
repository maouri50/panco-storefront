-- Panco: one-time TiDB production setup
-- In TiDB Cloud SQL Editor, select the same database used by the
-- DATABASE_URL in Vercel, paste this entire file, and click Run.
-- This creates Panco's editable catalog, announcement, and newsletter tables.
-- It is safe to run once on an empty database.

CREATE TABLE IF NOT EXISTS `catalog_items` (
  `id` int AUTO_INCREMENT NOT NULL,
  `slug` varchar(160) NOT NULL,
  `name` varchar(160) NOT NULL,
  `category` varchar(120) NOT NULL,
  `price` varchar(32) NOT NULL,
  `was` varchar(32),
  `image` text NOT NULL,
  `galleryJson` text NOT NULL,
  `swatchesJson` text NOT NULL,
  `colorsJson` text NOT NULL,
  `tag` varchar(80),
  `description` text NOT NULL,
  `highlightsJson` text NOT NULL,
  `published` boolean NOT NULL DEFAULT true,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `catalog_items_id` PRIMARY KEY(`id`),
  CONSTRAINT `catalog_items_slug_unique` UNIQUE(`slug`)
);
CREATE INDEX `catalog_items_public_order` ON `catalog_items` (`published`,`displayOrder`);

CREATE TABLE IF NOT EXISTS `announcement_settings` (
  `id` int NOT NULL,
  `enabled` boolean NOT NULL DEFAULT true,
  `messagesJson` text NOT NULL,
  `backgroundColor` varchar(24) NOT NULL DEFAULT '#18362a',
  `textColor` varchar(24) NOT NULL DEFAULT '#f6f5f2',
  `fontStyle` varchar(24) NOT NULL DEFAULT 'mono',
  `rotationSeconds` int NOT NULL DEFAULT 4,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `announcement_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `email` varchar(320) NOT NULL,
  `status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  `consentedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
  CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
CREATE INDEX `newsletter_subscribers_status` ON `newsletter_subscribers` (`status`,`consentedAt`);
