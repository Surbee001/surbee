"use client"

import React from 'react'
import Link from 'next/link'

export default function FormSubdomainIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">Surbee Forms</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          This is where published surveys are hosted. To access a survey, use the link provided by the survey creator.
        </p>
        <Link
          href="https://surbee.dev"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
        >
          Create Your Own Survey
        </Link>
      </div>
    </div>
  )
}
