-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 08, 2026 at 06:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `witbri_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `group_chats`
--

CREATE TABLE `group_chats` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `max_members` int(11) DEFAULT 100,
  `invite_link` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `polls`
--

CREATE TABLE `polls` (
  `id` int(11) NOT NULL,
  `question` varchar(500) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `is_multi_choice` tinyint(1) DEFAULT 0,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_votes` int(11) DEFAULT 0,
  `status` enum('active','closed','expired') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `image_url` longtext DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `duration` int(11) DEFAULT 15,
  `caption` varchar(500) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `status` enum('active','expired','archived') DEFAULT 'active',
  `privacy` enum('public','friends','custom') DEFAULT 'public'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT 'https://via.placeholder.com/150',
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar_url`, `bio`, `created_at`) VALUES
(1, 'wit', 'witnessfabrice@gmail', '$2b$10$kvuA9ILpqjJQ8okn64S1hOXl7G3G0dFpfaiZ3ERAGGXT88EupeoLK', 'https://via.placeholder.com/150', NULL, '2026-02-06 03:22:55'),
(2, 'me', 'me@gmail.com', '$2b$10$SPrHwD//qZaaGeGs.Vcqce8JXETmfwA3msLSVNTFb56opNMHYcLQG', 'https://via.placeholder.com/150', NULL, '2026-02-06 03:24:49'),
(3, 'kam', 'kam@gmail.com', '$2b$10$IQSLeDH0K7IY4OqE8MTYeOd77gGIua85wjbPgeFbIC1XP3Dlovw/6', 'https://via.placeholder.com/150', NULL, '2026-02-06 06:09:35'),
(4, 'do', 'kamuhandaaline@gmail.com', '$2b$10$ftHDkKcI3Xac6CWzW9jE9et.IcKhp.kEnfPLn1A8FeJw5dpEmsJEy', 'https://via.placeholder.com/150', NULL, '2026-02-06 06:48:41'),
(5, 'be', 'be@gmail.com', '$2b$10$z6N6HsQI.Xf63TH/lepeoOmp6xu/mpooM2l3Nu/EfDN.RbqDCqxse', 'https://via.placeholder.com/150', NULL, '2026-02-06 06:57:55'),
(9, 'yu', 'hy@gnma.com', '$2b$10$ukLLoj7uUCyKn7VW.d3wf.jGZPABwH06iFXi9viX9DZtwvb./Q3uq', 'https://via.placeholder.com/150', NULL, '2026-02-08 17:02:19'),
(10, 'yuyu', 'witnessfabrice@gmail.com', '$2b$10$s2UEMF5nmIRpwcv4kuJKE.LHeqkpVPStQg5J3.3FW8ML8wzeASWw2', 'https://via.placeholder.com/150', NULL, '2026-02-08 17:02:46'),
(12, 'fill', 'witnessafabrice@gmail.com', '$2b$10$iM60q1ovUGw74KryTRv7VOGFQ1s7Ck6/onlK0VPA/1PFIGOKACITq', 'https://via.placeholder.com/150', NULL, '2026-02-08 17:03:43'),
(13, 'meg', 'myQ@gmail.com', '$2b$10$Ca25ewAQPzCWu2PJ2Mw5vOhrpn4MNS564Cc0b8GyOeYbjK4a4RXVC', 'https://via.placeholder.com/150', NULL, '2026-02-08 17:25:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `group_chats`
--
ALTER TABLE `group_chats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invite_link` (`invite_link`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_invite_link` (`invite_link`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_polls` (`created_by`,`created_at`),
  ADD KEY `idx_active_polls` (`status`,`expires_at`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_stories` (`user_id`,`created_at`),
  ADD KEY `idx_active_expires` (`status`,`expires_at`),
  ADD KEY `idx_public_feed` (`privacy`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `group_chats`
--
ALTER TABLE `group_chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `polls`
--
ALTER TABLE `polls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `group_chats`
--
ALTER TABLE `group_chats`
  ADD CONSTRAINT `group_chats_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `polls`
--
ALTER TABLE `polls`
  ADD CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
