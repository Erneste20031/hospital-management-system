-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2026 at 11:25 AM
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
-- Database: `hospital_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `department_id` varchar(50) DEFAULT NULL,
  `department_name` varchar(100) DEFAULT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `time` varchar(20) NOT NULL,
  `type` enum('Checkup','Follow-up','Consultation','Emergency') DEFAULT 'Checkup',
  `reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled','In Progress') DEFAULT 'Scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `department_id`, `department_name`, `doctor_name`, `patient_name`, `date`, `time`, `type`, `reason`, `notes`, `status`, `created_at`) VALUES
(1, 2, 4, NULL, 'Neurology', 'Dr. Emily Davis', 'John Doe', '2026-06-02', '11:30 AM', 'Emergency', 'umutwe', 'ararembye', 'Completed', '2026-05-28 11:18:23'),
(2, 2, 6, NULL, 'Orthopedics', 'Dr. James Wilson', 'John Doe', '2026-06-02', '10:00 AM', 'Follow-up', NULL, NULL, 'Completed', '2026-05-28 11:23:17'),
(3, 4, 5, NULL, 'Pediatrics', 'Dr. Michael Chen', 'Mwiza Kiki', '2026-06-02', '11:30 AM', 'Consultation', 'check up', 'Checkup', 'Cancelled', '2026-05-28 16:08:53');

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` int(11) NOT NULL,
  `bill_number` varchar(50) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `due_date` date NOT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `insurance_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('Unpaid','Paid','Overdue') DEFAULT 'Unpaid',
  `paid_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `bg_color` varchar(50) DEFAULT NULL,
  `head` varchar(100) DEFAULT NULL,
  `doctors` int(11) DEFAULT 0,
  `patients` int(11) DEFAULT 0,
  `beds` int(11) DEFAULT 0,
  `available` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT 'Active',
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `icon`, `color`, `bg_color`, `head`, `doctors`, `patients`, `beds`, `available`, `status`, `description`) VALUES
(2, 'Neurology', '🧠', '#7c3aed', 'rgba(124,58,237,0.08)', '', 1, 0, 0, 0, 'Active', ''),
(3, 'Pediatrics', '❤️', '#0891b2', 'rgba(8,145,178,0.08)', '', 1, 0, 0, 0, 'Active', ''),
(4, 'Orthopedics', '🦴', '#16a34a', 'rgba(22,163,74,0.08)', NULL, 1, 0, 0, 0, 'Active', NULL),
(5, 'Dermatology', '🩺', '#d97706', 'rgba(217,119,6,0.08)', '', 1, 0, 0, 0, 'Active', ''),
(6, 'Ophthalmology', '👁️', '#0369a1', 'rgba(3,105,161,0.08)', NULL, 1, 0, 0, 0, 'Active', NULL),
(7, 'Surgery', '🔬', '#2563eb', '#2563eb18', 'Erneste Hage', 1, 1, 2, 1, 'Active', 'Birahari');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `specialization` varchar(100) NOT NULL,
  `qualification` varchar(100) NOT NULL,
  `experience` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `department` varchar(100) NOT NULL,
  `status` enum('Available','Busy','On Leave') DEFAULT 'Available',
  `patients_count` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 4.50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `specialization`, `qualification`, `experience`, `phone`, `department`, `status`, `patients_count`, `rating`) VALUES
(3, 6, 'Cardiologist', 'MD, FACC', '12 years', '+250 788 123 456', 'Cardiologyy', 'Available', 0, 4.80),
(4, 9, 'Neurologist', 'MD, PhDv', '15 years', '+250 788 123 458', 'Neurology', 'Available', 0, 4.90),
(5, 10, 'Pediatrician', 'MD', '8 years', '+250 788 123 457', 'Pediatrics', 'Available', 0, 4.60),
(6, 11, 'Orthopedic Surgeon', 'MS Ortho', '10 years', '+250 788 123 459', 'Orthopedics', 'Available', 0, 4.70),
(7, 12, 'Dermatologist', 'MDb', '11 years', '+250 788 123 460', 'Dermatology', 'Available', 0, 4.80),
(8, 13, 'Ophthalmologist', 'MD', '13 years', '+250 788 123 461', 'Ophthalmology', 'Available', 0, 4.80);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `uploaded_by` varchar(100) DEFAULT NULL,
  `upload_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `patient_id`, `name`, `type`, `file_path`, `file_size`, `uploaded_by`, `upload_date`) VALUES
