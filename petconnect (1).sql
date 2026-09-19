-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2026 at 05:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `petconnect`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_shelter_pet` (IN `p_name` VARCHAR(255), IN `p_type` VARCHAR(255), IN `p_breed` VARCHAR(255), IN `p_age` VARCHAR(255), IN `p_status` VARCHAR(255), IN `p_image` TEXT, IN `p_shelter_id` BIGINT)   BEGIN
    INSERT INTO pets (name, type, breed, age, status, image, shelter_id, created_at, updated_at)
    VALUES (p_name, p_type, p_breed, p_age, p_status, p_image, p_shelter_id, NOW(), NOW());
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `adopter_id` bigint(20) UNSIGNED NOT NULL,
  `pet_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `applications`
--
DELIMITER $$
CREATE TRIGGER `trg_update_pet_status_on_adoption` AFTER UPDATE ON `applications` FOR EACH ROW BEGIN
   
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
      
        UPDATE pets 
        SET status = 'adopted', updated_at = NOW() 
        WHERE id = NEW.pet_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'General',
  `description` text NOT NULL,
  `status` enum('Pending','Resolved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_16_134227_add_petconnect_fields_to_users_table', 1),
(5, '2026_08_16_134259_add_adopter_fields_to_users_table', 1),
(6, '2026_08_16_135526_create_personal_access_tokens_table', 1),
(7, '2026_08_16_152335_add_shelter_fields_to_users_table', 1),
(8, '2026_08_17_000001_create_shelters_table', 1),
(9, '2026_08_17_000002_add_shelter_id_to_users_table', 1),
(10, '2026_08_17_000003_add_username_to_users_table', 1),
(11, '2026_08_17_000004_add_password_changed_at_to_users_table', 1),
(12, '2026_08_23_154312_create_pets_table', 1),
(13, '2026_08_23_154313_create_applications_table', 1),
(14, '2026_08_23_172918_create_complaints_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'petconnect-shelter_staff', '4a6eee4ca744fe1e3b77f34f535c418e6270b31815a643642c2d9e0a14369c9e', '[\"*\"]', '2026-08-30 10:57:59', NULL, '2026-08-30 10:49:57', '2026-08-30 10:57:59'),
(2, 'App\\Models\\User', 2, 'petconnect-shelter_staff', '1e3b0148c18d7d5b49d967aae78489380b197bf11c7b5e22f3d5c04075edec75', '[\"*\"]', '2026-08-30 11:49:24', NULL, '2026-08-30 10:58:59', '2026-08-30 11:49:24'),
(3, 'App\\Models\\User', 3, 'petconnect-shelter_staff', '5a0817aa7fa2528bb8c2f67f979636195f828297972d02b35940b58d69d66043', '[\"*\"]', '2026-08-30 11:51:55', NULL, '2026-08-30 11:51:24', '2026-08-30 11:51:55'),
(4, 'App\\Models\\User', 4, 'petconnect-shelter_staff', '13000bbb41e31701af409cb3a911541ad0742828d5c4deb2d2eca7454b3c7914', '[\"*\"]', '2026-08-30 12:24:09', NULL, '2026-08-30 11:55:32', '2026-08-30 12:24:09'),
(5, 'App\\Models\\User', 5, 'petconnect-shelter_staff', '0e49cd2d35501c5d95a96e0254e419696ac0d831dbe435f988f46054e9d528e4', '[\"*\"]', '2026-09-17 23:21:22', NULL, '2026-09-17 23:14:51', '2026-09-17 23:21:22'),
(6, 'App\\Models\\User', 6, 'petconnect-shelter_staff', 'd25102ba300cd0091ea25976715fbb604c2f9d97d947a10e431b50b081f79a93', '[\"*\"]', '2026-09-17 23:48:40', NULL, '2026-09-17 23:27:21', '2026-09-17 23:48:40'),
(7, 'App\\Models\\User', 7, 'petconnect-shelter_staff', 'a6ecc5b4e26d9fd63e1e4007f954604ef45421a4dde74ed68a3d9fa8b3fc7b72', '[\"*\"]', '2026-09-17 23:51:33', NULL, '2026-09-17 23:51:30', '2026-09-17 23:51:33'),
(8, 'App\\Models\\User', 8, 'petconnect-shelter_staff', '972770d436d2417bffd6064a5e186a8aca8ff833c3a050345513e4a007f65d2f', '[\"*\"]', '2026-09-18 00:17:21', NULL, '2026-09-18 00:00:27', '2026-09-18 00:17:21'),
(9, 'App\\Models\\User', 9, 'petconnect-shelter_staff', 'd0f222607490931f5076de3f5764e7909c85173d197ee750f3d692aa537393c9', '[\"*\"]', '2026-09-18 00:23:02', NULL, '2026-09-18 00:22:27', '2026-09-18 00:23:02'),
(10, 'App\\Models\\User', 1, 'petconnect-shelter_staff', '6496eb39a142e3680347088ecca7719f5720cbc849f89809a95c04ed605663f7', '[\"*\"]', '2026-09-18 00:25:22', NULL, '2026-09-18 00:25:21', '2026-09-18 00:25:22'),
(11, 'App\\Models\\User', 1, 'petconnect-shelter_staff', 'a609f0454cdbcc1804819c26287194f69fbceb58d6ad4ff2fc82a94b4d4f7e28', '[\"*\"]', '2026-09-18 00:35:15', NULL, '2026-09-18 00:33:17', '2026-09-18 00:35:15'),
(12, 'App\\Models\\User', 10, 'petconnect-shelter_staff', '8e8f566d5a2135d8f1521fa6694c03d81669e740d2b3254b54b21df819851c35', '[\"*\"]', '2026-09-18 06:20:14', NULL, '2026-09-18 04:44:59', '2026-09-18 06:20:14');

-- --------------------------------------------------------

--
-- Table structure for table `pets`
--

CREATE TABLE `pets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `breed` varchar(255) DEFAULT NULL,
  `age` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Available',
  `shelter_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pets`
--

INSERT INTO `pets` (`id`, `name`, `type`, `breed`, `age`, `gender`, `description`, `image`, `status`, `shelter_id`, `created_at`, `updated_at`) VALUES
(4, 'Bella', 'Dog', 'Labrador Retriever', '2', 'Female', 'Playful Labrador who loves people and outdoor activities.', NULL, 'available', 1, '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(5, 'Milo', 'Cat', 'Domestic Shorthair', '1', 'Male', 'Playful young cat who would make a wonderful companion.', NULL, 'available', 2, '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(6, 'Coco', 'Dog', 'Beagle', '3', 'Female', 'Sweet and curious Beagle looking for a caring family.', NULL, 'available', 3, '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(17, 'jk', 'Dog', 'Bulldog', '2 years', NULL, NULL, NULL, 'Available', 13, '2026-09-18 05:19:51', '2026-09-18 05:19:51'),
(18, 'nbbm', 'Cat', 'persian', '1 year', NULL, NULL, NULL, 'Pending', 13, '2026-09-18 05:20:20', '2026-09-18 05:20:20'),
(19, 'pookie pookie', 'Dog', 'Bulldog', '1 year', NULL, NULL, NULL, 'Adopted', 13, '2026-09-18 05:21:05', '2026-09-18 05:21:05'),
(20, 'guguu', 'Dog', 'Bulldog', '2 years', NULL, NULL, NULL, 'Available', 13, '2026-09-18 11:41:33', '2026-09-18 11:41:33'),
(21, 'gigi', 'Cat', 'persian', '1 year', NULL, NULL, NULL, 'Adopted', 13, '2026-09-18 11:42:04', '2026-09-18 11:42:04'),
(22, 'jiji', 'Dog', 'persian', '1 year', NULL, NULL, NULL, 'Available', 13, '2026-09-18 11:46:04', '2026-09-18 11:46:04'),
(23, 'jk', 'Dog', 'persian', '1 year', NULL, NULL, NULL, 'Available', 13, '2026-09-18 11:56:54', '2026-09-18 11:56:54'),
(24, 'nbbm', 'Cat', 'persian', '1 year', NULL, NULL, NULL, 'Available', 13, '2026-09-18 12:17:19', '2026-09-18 12:17:19');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('4McanX9U18vr9b3MSApGvmTFPjxL9g8poCxp93WD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.138.0 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'eyJfdG9rZW4iOiIyZ2xXcVJYUkNWeFF4Y1FjU1M2eXlCSW9tckdvS2N3c3hDdU1BWVpKIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1789722132),
('HFV36jogDaY8UfXOQUXYVbYdM4fXo6ZaVb6lXk83', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJCNXowU1ZxeVhKNVNIQ3dSMHJlUkFKSGxCTXhRd2pwcTFNTGxBVTlQIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1789707717),
('ImQYKYtO8HCp0vWLy5HTDlJpCqLenTAAH3UGrE1r', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJRUzRzTHhITzBSQlAwdjR2NFM3ZWtxYWkxWlJKWVVwaUR3eE53aFdNIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1789721076),
('p4PMG0JPg9CL2Da3wb5ivfCsSaStArfEIPwloItg', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.135.0 Chrome/148.0.7778.280 Electron/42.8.1 Safari/537.36', 'eyJfdG9rZW4iOiJQM3hMOHpiUEpuOUJ0NGI0WGtPNzJaWXM1RzRhVEowVDdGdG4wc2gyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1788108376);

-- --------------------------------------------------------

--
-- Table structure for table `shelters`
--

CREATE TABLE `shelters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(255) NOT NULL,
  `status` enum('active','pending','inactive') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shelters`
--

INSERT INTO `shelters` (`id`, `name`, `location`, `contact_email`, `contact_phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Happy Paws Shelter', 'Dhaka', 'happypaws@example.com', '01711111111', 'active', '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(2, 'Safe Haven Animal Shelter', 'Uttara, Dhaka', 'safehaven@example.com', '01722222222', 'active', '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(3, 'Hope Animal Center', 'Mirpur, Dhaka', 'hopeanimal@example.com', '01733333333', 'active', '2026-08-30 10:45:19', '2026-08-30 10:45:19'),
(13, 'Safe Haven Shelter', 'Savar,Dhaka', 'shelter@gmail.com', '01660137883', 'active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('adopter','shelter_staff','platform_admin') NOT NULL DEFAULT 'adopter',
  `shelter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `shelter_name` varchar(255) DEFAULT NULL,
  `shelter_contact` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `password_changed_at`, `remember_token`, `created_at`, `updated_at`, `phone`, `address`, `role`, `shelter_id`, `shelter_name`, `shelter_contact`) VALUES
(1, 'fjgnfg', NULL, 'ishratifa2018@gmail.com', NULL, '$2y$12$Q5XX8NQ8yt0t8y/gm72dwuEm0sBFFAIvAtBbvgTzj/BUI4J3qtze2', NULL, NULL, '2026-08-30 10:49:57', '2026-08-30 10:49:57', '01660137993', NULL, 'shelter_staff', NULL, 'dfdg', '01626256855'),
(2, 'erter', NULL, 'ishratifa20181@gmail.com', NULL, '$2y$12$d7s8WcE0/OM7dv/MqJVwOuZn1.HvZQ/R3ASmI64rVcUZazF.VW/2i', NULL, NULL, '2026-08-30 10:58:59', '2026-08-30 10:58:59', '01660137993', NULL, 'shelter_staff', NULL, 'rgdhdf', '01626256855'),
(3, 'ayon', NULL, 'ishratifaq2018@gmail.com', NULL, '$2y$12$LB/n5S52Yhsd6Jz7GZ8MreWWRB1Jy88OUdqh19O9/EjhlBd9C9wR.', NULL, NULL, '2026-08-30 11:51:24', '2026-08-30 11:51:24', '01660137993', NULL, 'shelter_staff', NULL, 'fsdgs', '01626256855'),
(4, 'ayon', NULL, 'ishratifwa2018@gmail.com', NULL, '$2y$12$HlfKvQzyCgFlGhCOvqIPYekhww6staa16TpfS3p44yLSynY4GyVLO', NULL, NULL, '2026-08-30 11:55:32', '2026-08-30 12:24:09', '01660137992', 'Dhaka,Bangladesh', 'shelter_staff', NULL, 'bdhhffh', '01626256855'),
(5, 'fdsgfds', NULL, 'ishratifa2018e@gmail.com', NULL, '$2y$12$..JmypWouQF3A/9F7YfRLOc8m7I9ByMKcPw3za2FG9nkj.0vEkQZq', NULL, NULL, '2026-09-18 05:14:51', '2026-09-18 05:14:51', '01660137993', NULL, 'shelter_staff', NULL, 'fdfgdfg', '01626256855'),
(6, 'erter', NULL, 'ishratifa2018d@gmail.com', NULL, '$2y$12$KsIe3QKhpGFBv2Yh4v1Qy.G0.UsRi3PbmjV6vDkgnLl5Lfnanh1BG', NULL, NULL, '2026-09-18 05:27:20', '2026-09-18 05:27:20', '01660137993', NULL, 'shelter_staff', NULL, 'hdhfgd', '01626256855'),
(7, 'erter', NULL, 'ishratifa2018w@gmail.com', NULL, '$2y$12$Or3zbGSXu95LUJtxvzwc/.fn5a8A7.s0lRBG33NY.XxX7nlBJUXL.', NULL, NULL, '2026-09-18 05:51:30', '2026-09-18 05:51:30', '01660137993', NULL, 'shelter_staff', NULL, 'fdfgdfgh', '01626256855'),
(8, 'erter', NULL, 'ishratifsa2018@gmail.com', NULL, '$2y$12$7BSgoji/VyoPFn/1ZEUksuS/Fvdh8GRn/7gpm5wE633oLy15LC4Pu', NULL, NULL, '2026-09-18 06:00:27', '2026-09-18 06:00:27', '01660137993', NULL, 'shelter_staff', NULL, 'bdhhffhd', '01626256855'),
(9, 'fdsgfds', NULL, 'ishratdifsa2018@gmail.com', NULL, '$2y$12$khkyr9goggZx7xCXOTBhke4m8MJ5I53mvjs1u2fgPMfW3GFq/cOjS', NULL, NULL, '2026-09-18 06:22:27', '2026-09-18 06:22:27', '01660137993', NULL, 'shelter_staff', NULL, 'bdhhffhdf', '01626256855'),
(10, 'ayon', NULL, 'shelter@gmail.com', NULL, '$2y$12$/PZ0n1/9GoWuJXY/J1uepuxX64FhQGt/7JhNhcGWVAyJ.bN.EUAvC', NULL, NULL, '2026-09-18 04:44:59', '2026-09-18 04:44:59', '01660137883', NULL, 'shelter_staff', 13, 'Safe Haven Shelter', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `applications_adopter_id_pet_id_unique` (`adopter_id`,`pet_id`),
  ADD KEY `applications_pet_id_foreign` (`pet_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaints_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pets_shelter_id_foreign` (`shelter_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shelters`
--
ALTER TABLE `shelters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shelters_name_unique` (`name`),
  ADD UNIQUE KEY `shelters_contact_email_unique` (`contact_email`),
  ADD KEY `shelters_status_index` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_shelter_id_foreign` (`shelter_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `pets`
--
ALTER TABLE `pets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `shelters`
--
ALTER TABLE `shelters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_adopter_id_foreign` FOREIGN KEY (`adopter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `pets_shelter_id_foreign` FOREIGN KEY (`shelter_id`) REFERENCES `shelters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_shelter_id_foreign` FOREIGN KEY (`shelter_id`) REFERENCES `shelters` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
