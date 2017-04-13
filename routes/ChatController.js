/**
* チャット画面のコントローラ
*
* Created by aska-fun
* Created on 2017/04/01
* Updated by 
* Updated on 
**/


var ChatController = function(app, http, CommonConst, pool, io){

	//ユーザ数を格納する変数
	var userCnt = {
			a			: 0
		,	b			: 0
		,	kentaBot	: 0
	}
	
	/*
	 * user_log_outにアクセスした時に動く処理
	 */
	app.get('/user_log_out', function(req, res) {
		//セッション情報を破棄
		req.session.destroy();
		//ログインにリダイレクト
		res.redirect(CommonConst.PAGE_ID_USER_LOG_IN);
	});

	// chatにアクセスした時に動く処理
	app.get('/chat', function(req, res) {

		//セッションにユーザ情報がない場合
  		if(req.session && req.session.user) {
			res.redirect(CommonConst.PAGE_ID_USER_LOG_IN);
			return;
		}
		res.render(CommonConst.PAGE_ID_CHAT);
	});
	
	//socket.ioに接続された時に動く処理
	io.on('connection', function(socket) {
	
		console.log('▲▲▲connection established');

		//セッションにユーザ情報がない場合
  		if(		!socket.handshake.session
			||	!socket.handshake.session.user
			||	!socket.handshake.session.user.user_name) {
			console.log('▲▲▲リダイレクトさせます');
			socket.emit('redirect', '/');
			return;
		}
		//debug
		console.log('%s さんが接続しました。', socket.handshake.session.user.user_name);
	
		//デフォルトのチャンネル
		var channel = 'A';
		//Roomを初期化
		socket.join(channel);
		//アクセス時はデフォルトのチャンネルなので、そのユーザをカウント
		userCnt.a++;
		//全ユーザ上のユーザ数を更新
		io.emit('user cnt', userCnt);
		
		sendPastMsg(pool, socket, channel)
		.then(tellEveryoneWhoEnter(socket, channel));

	
		/**
		 * 'message'イベント関数
		 * 同じチャンネルの人にメッセージを送る
		 * @param	String	msj	ユーザが送信したメッセージ
		 **/
		socket.on('message', function(userName, msj) {
			io.sockets.in(channel).emit('message', userName, msj);
	
			pool.getConnection(function(err, connection) {
				// Use the connection
				//クエリ実行
				//DBに保存
				connection.query(
						'INSERT INTO t_comment SET ?'
					,	{
								user_name	: userName
							,	channel		:channel
							,	comment		: msj
						}
					,	function(err, result) {
							if (err) throw err;
							console.log(result.insertId);
							// プールに戻す
							// これ以降connectionは使用不可。
							connection.release();
						}
				);
			});
		});

		/**
		 * 'disconnect'イベント関数
		 * 接続が切れた時に動く
		 * 接続が切れたIDを全員に表示
		 * @param	String	e
		 **/
		socket.on('disconnect', function(e) {
			console.log('%s さんが退室しました。', socket.handshake.session.user.user_name);
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
			socket.broadcast.to(channel).emit('message', socket.handshake.session.user.user_name + 'さんが退室しました！', 'system');
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

			sendPastMsg(pool, socket, channel)
			.then(tellEveryoneWhoEnter(socket, channel));
		});
	});
	/**
	* DBから今までのメッセージを取ってきて自分だけに表示
	* @param DBインスタンス
	* @param socket
	* @return Promise
	**/
	function sendPastMsg(pool, socket, channel) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, connection) {
				//クエリ実行
	    		connection.query('SELECT * from t_comment where channel = ' + '\'' + channel + '\'', function(err, rows, fields) {
	        		if (err) {
	            		console.log('error: ', err);
	            		throw err;
	        		}
					//「ようこそ」と「ID」を自分の画面だけに表示
	        		console.log(socket.handshake.session.user.user_name);
					socket.emit('welcome', socket.handshake.session.user.user_name, rows);
					socket.emit('get user_name', socket.handshake.session.user.user_name);
				
					//接続時に同じチャンネルの人に入室を伝える
					socket.broadcast.to(channel).emit('message', socket.handshake.session.user.user_name + 'さんが入室しました！', 'system'); 
					// プールに戻す
					// これ以降connectionは使用不可。
					connection.release();
					resolve(socket, channel);
				});
			});
		});
	}
	/**
	* 接続時に同じチャンネルの人に入室を伝える
	* @param socket
	* @param チャンネル
	**/
	function tellEveryoneWhoEnter(socket, channel) {
		//接続時に同じチャンネルの人に入室を伝える
		socket.broadcast.to(channel).emit('message', socket.handshake.session.user.user_name + 'さんが入室しました！', 'system'); 
	}
};
module.exports = ChatController;
