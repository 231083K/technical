// src/components/UserForm.js
import React, { useState, useEffect } from 'react';

function UserForm({
  onAdd,          // 新規追加時の処理: (userData) => Promise<boolean>
  onSave,         // 更新時の処理: (userId, userData) => Promise<boolean>
  initialData,    // 編集時の初期データ (ユーザーオブジェクト)
  isEditing = false, // 編集モードかどうかのフラグ
  isLoading,
  onCancel        // 編集モード時のキャンセル処理
}) {
  const initialFormState = {
    username: '', mail: '', password: '', age: '', gender: '', birth: '', addr: '', phone: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        username: initialData.username || '',
        mail: initialData.mail || '',
        password: '', // 編集時はパスワードを空にし、変更する場合のみ入力
        age: initialData.age || '',
        gender: initialData.gender || '',
        birth: initialData.birth ? new Date(initialData.birth).toISOString().split('T')[0] : '', // YYYY-MM-DD形式に
        addr: initialData.addr || '',
        phone: initialData.phone || '',
      });
    } else if (!isEditing) {
      setFormData(initialFormState); // 新規追加モードならフォームをクリア
    }
    setFormError(''); // モード変更時や初期データ変更時にエラーをクリア
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: valueAsNumberOrString(name, value) }));
  };

  // ageは数値として扱うためのヘルパー
  const valueAsNumberOrString = (name, value) => {
    if (name === 'age') {
      return value === '' ? '' : Number(value); // 空を許容しつつ、数値に
    }
    return value;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // 送信前にエラーをクリア

    if (!formData.username.trim() || !formData.mail.trim()) {
      setFormError("Username and Email are required.");
      return;
    }
    if (!isEditing && !formData.password.trim()) { // 新規ユーザーの場合のみパスワード必須
      setFormError("Password is required for new users.");
      return;
    }

    let success = false;
    if (isEditing && onSave && initialData) {
      const dataToUpdate = { ...formData };
      // 編集時、パスワードフィールドが空なら、パスワードは更新しない (キー自体を送らない)
      if (!formData.password || formData.password.trim() === '') {
        delete dataToUpdate.password;
      }
      success = await onSave(initialData.id, dataToUpdate);
      if (success && onCancel) onCancel(); // 成功したらキャンセル処理（モーダルを閉じるなど）を実行
    } else if (!isEditing && onAdd) {
      success = await onAdd(formData);
      if (success) {
        setFormData(initialFormState); // 新規追加成功時のみフォームをリセット
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        {isEditing ? `Edit User (ID: ${initialData?.id})` : 'Add New User'}
      </h2>
      {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username <span className="text-red-500">*</span></label>
            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder="John Doe" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="mail" className="block text-gray-700 text-sm font-bold mb-2">Email <span className="text-red-500">*</span></label>
            <input type="email" name="mail" id="mail" value={formData.mail} onChange={handleChange} placeholder="john.doe@example.com" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password {isEditing ? '(Leave blank to keep current)' : <span className="text-red-500">*</span>}</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "New password (if changing)" : "********"} required={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="age" className="block text-gray-700 text-sm font-bold mb-2">Age</label>
            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} placeholder="30" min="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
            <input type="text" name="gender" id="gender" value={formData.gender} onChange={handleChange} placeholder="Male/Female/Other" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="birth" className="block text-gray-700 text-sm font-bold mb-2">Birthday</label>
            <input type="date" name="birth" id="birth" value={formData.birth} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="addr" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <textarea name="addr" id="addr" value={formData.addr} onChange={handleChange} placeholder="123 Main St, Anytown" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="090-1234-5678" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          {isEditing && onCancel && (
            <button type="button" onClick={onCancel} disabled={isLoading} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cancel
            </button>
          )}
          <button type="submit" disabled={isLoading} className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isEditing ? 'bg-green-500 hover:bg-green-700 text-white' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}>
            {isLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add User')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;