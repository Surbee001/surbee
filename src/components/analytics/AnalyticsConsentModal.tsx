"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function AnalyticsConsentModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: AnalyticsConsentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]"
          >
            <div
              className="relative flex flex-col w-full max-w-[560px] rounded-[32px] max-h-[90vh] p-6 sm:p-8 sm:pt-7 overflow-auto"
              style={{
                backgroundColor: 'var(--surbee-bg-primary)',
                border: '1px solid var(--surbee-border-subtle)',
                boxShadow: '0 0 4px 0 rgba(0,0,0,0.04), 0 24px 48px 0 rgba(0,0,0,0.24)',
                scrollbarColor: 'rgba(232, 232, 232, 0.08) rgba(0, 0, 0, 0)',
                scrollbarWidth: 'thin',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="analytics-consent-title"
              aria-describedby="analytics-consent-description"
            >
              {/* Close Button */}
              <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-10 flex gap-1 sm:gap-2 md:gap-4">
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--surbee-bg-tertiary)',
                    color: 'var(--surbee-fg-primary)',
                  }}
                  aria-label="Close"
                  title="Close"
                >
                  <svg
                    height="20"
                    width="20"
                    fill="none"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.499 23.624A1.1 1.1 0 0 1 8.4 22.512c0-.295.108-.576.322-.777l5.71-5.723-5.71-5.71a1.07 1.07 0 0 1-.322-.777c0-.63.483-1.098 1.099-1.098.308 0 .549.107.763.308l5.737 5.724 5.763-5.737c.228-.228.469-.322.763-.322.616 0 1.112.483 1.112 1.099 0 .308-.094.549-.335.79l-5.723 5.723 5.71 5.71c.227.2.335.482.335.79 0 .616-.496 1.112-1.125 1.112a1.06 1.06 0 0 1-.79-.322l-5.71-5.723-5.697 5.723a1.1 1.1 0 0 1-.803.322"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>

              {/* Icon */}
              <div
                className="mb-5 mt-1 p-1"
                style={{ color: 'var(--surbee-fg-secondary)' }}
                aria-hidden="true"
              >
                <svg
                  height="36"
                  width="36"
                  fill="none"
                  viewBox="0 0 28 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="currentColor">
                    <path d="M13.738 26.293c.188 0 .492-.07.785-.234 6.668-3.739 8.954-5.32 8.954-9.598V7.496c0-1.23-.528-1.617-1.524-2.039-1.383-.574-5.848-2.18-7.23-2.66a3.2 3.2 0 0 0-.985-.176c-.328 0-.668.094-.972.176-1.383.398-5.86 2.098-7.243 2.66C4.54 5.867 4 6.266 4 7.497v8.964c0 4.277 2.297 5.848 8.953 9.598.305.164.598.234.785.234m0-2.121c-.187 0-.375-.07-.726-.281-5.414-3.282-7.149-4.243-7.149-7.864V7.86c0-.398.07-.55.399-.68 1.781-.702 5.238-1.863 7.008-2.566a1.1 1.1 0 0 1 .468-.105c.13 0 .282.035.469.105 1.77.703 5.203 1.946 7.02 2.567.316.117.386.28.386.68v8.167c0 3.621-1.734 4.57-7.148 7.864-.34.21-.54.28-.727.28" />
                    <path d="M8.3 10.813c-.374.714-.269 1.066.4 1.417l2.94 1.606-2.964 1.723c-.668.386-.762.726-.364 1.441l.036.047c.386.715.75.808 1.418.398l2.847-1.64v3.293c0 .785.27 1.043 1.102 1.043h.07c.809 0 1.078-.258 1.078-1.043v-3.293l2.848 1.64c.703.434 1.055.328 1.43-.398l.023-.047c.363-.727.281-1.078-.363-1.441l-2.965-1.723 2.953-1.606c.668-.351.762-.703.387-1.418l-.035-.082c-.364-.738-.727-.843-1.454-.398l-2.824 1.64V8.68c0-.774-.27-1.032-1.078-1.032h-.07c-.832 0-1.102.258-1.102 1.032v3.293L9.79 10.332c-.727-.422-1.09-.328-1.441.398l-.047.082Z" />
                  </g>
                </svg>
              </div>

              {/* Content */}
              <div className="mb-5 md:pr-20 leading-tight">
                <h2
                  id="analytics-consent-title"
                  className="font-bold text-pretty text-lg"
                  style={{
                    lineHeight: 1.4,
                    color: 'var(--surbee-fg-primary)',
                  }}
                >
                  Help us improve
                </h2>
                <p
                  id="analytics-consent-description"
                  className="text-base text-pretty mt-2"
                  style={{ color: 'var(--surbee-fg-secondary)' }}
                >
                  Allow anonymous usage data to be collected to help us improve Surbee.
                  We only track feature usage and interactions - never your survey content or personal data.
                  You can opt-out at any time in{' '}
                  <a
                    href="/dashboard/settings/privacy"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--surbee-fg-primary)' }}
                  >
                    Settings
                  </a>
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end flex-wrap gap-2 mt-6">
                <button
                  onClick={onDecline}
                  className="flex items-center justify-center py-1.5 h-10 text-sm font-semibold whitespace-nowrap transition-all duration-200 rounded-full px-5 cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--surbee-bg-tertiary)',
                    color: 'var(--surbee-fg-primary)',
                  }}
                >
                  Don't share
                </button>
                <button
                  onClick={onAccept}
                  className="flex items-center justify-center py-1.5 h-10 text-sm font-semibold whitespace-nowrap transition-all duration-200 rounded-full px-5 cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--surbee-fg-primary)',
                    color: 'var(--surbee-bg-primary)',
                  }}
                >
                  Share analytics
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
