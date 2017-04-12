/**
* mysql接続処理
*
* Created by aska-fun
* Created on 2017/04/01
* Updated by 
* Updated on 
**/

var mysql	= require('mysql'			);

//DBに接続する関数
var pool;
function handleDisconnect() {
	/*
	 * コネクションをプールする
	 * 以下の方法だとうまくいかなかったので変更した
	 * connection = mysql.createConnection(process.env.DATABASE_URL);
	 * この外の関数もいらないか？
	 */
	pool = mysql.createPool(process.env.DATABASE_URL);
}
handleDisconnect();

module.exports = pool;
