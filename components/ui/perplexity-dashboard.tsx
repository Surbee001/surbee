'use client';

import React from 'react';
import { Home, Search, BarChart3, User, Settings } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home' },
  { icon: Search, label: 'Explore' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: User, label: 'Profile' },
  { icon: Settings, label: 'Settings' },
];

export default function PerplexityDashboard() {
  const [active, setActive] = React.useState('Home');
  return (
    <div className="min-h-screen flex font-inter bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="sidebar-gradient flex flex-col items-center py-8 px-2 w-24 md:w-64 transition-all duration-300 shadow-lg">
        <div className="flex flex-col items-center w-full">
          {navItems.map(({ icon: Icon, label }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`
                  group flex flex-col items-center w-full mb-8 last:mb-0
                  transition-all duration-200
                  ${isActive ? 'icon-active' : 'icon-inactive'}
                `}
                aria-label={label}
                type="button"
              >
                <span
                  className={`icon flex items-center justify-center mb-2 transition-all duration-200
                    ${isActive ? 'bg-[#FD4524] text-white shadow-lg' : 'bg-white text-[#A9C8E5] hover:bg-[#FC8A21] hover:text-white'}
                  `}
                >
                  <Icon size={40} strokeWidth={2.2} />
                </span>
                <span
                  className={`text-xs md:text-base font-bold tracking-wide transition-all duration-200
                    ${isActive ? 'text-[#FD4524]' : 'text-[#222] group-hover:text-[#FC8A21]'}
                  `}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-10 bg-[#F8FAFC] min-h-screen">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#222] font-inter">
            Welcome to Perplexity-Inspired Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <section className="rounded-2xl bg-white shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-[#FD4524] font-inter">
                Quick Insights
              </h2>
              <p className="text-gray-600 mb-6 font-inter">
                Get a snapshot of your latest activity and trends. All your
                data, visualized with clarity and style.
              </p>
              <button
                className="px-6 py-2 rounded-lg bg-[#FC8A21] text-white font-bold shadow-md hover:bg-[#FD4524] transition-all duration-200"
                type="button"
              >
                View Analytics
              </button>
            </section>
            {/* Card 2 */}
            <section className="rounded-2xl bg-white shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-[#FC8A21] font-inter">
                Explore Content
              </h2>
              <p className="text-gray-600 mb-6 font-inter">
                Dive into curated resources and discover new insights tailored
                for you.
              </p>
              <button
                className="px-6 py-2 rounded-lg bg-[#A9C8E5] text-[#222] font-bold shadow-md hover:bg-[#FD4524] hover:text-white transition-all duration-200"
                type="button"
              >
                Start Exploring
              </button>
            </section>
          </div>
        </div>
      </main>
      {/* Custom styles for sidebar gradient and icon */}
      <style jsx>{`
        .sidebar-gradient {
          background: linear-gradient(135deg, #A9C8E5 0%, #fff 100%);
        }
        .icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          margin-bottom: 8px;
          font-size: 2rem;
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
        }
        .icon-active {
          background: #FD4524;
          color: #fff;
          box-shadow: 0 4px 16px rgba(253,69,36,0.15);
        }
        .icon-inactive {
          background: #fff;
          color: #A9C8E5;
        }
        @media (max-width: 768px) {
          aside {
            width: 88px !important;
            min-width: 64px !important;
            padding-left: 0;
            padding-right: 0;
          }
          .icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }
          .text-xs, .md\:text-base {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
