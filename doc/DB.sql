
-- データベース名を記述
-- USE heroku_6c1d62805e0ec8f;

SET FOREIGN_KEY_CHECKS=0;

-- テーブルの作成
-- メッセージ
DROP TABLE IF EXISTS `t_comment`;
CREATE TABLE t_comment (
		`id`				SMALLINT(6)		NOT NULL AUTO_INCREMENT
	,	`user_name`			VARCHAR(100)	DEFAULT NULL
	,	`channel`			VARCHAR(100)	DEFAULT NULL
	,	`message`			VARCHAR(100)	DEFAULT NULL
	,	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT character set utf8mb4;
-- ユーザ
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE t_user (
		id					INT AUTO_INCREMENT
	,	user_name			VARCHAR(20)
	,	user_password		VARCHAR(30)
	,	email				VARCHAR(255)
	,	primary KEY (id)
	,	INDEX(id)
) ENGINE=InnoDB character set utf8mb4;

-- チャンネル
-- DROP TABLE IF EXISTS `t_channel`;
-- CREATE TABLE t_channel (
		-- id					INT AUTO_INCREMENT
	-- ,	channel_name		VARCHAR(20)
	-- ,	created_user		VARCHAR(100)
	-- ,	CREATED_DATETIME timestamp not null default current_timestamp
	-- ,	primary KEY (id)
	-- ,	INDEX(id)
-- ) ENGINE=InnoDB character set utf8mb4;

-- サンプルインサート
INSERT INTO `t_comment` VALUES ('1', 'sample001', 'A', 'サンプルコメント001');
INSERT INTO `t_comment` VALUES ('2', 'sample002', 'A', 'サンプルコメント002');
INSERT INTO `t_comment` VALUES ('3', 'sample003', 'B', 'サンプルコメント003');

