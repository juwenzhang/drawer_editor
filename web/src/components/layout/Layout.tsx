import type React from 'react';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="layout">{children}</div>;
};

export default Layout;
