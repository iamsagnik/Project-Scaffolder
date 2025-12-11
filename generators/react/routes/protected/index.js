// generators/react/router/protected.js

async function defaultVariant(ctx = {}) {
  const content = `// src/routes/protected.routes.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, isAuthenticated } : any) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
