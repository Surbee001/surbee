"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type SettingsTab = 'general' | 'account' | 'privacy' | 'billing';

const settingsTabs: { id: SettingsTab; label: string; href: string }[] = [
  { id: 'general', label: 'General', href: '/home/settings/general' },
  { id: 'account', label: 'Account', href: '/home/settings/account' },
  { id: 'privacy', label: 'Privacy', href: '/home/settings/privacy' },
  { id: 'billing', label: 'Billing', href: '/home/settings/billing' },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    try {
      toast.loading('Deleting your account...');
      const { error } = await deleteAccount();
      if (error) {
        toast.dismiss();
        toast.error(`Failed to delete account: ${error.message}`);
        return;
      }
      toast.dismiss();
      toast.success('Your account has been deleted successfully.');
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.dismiss();
      toast.error('Failed to delete account. Please try again or contact support.');
    }
  };

  return (
    <div className="settings-root">
      {/* Header */}
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      {/* Tab Navigation */}
      <nav className="settings-tabs">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${pathname === tab.href ? 'active' : ''}`}
            onClick={() => router.push(tab.href)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="settings-content">
        <div className="settings-section">
          {/* Account Email */}
          <div className="form-field">
            <label className="field-label">Email address</label>
            <p className="field-description">Your account email</p>
            <div className="email-display">
              {user?.email || 'Not available'}
            </div>
          </div>

          <div className="divider" />

          {/* Log Out */}
          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Log out of all devices</span>
                <span className="field-description">Sign out from this account on all devices</span>
              </div>
              <button className="action-btn" onClick={handleLogout}>
                Log out
              </button>
            </label>
          </div>

          <div className="divider" />

          {/* Danger Zone */}
          <div className="danger-zone">
            <div className="danger-zone-content">
              <h3 className="danger-zone-title">Delete account</h3>
              <p className="danger-zone-description">
                Once deleted, your account and all associated data (surveys, responses, settings) will be permanently removed. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                className="danger-zone-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete account
              </button>
            ) : (
              <div className="danger-zone-confirm">
                <p className="danger-zone-confirm-label">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  className="danger-zone-input"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                />
                <div className="danger-zone-actions">
                  <button
                    className="danger-zone-cancel"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="danger-zone-delete"
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE'}
                  >
                    Delete permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-root {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 32px 120px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Header */
        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-family: 'Kalice-Trial-Regular', sans-serif;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.4;
          margin-bottom: 0;
        }

        /* Tabs */
        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .settings-tab {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-tab:hover {
          border-color: rgba(232, 232, 232, 0.2);
        }

        .settings-tab.active {
          background: rgba(232, 232, 232, 0.05);
          border-color: transparent;
        }

        /* Content */
        .settings-content {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-section {
          max-width: 100%;
        }

        .divider {
          margin: 32px 0;
          width: 100%;
          height: 1px;
          background-color: rgba(232, 232, 232, 0.08);
        }

        /* Form Fields */
        .form-field {
          display: flex;
          flex-direction: column;
          margin-top: 24px;
        }

        .form-field:first-child {
          margin-top: 0;
        }

        .field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .field-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 4px 0 12px;
        }

        .email-display {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          background: rgba(232, 232, 232, 0.04);
          border: 1px solid rgba(232, 232, 232, 0.1);
          max-width: 400px;
        }

        /* Toggle Field */
        .toggle-field {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
        }

        .action-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .action-btn:hover {
          opacity: 0.9;
        }

        /* Danger Zone */
        .danger-zone {
          margin-top: 24px;
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 16px;
          padding: 24px;
          background: rgba(239, 68, 68, 0.02);
        }

        .danger-zone-content {
          margin-bottom: 20px;
        }

        .danger-zone-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0 0 8px 0;
        }

        .danger-zone-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0;
          line-height: 1.5;
        }

        .danger-zone-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #ef4444;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-zone-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .danger-zone-confirm {
          padding-top: 20px;
          border-top: 1px solid rgba(239, 68, 68, 0.1);
        }

        .danger-zone-confirm-label {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0 0 12px 0;
        }

        .danger-zone-confirm-label strong {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .danger-zone-input {
          width: 100%;
          max-width: 280px;
          padding: 12px 16px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          border-radius: 12px;
          outline: none;
          margin-bottom: 16px;
        }

        .danger-zone-input:focus {
          border-color: rgba(232, 232, 232, 0.3);
        }

        .danger-zone-input::placeholder {
          color: rgba(232, 232, 232, 0.3);
        }

        .danger-zone-actions {
          display: flex;
          gap: 12px;
        }

        .danger-zone-cancel {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(232, 232, 232, 0.06);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .danger-zone-cancel:hover {
          background: rgba(232, 232, 232, 0.1);
        }

        .danger-zone-delete {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          background: #ef4444;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-zone-delete:hover:not(:disabled) {
          background: #dc2626;
        }

        .danger-zone-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}