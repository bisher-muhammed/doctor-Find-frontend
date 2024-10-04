import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';

function HeaderLayout() {
  return (
    <>
      <Header />
      <main className="p-4">
        {/* Outlet is where the child routes will be rendered */}
        <Outlet />
      </main>
    </>
  );
}

export default HeaderLayout;
