# Future Features

This document tracks planned features that are not yet implemented.

---

## Email Notifications

**Status:** Not Implemented
**Priority:** Medium
**Settings saved:** `emailOnResponse`, `emailDigest` (daily/weekly)

### Requirements
- Integration with email service (Resend, SendGrid, etc.)
- Email templates for:
  - New response notification
  - Daily digest summary
  - Weekly report with analytics
- User email verification
- Unsubscribe handling

### Implementation Notes
- Settings are already saved to `project.settings.notifications`
- Need to add email sending logic in `/api/projects/[id]/responses` POST handler
- Consider using a queue for digest emails (Vercel Cron or similar)

---

## Question Randomization

**Status:** Not Implemented
**Priority:** Low
**Settings saved:** `randomizeQuestions`, `randomizeOptions`

### Requirements
- Randomize question order per respondent
- Randomize answer options within questions
- Maintain randomization for session resume
- Store original order for analytics

### Implementation Notes
- Settings saved to `project.settings.advanced`
- Need to apply randomization in sandbox bundle generation or at runtime
- Consider seeding randomization with session ID for consistency

---

## Response Limits (One Per User)

**Status:** Not Implemented
**Priority:** Low
**Setting saved:** `limitOnePerUser`

### Requirements
- Track unique respondents (by IP, fingerprint, or auth)
- Block duplicate submissions from same user
- Show "already completed" message

### Implementation Notes
- Requires reliable user identification
- Could use device fingerprint from Cipher
- Privacy considerations for tracking

---

## Custom Domains

**Status:** Not Implemented
**Priority:** Low (Pro/Max feature)
**Settings saved:** `customDomain`, `customDomainVerified`, `allowedDomains`, `blockDomains`

### Requirements
- DNS verification flow
- SSL certificate provisioning
- Domain routing configuration
- Allowed/blocked domain embedding

### Implementation Notes
- Settings saved to `project.settings.domains`
- Would need Vercel/infrastructure changes for custom domains
- Embedding restrictions can be done with `X-Frame-Options`

---

## CAPTCHA Integration

**Status:** Not Implemented
**Priority:** Low
**Setting saved:** `enableCaptcha`

### Requirements
- reCAPTCHA or hCaptcha integration
- Invisible CAPTCHA option
- Score-based triggering (show only for suspicious users)

### Implementation Notes
- Setting saved to `project.settings.advanced.enableCaptcha`
- Would need to inject CAPTCHA script into sandbox
- Verify token server-side before accepting response

---

## Partial Response Saving

**Status:** Not Implemented
**Priority:** Medium
**Setting saved:** `savePartialResponses`

### Requirements
- Auto-save responses as user progresses
- Resume incomplete surveys
- Mark responses as partial vs complete in analytics

### Implementation Notes
- Setting saved to `project.settings.advanced.savePartialResponses`
- CipherTracker already handles session persistence
- Need API endpoint for partial saves

---

## Branding Customization

**Status:** Partially Implemented
**Priority:** Low (Pro feature)
**Settings saved:** `hideBadge`, `customLogo`, `primaryColor`, `backgroundColor`

### Requirements
- Remove "Powered by Surbee" badge (Pro)
- Custom logo in survey header
- Custom color scheme

### Implementation Notes
- Settings saved but not applied to sandbox surveys
- AI-generated surveys have their own styling
- Would need to inject CSS variables or modify generated code

---

## Edit Responses

**Status:** Not Implemented
**Priority:** Low
**Setting saved:** `allowEditResponses`

### Requirements
- Allow respondents to edit their submission
- Time window for edits
- Track edit history

### Implementation Notes
- Setting saved to `project.settings.advanced.allowEditResponses`
- Would need response lookup by session ID
- UI for editing after submission

---

## Notes

- All settings listed here are saved to the database via `/api/projects/[id]/settings`
- Implementation can be done incrementally
- Consider feature flags for gradual rollout
