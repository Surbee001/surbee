"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  target?: '_blank' | '_self';
  rel?: string;
}

interface SurbeeDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const SurbeeDropdown: React.FC<SurbeeDropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlignmentClasses = () => {
    switch (align) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      default:
        return 'left-0';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-2 z-50 min-w-[200px] ${getAlignmentClasses()}`}
          >
            <ul
              className="bg-white rounded-xl border border-gray-200 shadow-lg py-2 overflow-hidden"
              style={{
                listStyle: "none",
                margin: "0px",
                padding: "0px",
                outline: "0px",
                position: "relative",
                color: "rgba(0, 0, 0, 0.87)",
              }}
            >
              {items.map((item, index) => (
                <li
                  key={index}
                  className="transition-colors duration-200 hover:bg-gray-50"
                  style={{
                    outline: "0px",
                    border: "0px",
                    margin: "0px",
                    borderRadius: "0px",
                    textDecoration: "none",
                    padding: "6px 16px",
                    whiteSpace: "nowrap",
                    WebkitTapHighlightColor: "transparent",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    userSelect: "none",
                    verticalAlign: "middle",
                    appearance: "none",
                    color: "inherit",
                    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    letterSpacing: "0.00938em",
                    display: "flex",
                    WebkitBoxPack: "start",
                    justifyContent: "flex-start",
                    WebkitBoxAlign: "center",
                    alignItems: "center",
                    position: "relative",
                    boxSizing: "border-box",
                    minHeight: "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.href ? (
                    <a
                      className="inline-block w-full text-gray-900 hover:text-gray-700 transition-colors"
                      href={item.href}
                      target={item.target || '_self'}
                      rel={item.rel}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="inline-block w-full text-gray-900 hover:text-gray-700 transition-colors">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dark theme variant
export const SurbeeDropdownDark: React.FC<SurbeeDropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlignmentClasses = () => {
    switch (align) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      default:
        return 'left-0';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-2 z-50 min-w-[200px] ${getAlignmentClasses()}`}
          >
            <ul
              className="bg-gray-900 rounded-xl border border-gray-700 shadow-lg py-2 overflow-hidden"
              style={{
                listStyle: "none",
                margin: "0px",
                padding: "0px",
                outline: "0px",
                position: "relative",
                color: "rgba(255, 255, 255, 0.87)",
              }}
            >
              {items.map((item, index) => (
                <li
                  key={index}
                  className="transition-colors duration-200 hover:bg-gray-800"
                  style={{
                    outline: "0px",
                    border: "0px",
                    margin: "0px",
                    borderRadius: "0px",
                    textDecoration: "none",
                    padding: "6px 16px",
                    whiteSpace: "nowrap",
                    WebkitTapHighlightColor: "transparent",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    userSelect: "none",
                    verticalAlign: "middle",
                    appearance: "none",
                    color: "inherit",
                    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    letterSpacing: "0.00938em",
                    display: "flex",
                    WebkitBoxPack: "start",
                    justifyContent: "flex-start",
                    WebkitBoxAlign: "center",
                    alignItems: "center",
                    position: "relative",
                    boxSizing: "border-box",
                    minHeight: "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.href ? (
                    <a
                      className="inline-block w-full text-white hover:text-gray-300 transition-colors"
                      href={item.href}
                      target={item.target || '_self'}
                      rel={item.rel}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="inline-block w-full text-white hover:text-gray-300 transition-colors">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
