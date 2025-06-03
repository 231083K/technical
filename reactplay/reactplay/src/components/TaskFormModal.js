// src/components/TaskFormModal.js
import React, { useState, useEffect } from 'react';

// ★ initialFormState をコンポーネントの外に定数として定義
const INITIAL_TASK_FORM_STATE = {
  title: '',
  description: '',
  due_date: '',
  status: 'pending',
  user_id: '', // user_id の初期値は useEffect 内で props を元に設定する
};

function TaskFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskData,                 // 編集対象のタスクデータ
  selectedDate,             // カレンダーでクリックされた日付 (新規追加用)
  availableUsers,           // ユーザー選択用ドロップダウンのリスト
  selectedUserIdForNewTask  // 新規タスク作成時のデフォルトユーザーID
}) {
  // ★ 定数 INITIAL_TASK_FORM_STATE を初期値として使用
  const [formData, setFormData] = useState(INITIAL_TASK_FORM_STATE);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (taskData) { // 編集モード
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '',
          status: taskData.status || 'pending',
          user_id: taskData.user_id || '', // 編集時は既存のuser_idを使用
        });
      } else { // 新規追加モード
        let defaultUserId = selectedUserIdForNewTask || '';
        if (!defaultUserId && availableUsers && availableUsers.length > 0) {
          defaultUserId = availableUsers[0].id.toString(); // availableUsers があれば最初のユーザーをデフォルトに
        }
        setFormData({
          ...INITIAL_TASK_FORM_STATE, // ★ 定数を使用
          due_date: selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '',
          user_id: defaultUserId,
        });
      }
      setError(''); // モーダルを開くときにフォーム固有のエラーをクリア
    }
    // isEditing や initialData の代わりに、isOpen, taskData, selectedDate を依存関係にする
  }, [isOpen, taskData, selectedDate, selectedUserIdForNewTask, availableUsers]); // ★ INITIAL_TASK_FORM_STATE は依存配列から削除 (安定した定数のため)


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
    if (!formData.user_id) { // user_idが必須であることを確認
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" name="due_date" id="due_date" value={formData.due_date} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" id="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {/* Assign to User - 編集時は表示しない（または変更不可にする）か、ユーザー変更を許可する場合は別途考慮 */}
          {(!taskData || taskData.user_id === undefined) && availableUsers && availableUsers.length > 0 && (
            <div>
              <label htmlFor="user_id_task" className="block text-sm font-medium text-gray-700">Assign to User <span className="text-red-500">*</span></label>
              <select name="user_id" id="user_id_task" value={formData.user_id} onChange={handleChange} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">-- Select User --</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>{user.username} (ID: {user.id})</option>
                ))}
              </select>
            </div>
          )}
           {taskData && taskData.user_id && ( // 編集時でuser_idがある場合は表示のみ（変更不可）
            <div>
                <p className="text-sm text-gray-500">Assigned to: User ID {taskData.user_id}</p>
                {/* 隠しフィールドでuser_idを保持する */}
                <input type="hidden" name="user_id" value={formData.user_id} />
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