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
-- Table structure for table `forbidden_usernames`
--

DROP TABLE IF EXISTS `forbidden_usernames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forbidden_usernames` (
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forbidden_usernames`
--

LOCK TABLES `forbidden_usernames` WRITE;
/*!40000 ALTER TABLE `forbidden_usernames` DISABLE KEYS */;
INSERT INTO `forbidden_usernames` VALUES ('admin'),('fuck'),('kurac'),('picka'),('pička'),('peder'),('idiot');
/*!40000 ALTER TABLE `forbidden_usernames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `lang_key` varchar(20) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '0',
  `completed` enum('0','1') NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,'English','english','1','1'),(2,'Српски','srpski_cir','1','1'),(3,'Srpski','srpski_lat','1','1');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_items`
--

DROP TABLE IF EXISTS `list_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `list_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `is_repeating` enum('0','1') NOT NULL DEFAULT '0',
  `last_bought` int(11) DEFAULT NULL,
  `last_bought_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ListItems_Users` (`userID`),
  KEY `FK_ListItems_Bought_Users` (`last_bought`),
  KEY `FK_ListItems_Lists` (`listID`),
  CONSTRAINT `FK_ListItems_Bought_Users` FOREIGN KEY (`last_bought`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_ListItems_Lists` FOREIGN KEY (`listID`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ListItems_Users` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_items`
--

LOCK TABLES `list_items` WRITE;
/*!40000 ALTER TABLE `list_items` DISABLE KEYS */;
INSERT INTO `list_items` VALUES (1,1,'Test list item #3 - Edited',NULL,1,'1',NULL,NULL),(7,2,'item #2',NULL,1,'1',NULL,NULL),(31,1,'Test 3',NULL,1,'1',NULL,NULL),(45,1,'Test 4',NULL,1,'0',NULL,NULL),(46,1,'Test 5',NULL,1,'1',NULL,NULL),(47,1,'Test 6',NULL,1,'0',NULL,NULL),(48,1,'Test 7',NULL,1,'1',NULL,NULL),(49,1,'Test 8',NULL,1,'0',NULL,NULL),(50,1,'Test 9',NULL,1,'1',NULL,NULL),(60,18,'Hljeb',NULL,1,'1',NULL,NULL),(61,19,'cedevita',NULL,1,'0',NULL,NULL),(62,20,'Stavka #1',NULL,1,'0',NULL,NULL),(64,20,'Stavka #3',NULL,1,'0',NULL,NULL),(76,18,'Kisela',NULL,1,'1',NULL,NULL),(77,1,'Test list item #1',NULL,1,'0',NULL,NULL),(79,1,'Test list item #2',NULL,1,'1',NULL,NULL),(80,1,'Test list item #2',NULL,1,'1',NULL,NULL);
/*!40000 ALTER TABLE `list_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_users`
--

DROP TABLE IF EXISTS `list_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `list_users` (
  `listID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '0',
  UNIQUE KEY `UQ_ListID_UserID` (`listID`,`userID`),
  KEY `FK_ListUsers_Users` (`userID`),
  CONSTRAINT `FK_ListUsers_Lists` FOREIGN KEY (`listID`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ListUsers_Users` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_users`
--

LOCK TABLES `list_users` WRITE;
/*!40000 ALTER TABLE `list_users` DISABLE KEYS */;
INSERT INTO `list_users` VALUES (1,2,'1');
/*!40000 ALTER TABLE `list_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lists`
--

DROP TABLE IF EXISTS `lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lists`
--

LOCK TABLES `lists` WRITE;
/*!40000 ALTER TABLE `lists` DISABLE KEYS */;
INSERT INTO `lists` VALUES (1,1,'Test list #1','2017-04-21 20:38:41'),(2,6,'Test list by another user','2017-04-22 18:57:19'),(18,1,'Stvari za kuću','2017-06-20 18:03:37'),(19,1,'test list #2','2018-01-27 15:09:18'),(20,7,'Nova lista','2018-01-27 16:36:59');
/*!40000 ALTER TABLE `lists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_token`
--

DROP TABLE IF EXISTS `notification_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_token` (
  `userID` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `device` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_token`
--

LOCK TABLES `notification_token` WRITE;
/*!40000 ALTER TABLE `notification_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `function` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'about-us','about_us'),(2,'contact','contact'),(3,'o-nama','about_us'),(4,'kontakt','contact');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refresh_token` (
  `token` varchar(500) NOT NULL,
  `userID` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  KEY `FK_RefreshToken_User` (`userID`),
  CONSTRAINT `FK_RefreshToken_User` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGdvcml0aG0iOiJIUzI1NiIsImlzc3VlciI6ImRpZC15b3UtYnV5LWl0IiwiaWF0IjoxNjA1MTMzNDc1OTk1LCJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImdhYyJ9fQ.1nnud4JYpHj-yVtIdpTqH-AhOr7NMf0MsAtZsLCsL_4',1,'2020-11-11 22:24:35');
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_token`
--

DROP TABLE IF EXISTS `user_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_token` (
  `userID` int(11) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `system` varchar(50) NOT NULL DEFAULT 'android'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_token`
--

LOCK TABLES `user_token` WRITE;
/*!40000 ALTER TABLE `user_token` DISABLE KEYS */;
INSERT INTO `user_token` VALUES (1,'fPfidoRRD4Q:APA91bHzi1oZtqwOjU_6xaxQHOgEf-r04R8XyWdWW_i0weassF-8jiU0OBWG0h_tUzHqf4tVqTXrN-ASKNwd_Rk8CQ8d2O8roc4lAVmn34w05h4yytzzBwvo-x1nTzMxe7AZxTs4ZyjI','android'),(2,'dXptKZO-O5E:APA91bH07a2UXiyjeP5dlA6U8Dl9OpeHXMtZnitC_MmZy07VFtTogZkt_WbsWSJvt9ytcj2ilXANlOzFMq8aAtexd19mEj0ZeXoAHs3vAP4HImyLfE__KGLxLcl7VGn-ClRAOWdic5js','android'),(3,'dyMldql9RNu_FG2L3zUaol:APA91bFvvS1K-4ULg-Jn658GiD3GfZYoo3Ab-DqqSZRWn6s9xD3pzoDCx9oLwX_5wIZmfAZIGWPR2eO4oEDfFsMum2lmywwgZKwFj0GsdBL7uS2T_fWnSkLpsDeqh2pJR0NijX6dfM4T','android'),(4,'dqZJq6n_RLOOwrjBPqT7_2:APA91bEPhvyOOk5blx_kzZY2sGIxzsu1gYyX67MLvTJ7H1gCL5t6L0c5qx41rw9BBHaC36JsJcoMoDY30uwCgS4E87caGQyy5fjPqlDKh_D25TyeWEJFs7z2xceaadmLwJyw0yR794ru','android');
/*!40000 ALTER TABLE `user_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT 'default.png',
  `level` tinyint(1) NOT NULL DEFAULT 0,
  `lang` varchar(50) NOT NULL DEFAULT 'english',
  `activation_key` varchar(15) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '0',
  `date_registered` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Igor Ilic','gac','mr.gigiliIII@gmail.com','ec4136f96f2fa9dd52def83fe3a2097dd0cd657c37aa8096a4033e1a77a57a32','4204vQJD.jpeg',3,'english','f3b7a947f2','1','2017-04-17 13:43:18'),(2,'Test Tester','testUser','test@test.com','2a6e38a36408ccfde8dc8e17ce2b14d758dd13b5617dff9e5f54c9fb44576d59','default.png',0,'english','0b8e4ab7f4','1','2017-04-17 15:10:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-20 21:21:11
