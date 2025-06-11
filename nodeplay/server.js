const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; 

// PostgreSQL接続設定 (環境変数から読み込むのがベストプラクティス)
const connectionString = process.env.DATABASE_URL || 'postgresql://nodeman:password@localhost:5432/nodeplay'; // 環境変数またはデフォルト値

const pool = new Pool({
  connectionString: connectionString,
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

app.put('/edit_user/:id', async (req, res) => {
  const { id } = req.params;
  // リクエストボディから更新可能性のあるフィールドを取得
  const { username, age, gender, birth, addr, phone, mail, password } = req.body;

  // 更新するフィールドと値を動的に構築
  const fieldsToUpdate = [];
  const values = [];
  let queryParamIndex = 1;

  if (username !== undefined) {
    fieldsToUpdate.push(`username = $${queryParamIndex++}`);
    values.push(username);
  }
  if (age !== undefined) {
    fieldsToUpdate.push(`age = $${queryParamIndex++}`);
    values.push(age === '' || age === null ? null : parseInt(age, 10));
  }
  if (gender !== undefined) {
    fieldsToUpdate.push(`gender = $${queryParamIndex++}`);
    values.push(gender === '' ? null : gender);
  }
  if (birth !== undefined) {
    fieldsToUpdate.push(`birth = $${queryParamIndex++}`);
    values.push(birth === '' ? null : birth); // フロントエンドから YYYY-MM-DD形式で来ると想定
  }
  if (addr !== undefined) {
    fieldsToUpdate.push(`addr = $${queryParamIndex++}`);
    values.push(addr === '' ? null : addr);
  }
  if (phone !== undefined) {
    fieldsToUpdate.push(`phone = $${queryParamIndex++}`);
    values.push(phone === '' ? null : phone);
  }
  if (mail !== undefined) {
    // メールアドレスのユニーク制約チェック (自分自身以外で重複がないか)
    try {
      const mailCheckResult = await pool.query('SELECT id FROM users WHERE mail = $1 AND id != $2', [mail, id]);
      if (mailCheckResult.rows.length > 0) {
        return res.status(409).json({ error: 'Mail address already in use by another user.' });
      }
    } catch (dbErr) {
      console.error('Error checking mail uniqueness during update:', dbErr);
      return res.status(500).json({ error: 'Database error during mail check' });
    }
    fieldsToUpdate.push(`mail = $${queryParamIndex++}`);
    values.push(mail);
  }
  if (password && password.trim() !== '') { 
    // 例: const hashedPassword = await bcrypt.hash(password, 10);
    // fieldsToUpdate.push(`password = $${queryParamIndex++}`);
    // values.push(hashedPassword);
    fieldsToUpdate.push(`password = $${queryParamIndex++}`); 
    values.push(password);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  // WHERE句のIDを値の配列の最後に追加
  values.push(id);

  const setClause = fieldsToUpdate.join(', ');
  const updateQuery = `UPDATE users SET ${setClause} WHERE id = $${queryParamIndex} RETURNING *`;

  try {
    const result = await pool.query(updateQuery, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    console.log('User updated:', result.rows[0]);
    res.status(200).json(result.rows[0]); // 更新されたユーザー情報を返す
  } catch (err) {
    console.error('Error updating user:', err);
    // 他のDBエラー（例：型エラーなど）も考慮
    res.status(500).json({ error: 'Database error while updating user.' });
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

// 特定ユーザーの全タスクを取得 (GET /users/:userId/tasks)
app.get('/users/:userId/tasks', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC, created_at ASC', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks for user:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 新しいタスクを作成 (POST /users/:userId/tasks)
app.post('/users/:userId/tasks', async (req, res) => {
  const { userId } = req.params;
  const { title, description, due_date, status } = req.body;

  if (!title || !userId) {
    return res.status(400).json({ error: 'User ID and Title are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description || null, due_date || null, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 特定のタスクを取得 (GET /tasks/:taskId) - 必要に応じて
app.get('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});


// タスクを更新 (PUT /tasks/:taskId)
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, due_date, status, user_id } = req.body; // user_idも更新可能にするか検討

  // 更新するフィールドと値を動的に構築
  const fieldsToUpdate = [];
  const values = [];
  let queryParamIndex = 1;

  if (title !== undefined) {
    fieldsToUpdate.push(`title = $${queryParamIndex++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fieldsToUpdate.push(`description = $${queryParamIndex++}`);
    values.push(description);
  }
  if (due_date !== undefined) {
    fieldsToUpdate.push(`due_date = $${queryParamIndex++}`);
    values.push(due_date === '' ? null : due_date);
  }
  if (status !== undefined) {
    fieldsToUpdate.push(`status = $${queryParamIndex++}`);
    values.push(status);
  }
  // もしuser_idを変更可能にする場合は追加
  // if (user_id !== undefined) {
  //   fieldsToUpdate.push(`user_id = $${queryParamIndex++}`);
  //   values.push(user_id);
  // }


  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  values.push(taskId); // WHERE句のtaskId用

  const setClause = fieldsToUpdate.join(', ');
  // updated_at はトリガーで自動更新される想定だが、明示的に更新しても良い
  const updateQuery = `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${queryParamIndex} RETURNING *`;

  try {
    const result = await pool.query(updateQuery, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found or no changes made' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// タスクを削除 (DELETE /tasks/:taskId)
app.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully', deletedTask: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.delete('/delete_user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      // 削除対象の行が見つからなかった場合 (rowCountが0)、404を返す
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 削除に成功した場合
    console.log('User deleted:', result.rows[0]);
    res.status(200).json({ message: `User ${id} deleted successfully.` });
  } catch (err) {
    // ...
  }
});