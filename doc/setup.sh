#!/bin/sh

echo "セットアップを開始します"

echo -n herokuのアカウントは登録済ですか? [y/n]
read answer
if [ "$answer" != "y" ]; then
	echo "アカウントを登録しましょう"
	exit;
fi

echo -n herokuのアカウントにクレジットカード情報を登録していますか? [y/n]
read answer
if [ "$answer" != "y" ]; then
	echo "クレジットカードを登録してください。心配ありません。これから使用するサービスはすべて無料です。"
	exit;
fi

echo -n 自分のレポジトリにフォークしたeroroChatプロジェクトをクローンしましたか? [y/n]
read answer
if [ "$answer" != "y" ]; then
	echo "git clone <自分のレポジトリ>を叩いてクローンしてください"
	exit;
fi

echo -n プロジェクトディレクトリ直下にいますか? [y/n]
read answer
if [ "$answer" != "y" ]; then
	echo "cd eroroChatで移動してください"
	exit;
fi

echo -n 最近疲れていますか? [y/n]
read answer
if [ "$answer" != "n" ]; then
	echo "まずは休息を取りましょう。元気なあなたが私は好きです。"
	exit;
fi

echo "herokuにログインします"
heroku login
echo "ログインしました"

echo "herokuアプリを作成します"
echo -n アプリ名を入力してください（半角英数字） :
read app_name
heroku create $app_name
echo "アプリを作成しました"

echo "アプリにclearDB MySQLアドオンを追加します"
heroku addons:create cleardb:ignite --app $app_name
echo "アドオンを追加しました"

echo "DBに接続してテーブルを作成します"
#mysql -h us-cdbr-iron-east-03.cleardb.net -u bac9292c240c4a -p
db_config=`heroku config --app $app_name | grep CLEARDB_DATABASE_URL`
#ホスト名
db_host=`echo ${db_config} | sed -e "s/^.*\@\(.*\)\/.*$/\1/"`
#echo $db_host
#ユーザ名
db_user_name=`echo ${db_config} | sed -e "s/^.*\/\/\(.*\):.*$/\1/"`
#echo $db_user_name
#パスワード
db_password=`echo ${db_config} | sed -e "s/^.*:\(.*\)\@.*$/\1/"`
#echo $db_password
#DB名
db_name=`echo ${db_config} | sed -e "s/^.*\@.*\/\(.*\)?.*$/\1/"`
#echo $db_name

#ここはトリッキー。-pオプションのあとは半角なしで入力する
mysql -h $db_host -u $db_user_name -p$db_password << EOF
use $db_name;
source ./doc/DB.sql;

EOF

echo "テーブルを作成しました"

echo "herokuのレポジトリにプッシュしてデプロイします"
git add .
git commit -m "heroku deploy"
git push heroku master
echo "エラーがでていなければデプロイが完了しています"
echo 試しにhttp://$app_name.herokuapp.comにアクセスしてみましょう！

