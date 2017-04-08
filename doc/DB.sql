
-- データベース名を記述
-- USE heroku_6c1d62805e0ec8f;

SET FOREIGN_KEY_CHECKS=0;

-- テーブルの作成
DROP TABLE IF EXISTS `t_comment`;
CREATE TABLE t_comment (
		`id`				SMALLINT(6)		NOT NULL AUTO_INCREMENT
	,	`user_id`			VARCHAR(100)	DEFAULT NULL
	,	`comment`			VARCHAR(100)	DEFAULT NULL
	,	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT character set utf8mb4;

-- インサート
INSERT INTO `t_comment` VALUES ('1', 'sample001', 'サンプルコメント001');
INSERT INTO `t_comment` VALUES ('2', 'sample002', 'サンプルコメント002');
INSERT INTO `t_comment` VALUES ('3', 'sample003', 'サンプルコメント003');

