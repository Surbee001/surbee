"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { useCredits } from '@/hooks/useCredits';
import { CreditCard as CreditCardIcon, AlertCircle, Plus, Trash2 } from 'lucide-react';

type SettingsTab = 'general' | 'account' | 'privacy' | 'billing';

const settingsTabs: { id: SettingsTab; label: string; href: string }[] = [
  { id: 'general', label: 'General', href: '/home/settings/general' },
  { id: 'account', label: 'Account', href: '/home/settings/account' },
  { id: 'privacy', label: 'Privacy', href: '/home/settings/privacy' },
  { id: 'billing', label: 'Billing', href: '/home/settings/billing' },
];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  description: string;
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, session } = useAuth();
  const { credits, percentUsed } = useCredits();
  const { resolvedTheme } = useTheme();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  const currentPlan = credits?.plan || 'free';

  // Icon filter: off-white for dark mode, off-black for light mode
  const isDark = resolvedTheme === 'dark';
  const iconFilter = isDark
    ? 'brightness(0) invert(0.9)'
    : 'brightness(0) invert(0.15)';

  const daysUntilReset = useMemo(() => {
    if (!credits?.creditsResetAt) return null;
    const resetDate = new Date(credits.creditsResetAt);
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [credits?.creditsResetAt]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const response = await fetch('/api/billing/invoices', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [session?.access_token]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const response = await fetch('/api/billing/payment-methods', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchInvoices();
    fetchPaymentMethods();
  }, [fetchInvoices, fetchPaymentMethods]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleUpgrade = () => router.push('/home/pricing');

  const handleAddPaymentMethod = async () => {
    if (!session?.access_token) {
      toast.error('Please log in to add a payment method');
      return;
    }

    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.setupUrl) {
        window.location.href = data.setupUrl;
      } else if (data.error === 'Stripe not configured') {
        toast.error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment.');
      } else {
        toast.error('Failed to set up payment method. Please try again.');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to set up payment method. Please try again.');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (response.ok) {
        toast.success('Payment method removed');
        fetchPaymentMethods();
      } else {
        toast.error('Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to remove payment method');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank');
    } else {
      toast.info(`Opening invoice ${invoice.id}...`);
    }
  };

  const handlePayInvoice = (invoice: Invoice) => {
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank');
    } else {
      toast.info(`Processing payment for ${invoice.id}...`);
    }
  };

  const handleCancelPlan = () => {
    toast.warning('Are you sure you want to cancel?', {
      duration: 5000,
      action: {
        label: 'Yes, Cancel',
        onClick: () => toast.error('Plan cancellation initiated.'),
      },
    });
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
          {/* Current Plan */}
          <div className="plan-section">
            <div className="plan-row">
              <div className="plan-left">
                <img
                  src={
                    currentPlan === 'surbee_max' || currentPlan === 'max' || currentPlan === 'surbee_enterprise' || currentPlan === 'enterprise'
                      ? 'https://ik.imagekit.io/on0moldgr/composition%20(2).svg'
                      : currentPlan === 'surbee_pro' || currentPlan === 'pro'
                        ? 'https://ik.imagekit.io/on0moldgr/composition%20(1).svg'
                        : 'https://ik.imagekit.io/on0moldgr/composition.svg'
                  }
                  alt="Plan icon"
                  className="plan-icon"
                  style={{ width: '64px', height: '64px', filter: iconFilter }}
                />
                <div className="plan-text">
                  <h2 className="plan-name">
                    {currentPlan === 'surbee_max' || currentPlan === 'max' ? 'Max plan' : currentPlan === 'surbee_pro' || currentPlan === 'pro' ? 'Pro plan' : currentPlan === 'surbee_enterprise' || currentPlan === 'enterprise' ? 'Enterprise plan' : 'Free plan'}
                  </h2>
                  <p className="plan-description">
                    {currentPlan === 'max' ? '5x more usage than Pro' : currentPlan === 'pro' ? '20x more usage than Free' : currentPlan === 'enterprise' ? 'Unlimited usage with API access' : 'Get started with Surbee'}
                  </p>
                  <p className="plan-renewal">
                    {credits?.creditsResetAt ? `Credits reset on ${new Date(credits.creditsResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Monthly credits included'}
                  </p>
                </div>
              </div>
              <button className="adjust-plan-btn" onClick={handleUpgrade}>
                {currentPlan === 'free' ? 'Upgrade' : 'Adjust plan'}
              </button>
            </div>
          </div>

          <div className="divider" />

          {/* Usage Analytics */}
          <div className="usage-analytics">
            <div className="analytics-header">
              <div className="analytics-controls">
                <button className="date-range-btn">
                  <span>Dec 08 - Jan 06</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className="period-selector">
                  <button className="period-btn">1d</button>
                  <button className="period-btn">7d</button>
                  <button className="period-btn active">30d</button>
                </div>
              </div>
            </div>

            <div className="analytics-title">Your Analytics</div>

            <div className="analytics-tiles">
              <div className="analytics-tile active">
                <div className="tile-label">
                  Credits Used
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <div className="tile-value">
                  <span className="tile-number">{credits ? (credits.monthlyCredits - credits.creditsRemaining).toLocaleString() : 0}</span>
                  <span className="tile-total">/ {credits?.monthlyCredits?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="analytics-tile">
                <div className="tile-label">Surveys Created</div>
                <div className="tile-value">
                  <span className="tile-number">0</span>
                </div>
              </div>
              <div className="analytics-tile">
                <div className="tile-label">Responses</div>
                <div className="tile-value">
                  <span className="tile-number">0</span>
                </div>
              </div>
              <div className="analytics-tile">
                <div className="tile-label">AI Analyses</div>
                <div className="tile-value">
                  <span className="tile-number">0</span>
                </div>
              </div>
            </div>

          </div>

          <div className="divider" />

          {/* Payment Methods */}
          <div className="section-header">
            <h2 className="section-title">Payment methods</h2>
          </div>

          <div className="payment-methods-list">
            {loadingPaymentMethods ? (
              <div className="loading-state">Loading payment methods...</div>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((pm) => (
                <div key={pm.id} className="payment-method-row">
                  <div className="payment-info">
                    <CreditCardIcon className="w-5 h-5 opacity-50" />
                    <div className="payment-details">
                      <span className="payment-card">
                        {pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1)} •••• {pm.last4}
                      </span>
                      {pm.expMonth && pm.expYear && (
                        <span className="payment-expiry">
                          Expires {pm.expMonth}/{pm.expYear.toString().slice(-2)}
                        </span>
                      )}
                    </div>
                    {pm.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  {!pm.isDefault && paymentMethods.length > 1 && (
                    <button
                      className="delete-payment-btn"
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      title="Remove payment method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="no-payment-methods">
                <p>No payment methods on file</p>
              </div>
            )}

            <button className="add-payment-btn-solid" onClick={handleAddPaymentMethod}>
              <Plus className="w-4 h-4" />
              Add payment method
            </button>
          </div>

          {invoices.some(inv => inv.status === 'overdue') && (
            <div className="overdue-alert">
              <AlertCircle className="w-4 h-4" />
              Your subscription is past due. Please update your payment method.
            </div>
          )}

          <div className="divider" />

          {/* Invoices */}
          <div className="section-header">
            <h2 className="section-title">Invoices</h2>
          </div>

          <div className="invoices-table">
            {loadingInvoices ? (
              <div className="loading-state">Loading invoices...</div>
            ) : invoices.length > 0 ? (
              <>
                <div className="invoices-header">
                  <span>Date</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="invoice-row">
                    <span className="invoice-date">{formatDate(invoice.date)}</span>
                    <span className="invoice-amount">US${invoice.amount.toFixed(2)}</span>
                    <span className={`invoice-status ${invoice.status}`}>
                      {invoice.status === 'overdue' && <AlertCircle className="w-3.5 h-3.5" />}
                      {invoice.status}
                    </span>
                    <button
                      className="invoice-action"
                      onClick={() => invoice.status === 'overdue' ? handlePayInvoice(invoice) : handleViewInvoice(invoice)}
                    >
                      {invoice.status === 'overdue' ? 'Pay' : 'View'}
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div className="no-invoices">
                <p>No invoices yet</p>
              </div>
            )}
          </div>

          {/* Cancellation - only show for paid plans */}
          {currentPlan !== 'free' && currentPlan !== 'free_user' && (
            <>
              <div className="divider" />
              <div className="danger-zone">
                <div className="danger-zone-content">
                  <h3 className="danger-zone-title">Cancel subscription</h3>
                  <p className="danger-zone-description">
                    Your subscription will remain active until the end of the billing period.
                  </p>
                </div>
                <button className="danger-zone-btn" onClick={handleCancelPlan}>
                  Cancel plan
                </button>
              </div>
            </>
          )}
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

        .section-header {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
        }

        .divider {
          margin: 32px 0;
          width: 100%;
          height: 1px;
          background-color: rgba(232, 232, 232, 0.08);
        }

        /* Plan Section - Claude.ai style */
        .plan-section {
          margin-bottom: 0;
        }

        .plan-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          column-gap: 32px;
          row-gap: 12px;
        }

        .plan-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .plan-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
          text-align: start;
        }

        .plan-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .plan-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0;
        }

        .plan-renewal {
          font-size: 13px;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          margin: 0;
        }

        .adjust-plan-btn {
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

        .adjust-plan-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .plan-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .adjust-plan-btn {
            align-self: flex-start;
          }
        }

        /* Usage Analytics */
        .usage-analytics {
          padding: 24px;
          border-radius: 12px;
          background: rgba(232, 232, 232, 0.025);
          border: 1px solid rgba(232, 232, 232, 0.06);
        }

        .analytics-header {
          margin-bottom: 24px;
        }

        .analytics-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-range-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
          height: 28px;
          font-size: 12px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .date-range-btn:hover {
          border-color: rgba(232, 232, 232, 0.15);
        }

        .date-range-btn svg {
          opacity: 0.6;
        }

        .period-selector {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .period-btn {
          padding: 4px 8px;
          height: 28px;
          min-width: 40px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(232, 232, 232, 0.6);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .period-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .period-btn.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .analytics-title {
          font-size: 13px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .analytics-tiles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .analytics-tiles {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .analytics-tile {
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .analytics-tile:hover {
          background: rgba(232, 232, 232, 0.04);
        }

        .analytics-tile.active {
          background: rgba(232, 232, 232, 0.06);
        }

        .tile-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(232, 232, 232, 0.6);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tile-label svg {
          flex-shrink: 0;
        }

        .tile-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .tile-number {
          font-size: 20px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          font-variant-numeric: tabular-nums;
        }

        .tile-total {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.4);
          font-variant-numeric: tabular-nums;
        }

        /* Form Fields */
        .form-field {
          display: flex;
          flex-direction: column;
          margin-top: 16px;
        }

        .toggle-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .payment-methods-list {
          margin-top: 16px;
        }

        .payment-method-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 12px;
          background: rgba(232, 232, 232, 0.03);
          border: 1px solid rgba(232, 232, 232, 0.08);
          margin-bottom: 12px;
        }

        .payment-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
        }

        .payment-card {
          font-size: 14px;
        }

        .payment-expiry {
          font-size: 12px;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        .default-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 9999px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .delete-payment-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-payment-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .add-payment-btn-solid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
        }

        .add-payment-btn-solid:hover {
          opacity: 0.9;
        }

        .no-payment-methods {
          padding: 24px;
          text-align: center;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          font-size: 14px;
        }

        .no-payment-methods p {
          margin: 0 0 16px 0;
        }

        .loading-state {
          padding: 24px;
          text-align: center;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          font-size: 14px;
        }

        .no-invoices {
          padding: 24px;
          text-align: center;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          font-size: 14px;
        }

        .no-invoices p {
          margin: 0;
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
        }

        .action-btn:hover {
          opacity: 0.9;
        }

        .overdue-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          margin-top: 16px;
          border-radius: 12px;
          font-size: 14px;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        /* Invoices */
        .invoices-table {
          margin-top: 16px;
        }

        .invoices-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 80px;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(232, 232, 232, 0.08);
          font-size: 12px;
          font-weight: 500;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .invoice-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 80px;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(232, 232, 232, 0.05);
          align-items: center;
        }

        .invoice-row:last-child {
          border-bottom: none;
        }

        .invoice-date {
          font-size: 14px;
        }

        .invoice-amount {
          font-size: 14px;
        }

        .invoice-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          text-transform: capitalize;
        }

        .invoice-status.paid {
          color: #22c55e;
        }

        .invoice-status.overdue {
          color: #ef4444;
        }

        .invoice-status.pending {
          color: #eab308;
        }

        .invoice-action {
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: none;
          border: none;
          text-decoration: underline;
          cursor: pointer;
          text-align: left;
          padding: 0;
        }

        .invoice-action:hover {
          opacity: 0.8;
        }

        /* Danger Zone */
        .danger-zone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 16px;
          padding: 24px;
          background: rgba(239, 68, 68, 0.02);
        }

        .danger-zone-content {
          flex: 1;
        }

        .danger-zone-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .danger-zone-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0;
        }

        .danger-zone-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #ef4444;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .danger-zone-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </div>
  );
}