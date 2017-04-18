/**
* mysql接続処理
*
* Created by aska-fun
* Created on 2017/04/01
* Updated by 
* Updated on 
**/

var mysql	= require('mysql'			);

/*
 * コネクションをプールする
 * 以下の方法だとうまくいかなかったので変更した
 * connection = mysql.createConnection(process.env.DATABASE_URL);
 */
module.exports = mysql.createPool(process.env.CLEARDB_DATABASE_URL);
