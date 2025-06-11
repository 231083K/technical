// src/pages/UserListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import UserTable from '../components/UserTable'; // パスを修正
import UserForm from '../components/UserForm';   // パスを修正

// APIのベースURL (共通化推奨)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/';

// API URLの末尾スラッシュを処理するヘルパー (共通化推奨)
const getApiEndpoint = (base, path) => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserForEdit, setCurrentUserForEdit] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching users from URL=", API_BASE_URL);
    try {
      const endpoint = getApiEndpoint(API_BASE_URL, 'sending_user');
      const response = await fetch(endpoint);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
        } catch (parseError) { /* ignore */ }
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint(API_BASE_URL, 'insert_user');
      const response = await fetch(endpoint, {
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
      fetchUsers();
      return true;
    } catch (e) {
      console.error("Failed to add user:", e);
      setError(`Failed to add user: ${e.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user) => {
    setCurrentUserForEdit(user);
    setIsEditModalOpen(true);
    setError(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserForEdit(null);
  };

  const handleUpdateUser = async (userId, updatedUserData) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = getApiEndpoint(API_BASE_URL, `edit_user/${userId}`);
      const response = await fetch(endpoint, {
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
      fetchUsers();
      closeEditModal();
      return true;
    } catch (e) {
      console.error("Failed to update user:", e);
      setError(`Failed to update user ID ${userId}: ${e.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`このユーザを削除しますか？ :${userId}?`)) {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = getApiEndpoint(API_BASE_URL, `delete_user/${userId}`);
        const response = await fetch(endpoint, {
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
    // <div className="container mx-auto p-4"> // App.jsのLayoutで <main> が囲むので不要な場合あり
    <>
      <h1 className="text-3xl font-bold text-center text-gray-800 my-8">User Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {isLoading && <p className="text-center text-blue-500 my-4">Loading...</p>}

      <UserTable users={users} onEdit={openEditModal} onDelete={handleDeleteUser} />

      {!isEditModalOpen && (
          <UserForm
            onAdd={handleAddUser}
            isLoading={isLoading}
            isEditing={false}
          />
      )}

      {isEditModalOpen && currentUserForEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="relative mx-auto p-1 w-full max-w-lg shadow-lg rounded-md bg-white">
            <UserForm
              onSave={handleUpdateUser}
              initialData={currentUserForEdit}
              isEditing={true}
              isLoading={isLoading}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}
    </>
    // </div>
  );
}

export default UserListPage;