import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for audit logging to bypass RLS
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export type AuditEventCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'security'
  | 'admin'
  | 'system';

export type AuditEventType =
  // Authentication events
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset_request'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'session_created'
  | 'session_expired'
  // Authorization events
  | 'access_denied'
  | 'permission_granted'
  | 'permission_revoked'
  // Data access events
  | 'data_read'
  | 'data_export'
  | 'report_generated'
  // Data modification events
  | 'resource_created'
  | 'resource_updated'
  | 'resource_deleted'
  | 'account_deleted'
  // Security events
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'api_key_created'
  | 'api_key_revoked'
  // Admin events
  | 'admin_action'
  | 'settings_changed';

export interface AuditLogEntry {
  userId?: string;
  eventType: AuditEventType;
  eventCategory: AuditEventCategory;
  resourceType?: string;
  resourceId?: string;
  action: string;
  status?: 'success' | 'failure' | 'warning';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extract client information from request
 */
function getClientInfo(request?: NextRequest): { ipAddress: string; userAgent: string } {
  if (!request) {
    return { ipAddress: 'unknown', userAgent: 'unknown' };
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Log a security-relevant event for audit purposes.
 * This is critical for SOC2 compliance.
 *
 * @param entry - The audit log entry
 * @param request - Optional NextRequest for client info extraction
 */
export async function auditLog(
  entry: AuditLogEntry,
  request?: NextRequest
): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('Audit logging unavailable: No service role key configured');
    return;
  }

  const { ipAddress, userAgent } = getClientInfo(request);

  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      user_id: entry.userId || null,
      event_type: entry.eventType,
      event_category: entry.eventCategory,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      action: entry.action,
      status: entry.status || 'success',
      ip_address: entry.ipAddress || ipAddress,
      user_agent: entry.userAgent || userAgent,
      metadata: entry.metadata || {},
    });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

/**
 * Convenience function for logging authentication events
 */
export async function logAuthEvent(
  eventType: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'password_reset_request',
  userId: string | undefined,
  status: 'success' | 'failure',
  request?: NextRequest,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLog(
    {
      userId,
      eventType,
      eventCategory: 'authentication',
      action: eventType.replace(/_/g, ' '),
      status,
      metadata,
    },
    request
  );
}

/**
 * Convenience function for logging data access events
 */
export async function logDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'export' | 'list',
  request?: NextRequest,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLog(
    {
      userId,
      eventType: action === 'export' ? 'data_export' : 'data_read',
      eventCategory: 'data_access',
      resourceType,
      resourceId,
      action: `${action} ${resourceType}`,
      status: 'success',
      metadata,
    },
    request
  );
}

/**
 * Convenience function for logging resource modifications
 */
export async function logResourceChange(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'created' | 'updated' | 'deleted',
  request?: NextRequest,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLog(
    {
      userId,
      eventType: `resource_${action}`,
      eventCategory: 'data_modification',
      resourceType,
      resourceId,
      action: `${action} ${resourceType}`,
      status: 'success',
      metadata,
    },
    request
  );
}

/**
 * Convenience function for logging security events
 */
export async function logSecurityEvent(
  eventType: 'rate_limit_exceeded' | 'suspicious_activity' | 'access_denied',
  userId: string | undefined,
  request?: NextRequest,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLog(
    {
      userId,
      eventType,
      eventCategory: 'security',
      action: eventType.replace(/_/g, ' '),
      status: 'warning',
      metadata,
    },
    request
  );
}
