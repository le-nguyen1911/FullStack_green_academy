-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: coffee_shop
-- ------------------------------------------------------
-- Server version	9.6.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e2a83f41-4f84-11f1-99c5-5811223c82c0:1-306';

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES ('01927a1c-0001-7222-8333-111111111111','Trung Nguyên Legend','Thương hiệu cà phê hàng đầu Việt Nam','https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop','2026-11-05 06:38:07'),('01927a1c-0002-7222-8333-222222222222','Highlands Coffee','Thương hiệu cà phê đóng gói Việt Nam','https://images.unsplash.com/photo-1559525839-b18514d33551?q=80&w=600&auto=format&fit=crop','2026-11-05 06:38:07'),('01927a1c-0003-7222-8333-333333333333','Cầu Đất Farm','Chuyên dòng Arabica chất lượng cao Lâm Đồng','https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop','2026-11-05 06:38:07');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cart_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`,`variant_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('01927a1b-0001-7111-8222-111111111111','Cà phê Hạt (Whole Bean)','Cà phê nguyên hạt rang mộc nguyên chất'),('01927a1b-0002-7111-8222-222222222222','Cà phê Xay (Ground Coffee)','Cà phê đã xay sẵn tối ưu cho pha phin'),('01927a1b-0003-7111-8222-333333333333','Dụng cụ Pha chế','Phin pha, máy xay và phụ kiện pha chế');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `order_items_chk_2` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_items_chk_3` CHECK ((`subtotal` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(12,2) NOT NULL,
  `shipping_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_date` (`user_id`,`order_date` DESC),
  KEY `idx_orders_status_date` (`status`,`order_date` DESC),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_user` (`user_id`),
  KEY `idx_password_reset_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
INSERT INTO `password_reset_otps` VALUES ('0cbeaeae-98ad-44e0-a758-c68973029879','eabcd5cd-534e-4bb5-88b0-af07c4ded354','$2b$10$1P4nX0CeM.VrQFHkJPOJte7DgVC5l4wrmE6FAoDTr8ut63AOBVRx6','2026-11-08 21:20:07',0,'2026-11-08 21:12:17','2026-11-08 21:10:07');
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('COD','BANK_TRANSFER','E_WALLET') COLLATE utf8mb4_unicode_ci DEFAULT 'COD',
  `payment_status` enum('UNPAID','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'UNPAID',
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_payments_order_status` (`order_id`,`payment_status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_permissions_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('018f3a3e-1111-7b12-a1b2-c3d4e5f6a701','product:read','Xem danh sách sản phẩm','PRODUCT'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a702','product:create','Thêm sản phẩm mới','PRODUCT'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a703','product:update','Sửa thông tin sản phẩm','PRODUCT'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a704','product:delete','Xóa sản phẩm','PRODUCT'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a705','order:read','Xem danh sách đơn hàng','ORDER'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a706','order:update_status','Cập nhật trạng thái đơn hàng','ORDER'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a707','user:read','Xem danh sách người dùng','USER'),('018f3a3e-1111-7b12-a1b2-c3d4e5f6a708','user:manage','Quản lý tài khoản & phân quyền','USER'),('d8c4e1fc-d9bb-11f1-94b4-b48c9d502cdc','category:manage','Quản lý danh mục','CATEGORY'),('d8c52efa-d9bb-11f1-94b4-b48c9d502cdc','review:manage','Kiểm duyệt đánh giá','REVIEW');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight_grams` int DEFAULT NULL,
  `grind_type` enum('WHOLE_BEAN','FINE','MEDIUM','COARSE') COLLATE utf8mb4_unicode_ci DEFAULT 'WHOLE_BEAN',
  `price` decimal(12,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_variants_product_status` (`product_id`,`status`),
  KEY `idx_variants_sku` (`sku`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `product_variants_chk_2` CHECK ((`quantity` >= 0)),
  CONSTRAINT `product_variants_chk_3` CHECK (((`weight_grams` is null) or (`weight_grams` > 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES ('01927a1f-0001-7555-8666-111111111111','01927a1e-0001-7444-8555-111111111111','Túi 250g - Nguyên hạt',250,'WHOLE_BEAN',150000.00,50,'SKU-ARABICA-250-WB',1),('01927a1f-0002-7555-8666-222222222222','01927a1e-0001-7444-8555-111111111111','Túi 500g - Xay pha Phin',500,'MEDIUM',280000.00,30,'SKU-ARABICA-500-MD',1),('01927a1f-0003-7555-8666-333333333333','01927a1e-0002-7444-8555-222222222222','Gói 340g - Xay mịn',340,'FINE',75000.00,100,'SKU-ST1-340-FN',1),('01927a1f-0004-7555-8666-444444444444','01927a1e-0003-7444-8555-333333333333','Gói 200g - Xay vừa',200,'MEDIUM',65000.00,80,'SKU-HL-TRAD-200',1),('01927a1f-0005-7555-8666-555555555555','01927a1e-0004-7444-8555-444444444444','Phin Nhỏ (170ml)',NULL,'WHOLE_BEAN',45000.00,40,'SKU-PHIN-INOX-S',1);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json NOT NULL DEFAULT (json_array()),
  `status` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category_status` (`category_id`,`status`),
  KEY `idx_products_brand` (`brand_id`),
  FULLTEXT KEY `idx_products_name` (`name`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `products_chk_1` CHECK ((json_type(`images`) = _utf8mb4'ARRAY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('01927a1e-0001-7444-8555-111111111111','01927a1b-0001-7111-8222-111111111111','01927a1c-0003-7222-8333-333333333333','Cà phê Arabica Cầu Đất Rang Mộc','Hương thơm trái cây phong phú, vị chua thanh thoát ngòn ngọt.','https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=800&auto=format&fit=crop','[\"https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop\", \"https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop\"]',1,'2026-11-05 06:38:07'),('01927a1e-0002-7444-8555-222222222222','01927a1b-0002-7111-8222-222222222222','01927a1c-0001-7222-8333-111111111111','Cà phê Trung Nguyên Sáng Tạo 1','Dòng Culi Robusta đắng đậm đà, mùi thơm dịu nhẹ tự nhiên.','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop','[\"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop\"]',1,'2026-11-05 06:38:07'),('01927a1e-0003-7444-8555-333333333333','01927a1b-0002-7111-8222-222222222222','01927a1c-0002-7222-8333-222222222222','Cà Phê Highlands Truyền Thống','Sự kết hợp giữa Robusta đậm đà và Arabica thơm nồng.','https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop','[]',1,'2026-11-05 06:38:07'),('01927a1e-0004-7444-8555-444444444444','01927a1b-0003-7111-8222-333333333333','01927a1c-0001-7222-8333-111111111111','Phin Pha Cà Phê Inox Cao Cấp','Chất liệu inox 304 không gỉ, đục lỗ đều.','https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop','[]',1,'2026-11-05 06:38:07');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_refresh_tokens_user_expire` (`user_id`,`expires_at`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('c1036bc0-61d2-4ad5-8513-fb8f6c1a8123','eabcd5cd-534e-4bb5-88b0-af07c4ded354','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYWJjZDVjZC01MzRlLTRiYjUtODhiMC1hZjA3YzRkZWQzNTQiLCJqdGkiOiI2MDQyYTYyMC01MWNjLTQ4ZDEtOTVjNi0zNDliMGE2MDgwMjEiLCJpYXQiOjE3OTQxNDcxNTUsImV4cCI6MTc5NDc1MTk1NX0.6WGEOf42Ay5R7tFSW1r2fZ8TLuMLEFd3oCw38POM9j8','2026-11-15 21:12:36','2026-11-08 14:12:35');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`product_id`),
  KEY `idx_reviews_product_date` (`product_id`,`created_at` DESC),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES ('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a701'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7ba','018f3a3e-1111-7b12-a1b2-c3d4e5f6a701'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a702'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a703'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7ba','018f3a3e-1111-7b12-a1b2-c3d4e5f6a703'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a704'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a705'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7ba','018f3a3e-1111-7b12-a1b2-c3d4e5f6a705'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a706'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7ba','018f3a3e-1111-7b12-a1b2-c3d4e5f6a706'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a707'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','018f3a3e-1111-7b12-a1b2-c3d4e5f6a708'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','d8c4e1fc-d9bb-11f1-94b4-b48c9d502cdc'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','d8c52efa-d9bb-11f1-94b4-b48c9d502cdc');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b8','CUSTOMER','Khách hàng mua sắm'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','ADMIN','Quản trị viên toàn quyền hệ thống'),('018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7ba','STAFF_SALE','Nhân viên bán hàng & xử lý đơn hàng'),('85945582-d9bb-11f1-94b4-b48c9d502cdc','MANAGER','Quản lý cửa hàng');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('01927a1d-0001-7333-8444-111111111111','018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','Quản Trị Viên','admin@coffeeshop.com','$2a$12$e8Y6.7A9U/8G.V0j6vE3HeL2H5J1qK4l5M6n7O8p9Q0r1S2T3U4V5W','0901234567','123 Nguyễn Huệ, Quận 1, TP.HCM','2026-11-05 06:38:07'),('01927a1d-0002-7333-8444-222222222222','018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b8','Nguyễn Văn An','nguyenan@gmail.com','$2a$12$e8Y6.7A9U/8G.V0j6vE3HeL2H5J1qK4l5M6n7O8p9Q0r1S2T3U4V5W','0912345678','456 Lê Lợi, Quận 3, TP.HCM','2026-11-05 06:38:07'),('01927a1d-0003-7333-8444-333333333333','018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b8','Trần Thị Bích','bichtran@gmail.com','$2a$12$e8Y6.7A9U/8G.V0j6vE3HeL2H5J1qK4l5M6n7O8p9Q0r1S2T3U4V5W','0987654321','789 Trần Hưng Đạo, Quận 5, TP.HCM','2026-11-05 06:38:07'),('1bb32330-974e-4855-b427-0bd37d30b1b8','018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b9','Nguyen Test','test@mail.com','$2b$12$EtJt2imp8QqotiShuaAyaeft8YqqqDhfDP6953C4hWPi2MlUJ3i3O','0900000000','TP.HCM','2026-11-06 07:51:39'),('eabcd5cd-534e-4bb5-88b0-af07c4ded354','018f3a3d-9d4e-7b12-a1b2-c3d4e5f6a7b8','Nguyen Test','lenguyen001911@gmail.com','$2b$12$DUxVr1Yzqp50PGPBXVhKA.mkZdwnjYwix0n4f.d3PRV7daeRtycfG','0900000000','TP.HCM','2026-11-08 14:07:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08 22:27:12
