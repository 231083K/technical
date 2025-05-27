// src/App.js (関連部分のみ抜粋、他の部分は前回提示したものを参照)
import React, { useState, useEffect, useCallback } from 'react';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm'; // UserForm は新規追加と編集の両方で使う

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/';

function App() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserForEdit, setCurrentUserForEdit] = useState(null);

  // ユーザーリストを取得 (前回同様)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching users from URL=", API_BASE_URL);
    try {
      const endpoint = API_BASE_URL.endsWith('/') ? 'sending_user' : '/sending_user';
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        // エラーレスポンスがJSON形式でない場合も考慮
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
        } catch (parseError) {
            // JSONパース失敗時は元のエラーステータスを使用
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      console.log("Fetched users data:", data);
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      setError(`Failed to load user data: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // API_BASE_URL はビルド時に固定されるので依存配列から除外しても良い

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ユーザー追加処理 (前回同様)
  const handleAddUser = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = API_BASE_URL.endsWith('/') ? 'insert_user' : '/insert_user';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
        } catch (parseError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      // const newUser = await response.json(); // バックエンドがユーザー情報を返す場合
      fetchUsers();
      return true; // 成功
    } catch (e) {
      console.error("Failed to add user:", e);
      setError(`Failed to add user: ${e.message}`);
      return false; // 失敗
    } finally {
      setIsLoading(false);
    }
  };

  // 編集モーダルを開く
  const openEditModal = (user) => {
    setCurrentUserForEdit(user);
    setIsEditModalOpen(true);
    setError(null); // モーダルを開くときにAppレベルのエラーをクリア
  };

  // 編集モーダルを閉じる
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserForEdit(null);
  };

  // ユーザー更新処理
  const handleUpdateUser = async (userId, updatedUserData) => {
    setIsLoading(true);
    setError(null); // Appレベルのエラーをクリア
    try {
      const endpoint = API_BASE_URL.endsWith('/') ? `edit_user/${userId}` : `/edit_user/${userId}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
        } catch (parseError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      // const updatedUser = await response.json(); // バックエンドがユーザー情報を返す場合
      fetchUsers();
      closeEditModal(); // 成功したらモーダルを閉じる
      return true; // 成功
    } catch (e) {
      console.error("Failed to update user:", e);
      setError(`Failed to update user ID ${userId}: ${e.message}`); // Appレベルでエラー表示
      return false; // 失敗
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー削除処理 (前回同様)
  const handleDeleteUser = async (userId) => {
    // ... (前回提示したコード) ...
    if (window.confirm(`Are you sure you want to delete user ID: ${userId}?`)) {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = API_BASE_URL.endsWith('/') ? `delete_user/${userId}` : `/delete_user/${userId}`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
              const errData = await response.json();
              errorMsg = errData.error || errorMsg;
              if (response.status === 404) errorMsg = errData.error || 'User not found.';
          } catch (parseError) { /* ignore */ }
          throw new Error(errorMsg);
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {isLoading && <p className="text-center text-blue-500 my-4">Loading...</p>}

      <UserTable users={users} onEdit={openEditModal} onDelete={handleDeleteUser} />

      {/* 新規追加用フォーム (編集モードではない) */}
      {!isEditModalOpen && (
          <UserForm 
            onAdd={handleAddUser} 
            isLoading={isLoading} 
            isEditing={false} 
          />
      )}


      {/* 編集用モーダル */}
      {isEditModalOpen && currentUserForEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="relative mx-auto p-1 w-full max-w-lg shadow-lg rounded-md bg-white">
            {/* UserFormを編集モードで利用 */}
            <UserForm
              onSave={handleUpdateUser} // 更新処理関数を渡す
              initialData={currentUserForEdit}
              isEditing={true}
              isLoading={isLoading}
              onCancel={closeEditModal} // キャンセル（モーダルを閉じる）関数を渡す
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;