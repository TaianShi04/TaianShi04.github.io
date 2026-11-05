CREATE TABLE `planner_state` (
	`user_id` text NOT NULL,
	`state_key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `state_key`)
);
