import React from 'react';
import { Outlet } from 'react-router-dom';

export default function LayoutPrincipal() {
  return (
    <div>
      <h1>Layout Principal</h1>
      <Outlet />
    </div>
  );
}