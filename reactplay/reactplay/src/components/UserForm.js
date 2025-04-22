import React, { useState } from 'react';

function UserForm({ onAdd, isLoading }) {
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '',
    birth: '',
    addr: '',
    phone: '',
    mail: '',
    password: '',
  });
  const [error, setError] = useState(''); // エラーメッセージ用

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError(''); // エラーをリセット

      // 簡単なバリデーション
      if (!formData.username || !formData.mail || !formData.password) {
          setError('Username, Email, and Password are required.');
          return;
      }
      if (formData.age && isNaN(Number(formData.age))) {
          setError('Age must be a number.');
          return;
      }

      // 年齢を数値に変換 (空ならnull)
      const userData = {
          ...formData,
          age: formData.age ? parseInt(formData.age, 10) : null,
          birth: formData.birth || null, // 空ならnull
      };

      const success = await onAdd(userData); // App.jsのhandleAddUserを呼び出す
      if (success) {
          // 成功したらフォームをクリア
          setFormData({
              username: '', age: '', gender: '', birth: '', addr: '', phone: '', mail: '', password: '',
          });
      } else {
          // App.js側でエラー処理をする想定だが、ここでもメッセージ表示可能
          // setError('Failed to add user. Please check the console or try again.');
      }
  };


  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add New User</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username" type="text" placeholder="John Doe" name="username"
              value={formData.username} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mail">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="mail" type="email" placeholder="john.doe@example.com" name="mail"
              value={formData.mail} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password" type="password" placeholder="********" name="password"
              value={formData.password} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
              Age
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="age" type="number" placeholder="30" name="age"
              value={formData.age} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
              Gender
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="gender" type="text" placeholder="Male/Female/Other" name="gender"
              value={formData.gender} onChange={handleChange}
            />
          </div>
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birth">
              birthday
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="birth" type="date" name="birth"
              value={formData.birth} onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="addr">
              Address
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="addr" placeholder="123 Main St, Anytown" name="addr" rows="3"
              value={formData.addr} onChange={handleChange}
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone" type="tel" placeholder="090-1234-5678" name="phone"
              value={formData.phone} onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;