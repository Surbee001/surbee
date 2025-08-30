"use client";

import React from 'react';
import Link from 'next/link';
import { 
  changelogEntries, 
  formatDate
} from '@/lib/changelog-data';

export default function ChangelogPage() {
  const sortedEntries = changelogEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-20">
          <Link href="/" className="text-gray-600 hover:text-black transition-colors mb-8 inline-block" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            ← Back to Surbee
          </Link>
          
          <h1 className="text-6xl mb-6 tracking-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 100 }}>
            Changelog
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            New features, fixes, improvements and polish to the Surbee platform
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-2 top-2 bottom-0 w-px bg-black"></div>
          
          {/* Timeline Entries */}
          <div className="space-y-12">
            {sortedEntries.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Date and Timeline Dot */}
                <div className="flex items-center mb-6">
                  <div className="absolute left-2 w-2 h-2 bg-black rounded-full z-10 transform -translate-x-1/2"></div>
                  <span className="text-sm text-gray-500 ml-6" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                    {formatDate(entry.date)}
                  </span>
                </div>
                
                {/* Content */}
                <div className="ml-10">
                  {/* Title */}
                  <h2 className="text-3xl mb-6 text-black leading-tight" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                    {entry.title}
                  </h2>
                  
                  {/* Image */}
                  <div className="mb-6">
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="w-full max-w-2xl h-auto rounded-lg"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                      {entry.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {sortedEntries.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-600 mb-2" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                No updates yet
              </h3>
              <p className="text-gray-500" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Check back soon for new features and improvements.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-20 pt-16 border-t border-gray-200">
          <h3 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
            Want to be the first to know about updates?
          </h3>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            Join our community to get notified about new features and improvements.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-colors" 
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              Get Started
            </Link>
            <a 
              href="https://discord.gg/krs577Qxqr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors" 
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}