(1, 2, 'Lipid Panel Results', 'Lab Report', NULL, '284 KB', 'Dr. Sarah Johnson', NULL),
(2, 2, 'Cardiology ECG Report', 'Imaging', NULL, '1.2 MB', 'Dr. Sarah Johnson', NULL),
(3, 2, 'Physiotherapy Referral', 'Referral', NULL, '120 KB', 'Dr. James Wilson', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medical_history`
--

CREATE TABLE `medical_history` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `visit_date` date NOT NULL,
  `diagnosis` varchar(255) NOT NULL,
  `treatment` text NOT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_history`
--

INSERT INTO `medical_history` (`id`, `patient_id`, `record_id`, `visit_date`, `diagnosis`, `treatment`, `doctor_name`, `notes`) VALUES
(1, 2, NULL, '2026-05-29', 'gh', 'fgh', NULL, 'fgh'),
(2, 2, NULL, '2026-05-29', 'Precitamolo', 'Precitamolo 19mg, Once in day for 2 week', NULL, 'Take it after eating'),
(3, 2, NULL, '2026-05-29', 'Precitamolo', 'Precitamolo 19mg, Once in day for 2 week', NULL, 'Take it after eating'),
(4, 3, NULL, '2026-05-29', 'gfhjh', 'dfgh', NULL, 'rtyu'),
(5, 3, NULL, '2026-05-29', 'gfhjh', 'dfgh', NULL, 'rtyu'),
(6, 3, NULL, '2026-05-29', 'Hypheness', 'Fever', NULL, 'Hiv sign'),
(7, 3, NULL, '2026-05-29', 'hhh', 'hhh', NULL, 'hhh'),
(8, 3, NULL, '2026-05-29', 'Umutwe', 'Once in day', NULL, 'Maboko'),
(9, 3, NULL, '2026-05-29', 'Umutwe', 'Once in day', NULL, 'Maboko'),
(10, 3, NULL, '2026-05-29', 'Umutwe', 'Once in day', NULL, 'Maboko'),
(11, 3, NULL, '2026-05-29', 'Umutwe', 'Once in day', NULL, 'Maboko'),
(12, 2, NULL, '2026-05-29', 'Precitamolo 19mg, Once in day for 2 week', 'Precitamolo 19mg, Once in day for 2 week', NULL, 'Take it after eatinggg'),
(13, 2, NULL, '2026-05-29', 'Precitamolo 19mg, Once in day for 2 week', 'Precitamolo 19mg, Once in day for 2 week', NULL, 'Take it after eating'),
(14, 4, NULL, '2026-05-29', 'rtyui', 'rtyui erfghj, dfghj for hhh', NULL, 'ggg'),
(15, 4, NULL, '2026-05-29', 'Qualiteme', 'Qualiteme Twice in dAY, 2 for 2HRS', NULL, 'Drink waters'),
(16, 2, NULL, '2026-06-01', 'Yez', 'Nibyo', NULL, 'Nibyo'),
(17, 3, NULL, '2026-06-01', 'sss', 'sss 12, 32 for dd', NULL, 'ssss');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `diagnosis` varchar(255) NOT NULL,
  `prescription` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('Active','Follow-up','Chronic','Resolved') DEFAULT 'Active',
  `allergies` text DEFAULT NULL,
  `last_visit` date DEFAULT NULL,
  `visits_count` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `doctor_id`, `doctor_name`, `patient_name`, `age`, `gender`, `blood_group`, `phone`, `diagnosis`, `prescription`, `notes`, `status`, `allergies`, `last_visit`, `visits_count`, `created_at`, `updated_at`) VALUES
