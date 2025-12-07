// generators/mern/frontend/app.js

async function authDashboardShell(ctx = {}) {
  const content = `// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home.page';
import Login from './pages/Login.page';
import Register from './pages/Register.page';
import Dashboard from './pages/Dashboard.page';
import Todos from './pages/Todos.page';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated section */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/todos" element={<Todos />} />
    </Routes>
  );
}

export default App;
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return authDashboardShell(ctx);
}

module.exports = {
  "auth-dashboard-shell": authDashboardShell,
  default: defaultVariant,
};
