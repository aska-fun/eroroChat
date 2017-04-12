# eroroChat


http://eelee.herokuapp.com/


ディレクトリ構成

    "# eroroChat" 
    .
    ├── chat.js
    ├── DB.sql
    ├── doc
    │   ├── command01.sh
    │   └── command02.sh
    ├── index.html
    ├── package.json
    ├── Procfile
    └── README.md



アプリ設定を表示  

    heroku config --app <アプリ名>
    heroku config --app secret-gorge-46628


herokuのリモートレポジトリを追加するコマンド

    heroku git:remote -a <herokuアプリ名>
    heroku git:remote -a secret-gorge-46628

ログをリアルタイムで表示

    heroku logs --tail --app <herokuアプリ名>
    heroku logs --tail --app secret-gorge-46628


## DBテーブル作成方法

以下のコマンドを実行

    heroku config --app <アプリ名>

以下が表示される

    === <アプリ名> Config Vars
    CLEARDB_DATABASE_URL: mysql://<ユーザ名>:<パスワード>@<ホスト名>/<DB名>?reconnect=true

MySQLのリモートホストに接続する

    mysql -h <ホスト名> -u <ユーザ名> -p

例えば

    mysql -h us-cdbr-iron-east-03.cleardb.net -u bac9292c240c4a -p

使用するDBを選択する

    use <DB名>;

sqlファイルを実行する

    source <sqlファイルパス>

例えば

    source ./DB.sql


## DB接続方法

以下のコマンドを実行

    heroku config --app <アプリ名>

以下が表示される

    === <アプリ名> Config Vars
    CLEARDB_DATABASE_URL: mysql://<ユーザ名>:<パスワード>@<ホスト名>/<DB名>?reconnect=true

出力された情報を以下で環境変数に登録

    heroku config:set DATABASE_URL="mysql2://<ユーザ名>:<パスワード>@<ホスト名>/<DB名>?reconnect=true&encoding=utf8mb4"


あとは以下のようにコードから環境変数を使用してDBに接続する

    var connection = mysql.createConnection(process.env.DATABASE_URL);  

## その他

#Herokuログイン
heroku login

#プロジェクトのディレクトリに移動
#もうディレクトリ内なら不要
#cd <app-path>
#たとえば
#cd ~/work/chat

#gitを始めるコマンド
#git init

#全部のファイルをgitに認識させる（ステージに上げる）
git add .

#コミット
git commit -m "comment"

#herokuのリモートレポジトリを作成（アプリが作られる）
heroku create

#githubにプッシュ
git push origin master

#herokuへプッシュ（デプロイ）
git push heroku master
