const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001; // Reactの開発サーバー(通常3000)と違うポートにする

// PostgreSQL接続設定 (環境変数から読み込むのがベストプラクティス)
const pool = new Pool({
  connectionString: 'postgresql://nodeman:password@localhost/nodeplay',
});

// ミドルウェアの設定
app.use(cors()); // CORSを許可
app.use(express.json()); // リクエストボディのJSONをパース

// --- APIエンドポイント ---

// GET: 全ユーザー情報を取得
app.get('/sending_user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST: 新規ユーザーを追加
app.post('/insert_user', async (req, res) => {
  const { username, age, gender, birth, addr, phone, mail, password } = req.body;
  console.log(birth)
  // 簡単なバリデーション (本来はもっと厳密に)
  if (!username || !mail || !password) {
    return res.status(400).json({ error: 'Username, mail, and password are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (username, age, gender, birth_date, address, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [username, age || null, gender || null, birth || null, addr || null, phone || null, mail, password]
    );
    console.log('User inserted:', result.rows[0]);
    res.status(201).json(result.rows[0]); // 追加されたユーザー情報を返す
  } catch (err) {
    console.error('Error inserting user:', err);
    // mail重複エラーなど
    if (err.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'Mail address already exists.' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT: ユーザー情報を編集 (パスパラメータからIDを取得)
// 注意: 本来は req.body に更新データを含めるべきですが、今回はID処理のみ
app.put('/edit_user/:id', async (req, res) => {
  const { id } = req.params; // パスパラメータからIDを取得
  // const { username, age, ... } = req.body; // 本来は更新データも受け取る

  if (!id) {
    // このパス定義ではIDがないリクエストは基本来ないが念のため
    return res.status(400).json({ error: 'User ID is required in the URL path' });
  }
  try {
    // IDを使ってDB操作を行う (例: ログ出力)
    console.log(`Edit request received for user ID: ${id}`);

    // --- 本来のDB更新処理の例 ---
    // if (!username) { // 更新データがない場合の例
    //   return res.status(400).json({ error: 'Update data is required in the request body.' });
    // }
    // const result = await pool.query(
    //   'UPDATE users SET username = $1, age = $2 /*, 他のカラム...*/ WHERE id = $3 RETURNING *',
    //   [username, age, id]
    // );
    // if (result.rowCount === 0) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    // res.status(200).json(result.rows[0]);
    // --- ここまで更新処理の例 ---

    // 今回は更新処理がないので、成功メッセージのみ返す
    res.status(200).json({ message: `Edit request for user ${id} processed (no actual update performed in this example).` });

  } catch (err) {
    console.error('Error processing edit request:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE: ユーザー情報を削除 (パスパラメータからIDを取得)
app.delete('/delete_user/:id', async (req, res) => {
  const { id } = req.params; // パスパラメータからIDを取得

  if (!id) {
    // このパス定義ではIDがないリクエストは基本来ないが念のため
    return res.status(400).json({ error: 'User ID is required in the URL path' });
  }
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User deleted:', result.rows[0]);
    res.status(200).json({ message: `User ${id} deleted successfully.` }); // or res.status(204).send(); (No Content)
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  // DB接続テスト (任意)
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
      release(); // プールに接続を返す
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      console.log('Connected to PostgreSQL:', result.rows[0].now);
    });
  });
});