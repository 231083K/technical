// src/pages/TaskCalendarPage.js
import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // dateClick, eventClick, eventDropなど
import TaskFormModal from '../components/TaskFormModal'; // 作成したモーダルをインポート
// import { useParams } from 'react-router-dom'; // もしURLからuserIdを取得する場合

// APIのベースURL (App.jsから持ってくるか、共通化する)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/';

// API URLの末尾スラッシュを処理するヘルパー
const getApiEndpoint = (base, path) => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};


function TaskCalendarPage() {
  // const { userId: userIdFromParams } = useParams(); // URLからuserIdを取得する場合

  const [allUsers, setAllUsers] = useState([]); // ユーザー選択用
  const [selectedUserId, setSelectedUserId] = useState(''); // 選択されたユーザーID
  
  const [tasks, setTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskData, setCurrentTaskData] = useState(null); // 編集用タスクデータ
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState(null); // カレンダーで日付クリック時の日付

  // 全ユーザーリストを取得 (ユーザー選択用)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(getApiEndpoint(API_BASE_URL, 'sending_user'));
        if (!response.ok) throw new Error('Failed to fetch users list');
        const data = await response.json();
        setAllUsers(data);
        if (data.length > 0 && !selectedUserId) { // 初期選択ユーザーを設定
          setSelectedUserId(data[0].id.toString()); // IDを文字列として扱う
        }
      } catch (e) {
        console.error("Failed to fetch all users:", e);
        setError(`Failed to load users for selection: ${e.message}`);
      }
    };
    fetchAllUsers();
  }, [selectedUserId]); // selectedUserId の変更時ではなく、初期ロード時に実行し、必要なら依存配列を調整

  // 選択されたユーザーのタスクを取得
  const fetchTasksForUser = useCallback(async (userId) => {
    if (!userId) {
      setTasks([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiEndpoint(API_BASE_URL, `/users/${userId}/tasks`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (e) {
      console.error(`Failed to fetch tasks for user ${userId}:`, e);
      setError(`Failed to load tasks: ${e.message}`);
      setTasks([]); // エラー時はタスクを空にする
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchTasksForUser(selectedUserId);
    }
  }, [selectedUserId, fetchTasksForUser]);

  // tasks 配列を FullCalendar が扱えるイベント形式に変換
  useEffect(() => {
    const events = tasks.map(task => ({
      id: task.id.toString(), // FullCalendarはidを文字列として期待することがある
      title: task.title,
      start: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null, // YYYY-MM-DD形式
      allDay: true, // 終日イベントとして扱う
      extendedProps: { ...task } // 元のタスクデータを保持
    }));
    setCalendarEvents(events);
  }, [tasks]);

  // --- モーダル制御 ---
  const openAddTaskModal = (date) => {
    setCurrentTaskData(null); // 新規追加なので既存データはなし
    setSelectedDateForNewTask(date ? date.toISOString().split('T')[0] : ''); // YYYY-MM-DD
    setIsModalOpen(true);
    setError(null);
  };

  const openEditTaskModal = (task) => {
    setCurrentTaskData(task);
    setSelectedDateForNewTask(null);
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTaskData(null);
    setSelectedDateForNewTask(null);
  };

  // --- API連携 (タスク操作) ---
  const handleTaskFormSubmit = async (formData, taskId) => {
    setIsLoading(true);
    setError(null);
    const isEditing = !!taskId;
    const url = isEditing 
        ? getApiEndpoint(API_BASE_URL, `/tasks/${taskId}`)
        : getApiEndpoint(API_BASE_URL, `/users/${selectedUserId}/tasks`); // 新規作成は選択中ユーザーに紐づく
    const method = isEditing ? 'PUT' : 'POST';

    // user_id は formData に含まれている想定 (TaskFormModalで設定)
    const body = { ...formData };
    if (!isEditing && !body.user_id) { // 新規作成時にuser_idがなければ、選択中のユーザーIDをセット
        body.user_id = selectedUserId;
    }
    if (body.due_date === '') body.due_date = null; // 空の期日はnullとして送信

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Operation failed' }));
        throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
      }
      await response.json(); // 必要なら結果を利用
      fetchTasksForUser(selectedUserId); // タスクリストを再読み込み
      closeModal();
    } catch (e) {
      console.error(`Failed to ${isEditing ? 'update' : 'add'} task:`, e);
      // モーダル内でエラー表示するので、ここではAppレベルのエラーはセットしないか、別途管理
      // setError(`Failed to ${isEditing ? 'update' : 'add'} task: ${e.message}`);
      // TaskFormModal 側にエラーを渡して表示させるのが親切
      alert(`Error: ${e.message}`); // とりあえずalert
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (arg) => { // カレンダーの日付クリック
    openAddTaskModal(arg.date);
  };

  const handleEventClick = (clickInfo) => { // カレンダーのイベント (タスク) クリック
    // clickInfo.event.extendedProps に元のタスクデータが入っている
    openEditTaskModal(clickInfo.event.extendedProps);
  };

  // (オプション) イベントドラッグによる日付変更
  const handleEventDrop = async (dropInfo) => {
    const { id, title, description, status } = dropInfo.event.extendedProps;
    const newDueDate = dropInfo.event.start ? new Date(dropInfo.event.start).toISOString().split('T')[0] : null;

    if (window.confirm(`Move task "${title}" to ${newDueDate}?`)) {
      await handleTaskFormSubmit({ title, description, due_date: newDueDate, status, user_id: selectedUserId }, id);
    } else {
      dropInfo.revert(); // ドラッグを元に戻す
    }
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Task Calendar</h1>

      {/* ユーザー選択ドロップダウン */}
      <div className="mb-4">
        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select User:
        </label>
        <select
          id="user-select"
          value={selectedUserId}
          onChange={handleUserChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">-- Select a User --</option>
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.username} (ID: {user.id})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {isLoading && <p className="text-blue-500 mb-4">Loading tasks...</p>}

      {selectedUserId ? (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={calendarEvents}
          dateClick={handleDateClick}    // 日付クリック時の処理
          eventClick={handleEventClick}  // イベントクリック時の処理
          editable={true}                // イベントのドラッグを許可
          eventDrop={handleEventDrop}    // イベントドラッグ完了時の処理
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay' // timeGridも追加（必要なら）
          }}
          // eventContent={renderEventContent} // カスタムイベントレンダリング (オプション)
        />
      ) : (
        <p className="text-center text-gray-500">Please select a user to view their tasks.</p>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleTaskFormSubmit}
        taskData={currentTaskData} // 編集時はここにデータが入る
        selectedDate={selectedDateForNewTask} // 新規追加(日付クリック時)はここに日付が入る
        availableUsers={allUsers} // モーダル内でユーザーを選択できるように全ユーザー情報を渡す
        selectedUserIdForNewTask={selectedUserId} // 現在選択中のユーザーIDを新規タスクのデフォルトに
      />
    </div>
  );
}

// (オプション) カスタムイベントレンダリング関数
// function renderEventContent(eventInfo) {
//   return (
//     <>
//       <b>{eventInfo.timeText}</b>
//       <i>{eventInfo.event.title}</i>
//       <p>Status: {eventInfo.event.extendedProps.status}</p>
//     </>
//   );
// }

export default TaskCalendarPage;