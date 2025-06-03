// src/App.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // または MemoryRouter
import App from './App';

// test('renders user management heading', () => { // 古いテスト名
test('renders navigation links correctly', () => { // 新しいテスト名 (例)
  render(
    <Router>
      <App />
    </Router>
  );

  // オプション1: "My App" というサイトタイトル/リンクが存在するか確認
  const siteTitleLink = screen.getByRole('link', { name: /My App/i });
  expect(siteTitleLink).toBeInTheDocument();

  // オプション2: "User Management" というナビゲーションリンクが存在するか確認
  const userManagementNavLink = screen.getByRole('link', { name: /User Management/i });
  expect(userManagementNavLink).toBeInTheDocument();

  // オプション3: "Task Calendar" というナビゲーションリンクが存在するか確認
  const taskCalendarNavLink = screen.getByRole('link', { name: /Task Calendar/i });
  expect(taskCalendarNavLink).toBeInTheDocument();

  // もし UserListPage の H1 要素をテストしたい場合は、
  // 非同期処理 (fetchUsers) を考慮して waitFor を使う必要があるかもしれません。
  // 例:
  // const pageHeading = await screen.findByRole('heading', { name: /User Management/i, level: 1 });
  // expect(pageHeading).toBeInTheDocument();
  // この場合、テスト関数を async にする必要があります。
});