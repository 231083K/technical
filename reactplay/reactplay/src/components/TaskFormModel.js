import React, { useState, useEffect } from 'react';

function TaskFormModal({ isOpen, onClose, onSubmit, taskData, selectedDate, availableUsers, selectedUserIdForNewTask }) {
  const initialFormState = {
    title: '',
    description: '',
    due_date: '',
    status: 'pending', // デフォルトステータス
    user_id: selectedUserIdForNewTask || '', // 新規タスクの場合のデフォルトユーザーID
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (taskData) { // 編集モード
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '',
          status: taskData.status || 'pending',
          user_id: taskData.user_id || '',
        });
      } else if (selectedDate) { // 新規追加モード (日付クリック時)
        setFormData({
          ...initialFormState,
          due_date: new Date(selectedDate).toISOString().split('T')[0],
          user_id: selectedUserIdForNewTask || (availableUsers.length > 0 ? availableUsers[0].id : ''),
        });
      } else { // 新規追加モード (通常)
         setFormData({
          ...initialFormState,
          user_id: selectedUserIdForNewTask || (availableUsers.length > 0 ? availableUsers[0].id : ''),
        });
      }
      setError(''); // モーダルを開くときにエラーをクリア
    }
  }, [isOpen, taskData, selectedDate, initialFormState, selectedUserIdForNewTask, availableUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!formData.user_id) {
        setError('User must be selected for the task.');
        return;
    }
    onSubmit(formData, taskData?.id); // taskData.id があれば更新、なければ新規
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {taskData ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" name="due_date" id="due_date" value={formData.due_date} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" id="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
           {/* ユーザー選択 (特にタスク編集時や、管理者として複数ユーザーのタスクを追加する場合) */}
           {/* 新規追加時で、特定のユーザーページから来た場合は pre-select されている想定 */}
           {!taskData && availableUsers && availableUsers.length > 0 && ( // 新規追加の場合のみ表示、または編集時もuser_id変更可能にするなら常に表示
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">Assign to User <span className="text-red-500">*</span></label>
              <select name="user_id" id="user_id" value={formData.user_id} onChange={handleChange} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select User</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.username} (ID: {user.id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {taskData ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;