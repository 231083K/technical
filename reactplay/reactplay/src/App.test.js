import { render, screen } from '@testing-library/react';
import App from './App';

test('renders user management heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/User Management/i);
  expect(headingElement).toBeInTheDocument();
});