"use client"
import React, { useMemo } from 'react'
import type { Survey, SurveyComponent } from '@/lib/schemas/survey-schemas'

type ResponseRow = {
  id?: string
  survey_id?: string
  responses: Record<string, any>
  completed_at?: string
  is_flagged?: boolean
  fraud_score?: number
}

interface ResponsesPerQuestionProps {
  survey: Survey
  responses: ResponseRow[]
}

export const ResponsesPerQuestion: React.FC<ResponsesPerQuestionProps> = ({ survey, responses }) => {
  const components: SurveyComponent[] = useMemo(() => {
    return (survey?.pages || []).flatMap(p => p.components || [])
  }, [survey])

  if (!components || components.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500">No questions found in this survey.</div>
    )
  }

  return (
    <div className="space-y-4">
      {components.map((c, idx) => (
        <QuestionBlock key={c.id} index={idx + 1} component={c} responses={responses} />
      ))}
    </div>
  )
}

function QuestionBlock({ index, component, responses }: { index: number; component: SurveyComponent; responses: ResponseRow[] }) {
  const label = component.label || component.id
  const type = component.type

  // Extract all answers for this component id
  const answers = useMemo(() => responses.map(r => r.responses?.[component.id]).filter(v => v !== undefined && v !== null), [responses, component.id])

  const content = useMemo(() => {
    switch (type) {
      case 'yes-no':
      case 'radio':
      case 'select':
      case 'likert':
      case 'scale':
      case 'nps': {
        const counts = new Map<string, number>()
        answers.forEach((a) => {
          const key = String(a)
          counts.set(key, (counts.get(key) || 0) + 1)
        })
        const total = answers.length || 1
        const items = Array.from(counts.entries()).sort((a,b) => b[1]-a[1])
        return (
          <div className="space-y-2">
            {items.length === 0 && <p className="text-sm text-gray-500">No responses yet</p>}
            {items.map(([option, count]) => {
              const pct = Math.round((count / total) * 100)
              return (
                <div key={option} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">{option}</span>
                    <span className="text-gray-600 font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
      case 'checkbox':
      case 'multiselect': {
        const counts = new Map<string, number>()
        answers.forEach((a) => {
          const arr = Array.isArray(a) ? a : []
          arr.forEach((opt: any) => {
            const key = String(opt)
            counts.set(key, (counts.get(key) || 0) + 1)
          })
        })
        const total = answers.reduce((acc, a) => acc + (Array.isArray(a) ? a.length : 0), 0) || 1
        const items = Array.from(counts.entries()).sort((a,b) => b[1]-a[1])
        return (
          <div className="space-y-2">
            {items.length === 0 && <p className="text-sm text-gray-500">No responses yet</p>}
            {items.map(([option, count]) => {
              const pct = Math.round((count / total) * 100)
              return (
                <div key={option} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">{option}</span>
                    <span className="text-gray-600 font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
      case 'file-upload': {
        const files = answers.flat().filter(Boolean)
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{files.length} files uploaded</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {files.slice(0, 8).map((url: any, i: number) => (
                <a key={i} href={typeof url === 'string' ? url : '#'} target="_blank" className="block">
                  <div className="h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                    {typeof url === 'string' && /\.(png|jpg|jpeg|gif|webp)$/i.test(url)
                      ? <img src={url} alt="file" className="w-full h-full object-cover" />
                      : <span className="px-2 break-words">{typeof url === 'string' ? url.split('/').pop() : 'file'}</span>
                    }
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      }
      default: {
        const latest = answers.slice(-3).reverse()
        return (
          <div className="space-y-2">
            {latest.length === 0 && <p className="text-sm text-gray-500">No responses yet</p>}
            {latest.map((text, i) => (
              <div key={i} className="p-3 bg-white rounded border text-sm text-gray-800 shadow-sm">
                {String(text)}
              </div>
            ))}
          </div>
        )
      }
    }
  }, [type, answers])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">
          {index}. {label}
        </h4>
        <span className="text-xs text-gray-500">{answers.length} responses</span>
      </div>
      {content}
    </div>
  )
}

export default ResponsesPerQuestion

