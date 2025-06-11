// src/App.js
import React from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import UserListPage from './pages/UserListPage';    
import TaskCalendarPage from './pages/TaskCalendarPage'; // 前回作成したタスクカレンダーページ
// import NotFoundPage from './pages/NotFoundPage'; // (オプション) 404ページ

// 共通レイアウトコンポーネント
function Layout() {
  return (
    <div>
      <nav className="bg-gray-800 text-white p-4 mb-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-gray-300">技術研究システム</Link>
          <div>
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">User Management</Link>
            <Link to="/tasks" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Task Calendar</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Outlet /> {/* 各ルートのコンポーネントがここに描画される */}
      </main>
      <footer className="text-center text-gray-500 py-4 mt-8 border-t">
        <p>&copy; {new Date().getFullYear()} My Application</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> 
        <Route index element={<UserListPage />} /> 
        <Route path="tasks" element={<TaskCalendarPage />} /> 
      </Route>
    </Routes>
  );
}

export default App;