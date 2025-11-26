import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Teaching Assistant</h1>
      </header>

      <div className="app-body">
        <nav className="sidebar">
          <ul>
            <li><Link to="/students">Students</Link></li>
            <li><Link to="/classes">Classes</Link></li>
            <li><Link to="/evaluations">Evaluations</Link></li>
          </ul>
        </nav>

        <section className="content">
          {children ?? <Outlet />}
        </section>
      </div>
    </div>
  );
};

export default Layout;
