"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for project settings
export interface ProjectSettings {
  privacy: {
    isPublic: boolean;
    requireAuthentication: boolean;
    passwordProtected: boolean;
    password: string | null;
    allowAnonymousResponses: boolean;
    collectIpAddresses: boolean;
    showProgressBar: boolean;
    showQuestionNumbers: boolean;
  };
  branding: {
    showSurbeeBadge: boolean;
    customLogo: string | null;
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  domains: {
    customDomain: string | null;
    customDomainVerified: boolean;
    allowedDomains: string[];
    blockDomains: string[];
  };
  responses: {
    limitResponses: boolean;
    maxResponses: number | null;
    limitOnePerUser: boolean;
    closeAfterDate: string | null;
    closeMessage: string;
    showThankYouPage: boolean;
    thankYouMessage: string;
    redirectUrl: string | null;
  };
  notifications: {
    emailOnResponse: boolean;
    emailRecipients: string[];
    dailyDigest: boolean;
    weeklyReport: boolean;
  };
  cipher: {
    enabled: boolean;
    sensitivity: "low" | "medium" | "high";
    detectBots: boolean;
    detectVpn: boolean;
    detectDuplicates: boolean;
    detectProxies: boolean;
    blockSuspicious: boolean;
    requireMinTime: boolean;
    minTimeSeconds: number;
    detectStraightLining: boolean;
    detectSpeedsters: boolean;
    flagThreshold: number;
  };
  advanced: {
    enableCaptcha: boolean;
    preventBotResponses: boolean;
    allowEditResponses: boolean;
    savePartialResponses: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
  };
}

const defaultSettings: ProjectSettings = {
  privacy: {
    isPublic: true,
    requireAuthentication: false,
    passwordProtected: false,
    password: null,
    allowAnonymousResponses: true,
    collectIpAddresses: false,
    showProgressBar: true,
    showQuestionNumbers: true,
  },
  branding: {
    showSurbeeBadge: true,
    customLogo: null,
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
  },
  domains: {
    customDomain: null,
    customDomainVerified: false,
    allowedDomains: [],
    blockDomains: [],
  },
  responses: {
    limitResponses: false,
    maxResponses: null,
    limitOnePerUser: false,
    closeAfterDate: null,
    closeMessage: "This survey is now closed.",
    showThankYouPage: true,
    thankYouMessage: "Thank you for completing this survey!",
    redirectUrl: null,
  },
  notifications: {
    emailOnResponse: false,
    emailRecipients: [],
    dailyDigest: false,
    weeklyReport: false,
  },
  cipher: {
    enabled: true,
    sensitivity: "medium",
    detectBots: true,
    detectVpn: true,
    detectDuplicates: true,
    detectProxies: true,
    blockSuspicious: false,
    requireMinTime: true,
    minTimeSeconds: 30,
    detectStraightLining: true,
    detectSpeedsters: true,
    flagThreshold: 70,
  },
  advanced: {
    enableCaptcha: false,
    preventBotResponses: true,
    allowEditResponses: false,
    savePartialResponses: true,
    randomizeQuestions: false,
    randomizeOptions: false,
  },
};

type SettingsTab = 
  | "project" 
  | "domains" 
  | "branding"
  | "responses"
  | "notifications"
  | "cipher"
  | "privacy"
  | "danger";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  userId: string;
}

