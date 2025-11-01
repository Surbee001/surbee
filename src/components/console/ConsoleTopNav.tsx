"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function ConsoleTopNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <div className="console-top-nav">
        <div className="nav-left">
          <span className="nav-breadcrumb">
            <div className="breadcrumb-container">
              <span
                className="breadcrumb-item"
                role="button"
                tabIndex={0}
              >
                <span className="breadcrumb-content">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="org-icon" role="presentation">
                      <span className="org-letter">S</span>
                    </span>
                    <span className="truncate">Surbee</span>
                  </span>
                </span>
                <div className="breadcrumb-chevron">
                  <svg
                    className="chevron-icon"
                    height="1em"
                    width="1em"
                    fill="currentColor"
                    viewBox="0 0 10 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M4.34151 0.747423C4.71854 0.417526 5.28149 0.417526 5.65852 0.747423L9.65852 4.24742C10.0742 4.61111 10.1163 5.24287 9.75259 5.6585C9.38891 6.07414 8.75715 6.11626 8.34151 5.75258L5.00001 2.82877L1.65852 5.75258C1.24288 6.11626 0.61112 6.07414 0.247438 5.6585C-0.116244 5.24287 -0.0741267 4.61111 0.34151 4.24742L4.34151 0.747423ZM0.246065 10.3578C0.608879 9.94139 1.24055 9.89795 1.65695 10.2608L5.00001 13.1737L8.34308 10.2608C8.75948 9.89795 9.39115 9.94139 9.75396 10.3578C10.1168 10.7742 10.0733 11.4058 9.65695 11.7687L5.65695 15.2539C5.28043 15.582 4.7196 15.582 4.34308 15.2539L0.343082 11.7687C-0.0733128 11.4058 -0.116749 10.7742 0.246065 10.3578Z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </span>
              <div className="breadcrumb-slash">/</div>
              <span
                className="breadcrumb-item"
                role="button"
                tabIndex={0}
              >
                <span className="breadcrumb-content">
                  <span className="font-semibold">Surbee</span>
                </span>
                <div className="breadcrumb-chevron">
                  <svg
                    className="chevron-icon"
                    height="1em"
                    width="1em"
                    fill="currentColor"
                    viewBox="0 0 10 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M4.34151 0.747423C4.71854 0.417526 5.28149 0.417526 5.65852 0.747423L9.65852 4.24742C10.0742 4.61111 10.1163 5.24287 9.75259 5.6585C9.38891 6.07414 8.75715 6.11626 8.34151 5.75258L5.00001 2.82877L1.65852 5.75258C1.24288 6.11626 0.61112 6.07414 0.247438 5.6585C-0.116244 5.24287 -0.0741267 4.61111 0.34151 4.24742L4.34151 0.747423ZM0.246065 10.3578C0.608879 9.94139 1.24055 9.89795 1.65695 10.2608L5.00001 13.1737L8.34308 10.2608C8.75948 9.89795 9.39115 9.94139 9.75396 10.3578C10.1168 10.7742 10.0733 11.4058 9.65695 11.7687L5.65695 15.2539C5.28043 15.582 4.7196 15.582 4.34308 15.2539L0.343082 11.7687C-0.0733128 11.4058 -0.116749 10.7742 0.246065 10.3578Z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </span>
            </div>
          </span>
        </div>
        <div className="nav-center">
          <div className="nav-center-inner">
            <span className="nav-links-wrapper">
              <div className="nav-center-inner">
                <nav className="nav-links">
                  <a
                    className={`nav-link ${pathname === '/console' ? 'nav-link-active' : ''}`}
                    href="/console"
                  >
                    <span className="nav-link-text">Dashboard</span>
                    <span className="nav-link-text">Dashboard</span>
                  </a>
                  <a
                    className={`nav-link ${pathname === '/console/documentation' ? 'nav-link-active' : ''}`}
                    href="/console/documentation"
                  >
                    <span className="nav-link-text">Docs</span>
                    <span className="nav-link-text">Docs</span>
                  </a>
                  <a
                    className={`nav-link ${pathname === '/console/documentation' ? 'nav-link-active' : ''}`}
                    href="/console/documentation"
                  >
                    <span className="nav-link-text">API reference</span>
                    <span className="nav-link-text">API</span>
                  </a>
                </nav>
                <span>
                  <a
                    className={`nav-settings ${pathname === '/console/settings' ? 'nav-settings-active' : ''}`}
                    href="/console/settings"
                  >
                    <span className="settings-icon-wrapper">
                      <svg
                        height="1em"
                        width="1em"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          clipRule="evenodd"
                          d="M11.568 3.5a1 1 0 0 0-.863.494l-.811 1.381A3.001 3.001 0 0 1 7.33 6.856l-1.596.013a1 1 0 0 0-.858.501l-.439.761a1 1 0 0 0-.004.992l.792 1.4a3 3 0 0 1 0 2.954l-.792 1.4a1 1 0 0 0 .004.992l.439.76a1 1 0 0 0 .858.502l1.596.013a3 3 0 0 1 2.564 1.48l.811 1.382a1 1 0 0 0 .863.494h.87a1 1 0 0 0 .862-.494l.812-1.381a3.001 3.001 0 0 1 2.563-1.481l1.596-.013a1 1 0 0 0 .86-.501l.438-.761a1 1 0 0 0 .004-.992l-.793-1.4a3 3 0 0 1 0-2.954l.793-1.4a1 1 0 0 0-.004-.992l-.439-.76a1 1 0 0 0-.858-.502l-1.597-.013a3 3 0 0 1-2.563-1.48L13.3 3.993a1 1 0 0 0-.862-.494h-.87ZM8.98 2.981A3.001 3.001 0 0 1 11.568 1.5h.87c1.064 0 2.049.564 2.588 1.481l.811 1.382a1 1 0 0 0 .855.494l1.596.013a3 3 0 0 1 2.575 1.502l.44.76a3 3 0 0 1 .011 2.975l-.792 1.4a1 1 0 0 0 0 .985l.792 1.401a3 3 0 0 1-.012 2.974l-.439.761a3.001 3.001 0 0 1-2.575 1.503l-1.597.012a1 1 0 0 0-.854.494l-.811 1.382a3.001 3.001 0 0 1-2.588 1.481h-.87a3.001 3.001 0 0 1-2.588-1.481l-.811-1.382a1 1 0 0 0-.855-.494l-1.596-.012a3.001 3.001 0 0 1-2.576-1.503l-.438-.76a3 3 0 0 1-.013-2.975l.793-1.4a1 1 0 0 0 0-.985l-.793-1.4a3 3 0 0 1 .013-2.975l.438-.761A3.001 3.001 0 0 1 5.718 4.87l1.596-.013a1 1 0 0 0 .855-.494l.81-1.382Z"
                          fillRule="evenodd"
                        />
                        <path
                          clipRule="evenodd"
                          d="M12.003 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.502 12a3.5 3.5 0 1 1 7 .001 3.5 3.5 0 0 1-7-.001Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </span>
                  </a>
                </span>
              </div>
            </span>
            <div className="nav-avatar">
              <button
                className="avatar-button"
                type="button"
                aria-expanded="false"
                aria-haspopup="menu"
              >
                <span className="avatar-wrapper">
                  {user?.photoURL ? (
                    <img
                      className="avatar-img"
                      role="presentation"
                      src={user.photoURL}
                      alt="User avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .console-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--surbee-border-primary);
          background-color: var(--surbee-sidebar-bg);
          position: relative;
        }

        .nav-left {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .nav-breadcrumb {
          display: inline-flex;
        }

        .breadcrumb-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.2s;
          color: var(--surbee-fg-secondary);
        }

        .breadcrumb-item:hover {
          color: var(--surbee-fg-primary);
        }

        .breadcrumb-content {
          display: flex;
          align-items: center;
        }

        .org-icon {
          display: flex;
          align-items: center;
          justify-center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: var(--surbee-accent-primary);
          color: #ffffff;
        }

        .org-letter {
          font-size: 12px;
          font-weight: 600;
        }

        .breadcrumb-chevron {
          display: flex;
          align-items: center;
          color: var(--surbee-fg-muted);
        }

        .chevron-icon {
          width: 10px;
          height: 16px;
        }

        .breadcrumb-slash {
          color: var(--surbee-fg-muted);
          font-size: 14px;
        }

        .nav-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-center-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-links-wrapper {
          display: flex;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--surbee-fg-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
          position: relative;
        }

        .nav-link:hover {
          color: var(--surbee-fg-primary);
        }

        .nav-link-active {
          color: var(--surbee-fg-primary);
        }

        .nav-link-text {
          display: block;
        }

        .nav-link-text:first-child {
          display: none;
        }

        @media (min-width: 768px) {
          .nav-link-text:first-child {
            display: block;
          }
          .nav-link-text:last-child {
            display: none;
          }
        }

        .nav-settings {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          color: var(--surbee-fg-secondary);
          transition: color 0.2s;
          cursor: pointer;
          text-decoration: none;
        }

        .nav-settings:hover {
          color: var(--surbee-fg-primary);
        }

        .nav-settings-active {
          color: var(--surbee-fg-primary);
        }

        .settings-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .nav-avatar {
          margin-left: auto;
        }

        .avatar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .avatar-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--surbee-accent-primary);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
