import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';

function HeaderLayout() {
  return (
    <>
      <Header />
      <>
        {/* Outlet is where the child routes will be rendered */}
        <Outlet />
      </>
    </>
  );
}

export default HeaderLayout;
