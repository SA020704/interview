/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 50726
 Source Host           : localhost:3306
 Source Schema         : worldai

 Target Server Type    : MySQL
 Target Server Version : 50726
 File Encoding         : 65001

 Date: 06/06/2025 14:03:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_interview
-- ----------------------------
DROP TABLE IF EXISTS `tb_interview`;
CREATE TABLE `tb_interview`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_date_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` bigint(20) NULL DEFAULT 0,
  `deleted` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT 'NO',
  `resume` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL COMMENT '简历信息',
  `user_id` bigint(20) NULL DEFAULT NULL COMMENT '面试人的id',
  `interview_evaluation` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL COMMENT '面试结果',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tb_question
-- ----------------------------
DROP TABLE IF EXISTS `tb_question`;
CREATE TABLE `tb_question`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_date_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` bigint(20) NULL DEFAULT 0,
  `deleted` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT 'NO',
  `interview_id` bigint(20) NOT NULL,
  `question` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 82 CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
