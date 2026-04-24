-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-04-2026 a las 04:58:36
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `psychoway`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agenda`
--

CREATE TABLE `agenda` (
  `id_agenda` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chatbot`
--

CREATE TABLE `chatbot` (
  `id_chatbot` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diary`
--

CREATE TABLE `diary` (
  `id_diary` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `diary_visibility` varchar(20) DEFAULT 'yo-psicologo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `diary`
--

INSERT INTO `diary` (`id_diary`, `id_user`, `fecha`, `last_update`, `diary_visibility`) VALUES
(1, 3, '2026-04-11', '2026-04-11 23:50:15', 'yo-psicologo'),
(2, 4, '2026-04-11', '2026-04-12 01:00:22', 'yo-psicologo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diary_entries`
--

CREATE TABLE `diary_entries` (
  `id_diary_entries` int(11) NOT NULL,
  `id_diary` int(11) DEFAULT NULL,
  `entry_date` datetime DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `id_emotions` int(11) DEFAULT NULL,
  `id_objetives` int(11) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `diary_entries`
--

INSERT INTO `diary_entries` (`id_diary_entries`, `id_diary`, `entry_date`, `description`, `id_emotions`, `id_objetives`, `last_update`) VALUES
(1, 1, '2026-04-11 18:50:15', 'Estoy feliz porque sí', 1, NULL, '2026-04-12 00:24:39'),
(2, 1, '2026-04-11 19:23:57', 'Me gusta el K drama', 1, NULL, '2026-04-12 00:23:57'),
(3, 1, '2026-04-11 19:28:02', 'hola soy pro', 1, NULL, '2026-04-12 00:28:02'),
(4, 1, '2026-04-11 19:40:47', 'Etoi tiste porque creí que Lim Joo-kyung se iba a separar de Lee Su-ho', 6, 1, '2026-04-12 00:40:47'),
(5, 1, '2026-04-11 19:42:41', 'Pobre Han Seou-Joon, al final se quedó solito', 2, 1, '2026-04-12 00:42:41'),
(6, 2, '2026-04-11 20:00:22', 'Wiwiwiwi', 1, 2, '2026-04-12 01:00:22'),
(7, 2, '2026-04-11 20:01:29', 'Guagua', 2, 3, '2026-04-12 01:01:29'),
(8, 2, '2026-04-23 19:13:19', 'Hola', 1, 3, '2026-04-24 00:13:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `emotions`
--

CREATE TABLE `emotions` (
  `id_emotions` int(11) NOT NULL,
  `emot_name` varchar(45) DEFAULT NULL,
  `emot_estado` varchar(45) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `emotions`
--

INSERT INTO `emotions` (`id_emotions`, `emot_name`, `emot_estado`, `last_update`) VALUES
(1, 'Muy Feliz', 'Positivo', '2026-04-11 23:50:15'),
(2, 'Muy Triste', 'Negativo', '2026-04-12 00:01:39'),
(3, 'Neutral', 'Neutral', '2026-04-12 00:01:50'),
(4, 'Feliz', 'Positivo', '2026-04-12 00:02:10'),
(6, 'Triste', 'Negativo', '2026-04-12 00:40:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `history_chatbot`
--

CREATE TABLE `history_chatbot` (
  `id_history_chatbot` int(11) NOT NULL,
  `conversation` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `id_chatbot` int(11) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `meetings_agenda`
--

CREATE TABLE `meetings_agenda` (
  `id_meetings_agenda` int(11) NOT NULL,
  `day` varchar(45) DEFAULT NULL,
  `hour` time DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_user` int(11) DEFAULT NULL,
  `id_professional` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `objetivos`
--

CREATE TABLE `objetivos` (
  `id_objetives` int(11) NOT NULL,
  `nombre_objetivo` varchar(45) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `objetivos`
--

INSERT INTO `objetivos` (`id_objetives`, `nombre_objetivo`, `descripcion`, `estado`, `last_update`, `id_user`) VALUES
(1, 'Aprender Japonés', 'Amm, hacer Anki todos los días', 'No Cumplido', '2026-04-12 00:40:45', 3),
(2, 'Aprender POO', 'Necesito tener bases para que la ia haga todo', 'No Cumplido', '2026-04-12 00:57:16', 3),
(3, 'Terminar este Sprint', 'Ayuda', 'No Cumplido', '2026-04-12 01:00:41', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Aprendiz'),
(2, 'Psicologo'),
(3, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `document` varchar(15) NOT NULL,
  `doc_type` varchar(45) NOT NULL,
  `names` varchar(45) NOT NULL,
  `last_names` varchar(45) NOT NULL,
  `birth_date` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `document`, `doc_type`, `names`, `last_names`, `birth_date`, `email`, `password`, `id_rol`, `last_update`) VALUES
(1, '323456789', 'CC', 'Admin', 'Administrador', '2025-12-11', 'Admin@Admin.com', '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 3, '2026-04-11 23:22:46'),
(2, '223456789', 'CC', 'Psicólogo', 'Psicólogo', '2025-12-11', 'psicologo@psicologo.com', '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 2, '2026-04-11 23:17:56'),
(3, '123456789', 'CC', 'Aprendiz', 'Aprendiz', '2025-12-11', 'Aprendiz@Aprendiz.com', '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 1, '2026-04-11 23:20:47'),
(4, '987654321', 'CC', 'Luis', 'Zapata', '2026-04-11', 'itslucky535@gmail.com', '$2b$10$UOVlkFlObzfRIHwuWubh7eKnlw.f.a56vxTCcn4WEqgQBd9HG8gPy', 1, '2026-04-12 00:59:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_activity`
--

CREATE TABLE `user_activity` (
  `id_user_activity` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `session_start` datetime DEFAULT NULL,
  `session_end` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `browser` varchar(45) DEFAULT NULL,
  `os` varchar(45) DEFAULT NULL,
  `visited_section` varchar(45) DEFAULT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD PRIMARY KEY (`id_agenda`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `chatbot`
--
ALTER TABLE `chatbot`
  ADD PRIMARY KEY (`id_chatbot`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `diary`
--
ALTER TABLE `diary`
  ADD PRIMARY KEY (`id_diary`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `diary_entries`
--
ALTER TABLE `diary_entries`
  ADD PRIMARY KEY (`id_diary_entries`),
  ADD KEY `id_diary` (`id_diary`),
  ADD KEY `id_emotions` (`id_emotions`),
  ADD KEY `id_objetives` (`id_objetives`);

--
-- Indices de la tabla `emotions`
--
ALTER TABLE `emotions`
  ADD PRIMARY KEY (`id_emotions`);

--
-- Indices de la tabla `history_chatbot`
--
ALTER TABLE `history_chatbot`
  ADD PRIMARY KEY (`id_history_chatbot`),
  ADD KEY `id_chatbot` (`id_chatbot`);

--
-- Indices de la tabla `meetings_agenda`
--
ALTER TABLE `meetings_agenda`
  ADD PRIMARY KEY (`id_meetings_agenda`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_professional` (`id_professional`);

--
-- Indices de la tabla `objetivos`
--
ALTER TABLE `objetivos`
  ADD PRIMARY KEY (`id_objetives`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `user_activity`
--
ALTER TABLE `user_activity`
  ADD KEY `user_activity_ibfk_1` (`id_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `agenda`
--
ALTER TABLE `agenda`
  MODIFY `id_agenda` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `chatbot`
--
ALTER TABLE `chatbot`
  MODIFY `id_chatbot` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `diary`
--
ALTER TABLE `diary`
  MODIFY `id_diary` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `diary_entries`
--
ALTER TABLE `diary_entries`
  MODIFY `id_diary_entries` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `emotions`
--
ALTER TABLE `emotions`
  MODIFY `id_emotions` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `history_chatbot`
--
ALTER TABLE `history_chatbot`
  MODIFY `id_history_chatbot` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `meetings_agenda`
--
ALTER TABLE `meetings_agenda`
  MODIFY `id_meetings_agenda` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `objetivos`
--
ALTER TABLE `objetivos`
  MODIFY `id_objetives` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Filtros para la tabla `chatbot`
--
ALTER TABLE `chatbot`
  ADD CONSTRAINT `chatbot_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Filtros para la tabla `diary`
--
ALTER TABLE `diary`
  ADD CONSTRAINT `diary_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Filtros para la tabla `history_chatbot`
--
ALTER TABLE `history_chatbot`
  ADD CONSTRAINT `history_chatbot_ibfk_1` FOREIGN KEY (`id_chatbot`) REFERENCES `chatbot` (`id_chatbot`);

--
-- Filtros para la tabla `meetings_agenda`
--
ALTER TABLE `meetings_agenda`
  ADD CONSTRAINT `fk_meeting_prof` FOREIGN KEY (`id_professional`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_meeting_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Filtros para la tabla `objetivos`
--
ALTER TABLE `objetivos`
  ADD CONSTRAINT `fk_objetivo_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);

--
-- Filtros para la tabla `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `user_activity_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
