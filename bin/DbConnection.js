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
var connection;
function handleDisconnect() {
    console.log('DBに接続します');		
	connection = mysql.createConnection(process.env.DATABASE_URL);
    connection.connect(function(err) {              	
		// or restarting (takes a while sometimes).
        if (err) {                                     
            console.log('error when connecting to db:', err);
			// We introduce a delay before attempting to reconnect,
			// to avoid a hot loop, and to allow our node script to
			// process asynchronous requests in the meantime.
			// If you're also serving http, display a 503 error.
            setTimeout(handleDisconnect, 1000); 
        } else {
    		console.log('DBに接続しました');		
		}
    });

	//エラーを受け取る
    connection.on('error', function(err) {
        console.log('DBエラー', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			//再接続
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

module.exports = connection;
