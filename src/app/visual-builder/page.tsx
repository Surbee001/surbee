"use client"

import React from 'react'
import NoCodeSurveyBuilder from '@/components/survey/builder/NoCodeSurveyBuilder'
import AppLayout from '@/components/layout/AppLayout'

interface GeneratedSurvey {
  id: string
  title: string
  description: string
  code: string
  pages?: any[]
  theme?: any
}

export default function VisualBuilderPage() {
  const handleSave = (survey: GeneratedSurvey) => {
    console.log('Survey saved:', survey)
    // Here you would typically save to database
    alert('Survey saved successfully!')
  }

  const handleExport = (survey: GeneratedSurvey) => {
    console.log('Survey exported:', survey)
    // Create and download the React component file
    const blob = new Blob([survey.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${survey.title.replace(/\s+/g, '-')}.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('Survey component exported successfully!')
  }

  return (
    <AppLayout>
      <NoCodeSurveyBuilder
        onSave={handleSave}
        onExport={handleExport}
      />
    </AppLayout>
  )
}