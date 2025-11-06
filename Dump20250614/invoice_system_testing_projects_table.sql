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
-- Table structure for table `projects_table`
--

DROP TABLE IF EXISTS `projects_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects_table` (
  `projectstable_uid` int NOT NULL AUTO_INCREMENT,
  `project_name` varchar(255) NOT NULL,
  `project_address` varchar(255) NOT NULL,
  `isactive` int NOT NULL,
  `manager_id` int NOT NULL,
  PRIMARY KEY (`projectstable_uid`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `projects_table_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `manager_info` (`managerinfo_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects_table`
--

LOCK TABLES `projects_table` WRITE;
/*!40000 ALTER TABLE `projects_table` DISABLE KEYS */;
INSERT INTO `projects_table` VALUES (1,'BMC SO','Boomerang, B-2, 508/509, off, Chandivali Farm Rd, Chandivali, Powai, Mumbai, Maharashtra 400072',1,104),(2,'SOI Karnataka','154/20, Royal Space, 3rd Floor, 5th Main Road, HSR Layout, Bengaluru, Karnataka - 560068',1,105),(3,'SSLR Karnataka','154/20, Royal Space, 3rd Floor, 5th Main Road, HSR Layout, Bengaluru, Karnataka - 560068',1,105),(4,'SOI HP','VILLAGE SOLANG, SNOW NEST PAYING GUEST HOUSE, POST OFFICE PALCHAN, TEHSIL MANALI, MANALI, Kullu, Himachal Pradesh, 175103',1,106),(5,'SOI ARP','103 AND 105, khalaktang, WEST KAMENG, West Kameng, Arunachal Pradesh, 790002',1,106),(6,'KSSLR / KSOI','154/20, Royal Space, 3rd Floor, 5th Main Road, HSR Layout, Bengaluru, Karnataka-560068',1,107),(7,'Assam SOI','276, No. 1 Murkongselek, NH 515, Near Threejey School, Jonai Bazar, Dhemaji, Assam - 787060',1,107),(8,'Arunachal Pradesh SOI','103 AND 105, khalaktang, WEST KAMENG, West Kameng, Arunachal Pradesh, 790002',1,107),(9,'Tripura SOI','5TH FLOOR, B2 509, Boomerang Co-Op Premises Society Limited, Chandivali Farm Road, Chandivali, Mumbai, Mumbai Suburban, Maharashtra, 400072',1,107),(10,'SRA','Administrative Building, Anant Kanekar Marg, Bandra (E), Mumbai 40005',1,108),(11,'Head Office(FS)','Boomerang, B-2, 508/509, off, Chandivali Farm Rd, Chandivali, Powai, Mumbai, Maharashtra 400072',1,111),(12,'SSLR (RR)','na',1,106),(13,'SSLR (SK)','na',1,107),(14,'SSLR (PL)','na',1,104),(15,'Head Office(TK)','Boomerang, B-2, 508/509, off, Chandivali Farm Rd, Chandivali, Powai, Mumbai, Maharashtra 400072',1,109),(16,'Head Office(KK)','Boomerang, B-2, 508/509, off, Chandivali Farm Rd, Chandivali, Powai, Mumbai, Maharashtra 400072',1,105),(17,'Nerul','na',1,112),(18,'SOI','na',1,110),(19,'Konoha','assdsdsd',1,111),(20,'Konohaas','asasasaszx',1,104),(21,'1','swasas',1,108),(22,'saa','sasa',1,112),(23,'dwdswdswd','dsdsd',1,109);
/*!40000 ALTER TABLE `projects_table` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-14 12:22:30
