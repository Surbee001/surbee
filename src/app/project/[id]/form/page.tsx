"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Monitor, Tablet, Smartphone, Settings2, Eye, BarChart3, ExternalLink } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { SurveyRenderer } from '@/components/SurveyRenderer-enhanced'
import type { AIGenerationOutput, Survey } from '@/lib/schemas/survey-schemas'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ResponsesPerQuestion from '@/components/survey/ResponsesPerQuestion'

type ResponseRow = { id: string; responses: Record<string, any>; completed_at?: string; fraud_score?: number; is_flagged?: boolean }

export default function ProjectSurveyWorkspace() {
  const { id } = useParams() as { id?: string }
  const projectId = id || 'preview'

  const [mode, setMode] = useState<'preview' | 'responses'>('preview')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [surveyData, setSurveyData] = useState<AIGenerationOutput | null>(null)
  const [responses, setResponses] = useState<ResponseRow[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)

  // Load survey from localStorage (same keys used by preview page)
  useEffect(() => {
    try {
      const keys = [
        `surbee_survey_${projectId}`,
        `surbee_latest_survey`,
        'surbee_preview_survey'
      ]
      for (const key of keys) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          setSurveyData(parsed)
          break
        }
      }
    } catch {}
  }, [projectId])

  // Fetch responses for the survey
  useEffect(() => {
    let abort = false
    async function fetchResponses() {
      if (!surveyData?.survey?.id) return
      setLoadingResponses(true)
      try {
        const res = await fetch(`/api/surbee/responses/list?surveyId=${encodeURIComponent(surveyData.survey.id)}&limit=200`)
        const json = await res.json()
        if (!abort && json?.success) setResponses(json.responses || [])
      } catch {
        // ignore
      } finally {
        if (!abort) setLoadingResponses(false)
      }
    }
    fetchResponses()
    const interval = setInterval(fetchResponses, 5000)
    return () => { abort = true; clearInterval(interval) }
  }, [surveyData?.survey?.id])

  const survey: Survey | null = useMemo(() => surveyData?.survey || null, [surveyData])

  const deviceClass = device === 'phone' ? 'w-[375px] max-w-full' : device === 'tablet' ? 'w-[768px] max-w-full' : 'w-full'

  return (
    <AppLayout hideSidebar fullBleed>
      <div className="flex flex-col h-full w-full" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Top Bar */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-3" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          {/* Left: View toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 rounded-md text-sm ${mode==='preview' ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Eye className="w-4 h-4 inline mr-1" /> Preview
            </button>
            <button
              onClick={() => setMode('responses')}
              className={`px-3 py-1.5 rounded-md text-sm ${mode==='responses' ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" /> View responses
            </button>
          </div>

          {/* Center: Device controls (preview mode) */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setDevice('desktop')} className={`p-2 rounded ${device==='desktop'?'bg-white/10 text-white':'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Desktop">
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setDevice('tablet')} className={`p-2 rounded ${device==='tablet'?'bg-white/10 text-white':'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Tablet">
              <Tablet className="w-4 h-4" />
            </button>
            <button onClick={() => setDevice('phone')} className={`p-2 rounded ${device==='phone'?'bg-white/10 text-white':'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Phone">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Settings and external preview */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-white/10"
            >
              <Settings2 className="w-4 h-4 inline mr-1" /> Settings
            </button>
            <button
              onClick={() => {
                if (projectId) window.open(`/project/${projectId}/preview`, '_blank')
              }}
              className="px-2 py-1.5 rounded-md text-sm text-gray-300 hover:bg-white/10"
              title="Open preview in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          {/* Centered container like Forms */}
          <div className="mx-auto max-w-[1100px]">
            {mode === 'preview' ? (
              <div className="bg-[#1a1a1a] rounded-[10px] border border-zinc-800 p-4 min-h-[60vh]">
                <div className="flex items-center justify-center">
                  <div className={`transition-all ${deviceClass}`}>
                    <SurveyRenderer
                      surveyData={surveyData || undefined}
                      surveyId={projectId}
                      onComplete={() => {}}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#f7f7f7] rounded-[10px] border border-gray-200 p-4 min-h-[60vh]">
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Metric title="Responses" value={responses.length.toString()} />
                  <Metric title="Average Time" value="—" />
                  <Metric title="Duration" value="—" />
                  <Metric title="Flagged" value={responses.filter(r => r.is_flagged).length.toString()} />
                </div>
                {survey ? (
                  <ResponsesPerQuestion survey={survey} responses={responses} />
                ) : (
                  <p className="text-sm text-gray-600">No survey structure found. Create a survey first.</p>
                )}
                {loadingResponses && <p className="text-xs text-gray-500 mt-3">Refreshing responses…</p>}
              </div>
            )}
          </div>
        </div>

        {/* Settings Drawer */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent side="right" className="bg-white w-[420px] text-gray-900">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <SurveySettings projectId={projectId} />
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function SurveySettings({ projectId }: { projectId: string }) {
  const key = `surbee_settings_${projectId}`
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : {
        acceptResponses: true,
        recordName: true,
        onePerPerson: false,
        startDate: '',
        endDate: '',
        progressBar: true,
        shuffleQuestions: false,
      }
    } catch {
      return { acceptResponses: true }
    }
  })

  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(settings)) } catch {} }, [key, settings])

  return (
    <div className="mt-4 space-y-6">
      <section>
        <h4 className="font-medium mb-2">Who can fill out this form</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="who" disabled /> Anyone with the link</label>
          <label className="flex items-center gap-2"><input type="radio" name="who" defaultChecked /> Only signed-in users</label>
          <label className="flex items-center gap-2 ml-6"><input type="checkbox" checked={!!settings.recordName} onChange={(e)=>setSettings((s:any)=>({...s,recordName:e.target.checked}))}/> Record name</label>
          <label className="flex items-center gap-2 ml-6"><input type="checkbox" checked={!!settings.onePerPerson} onChange={(e)=>setSettings((s:any)=>({...s,onePerPerson:e.target.checked}))}/> One response per person</label>
        </div>
      </section>
      <section>
        <h4 className="font-medium mb-2">Options for responses</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings.acceptResponses} onChange={(e)=>setSettings((s:any)=>({...s,acceptResponses:e.target.checked}))}/> Accept responses</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Start date</label>
              <input type="datetime-local" value={settings.startDate} onChange={(e)=>setSettings((s:any)=>({...s,startDate:e.target.value}))} className="w-full h-8 px-2 border rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-500">End date</label>
              <input type="datetime-local" value={settings.endDate} onChange={(e)=>setSettings((s:any)=>({...s,endDate:e.target.value}))} className="w-full h-8 px-2 border rounded" />
            </div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings.shuffleQuestions} onChange={(e)=>setSettings((s:any)=>({...s,shuffleQuestions:e.target.checked}))}/> Shuffle questions</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings.progressBar} onChange={(e)=>setSettings((s:any)=>({...s,progressBar:e.target.checked}))}/> Show a progress bar</label>
        </div>
      </section>
    </div>
  )
}

