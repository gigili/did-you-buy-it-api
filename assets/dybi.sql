-- MariaDB dump 10.18  Distrib 10.5.8-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: dybi
-- ------------------------------------------------------
-- Server version	10.5.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `list`
--

DROP TABLE IF EXISTS `list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_ba493a3aa39d75d8cf24a1e542` (`userID`),
  CONSTRAINT `FK_ba493a3aa39d75d8cf24a1e5423` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list`
--

LOCK TABLES `list` WRITE;
/*!40000 ALTER TABLE `list` DISABLE KEYS */;
INSERT INTO `list` VALUES (1,'My New List #1 - Edited','2020-11-29 00:38:02',1);
/*!40000 ALTER TABLE `list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_item`
--

DROP TABLE IF EXISTS `list_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `list_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listID` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` datetime NOT NULL,
  `is_repeating` enum('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `userID` int(11) NOT NULL,
  `userPurchasedID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_4c0189bf49c9ba2486d8f7f8c5` (`userID`),
  UNIQUE KEY `REL_f04b2f7e62075ea6cae5ad16ab` (`listID`),
  UNIQUE KEY `REL_1db39f57e1d76c4bb8046106ed` (`userPurchasedID`),
  CONSTRAINT `FK_1db39f57e1d76c4bb8046106edb` FOREIGN KEY (`userPurchasedID`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_4c0189bf49c9ba2486d8f7f8c5c` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f04b2f7e62075ea6cae5ad16abd` FOREIGN KEY (`listID`) REFERENCES `list` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_item`
--

LOCK TABLES `list_item` WRITE;
/*!40000 ALTER TABLE `list_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_user`
--

DROP TABLE IF EXISTS `list_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `list_user` (
  `listId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`listId`,`userId`),
  KEY `IDX_824632959cebf2a10e8b02243b` (`listId`),
  KEY `IDX_75e50eaaecd15e578f9aff0b37` (`userId`),
  CONSTRAINT `FK_75e50eaaecd15e578f9aff0b37a` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_824632959cebf2a10e8b02243b0` FOREIGN KEY (`listId`) REFERENCES `list` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_user`
--

LOCK TABLES `list_user` WRITE;
/*!40000 ALTER TABLE `list_user` DISABLE KEYS */;
INSERT INTO `list_user` VALUES (1,3);
/*!40000 ALTER TABLE `list_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refresh_token` (
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`token`),
  UNIQUE KEY `REL_85fa4ea5d54ccb8a76a15372c7` (`userID`),
  UNIQUE KEY `IDX_c38c91ad9a90e08f0213621c49` (`userID`,`token`),
  CONSTRAINT `FK_85fa4ea5d54ccb8a76a15372c76` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGdvcml0aG0iOiJIUzI1NiIsImlzc3VlciI6ImRpZC15b3UtYnV5LWl0IiwiaWF0IjoxNjA2NjA1MjYzMjk3LCJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImdhYyJ9fQ.EeVVqY09pmfHQbQS1APfuqjOCADJ7hx9wMVJZz78hAI',1);
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activation_key` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Igor Ilic','igor@igorilic.net','gac','e29785f6d4c556251ce8311016b0021479155ad6e6c451fc63d9104bff049fc0','1-image-002018b00e7473c6bbb362e1f6f42ecbe60294be05b086fde87243120e560566c94d4-V.jpg','a9e5a6ea-7d7b-','1'),(2,'Tester Test','github@igorilic.net','tester','e29785f6d4c556251ce8311016b0021479155ad6e6c451fc63d9104bff049fc0',NULL,'6ad88b69-7da6-','0'),(3,'Second Tester','test@igorilic.net','test','e29785f6d4c556251ce8311016b0021479155ad6e6c451fc63d9104bff049fc0',NULL,'ee30af3e-47bf-','0');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-29  2:32:56
