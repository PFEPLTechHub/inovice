-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: invoice_system_testing
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `manager_info`
--

DROP TABLE IF EXISTS `manager_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_info` (
  `managerinfo_uid` int NOT NULL AUTO_INCREMENT,
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isactive` int NOT NULL DEFAULT '1',
  `role` int DEFAULT NULL,
  `manager_email` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`managerinfo_uid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_info`
--

LOCK TABLES `manager_info` WRITE;
/*!40000 ALTER TABLE `manager_info` DISABLE KEYS */;
INSERT INTO `manager_info` VALUES (2,'1','admin','1',1,1,NULL,'12.9716,77.5946'),(104,'P00125','Prashant Lingayat','P00125',1,0,'shaikhazeem4646@gmail.com','26.8467,80.9462'),(105,'P00135','Kshitija Kadam','P00135',1,0,'shaikhazeem8080545351@gmail.com','19.0760,72.8777'),(106,'P00035','Rahul Ranjan','P00035',1,0,NULL,'28.6139,77.2090'),(107,'P00042','Shrikant Kotian','P00042',1,0,NULL,'31.1048,77.1734'),(108,'P00079','Dnyandeep Jamnik','P00079',1,0,NULL,'31.1048,77.1734'),(109,'P00059','Tabish Kalsekar','P00059',1,0,NULL,'19.0760,72.8777'),(110,'P00061','Nilima Dalvi','P00061',1,0,NULL,'31.1048,77.1734'),(111,'P00085','Fahad Shaikh','P00085',1,0,NULL,'12.9716,77.5946'),(112,'P00099','Lahu Bhalerao','P00099',1,0,NULL,'13.0827,80.2707'),(113,'3','3','3',1,1,NULL,NULL),(114,'4','4','4',1,1,NULL,NULL),(115,'5','Dipali','5',1,0,'dipali.patel11999@gmail.com','13.0827,80.2707'),(116,'6','Amreen','6',1,0,'kaziamreen1999@gmail.com','13.0827,80.2707');
/*!40000 ALTER TABLE `manager_info` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-14 12:22:29
