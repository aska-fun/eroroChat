var express	= require('express');
var mysql	= require('mysql');
var app		= express();
var http	= require('http').Server(app);
var io		= require('socket.io')(http);
var POST	= process.env.PORT || 8080;




//DBに接続する関数
var connection;
function handleDisconnect() {
    console.log('1. connecting to db:');		
	// Recreate the connection, since
	// the old one cannot be reused.
	// The server is either down
	
	connection = mysql.createConnection(process.env.DATABASE_URL);
    connection.connect(function(err) {              	
		// or restarting (takes a while sometimes).
        if (err) {                                     
            console.log('2. error when connecting to db:', err);
			// We introduce a delay before attempting to reconnect,
			// to avoid a hot loop, and to allow our node script to
			// process asynchronous requests in the meantime.
			// If you're also serving http, display a 503 error.
            setTimeout(handleDisconnect, 1000); 
        }
    });

	// Connection to the MySQL server is usually
	// lost due to either server restart, or a
	// connnection idle timeout (the wait_timeout
	// server variable configures this)
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
//DBに接続
handleDisconnect();



//ユーザ数を格納するグローバル変数
var userCnt = {
		a			: 0,
		b			: 0,
		kentaBot	: 0
	}

//スタイルシートを返す
app.get('/ero_style.css', function(req, res) {
	//index.htmlに遷移する
	res.sendFile(__dirname + '/ero_style.css');
});

//ルートディレクトリにアクセスした時に動く処理
app.get('/', function(req, res) {
	//index.htmlに遷移する
	res.sendFile(__dirname + '/index.html');
});

//socket.ioに接続された時に動く処理
io.on('connection', function(socket) {

	//debug
	console.log('%s さんが接続しました。', socket.id);

	//デフォルトのチャンネル
	var channel = 'A';
	//Roomを初期化
	socket.join(channel);
	//アクセス時はデフォルトのチャンネルなので、そのユーザをカウント
	userCnt.a++;
	//全ユーザ上のユーザ数を更新
	io.emit('user cnt', userCnt);
	
	//DBから今までのメッセージを取ってきて自分だけに表示
    connection.query('SELECT * from t_comment', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
		//「ようこそ」と「ID」を自分の画面だけに表示
		socket.emit('welcome', socket.id, rows);
		socket.emit('get id', socket.id);
	
		//接続時に同じチャンネルの人に入室を伝える
		socket.broadcast.to(channel).emit('message', socket.id + 'さんが入室しました！', 'system'); 
    });
	

	/**
	 * 'message'イベント関数
	 * 同じチャンネルの人にメッセージを送る
	 * @param	String	msj	ユーザが送信したメッセージ
	 **/
	socket.on('message', function(msj) {
		io.sockets.in(channel).emit('message', msj, socket.id);

		//DBに保存
		connection.query(
				'INSERT INTO t_comment SET ?'
			,	{user_id: socket.id, comment: msj}
			,	function(err, result) {
					if (err) throw err;
					console.log(result.insertId);
				}
		);
	});
	
	/**
	 * 'disconnect'イベント関数
	 * 接続が切れた時に動く
	 * 接続が切れたIDを全員に表示
	 * @param	String	e
	 **/
	socket.on('disconnect', function(e) {
		console.log('%s さんが退室しました。', socket.id);
		if (channel === 'A') {
			userCnt.a--;
	
		} else if(channel === 'B') {
			userCnt.b--;
		} else {
			userCnt.kentaBot--;
		}
		//アクティブユーザを更新
		io.emit('user cnt', userCnt);
	});
	
	/**
	 * 'disconnect'イベント関数
	 * チャンネルを変えた時に動く
	 * 今いるチャンネルを出て、選択されたチャンネルに移動する
	 * @param	String	e
	 **/
	socket.on('change channel', function(newChannel) {
		//ルーム内の自分以外
		socket.broadcast.to(channel).emit('message', socket.id + 'さんが退室しました！', 'system');
		if (newChannel === 'A') {
			++userCnt.a;
			if (userCnt.b > 0) {
				--userCnt.b;
			}
			if (userCnt.kentaBot > 0) {
				--userCnt.kentaBot;
			}
		} else if (newChannel === 'B') {
			++userCnt.b;
			if (userCnt.a > 0) {
				--userCnt.a;
			}
			if (userCnt.kentaBot > 0) {
				--userCnt.kentaBot;
			}
		} else {
			++userCnt.b;
			if (userCnt.a > 0) {
				--userCnt.a;
			}
			if (userCnt.b > 0) {
				--userCnt.b;
			}
		}
		io.emit('user cnt', userCnt);
		//チャンネルを去る
		socket.leave(channel); 
		//選択された新しいチャンネルのルームに入る
		socket.join(newChannel); 
		//今いるチャンネルを保存
		channel = newChannel; 
		//チャンネルを変えたこと自分に送信
		socket.emit('change channel', channel); 
		//ルーム内の自分以外
		socket.broadcast.to(channel).emit('message', socket.id + 'さんが入室しました！', 'system');
	});
});

//接続待ち状態になる
http.listen(POST, function() {
	console.log('接続開始：', POST);
});