// Icons as SVG components to match the reference design
const SettingsIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.25 12a.93.93 0 0 0-.415-.775l-.8-.535a2.75 2.75 0 0 1-1.155-2.906l.15-.647a.972.972 0 0 0-1.167-1.166l-.647.15a2.75 2.75 0 0 1-2.906-1.155l-.535-.801a.932.932 0 0 0-1.55 0l-.535.8A2.75 2.75 0 0 1 7.784 6.12l-.647-.15A.972.972 0 0 0 5.97 7.138l.15.647a2.75 2.75 0 0 1-1.155 2.906l-.801.535a.932.932 0 0 0 0 1.55l.8.535a2.75 2.75 0 0 1 1.155 2.906l-.15.647a.972.972 0 0 0 1.167 1.166l.647-.15a2.75 2.75 0 0 1 2.906 1.155l.535.801a.932.932 0 0 0 1.55 0l.535-.8a2.75 2.75 0 0 1 2.906-1.155l.647.15a.972.972 0 0 0 1.166-1.167l-.15-.647a2.75 2.75 0 0 1 1.155-2.906l.801-.535A.93.93 0 0 0 20.25 12m-6 0a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0m1.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0m6 0c0 .813-.407 1.572-1.083 2.023l-.8.535a1.25 1.25 0 0 0-.525 1.32l.15.648a2.472 2.472 0 0 1-2.966 2.965l-.648-.15a1.25 1.25 0 0 0-1.32.525l-.535.801a2.432 2.432 0 0 1-4.046 0l-.535-.8a1.25 1.25 0 0 0-1.32-.525l-.648.15a2.472 2.472 0 0 1-2.965-2.966l.15-.648a1.25 1.25 0 0 0-.525-1.32l-.801-.535a2.432 2.432 0 0 1 0-4.046l.8-.535a1.25 1.25 0 0 0 .525-1.32l-.15-.648a2.472 2.472 0 0 1 2.966-2.965l.648.15a1.25 1.25 0 0 0 1.32-.525l.535-.801a2.432 2.432 0 0 1 4.046 0l.535.8a1.25 1.25 0 0 0 1.32.525l.648-.15a2.472 2.472 0 0 1 2.965 2.966l-.15.648a1.25 1.25 0 0 0 .525 1.32l.801.535A2.43 2.43 0 0 1 21.75 12" fill="currentColor"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.25 12c0-.773.043-1.526.122-2.25H4.063a8.25 8.25 0 0 0 0 4.5h3.31A21 21 0 0 1 7.25 12m1.879 3.75c.186.87.434 1.65.727 2.31.337.757.719 1.322 1.104 1.689.381.363.732.501 1.04.501s.659-.138 1.04-.501c.385-.367.767-.932 1.104-1.69.293-.66.54-1.44.727-2.309zm-4.477 0a8.27 8.27 0 0 0 4.371 3.943 9 9 0 0 1-.537-1.024c-.375-.845-.676-1.833-.887-2.919zm11.75 0c-.212 1.086-.513 2.074-.888 2.919a9 9 0 0 1-.538 1.024 8.27 8.27 0 0 0 4.372-3.943zM14.975 4.306q.293.476.538 1.025c.375.845.676 1.833.887 2.919h2.947a8.28 8.28 0 0 0-4.372-3.944M12 3.75c-.308 0-.659.138-1.04.501-.385.367-.767.933-1.104 1.69-.293.66-.54 1.44-.727 2.309h5.742a12 12 0 0 0-.727-2.31c-.337-.756-.719-1.322-1.104-1.689-.381-.363-.732-.501-1.04-.501m-2.977.556a8.28 8.28 0 0 0-4.37 3.944h2.946c.21-1.086.512-2.074.887-2.919q.245-.55.537-1.025M8.75 12c0 .782.047 1.536.132 2.25h6.236c.085-.714.132-1.468.132-2.25s-.047-1.536-.132-2.25H8.882A19 19 0 0 0 8.75 12m8 0c0 .773-.043 1.526-.122 2.25h3.308a8.25 8.25 0 0 0 0-4.5h-3.308c.08.724.122 1.477.122 2.25m5 0c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25s9.75 4.365 9.75 9.75" fill="currentColor"/>
  </svg>
);

const PaletteIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 4.478 3.026 8.25 7.125 9.393.75.21 1.125-.315 1.125-.698v-2.445c0-.39.315-.705.705-.705h1.59c.39 0 .705.315.705.705v2.445c0 .383.375.908 1.125.698 4.099-1.143 7.125-4.915 7.125-9.393 0-5.385-4.365-9.75-9.75-9.75zM6.75 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2.25-4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2.25 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/>
  </svg>
);

const MessageIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.75 6.75v10.5a.5.5 0 0 0 .5.5h13.5a.5.5 0 0 0 .5-.5V6.75a.5.5 0 0 0-.5-.5H5.25a.5.5 0 0 0-.5.5zm-1.5 0a2 2 0 0 1 2-2h13.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2V6.75zm3.5 2a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75zm0 3.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75z" fill="currentColor"/>
  </svg>
);

const BellIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.25a.75.75 0 0 1 .75.75v1.043a6.751 6.751 0 0 1 5.999 6.707v3.5c0 .414.336.75.75.75h.75a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5h.75a.75.75 0 0 0 .75-.75v-3.5a6.751 6.751 0 0 1 6-6.707V3a.75.75 0 0 1 .75-.75zm5.25 12v-3.5a5.25 5.25 0 0 0-10.5 0v3.5a2.25 2.25 0 0 1-.75 1.682V15h12v-.068a2.25 2.25 0 0 1-.75-1.682zM12 21.75a3 3 0 0 1-2.905-2.25h5.81A3 3 0 0 1 12 21.75z" fill="currentColor"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.25 12A2.25 2.25 0 0 0 16 9.75H8A2.25 2.25 0 0 0 5.75 12v6A2.25 2.25 0 0 0 8 20.25h8A2.25 2.25 0 0 0 18.25 18zm-7 5v-4a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0m4-11a3.25 3.25 0 0 0-6.5 0v2.25h6.5zm1.5 2.324c1.712.348 3 1.862 3 3.676v6A3.75 3.75 0 0 1 16 21.75H8A3.75 3.75 0 0 1 4.25 18v-6a3.75 3.75 0 0 1 3-3.676V6a4.75 4.75 0 0 1 9.5 0z" fill="currentColor"/>
  </svg>
);

const FingerprintIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5a.75.75 0 0 1 .75.75v.018a9.251 9.251 0 0 1 8.498 9.232.75.75 0 0 1-1.5 0 7.751 7.751 0 0 0-6.998-7.715v.465a6.75 6.75 0 0 1 5.999 6.75.75.75 0 0 1-1.5 0 5.25 5.25 0 0 0-4.499-5.193v.443a4.5 4.5 0 0 1 3.999 4.5.75.75 0 0 1-1.5 0 3 3 0 0 0-2.499-2.958v.458a2.25 2.25 0 0 1 1.999 2.25.75.75 0 0 1-1.5 0 .75.75 0 0 0-.75-.75.75.75 0 0 1-.75-.75V2.25a.75.75 0 0 1 .75-.75zm-1.5 10.5a1.5 1.5 0 1 1 3 0v5.25a.75.75 0 0 1-1.5 0V12a.75.75 0 0 0-1.5 0v5.25a2.25 2.25 0 0 0 4.5 0v-2.5a.75.75 0 0 1 1.5 0v2.5a3.75 3.75 0 0 1-7.5 0V12a2.25 2.25 0 0 1 2.25-2.25.75.75 0 0 1 .75.75zM4.252 11.5a.75.75 0 0 1 .75.75v5a6.75 6.75 0 0 0 10.247 5.78.75.75 0 1 1 .752 1.298A8.25 8.25 0 0 1 3.502 17.25v-5a.75.75 0 0 1 .75-.75zm2.25 0a.75.75 0 0 1 .75.75v5a4.5 4.5 0 0 0 6.998 3.75.75.75 0 1 1 .752 1.298A6 6 0 0 1 5.752 17.25v-5a.75.75 0 0 1 .75-.75z" fill="currentColor"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="shrink-0" height="16" width="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.25a2.25 2.25 0 0 0-2.122 1.5H5a.75.75 0 0 0 0 1.5h.159l.91 12.74A2.75 2.75 0 0 0 8.813 20.5h6.374a2.75 2.75 0 0 0 2.744-2.51l.91-12.74H19a.75.75 0 0 0 0-1.5h-2.878A2.25 2.25 0 0 0 14 2.25h-4zm4.122 1.5a.75.75 0 0 0-.622-.334h-3a.75.75 0 0 0-.622.334h4.244zM6.663 5.25h10.674l-.9 12.6a1.25 1.25 0 0 1-1.247 1.15H8.81a1.25 1.25 0 0 1-1.247-1.15l-.9-12.6z" fill="currentColor"/>
  </svg>
);

// Setting Row Component
const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b last:border-0" style={{ borderColor: 'hsl(60 3% 15%)' }}>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-medium" style={{ color: 'hsl(45 40% 98%)' }}>{label}</span>
      {description && (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'hsl(40 9% 55%)' }}>{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// Section Header Component
const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold" style={{ color: 'hsl(45 40% 98%)' }}>{title}</h3>
    {description && <p className="mt-1 text-sm" style={{ color: 'hsl(40 9% 55%)' }}>{description}</p>}
  </div>
);

// Styled Input Component
const StyledInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  disabled,
  min,
}: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    min={min}
    className={cn(
      "px-3 py-2 rounded-md border text-sm transition-all outline-none",
      className
    )}
    style={{
      backgroundColor: 'hsl(0 0% 11%)',
      borderColor: 'hsl(60 3% 20%)',
      color: 'hsl(45 40% 98%)',
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'hsl(251 60% 51%)';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'hsl(60 3% 20%)';
    }}
  />
);

// Styled Dropdown Component
const StyledDropdown = ({
  value,
  options,
  onChange,
  placeholder = "Select...",
  minWidth = "140px",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  minWidth?: string;
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded-md transition-colors cursor-pointer"
          style={{
            color: 'hsl(45 40% 98%)',
            backgroundColor: 'transparent',
            borderColor: 'hsl(60 3% 20%)',
            minWidth,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(60 3% 15%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown className="w-4 h-4" style={{ color: 'hsl(40 9% 55%)' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-md"
        style={{
          backgroundColor: 'hsl(0 0% 14%)',
          borderColor: 'hsl(60 3% 20%)',
          color: 'hsl(45 40% 98%)',
          minWidth,
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="rounded cursor-pointer"
            style={{ color: 'hsl(45 40% 98%)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(60 3% 18%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Color Picker Component
const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md border cursor-pointer overflow-hidden"
        style={{ backgroundColor: value, borderColor: 'hsl(60 3% 20%)' }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <StyledInput
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            onChange(e.target.value);
          }
        }}
        placeholder="#000000"
        className="w-24 h-8 text-xs"
      />
    </div>
  );
};

// Domain Input Component
const DomainInput = ({
  domains,
  onChange,
  placeholder,
}: {
  domains: string[];
  onChange: (domains: string[]) => void;
  placeholder: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addDomain = () => {
    const domain = inputValue.trim().toLowerCase();
    if (domain && !domains.includes(domain)) {
      onChange([...domains, domain]);
      setInputValue("");
    }
  };

  const removeDomain = (domain: string) => {
    onChange(domains.filter((d) => d !== domain));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <StyledInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-9"
        />
        <button
          onClick={addDomain}
          className="px-4 py-2 text-sm font-medium rounded-md transition-all"
          style={{
            backgroundColor: 'hsl(251 60% 51%)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(251 60% 45%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(251 60% 51%)';
          }}
        >
          Add
        </button>
      </div>
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md"
              style={{ backgroundColor: 'hsl(60 3% 15%)', color: 'hsl(45 40% 98%)' }}
            >
              {domain}
              <button
                onClick={() => removeDomain(domain)}
                className="transition-colors"
                style={{ color: 'hsl(40 9% 55%)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(45 40% 98%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(40 9% 55%)';
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Email Recipients Component
const EmailRecipientsInput = ({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const addEmail = () => {
    const email = inputValue.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return;

    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (emails.includes(email)) {
      setError("Email already added");
      return;
    }

    onChange([...emails, email]);
    setInputValue("");
    setError("");
  };

  const removeEmail = (email: string) => {
    onChange(emails.filter((e) => e !== email));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <StyledInput
          type="email"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          placeholder="email@example.com"
          className={cn("flex-1 h-9", error && "border-red-500")}
        />
        <button
          onClick={addEmail}
          className="px-4 py-2 text-sm font-medium rounded-md transition-all"
          style={{
            backgroundColor: 'hsl(251 60% 51%)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(251 60% 45%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(251 60% 51%)';
          }}
        >
          Add
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md"
              style={{ backgroundColor: 'hsl(60 3% 15%)', color: 'hsl(45 40% 98%)' }}
            >
              {email}
              <button
                onClick={() => removeEmail(email)}
                className="transition-colors"
                style={{ color: 'hsl(40 9% 55%)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(45 40% 98%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(40 9% 55%)';
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Tab Button Component
const TabButton = ({
  active,
  onClick,
  icon,
  label,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm w-full transition-colors"
    style={{
      backgroundColor: active ? 'hsl(60 3% 15%)' : 'transparent',
      color: danger ? 'hsl(0 72% 51%)' : 'inherit',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'hsl(60 3% 13%)';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    {icon}
    <p className="m-0">{label}</p>
  </button>
);

// Section Label Component
const SectionLabel = ({ label }: { label: string }) => (
  <div
    className="mb-1 mt-6 px-3 text-xs font-medium first:mt-0"
    style={{ color: 'hsl(40 9% 75%)', fontWeight: 480 }}
  >
    {label}
  </div>
);

export function ProjectSettingsModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  userId,
}: ProjectSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("project");
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<ProjectSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    if (isOpen && projectId) {
      fetchSettings();
    }
  }, [isOpen, projectId]);

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const mergedSettings = {
          ...defaultSettings,
          ...data.settings,
          privacy: { ...defaultSettings.privacy, ...data.settings?.privacy },
          branding: { ...defaultSettings.branding, ...data.settings?.branding },
          domains: { ...defaultSettings.domains, ...data.settings?.domains },
          responses: { ...defaultSettings.responses, ...data.settings?.responses },
          notifications: { ...defaultSettings.notifications, ...data.settings?.notifications },
          cipher: { ...defaultSettings.cipher, ...data.settings?.cipher },
          advanced: { ...defaultSettings.advanced, ...data.settings?.advanced },
        };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, settings }),
      });

      if (response.ok) {
        setOriginalSettings(settings);
        setHasChanges(false);
      } else {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmation !== projectTitle) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        window.location.href = "/dashboard/projects";
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateSetting = useCallback(
    <K extends keyof ProjectSettings>(
      category: K,
      key: keyof ProjectSettings[K],
      value: ProjectSettings[K][keyof ProjectSettings[K]]
    ) => {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    },
    []
  );

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:max-w-[calc(100vw-2rem)] md:h-[680px] md:max-h-[calc(100vh-2rem)] rounded-xl shadow-2xl z-[10000] flex flex-col overflow-hidden border"
            style={{
              backgroundColor: 'hsl(0 0% 11%)',
              borderColor: 'hsl(60 3% 15%)',
              color: 'hsl(45 40% 98%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'hsl(45 40% 98%)' }}>Settings</h2>
                {projectTitle && (
                  <p className="text-sm mt-0.5" style={{ color: 'hsl(40 9% 55%)' }}>{projectTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: 'hsl(251 60% 51%)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(251 60% 45%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(251 60% 51%)';
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-md transition-colors"
                  style={{ color: 'hsl(40 9% 55%)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(60 3% 15%)';
                    e.currentTarget.style.color = 'hsl(45 40% 98%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'hsl(40 9% 55%)';
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0">
              {/* Sidebar */}
              <div
                className="w-[240px] border-r flex-col gap-0.5 overflow-y-auto px-4 py-6 flex"
                style={{
                  borderColor: 'hsl(60 3% 15%)',
                  scrollbarWidth: 'thin',
                }}
                role="tablist"
              >
                {/* Project Section */}
                <SectionLabel label="Project" />
                <TabButton
                  active={activeTab === "project"}
                  onClick={() => setActiveTab("project")}
                  icon={<SettingsIcon />}
                  label="Project Settings"
                />
                <TabButton
                  active={activeTab === "domains"}
                  onClick={() => setActiveTab("domains")}
                  icon={<GlobeIcon />}
                  label="Domains"
                />
                <TabButton
                  active={activeTab === "branding"}
                  onClick={() => setActiveTab("branding")}
                  icon={<PaletteIcon />}
                  label="Branding"
                />

                {/* Responses Section */}
                <SectionLabel label="Responses" />
                <TabButton
                  active={activeTab === "responses"}
                  onClick={() => setActiveTab("responses")}
                  icon={<MessageIcon />}
                  label="Response Settings"
                />
                <TabButton
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  icon={<BellIcon />}
                  label="Notifications"
                />

                {/* Security Section */}
                <SectionLabel label="Security" />
                <TabButton
                  active={activeTab === "cipher"}
                  onClick={() => setActiveTab("cipher")}
                  icon={<FingerprintIcon />}
                  label="Cipher"
                />
                <TabButton
                  active={activeTab === "privacy"}
                  onClick={() => setActiveTab("privacy")}
                  icon={<ShieldIcon />}
                  label="Privacy & Access"
                />

                {/* Danger Section */}
                <SectionLabel label="Danger" />
                <TabButton
                  active={activeTab === "danger"}
                  onClick={() => setActiveTab("danger")}
                  icon={<TrashIcon />}
                  label="Delete Project"
                  danger
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(40 9% 55%)' }} />
                  </div>
                ) : (
                  <>
                    {/* Project Settings Tab */}
                    {activeTab === "project" && (
                      <div>
                        <SectionHeader
                          title="Project Settings"
                          description="General settings for your survey project"
                        />

                        <SettingRow
                          label="Show Progress Bar"
                          description="Display a progress indicator during the survey"
                        >
                          <Switch
                            checked={settings.privacy.showProgressBar}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "showProgressBar", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Show Question Numbers"
                          description="Display question numbers (e.g., 1 of 10)"
                        >
                          <Switch
                            checked={settings.privacy.showQuestionNumbers}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "showQuestionNumbers", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Randomize Questions"
                          description="Show questions in random order"
                        >
                          <Switch
                            checked={settings.advanced.randomizeQuestions}
                            onCheckedChange={(checked) =>
                              updateSetting("advanced", "randomizeQuestions", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Randomize Options"
                          description="Randomize the order of answer choices"
                        >
                          <Switch
                            checked={settings.advanced.randomizeOptions}
                            onCheckedChange={(checked) =>
                              updateSetting("advanced", "randomizeOptions", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Save Partial Responses"
                          description="Save incomplete responses for later completion"
                        >
                          <Switch
                            checked={settings.advanced.savePartialResponses}
                            onCheckedChange={(checked) =>
                              updateSetting("advanced", "savePartialResponses", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Allow Edit Responses"
                          description="Let respondents edit their submitted responses"
                        >
                          <Switch
                            checked={settings.advanced.allowEditResponses}
                            onCheckedChange={(checked) =>
                              updateSetting("advanced", "allowEditResponses", checked)
                            }
                          />
                        </SettingRow>
                      </div>
                    )}

                    {/* Domains Tab */}
                    {activeTab === "domains" && (
                      <div>
                        <SectionHeader
                          title="Domains & Embedding"
                          description="Configure custom domains and embedding restrictions"
                        />

                        <SettingRow
                          label="Custom Domain"
                          description="Use your own domain for this survey (e.g., survey.yourcompany.com)"
                        >
                          <div className="flex items-center gap-2">
                            <StyledInput
                              value={settings.domains.customDomain || ""}
                              onChange={(e) =>
                                updateSetting("domains", "customDomain", e.target.value || null)
                              }
                              placeholder="survey.example.com"
                              className="w-48 h-9"
                            />
                            {settings.domains.customDomain && (
                              <span
                                className="px-2 py-1 text-xs rounded-full"
                                style={{
                                  backgroundColor: settings.domains.customDomainVerified
                                    ? 'rgba(34, 197, 94, 0.2)'
                                    : 'rgba(234, 179, 8, 0.2)',
                                  color: settings.domains.customDomainVerified
                                    ? '#22c55e'
                                    : '#eab308',
                                }}
                              >
                                {settings.domains.customDomainVerified ? "Verified" : "Pending"}
                              </span>
                            )}
                          </div>
                        </SettingRow>

                        <div className="py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium" style={{ color: 'hsl(45 40% 98%)' }}>Allowed Domains</span>
                            <span className="text-xs" style={{ color: 'hsl(40 9% 55%)' }}>
                              (Only allow embedding from these domains)
                            </span>
                          </div>
                          <DomainInput
                            domains={settings.domains.allowedDomains}
                            onChange={(domains) => updateSetting("domains", "allowedDomains", domains)}
                            placeholder="example.com"
                          />
                        </div>

                        <div className="py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium" style={{ color: 'hsl(45 40% 98%)' }}>Blocked Domains</span>
                            <span className="text-xs" style={{ color: 'hsl(40 9% 55%)' }}>
                              (Block embedding from these domains)
                            </span>
                          </div>
                          <DomainInput
                            domains={settings.domains.blockDomains}
                            onChange={(domains) => updateSetting("domains", "blockDomains", domains)}
                            placeholder="spam-site.com"
                          />
                        </div>
                      </div>
                    )}

                    {/* Branding Tab */}
                    {activeTab === "branding" && (
                      <div>
                        <SectionHeader
                          title="Branding & Appearance"
                          description="Customize the look and feel of your survey"
                        />

                        <SettingRow
                          label="Show Surbee Badge"
                          description="Display 'Powered by Surbee' badge on your survey"
                        >
                          <Switch
                            checked={settings.branding.showSurbeeBadge}
                            onCheckedChange={(checked) =>
                              updateSetting("branding", "showSurbeeBadge", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Primary Color"
                          description="Main accent color for buttons and highlights"
                        >
                          <ColorPicker
                            value={settings.branding.primaryColor}
                            onChange={(color) => updateSetting("branding", "primaryColor", color)}
                          />
                        </SettingRow>

                        <SettingRow
                          label="Background Color"
                          description="Survey background color"
                        >
                          <ColorPicker
                            value={settings.branding.backgroundColor}
                            onChange={(color) => updateSetting("branding", "backgroundColor", color)}
                          />
                        </SettingRow>

                        <SettingRow
                          label="Font Family"
                          description="Typography for your survey"
                        >
                          <StyledDropdown
                            value={settings.branding.fontFamily}
                            onChange={(value) => updateSetting("branding", "fontFamily", value)}
                            options={[
                              { value: "Inter", label: "Inter" },
                              { value: "DM Sans", label: "DM Sans" },
                              { value: "Roboto", label: "Roboto" },
                              { value: "Open Sans", label: "Open Sans" },
                              { value: "Lato", label: "Lato" },
                              { value: "Poppins", label: "Poppins" },
                              { value: "Montserrat", label: "Montserrat" },
                            ]}
                            minWidth="160px"
                          />
                        </SettingRow>
                      </div>
                    )}

                    {/* Responses Tab */}
                    {activeTab === "responses" && (
                      <div>
                        <SectionHeader
                          title="Response Settings"
                          description="Configure how responses are collected and handled"
                        />

                        <SettingRow
                          label="Limit Total Responses"
                          description="Stop accepting responses after a certain number"
                        >
                          <Switch
                            checked={settings.responses.limitResponses}
                            onCheckedChange={(checked) =>
                              updateSetting("responses", "limitResponses", checked)
                            }
                          />
                        </SettingRow>

                        {settings.responses.limitResponses && (
                          <div className="py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
                            <StyledInput
                              type="number"
                              value={settings.responses.maxResponses || ""}
                              onChange={(e) =>
                                updateSetting(
                                  "responses",
                                  "maxResponses",
                                  e.target.value ? parseInt(e.target.value) : null
                                )
                              }
                              placeholder="Maximum responses"
                              min={1}
                              className="w-40 h-9"
                            />
                          </div>
                        )}

                        <SettingRow
                          label="One Response Per User"
                          description="Prevent users from submitting multiple responses"
                        >
                          <Switch
                            checked={settings.responses.limitOnePerUser}
                            onCheckedChange={(checked) =>
                              updateSetting("responses", "limitOnePerUser", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Close After Date"
                          description="Automatically close the survey after a specific date"
                        >
                          <StyledInput
                            type="datetime-local"
                            value={settings.responses.closeAfterDate || ""}
                            onChange={(e) =>
                              updateSetting("responses", "closeAfterDate", e.target.value || null)
                            }
                            className="w-52 h-9"
                          />
                        </SettingRow>

                        <SettingRow
                          label="Show Thank You Page"
                          description="Display a thank you message after submission"
                        >
                          <Switch
                            checked={settings.responses.showThankYouPage}
                            onCheckedChange={(checked) =>
                              updateSetting("responses", "showThankYouPage", checked)
                            }
                          />
                        </SettingRow>

                        {settings.responses.showThankYouPage && (
                          <div className="py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
                            <StyledInput
                              value={settings.responses.thankYouMessage}
                              onChange={(e) =>
                                updateSetting("responses", "thankYouMessage", e.target.value)
                              }
                              placeholder="Thank you for completing this survey!"
                              className="w-full h-9"
                            />
                          </div>
                        )}

                        <SettingRow
                          label="Redirect URL"
                          description="Redirect to a custom URL after submission"
                        >
                          <StyledInput
                            value={settings.responses.redirectUrl || ""}
                            onChange={(e) =>
                              updateSetting("responses", "redirectUrl", e.target.value || null)
                            }
                            placeholder="https://example.com/thank-you"
                            className="w-64 h-9"
                          />
                        </SettingRow>
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                      <div>
                        <SectionHeader
                          title="Notifications"
                          description="Configure email notifications for survey responses"
                        />

                        <SettingRow
                          label="Email on New Response"
                          description="Receive an email notification for each new response"
                        >
                          <Switch
                            checked={settings.notifications.emailOnResponse}
                            onCheckedChange={(checked) =>
                              updateSetting("notifications", "emailOnResponse", checked)
                            }
                          />
                        </SettingRow>

                        {settings.notifications.emailOnResponse && (
                          <div className="py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
                            <div className="mb-2 text-sm" style={{ color: 'hsl(40 9% 55%)' }}>Email Recipients</div>
                            <EmailRecipientsInput
                              emails={settings.notifications.emailRecipients}
                              onChange={(emails) =>
                                updateSetting("notifications", "emailRecipients", emails)
                              }
                            />
                          </div>
                        )}

                        <SettingRow
                          label="Daily Digest"
                          description="Receive a daily summary of responses"
                        >
                          <Switch
                            checked={settings.notifications.dailyDigest}
                            onCheckedChange={(checked) =>
                              updateSetting("notifications", "dailyDigest", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Weekly Report"
                          description="Receive a weekly analytics report"
                        >
                          <Switch
                            checked={settings.notifications.weeklyReport}
                            onCheckedChange={(checked) =>
                              updateSetting("notifications", "weeklyReport", checked)
                            }
                          />
                        </SettingRow>
                      </div>
                    )}

                    {/* Cipher Tab */}
                    {activeTab === "cipher" && (
                      <div>
                        <SectionHeader
                          title="Cipher - Accuracy Detector"
                          description="Our industry-leading fraud detection system to ensure data integrity"
                        />

                        {/* Cipher Enable Banner */}
                        <div
                          className="p-4 rounded-lg mb-6 flex items-center justify-between"
                          style={{
                            backgroundColor: settings.cipher.enabled
                              ? 'rgba(99, 102, 241, 0.1)'
                              : 'hsl(60 3% 13%)',
                            border: `1px solid ${settings.cipher.enabled ? 'rgba(99, 102, 241, 0.3)' : 'hsl(60 3% 20%)'}`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: settings.cipher.enabled
                                  ? 'rgba(99, 102, 241, 0.2)'
                                  : 'hsl(60 3% 18%)',
                              }}
                            >
                              <FingerprintIcon />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium" style={{ color: 'hsl(45 40% 98%)' }}>
                                Cipher Protection
                              </h4>
                              <p className="text-xs" style={{ color: 'hsl(40 9% 55%)' }}>
                                {settings.cipher.enabled ? 'Active - Your survey is protected' : 'Disabled - Enable to protect your survey'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.cipher.enabled}
                            onCheckedChange={(checked) => updateSetting("cipher", "enabled", checked)}
                          />
                        </div>

                        {settings.cipher.enabled && (
                          <>
                            <SettingRow
                              label="Detection Sensitivity"
                              description="How strictly to flag suspicious responses"
                            >
                              <StyledDropdown
                                value={settings.cipher.sensitivity}
                                onChange={(value) =>
                                  updateSetting("cipher", "sensitivity", value as "low" | "medium" | "high")
                                }
                                options={[
                                  { value: "low", label: "Low" },
                                  { value: "medium", label: "Medium" },
                                  { value: "high", label: "High" },
                                ]}
                                minWidth="120px"
                              />
                            </SettingRow>

                            <SettingRow
                              label="Flag Threshold"
                              description="Fraud score threshold to flag responses (0-100)"
                            >
                              <StyledInput
                                type="number"
                                value={settings.cipher.flagThreshold}
                                onChange={(e) =>
                                  updateSetting("cipher", "flagThreshold", parseInt(e.target.value) || 70)
                                }
                                min={0}
                                className="w-20 h-9"
                              />
                            </SettingRow>

                            <SettingRow
                              label="Detect Bots"
                              description="Identify and flag automated bot responses"
                            >
                              <Switch
                                checked={settings.cipher.detectBots}
                                onCheckedChange={(checked) => updateSetting("cipher", "detectBots", checked)}
                              />
                            </SettingRow>

                            <SettingRow
                              label="Detect VPN/Proxy"
                              description="Flag responses from VPN or proxy connections"
                            >
                              <Switch
                                checked={settings.cipher.detectVpn}
                                onCheckedChange={(checked) => updateSetting("cipher", "detectVpn", checked)}
                              />
                            </SettingRow>

                            <SettingRow
                              label="Detect Duplicates"
                              description="Identify duplicate responses from same user"
                            >
                              <Switch
                                checked={settings.cipher.detectDuplicates}
                                onCheckedChange={(checked) => updateSetting("cipher", "detectDuplicates", checked)}
                              />
                            </SettingRow>

                            <SettingRow
                              label="Detect Straight-lining"
                              description="Flag responses with same answer for all questions"
                            >
                              <Switch
                                checked={settings.cipher.detectStraightLining}
                                onCheckedChange={(checked) => updateSetting("cipher", "detectStraightLining", checked)}
                              />
                            </SettingRow>

                            <SettingRow
                              label="Detect Speedsters"
                              description="Flag responses completed too quickly"
                            >
                              <Switch
                                checked={settings.cipher.detectSpeedsters}
                                onCheckedChange={(checked) => updateSetting("cipher", "detectSpeedsters", checked)}
                              />
                            </SettingRow>

                            <SettingRow
                              label="Auto-block Suspicious"
                              description="Automatically block responses that exceed the fraud threshold"
                            >
                              <Switch
                                checked={settings.cipher.blockSuspicious}
                                onCheckedChange={(checked) => updateSetting("cipher", "blockSuspicious", checked)}
                              />
                            </SettingRow>
                          </>
                        )}
                      </div>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === "privacy" && (
                      <div>
                        <SectionHeader
                          title="Privacy & Access"
                          description="Control who can access and respond to your survey"
                        />

                        <SettingRow
                          label="Public Survey"
                          description="Allow anyone with the link to view and respond to this survey"
                        >
                          <Switch
                            checked={settings.privacy.isPublic}
                            onCheckedChange={(checked) => updateSetting("privacy", "isPublic", checked)}
                          />
                        </SettingRow>

                        <SettingRow
                          label="Require Authentication"
                          description="Respondents must sign in to submit responses"
                        >
                          <Switch
                            checked={settings.privacy.requireAuthentication}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "requireAuthentication", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Password Protection"
                          description="Require a password to access the survey"
                        >
                          <Switch
                            checked={settings.privacy.passwordProtected}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "passwordProtected", checked)
                            }
                          />
                        </SettingRow>

                        {settings.privacy.passwordProtected && (
                          <div className="py-4 border-b" style={{ borderColor: 'hsl(60 3% 15%)' }}>
                            <div className="flex items-center gap-2">
                              <StyledInput
                                type={showPassword ? "text" : "password"}
                                value={settings.privacy.password || ""}
                                onChange={(e) => updateSetting("privacy", "password", e.target.value)}
                                placeholder="Enter password"
                                className="flex-1 h-9"
                              />
                              <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-2 transition-colors"
                                style={{ color: 'hsl(40 9% 55%)' }}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        <SettingRow
                          label="Allow Anonymous Responses"
                          description="Respondents can submit without identifying themselves"
                        >
                          <Switch
                            checked={settings.privacy.allowAnonymousResponses}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "allowAnonymousResponses", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Collect IP Addresses"
                          description="Store respondent IP addresses for fraud detection"
                        >
                          <Switch
                            checked={settings.privacy.collectIpAddresses}
                            onCheckedChange={(checked) =>
                              updateSetting("privacy", "collectIpAddresses", checked)
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Enable CAPTCHA"
                          description="Add CAPTCHA verification to prevent spam"
                        >
                          <Switch
                            checked={settings.advanced.enableCaptcha}
                            onCheckedChange={(checked) =>
                              updateSetting("advanced", "enableCaptcha", checked)
                            }
                          />
                        </SettingRow>
                      </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === "danger" && (
                      <div>
                        <SectionHeader
                          title="Danger Zone"
                          description="Irreversible actions for this project"
                        />

                        <div
                          className="p-4 rounded-lg border"
                          style={{
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium" style={{ color: '#ef4444' }}>Delete Project</h4>
                              <p className="mt-1 text-xs" style={{ color: 'hsl(40 9% 55%)' }}>
                                Once you delete a project, there is no going back. This will permanently
                                delete the project, all responses, and analytics data.
                              </p>

                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="text-xs block mb-1.5" style={{ color: 'hsl(40 9% 55%)' }}>
                                    Type <span className="font-mono" style={{ color: 'hsl(45 40% 98%)' }}>{projectTitle}</span> to confirm
                                  </label>
                                  <StyledInput
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Enter project name"
                                    className="w-full h-9"
                                  />
                                </div>

                                <button
                                  onClick={handleDeleteProject}
                                  disabled={deleteConfirmation !== projectTitle || isDeleting}
                                  className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                    deleteConfirmation === projectTitle
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed"
                                  )}
                                  style={{
                                    backgroundColor: deleteConfirmation === projectTitle ? '#dc2626' : 'hsl(60 3% 15%)',
                                    color: deleteConfirmation === projectTitle ? '#ffffff' : 'hsl(40 9% 55%)',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (deleteConfirmation === projectTitle) {
                                      e.currentTarget.style.backgroundColor = '#b91c1c';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (deleteConfirmation === projectTitle) {
                                      e.currentTarget.style.backgroundColor = '#dc2626';
                                    }
                                  }}
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4" />
                                      Delete Project
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProjectSettingsModal;
