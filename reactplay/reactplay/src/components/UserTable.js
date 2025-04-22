import React from 'react';

function UserTable({ users, onEdit, onDelete }) {
  if (!users || users.length === 0) {
    return <p className="text-center text-gray-500 my-4">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mb-8">
      <table className="w-full text-sm text-left text-gray-500 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200 ">
          <tr>
            <th scope="col" className="px-6 py-3">Username</th>
            <th scope="col" className="px-6 py-3">Age</th>
            <th scope="col" className="px-6 py-3">Gender</th>
            <th scope="col" className="px-6 py-3">Birth Date</th>
            <th scope="col" className="px-6 py-3">Address</th>
            <th scope="col" className="px-6 py-3">Phone</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Password</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="bg-white border-b hover:bg-gray-50 ">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4">{user.age || '-'}</td>
              <td className="px-6 py-4">{user.gender || '-'}</td>
              <td className="px-6 py-4">{user.birth ? new Date(user.birth).toLocaleDateString() : '-'}</td>
              <td className="px-6 py-4">{user.addr || '-'}</td>
              <td className="px-6 py-4">{user.phone || '-'}</td>
              <td className="px-6 py-4">{user.mail}</td>
              <td className="px-6 py-4">{user.password}</td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(user.id)}
                  className="font-medium text-blue-600 hover:underline mr-3"
                >
                  編集
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="font-medium text-red-600 hover:underline"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;