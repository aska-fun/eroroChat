/**
* アプリ全体の設定やらいろいろ
* TODO:passportを使用した認証機能
*
* Created	by aska-fun
* 			on 2017/04/01
* Updated	by 
* 			on 
**/

/*
 * モジュール
 */
//expressモジュールをロードし、インスタンス化してappに代入
var express			= require('express'			);
var app				= express();
var http			= require('http').createServer(app);
var bodyParser		= require('body-parser'				);
var io				= require('socket.io')(http);
var session			= require("express-session")({
	secret				: 'keyboard cat',
	resave				: false,
	saveUninitialized	: true
});
var sharedsession	= require("express-socket.io-session");
//var passport	= require('passport');

/**
 * Viewディレクトリを設定
 **/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/**
 * 共通処理を呼び出し
 **/
var CommonConst		= require('./bin/CommonConst.js'							);
var DbPool			= require('./bin/DbConnection.js'							);


/**
 * ミドルウェア
 **/
// if access with name of filename, then responses the files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session);
io.use(sharedsession(session, {
  autoSave: true
}));
//app.use(passport.initialize());


/**
 * コントローラ
 **/
ChatController					= require("./routes/ChatController.js"					)(app, http,		CommonConst, DbPool, io);
UserSignUpController			= require("./routes/UserSignUpController.js"			)(app, CommonConst,	DbPool);
UserLogInController				= require("./routes/UserLogInController.js"				)(app, CommonConst,	DbPool);


//接続待ち状態になる
//ポート番号は環境変数を使用
var PORT		= process.env.PORT || 8080;
http.listen(PORT, function() {
	console.log('接続開始：', PORT);
});
