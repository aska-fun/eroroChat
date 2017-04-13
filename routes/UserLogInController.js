/**
* ユーザログイン画面のコントローラ
*
* Created by Kozuka
* Created on 2017/03/24
* Updated by 
* Updated on 
**/
var UserLogInController = function(app, CommonConst, pool){

	//ルートディレクトリにアクセスした時に動く処理
	app.get('/', function(req, res) {
		res.redirect(CommonConst.PAGE_ID_USER_LOG_IN);
	});

	//ログイン画面にGETしたときの処理
	app.get('/user_log_in', function(req, res, next) {
		//セッション情報がある場合
  		if(req.session && req.session.user) {
			//メニュー画面にリダイレクト
    		res.redirect('/chat');
		//セッション情報がない場合
  		} else {
			//ログイン画面のレンダリング実行
    		res.render(CommonConst.PAGE_ID_USER_LOG_IN);
  		}
	});
	
	//ログインボタン押下時
	app.post('/user_log_in', function(req, res, next) {

		//debug
		console.log(req.body);

		var email = req.body.email;
		var password = req.body.password;
		
		//クエリ作成
		var queryArray = [];
		queryArray.push('SELECT'							);
		queryArray.push('*'									);
		queryArray.push('FROM'								);
		queryArray.push('t_user'							);
		queryArray.push('WHERE'								);
		queryArray.push('user_name='						);
		queryArray.push('\'' + req.body.user_name + '\''	);
		queryArray.push('AND'								);
		queryArray.push('user_password='					);
		queryArray.push('\'' + req.body.password + '\''		);
		queryArray.push('LIMIT 1'							);
		//クエリを結合
		var query = queryArray.join(' ');

		//debug
		console.log(query);
	
		(function () {
			return new Promise(function(resolve, reject) {
				pool.getConnection(function(err, connection) {
					//クエリ実行
	    			connection.query(query, function(err, rows, fields) {
	    		    	if (err) {
	    		        	console.log('error: ', err);
	    		        	reject();
	    		    	}
						resolve(rows);
						// プールに戻す
						// これ以降connectionは使用不可。
						connection.release();
					});
	    		});
			});
		})()
		.then(function(results) {
			//debug
			console.log(results);

			//結果を判定
   			var user = results.length? results[0]: false;
			//1件以上の場合
   			if (user) {
				console.log('user exist');
				//セッションにuserを追加
				req.session.user = {
					user_name: user.user_name
				};
				req.session.save();
				// チャット画面に遷移
     			res.render(CommonConst.PAGE_ID_CHAT);
			//0件の場合
   			} else {
				//ログイン画面に戻す
				res.render(CommonConst.PAGE_ID_USER_LOG_IN, {
				noUser: 'ユーザ名とパスワードが一致するユーザーはいません'
				});
			}
		});
	});
};
module.exports = UserLogInController

