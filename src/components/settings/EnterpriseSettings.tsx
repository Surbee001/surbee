"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  CreditCard, 
  Building2, 
  Mail, 
  Trash2, 
  Crown, 
  Eye, 
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatDate, getRoleDisplayName, getRoleDescription } from '@/lib/settings-manager';
import type { TeamMember } from '@/contexts/SettingsContext';

const EnterpriseSettings: React.FC = () => {
  const { 
    settings, 
    updateEnterprise,
    inviteTeamMember,
    removeTeamMember,
    updateTeamMember,
    showToast
  } = useSettings();

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'member' as TeamMember['role'],
  });
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const handleInviteMember = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsInviting(true);
    try {
      await inviteTeamMember(inviteForm.name, inviteForm.email, inviteForm.role);
      setInviteForm({ name: '', email: '', role: 'member' });
      setShowInviteForm(false);
    } catch (error) {
      // Error handling is done in useSettings hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = settings.enterprise.teamMembers.find(m => m.id === memberId);
    if (!member) return;

    if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      removeTeamMember(memberId);
    }
  };

  const handleUpdateMemberRole = (memberId: string, newRole: TeamMember['role']) => {
    try {
      updateTeamMember(memberId, { role: newRole });
      setEditingMember(null);
      showToast('Member role updated successfully');
    } catch (error) {
      showToast('Failed to update member role', 'error');
    }
  };

  const handleSSOReset = () => {
    if (window.confirm('Are you sure you want to reset SSO configuration? This will disable SSO for all team members.')) {
      updateEnterprise({ ssoEnabled: false, ssoProvider: '' });
      showToast('SSO configuration reset successfully');
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'member':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusIndicator = (member: TeamMember) => {
    const lastActive = new Date(member.lastActive);
    const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActive <= 1) {
      return <CheckCircle className="w-3 h-3 text-green-500" title="Active recently" />;
    } else if (daysSinceActive <= 7) {
      return <CheckCircle className="w-3 h-3 text-yellow-500" title="Active this week" />;
    } else {
      return <AlertTriangle className="w-3 h-3 text-gray-400" title="Inactive" />;
    }
  };

  return (
    <div className="settings-main">
      {/* Team Management */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Team Management</div>
              <span className="px-2 py-1 text-xs rounded-full" 
                    style={{ backgroundColor: 'var(--surbee-accent-muted)', color: 'var(--surbee-fg-primary)' }}>
                {settings.enterprise.teamMembers.length} member{settings.enterprise.teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              className="settings-button"
              onClick={() => setShowInviteForm(true)}
              disabled={showInviteForm}
              style={{
                backgroundColor: 'var(--surbee-accent-muted)',
                borderColor: 'var(--surbee-border-primary)',
                color: 'var(--surbee-fg-primary)',
                opacity: showInviteForm ? 0.6 : 1,
              }}
            >
              <div className="settings-button-content">
                <UserPlus className="w-4 h-4" />
                <div className="settings-button-text">Invite Member</div>
              </div>
            </button>
          </div>
        </div>
        <div className="settings-content">
          {/* Invite Form */}
          {showInviteForm && (
            <div className="settings-row" style={{ padding: '20px', backgroundColor: 'var(--surbee-bg-secondary)', borderRadius: '8px', marginBottom: '16px' }}>
              <div className="w-full space-y-4">
                <div className="settings-field-label">Invite New Team Member</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="px-3 py-2 border rounded-md text-sm"
                    style={{
                      backgroundColor: 'var(--surbee-sidebar-bg)',
                      borderColor: 'var(--surbee-border-secondary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="email@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="px-3 py-2 border rounded-md text-sm"
                    style={{
                      backgroundColor: 'var(--surbee-sidebar-bg)',
                      borderColor: 'var(--surbee-border-secondary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  />
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as TeamMember['role'] })}
                    className="px-3 py-2 border rounded-md text-sm"
                    style={{
                      backgroundColor: 'var(--surbee-sidebar-bg)',
                      borderColor: 'var(--surbee-border-secondary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="settings-field-value">
                    {getRoleDescription(inviteForm.role)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="settings-button"
                      onClick={handleInviteMember}
                      disabled={isInviting}
                      style={{
                        backgroundColor: 'var(--surbee-accent-muted)',
                        borderColor: 'var(--surbee-border-primary)',
                        color: 'var(--surbee-fg-primary)',
                        opacity: isInviting ? 0.6 : 1,
                      }}
                    >
                      <div className="settings-button-content">
                        <Mail className="w-4 h-4" />
                        <div className="settings-button-text">
                          {isInviting ? 'Sending...' : 'Send Invite'}
                        </div>
                      </div>
                    </button>
                    <button
                      className="settings-button"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteForm({ name: '', email: '', role: 'member' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members List */}
          {settings.enterprise.teamMembers.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--surbee-fg-muted)' }}>
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="settings-field-label">No team members yet</div>
              <div className="settings-field-value">Invite your first team member to get started</div>
            </div>
          ) : (
            settings.enterprise.teamMembers.map((member) => (
              <div key={member.id} className="settings-row" style={{ padding: '16px', backgroundColor: 'var(--surbee-bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
                <div className="settings-field-info flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIndicator(member)}
                    <div className="settings-field-label">{member.name}</div>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="settings-field-value">
                    <div className="flex items-center gap-4 mt-1">
                      <span>{member.email}</span>
                      <span>•</span>
                      <span>Joined {formatDate(member.joinedAt)}</span>
                      <span>•</span>
                      <span>Last active {formatDate(member.lastActive)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                  {editingMember === member.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamMember['role'])}
                        className="px-2 py-1 border rounded text-sm"
                        style={{
                          backgroundColor: 'var(--surbee-sidebar-bg)',
                          borderColor: 'var(--surbee-border-secondary)',
                          color: 'var(--surbee-fg-primary)',
                        }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="settings-button"
                        onClick={() => setEditingMember(null)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="px-2 py-1 text-xs rounded-full" 
                            style={{ backgroundColor: 'var(--surbee-accent-muted)', color: 'var(--surbee-fg-primary)' }}>
                        {getRoleDisplayName(member.role)}
                      </span>
                      <button
                        className="settings-button"
                        onClick={() => setEditingMember(member.id)}
                        title="Change role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="settings-button"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                        style={{
                          borderColor: 'rgb(239 68 68)',
                          color: 'rgb(239 68 68)',
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SSO Configuration */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Single Sign-On (SSO)</div>
              {settings.enterprise.ssoEnabled && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">SSO Status</div>
              <div className="settings-field-value">
                {settings.enterprise.ssoEnabled 
                  ? `Active with ${settings.enterprise.ssoProvider}` 
                  : 'Not configured'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {settings.enterprise.ssoEnabled ? (
                  <>
                    <button
                      className="settings-button"
                      style={{
                        backgroundColor: 'var(--surbee-accent-muted)',
                        borderColor: 'var(--surbee-border-primary)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                    >
                      <div className="settings-button-content">
                        <Shield className="w-4 h-4" />
                        <div className="settings-button-text">Configure</div>
                      </div>
                    </button>
                    <button
                      className="settings-button"
                      onClick={handleSSOReset}
                      style={{
                        borderColor: 'rgb(239 68 68)',
                        color: 'rgb(239 68 68)',
                      }}
                    >
                      <div className="settings-button-content">
                        <X className="w-4 h-4" />
                        <div className="settings-button-text">Reset</div>
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    className="settings-button"
                    style={{
                      backgroundColor: 'var(--surbee-accent-muted)',
                      borderColor: 'var(--surbee-border-primary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  >
                    <div className="settings-button-content">
                      <Shield className="w-4 h-4" />
                      <div className="settings-button-text">Set up SSO</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Supported Providers</div>
              <div className="settings-field-value">SAML 2.0, OAuth 2.0, OpenID Connect</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a 
                href="https://docs.surbee.com/enterprise/sso" 
                target="_blank" 
                rel="noopener noreferrer"
                className="settings-button"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <div className="settings-button-content">
                  <ExternalLink className="w-4 h-4" />
                  <div className="settings-button-text">SSO Guide</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Subscription */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Billing & Subscription</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Current Plan</div>
              <div className="settings-field-value">
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium">{settings.enterprise.billingInfo.plan}</span>
                  <span>•</span>
                  <span>{settings.enterprise.billingInfo.usersCount} user{settings.enterprise.billingInfo.usersCount !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>${settings.enterprise.billingInfo.amount}/month</span>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                style={{
                  backgroundColor: 'var(--surbee-accent-muted)',
                  borderColor: 'var(--surbee-border-primary)',
                  color: 'var(--surbee-fg-primary)',
                }}
              >
                <div className="settings-button-content">
                  <CreditCard className="w-4 h-4" />
                  <div className="settings-button-text">Manage Plan</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Next Billing Date</div>
              <div className="settings-field-value">
                {formatDate(settings.enterprise.billingInfo.nextBillingDate)}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <Download className="w-4 h-4" />
                  <div className="settings-button-text">Download Invoice</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Billing History</div>
              <div className="settings-field-value">View past invoices and payment history</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <Calendar className="w-4 h-4" />
                  <div className="settings-button-text">View History</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Usage-Based Billing</div>
              <div className="settings-field-value">Track usage and overage charges</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <DollarSign className="w-4 h-4" />
                  <div className="settings-button-text">View Usage</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Settings */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Organization</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Data Export</div>
              <div className="settings-field-value">Export all organization data and projects</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <Download className="w-4 h-4" />
                  <div className="settings-button-text">Request Export</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Compliance</div>
              <div className="settings-field-value">GDPR, SOC 2, and other compliance information</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a 
                href="https://surbee.com/compliance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="settings-button"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <div className="settings-button-content">
                  <Shield className="w-4 h-4" />
                  <div className="settings-button-text">View Details</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSettings;