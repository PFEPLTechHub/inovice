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
-- Table structure for table `contract_user_info_backup`
--

DROP TABLE IF EXISTS `contract_user_info_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_user_info_backup` (
  `contractuserinfo_uid` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(255) NOT NULL,
  `employee_address` varchar(255) NOT NULL,
  `pan_no` varchar(20) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `project_id` int NOT NULL,
  `monthly_salary` decimal(10,2) NOT NULL,
  `food_allowance_per_day_amount` decimal(10,2) NOT NULL,
  `phone_no` varchar(15) NOT NULL,
  `mailid` varchar(255) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `template_no` varchar(50) NOT NULL,
  `email_send` tinyint(1) NOT NULL DEFAULT '0',
  `joining_date` date NOT NULL,
  `contractuserinfo_isactive` int NOT NULL DEFAULT '1',
  `manager_id` int DEFAULT NULL,
  PRIMARY KEY (`contractuserinfo_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_user_info_backup`
--

LOCK TABLES `contract_user_info_backup` WRITE;
/*!40000 ALTER TABLE `contract_user_info_backup` DISABLE KEYS */;
INSERT INTO `contract_user_info_backup` VALUES (1,'Fahad','London, England','123','12331212542314','HDFC ','124213',1,123.00,123.00,'123','shaikhfahad3210@gmail.com','M','temp1',0,'2024-01-01',1,1),(2,'Hello','Karntaka','456','456','465','456',1,456.00,546.00,'456','shakfahad3210@gmail.com','M','temp2',0,'2024-01-01',1,1);
/*!40000 ALTER TABLE `contract_user_info_backup` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-14 12:22:28
