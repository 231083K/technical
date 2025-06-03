// src/App.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // または MemoryRouter
import App from './App';

test('renders user management heading', () => {
  // AppコンポーネントをRouterでラップしてレンダリング
  render(
    <Router>
      <App />
    </Router>
  );
  // 実際のAppコンポーネントは<Layout>を経由してUserListPageを表示するので、
  // "User Management"というテキストはUserListPage内にあるか、
  // Layoutコンポーネントのナビゲーションバーにある可能性があります。
  // テスト対象のテキストが存在するか確認してください。
  // 例: ナビゲーションバーのテキストを探す場合
  const navElement = screen.getByText(/User Management App/i); // Layoutコンポーネントのタイトルなど
  expect(navElement).toBeInTheDocument();

  // もしUserListPageのh1タイトルをテストしたい場合は、
  // 初期表示でUserListPageが確実に表示されることを確認し、
  // 非同期処理がある場合は waitFor などを使う必要があります。
  // const headingElement = screen.getByText(/User Management/i); // UserListPageのh1
  // expect(headingElement).toBeInTheDocument();
});

// 他のテストケースも同様にRouterでラップする必要があるかもしれません。