module.exports = {
  apps : [{
    name   : "nodeplay-backend",    // ★ GitHub Actions のデプロイスクリプトで使用する名前と合わせる
    script : "./server.js",         // 実行するスクリプトファイル
    // cwd    : "/home/ec2-user/app/nodeplay/", // このファイルを置く場所によってはCWD指定が必要
    watch  : false,                 // ファイル変更監視は本番では通常 false
    instances: 1,                   // 1インスタンスで実行 (CPUコア数分なら 'max' や数値を指定)
    exec_mode: "fork",              // 'fork' または 'cluster' (clusterモードにするなら instances も調整)
    env_production: {               // --env production で起動した際の環境変数
       "NODE_ENV": "production",
       "PORT": 3001,               // アプリケーションがリッスンするポート
       "DATABASE_URL": "postgresql://nodeman:password@localhost:5432/nodeplay"
    },
  }]
};