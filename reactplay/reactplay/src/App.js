import React, { useState, useEffect, useCallback } from 'react';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';

const API_BASE_URL = 'http://localhost:3001'; 

function App() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ユーザーリストを取得
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/sending_user`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      setError('Failed to load user data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初期表示時にユーザーリストを取得
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers が useCallback でラップされているため、依存関係に追加

  // ユーザー追加処理
  const handleAddUser = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/insert_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      await response.json(); // 処理を待つ
      fetchUsers(); 
      return true; // 成功したことを UserForm に伝える
    } catch (e) {
      console.error("Failed to add user:", e);
      setError(`Failed to add user: ${e.message}`);
      return false; 
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー編集処理 (API呼び出しのみ)
  const handleEditUser = async (userId) => {
    console.log(`Edit button clicked for user ID: ${userId}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/edit_user/${userId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json', 
        },
        // body: JSON.stringify({ key: 'value' }) // 更新データがある場合はボディを追加
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Edit API response:', result.message);
      alert(`Edit request for user ${userId} processed.`);
      fetchUsers(); 
    } catch (e) {
      console.error("Failed to process edit request:", e);
      setError(`Failed to process edit request: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー削除処理
  const handleDeleteUser = async (userId) => {
  if (window.confirm(`Are you sure you want to delete user ID: ${userId}?`)) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/delete_user/${userId}`, {
        method: 'DELETE', 
      });
      if (!response.ok) {
          const errData = await response.json().catch(() => ({})); 
          // ユーザーが見つからない場合のエラーハンドリング
          if (response.status === 404) {
                throw new Error(errData.error || 'User not found.');
          }
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      fetchUsers();
    } catch (e) {
      console.error("Failed to delete user:", e);
      setError(`Failed to delete user: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 my-8">User Management</h1>

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && <p className="text-center text-blue-500 my-4">Loading...</p>}

      {/* ユーザーテーブル */}
      <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />

      {/* ユーザー追加フォーム */}
      <UserForm onAdd={handleAddUser} isLoading={isLoading} />

    </div>
  );
}

export default App;