(1, 2, 6, NULL, NULL, NULL, NULL, NULL, NULL, 'Yez', 'Nibyo', 'Nibyo', 'Active', 'No', '2026-06-01', 6, '2026-05-29 09:48:30', '2026-06-01 08:05:57'),
(3, 3, 6, NULL, NULL, NULL, NULL, NULL, NULL, 'sss', 'sss 12, 32 for dd', 'ssss', 'Active', NULL, '2026-06-01', 6, '2026-05-29 10:54:31', '2026-06-01 08:06:27'),
(4, 4, 6, 'Dr. James Wilson', NULL, NULL, NULL, NULL, NULL, 'Qualiteme', 'Qualiteme Twice in dAY, 2 for 2HRS', 'Drink waters', 'Active', NULL, '2026-05-29', 2, '2026-05-29 11:03:59', '2026-05-29 12:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `alt_phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `conditions` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `insurance_provider` varchar(100) DEFAULT NULL,
  `insurance_number` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `first_name`, `last_name`, `dob`, `age`, `gender`, `phone`, `alt_phone`, `email`, `address`, `city`, `emergency_contact`, `emergency_phone`, `blood_group`, `allergies`, `conditions`, `department`, `insurance_provider`, `insurance_number`, `status`, `created_at`) VALUES
(2, 7, 'John', 'Doe', NULL, 45, 'Male', '+250 788 111 222', NULL, 'patient@medicare.com', '', NULL, NULL, NULL, 'O+', NULL, NULL, 'Cardiology', NULL, NULL, 'Active', '2026-05-28 08:24:59'),
(3, 15, 'olivier', 'oli', '2026-05-28', 12, 'Female', '+250724198410', NULL, 'pf@gmail.com', 'Tumbah', 'Tumba', 'HAGENIMANA Erneste', NULL, 'A+', 'kkk', 'lll', 'Cardiology', 'kk', 'kk', 'Active', '2026-05-28 11:47:46'),
(4, 16, 'Mwiza', 'Kiki', '2026-05-04', 86, 'Other', '+250724198410', '+250724198410', 'mwiza@gmail.com', 'Tumba\nTumba', 'Tumba', 'HAGENIMANA Erneste', '+250724198410', 'A+', 'Latex', 'b10', 'Neurology', 'RSSB', 'RSSB', 'Active', '2026-05-28 16:06:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','doctor','patient','receptionist') NOT NULL,
  `avatar` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `created_at`) VALUES
(5, 'Admin User', 'admin@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '👨‍💼', '2026-05-28 08:21:53'),
(6, 'Dr. Sarah Johnson', 'doctor@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 08:21:53'),
(7, 'John Doe', 'patient@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', '👤', '2026-05-28 08:21:53'),
(8, 'Jane Smith', 'reception@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist', '💼', '2026-05-28 08:21:53'),
(9, 'Dr. Emily Davis', 'emily@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:18'),
(10, 'Dr. Michael Chen', 'michael@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:18'),
(11, 'Dr. James Wilson', 'james@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:18'),
(12, 'Dr. Priya Nair', 'priya@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:18'),
(13, 'Dr. Grace Lee', 'grace@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:19'),
(14, 'Dr. Patrick Habimana', 'patrick@medicare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '👨‍⚕️', '2026-05-28 11:16:19'),
(15, 'olivier oli', 'pf@gmail.com', '$2b$10$ndGeDwmaf44Q8Uxx9vEZh.REREq08E8i5jI80HbJBm.M2K81s5n0O', 'patient', NULL, '2026-05-28 11:47:46'),
(16, 'Mwiza Kiki', 'mwiza@gmail.com', '$2b$10$Rvnnh1YWBQV2r4erMJx7ceustjq/BAKSvl2WGR8ZQURik24H3NxeG', 'patient', NULL, '2026-05-28 16:06:14'),
(17, 'HAGENIMANA Erneste', 'shema@gmail.com', '$2b$10$UsSho6S3V3Po6CesEsHy9eZz2cMw2iuFUuOy4eLd/DbpiXCNST1n6', 'doctor', '👨‍⚕️', '2026-05-29 09:00:31'),
(18, 'Kiki Amero', 'kila@gmail.com', '$2b$10$jbbwkc5/TdNwxyIFZhwt4OAyJ0xYb4iulbtdBgvZjikl11T.jBeNS', 'patient', '👤', '2026-06-01 08:11:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bill_number` (`bill_number`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_id` (`bill_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `medical_history`
--
ALTER TABLE `medical_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `record_id` (`record_id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bill_items`
--
ALTER TABLE `bill_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medical_history`
--
ALTER TABLE `medical_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bill_items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_history`
--
ALTER TABLE `medical_history`
  ADD CONSTRAINT `medical_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_history_ibfk_2` FOREIGN KEY (`record_id`) REFERENCES `medical_records` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
