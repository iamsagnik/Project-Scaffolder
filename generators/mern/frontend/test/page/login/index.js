// generators/mern/frontend/test/page/login.js

async function defaultVariant(ctx = {}) {
  const content = `// src/tests/pages/login.page.test.tsx
import { render, screen } from '@testing-library/react';
import Login from '../../pages/Login.page';

test('renders login form inputs and button', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
