-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: capstone
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `author` varchar(100) NOT NULL,
  `publisher` varchar(100) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `published_year` year DEFAULT NULL,
  PRIMARY KEY (`book_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `book_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
INSERT INTO `book` VALUES (1,1,'임헌찬 외 2인','북두출판사','9791166754548','전자공학과',2024),(2,2,'한학근','문운당','9791156922483','전자공학과',2016),(3,3,'한학근','동일출판사','9788938111876','전자공학과',2018),(4,4,'김경희 외 1인','한빛아카데미','9791156645306','정보통신과',2021),(5,5,'김수원 외 7인','홍릉과학출판사','9788945001658','정보통신과',2017),(6,6,'이종원','한빛아카데미','9791156641599','정보통신과',2017),(7,7,'검정연구회','동일출판사','9788938116871','전기과',2024),(8,8,'손혜영','인피니티북스','9788992649919','전기과',2016),(9,9,'천인국','생능출판사','9788970506678','전기과',2023),(10,10,'하정우','북두출판사','9791166754487','전자공학과',2024),(11,11,'오종오, 김승겸','북두출판사','9791159066245','전자공학과',2015),(12,12,'임석구, 홍경호','한빛아카데미','9791156645689','전자공학과',2022),(13,13,'김종현','생능출판','9791192932941','정보통신과',2024),(14,14,'우재남','한빛아카데미','9791156645702','정보통신과',2022),(15,15,'이해선','북두출판사','9791166753244','정보통신과',2023),(16,16,'이충식 외 4명','동일출판사','9788938106773','전기과',2010),(17,17,'검정연구회','동일출판사','9788938116888','전기과',2025),(18,18,'김세동 외 3명','동일출판사','9788938117045','전기과',2025);
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `price_per_item` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,16000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('준비','완료','취소') NOT NULL DEFAULT '준비',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `phone` varchar(13) DEFAULT NULL,
  `session_id` varchar(255) NOT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2025-05-07 04:24:38','준비',NULL,0.00,NULL,'v9fl8l5YeFmZ9gNmlkl9Q-XjDOLPgHvq');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `product_type` enum('책','문구류') NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'전기기초실험',16000.00,'/images/1.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(2,'이론과 함께 하는 전자회로 실험',26000.00,'/images/2.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(3,'NCS기반 전기회로 실험',22000.00,'/images/3.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(4,'컴퓨터 활용과 실습 2019',25000.00,'/images/4.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(5,'전자회로',42000.00,'/images/5.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(6,'페도라리눅스 시스템&네트워크',29000.00,'/images/6.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(7,'2025 회로이론',19800.00,'/images/7.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(8,'LapVIEW의 정석 기본편',28000.00,'/images/8.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(9,'쉽게 풀어쓴 C언어 Express개정 4판',32200.00,'/images/9.jpg','책',10,1,'2025-05-03 12:50:38','2025-05-03 12:50:38'),(10,'회로이론기초',15000.00,'/images/10.jpeg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:47:29'),(11,'실무와 예제로 배우는 PADS VX.O',29000.00,'/images/11.jpg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:28:49'),(12,'디지털 논리회로 이론, 실습 시뮬레이션 개정 4판',32000.00,'/images/12.jpeg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:48:16'),(13,'컴퓨터구조론',31000.00,'/images/13.jpg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:28:49'),(14,'IT CookBook',26000.00,'/images/14.jpeg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:47:52'),(15,'제5판 통신시스템의 기초',26000.00,'/images/15.jpeg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:48:23'),(16,'최신전기 AutoCAD',20000.00,'/images/16.jpg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:28:49'),(17,'2025 전기기기(전기기사시리즈3)',22000.00,'/images/17.jpg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:28:49'),(18,'자가용 전기설비설계',39000.00,'/images/18.jpg','책',10,1,'2025-05-07 05:28:49','2025-05-07 05:28:49');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `receipt_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `receipt_date` timestamp NULL DEFAULT NULL,
  `receipt_status` enum('대기','수령') NOT NULL DEFAULT '대기',
  PRIMARY KEY (`receipt_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stationery`
--

DROP TABLE IF EXISTS `stationery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stationery` (
  `stationery_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  PRIMARY KEY (`stationery_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `stationery_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stationery`
--

LOCK TABLES `stationery` WRITE;
/*!40000 ALTER TABLE `stationery` DISABLE KEYS */;
/*!40000 ALTER TABLE `stationery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'capstone'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-07 14:49:17
