"use client"

import React from 'react'
import { ChartRenderer } from '@/components/dashboard/ChartRenderer'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple markdown parsing for basic formatting
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentParagraph: string[] = []
    let listItems: string[] = []
    let inCodeBlock = false
    let codeLanguage = ''
    let codeContent: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join('\n')
        elements.push(
          <p key={elements.length} className="mb-4 text-[14px] leading-6" style={{ color: 'var(--surbee-fg-primary)' }}>
            {parseInlineMarkdown(paragraphText)}
          </p>
        )
        currentParagraph = []
      }
    }

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="mb-4 ml-4 space-y-1">
            {listItems.map((item, i) => (
              <li key={i} className="text-[14px] leading-6 list-disc" style={{ color: 'var(--surbee-fg-primary)' }}>
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    const flushCodeBlock = () => {
      if (codeContent.length > 0) {
        if (codeLanguage === 'chart') {
          try {
            const chartData = JSON.parse(codeContent.join('\n'))
            elements.push(
              <div key={elements.length} className="mb-4 not-prose">
                <ChartRenderer {...chartData} />
              </div>
            )
          } catch (e) {
             elements.push(
              <pre key={elements.length} className="mb-4 bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400 text-sm">
                Error parsing chart data
              </pre>
            )
          }
        } else {
          elements.push(
            <pre key={elements.length} className="mb-4 bg-zinc-800 border border-zinc-700 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-zinc-200 font-mono">
                {codeContent.join('\n')}
              </code>
            </pre>
          )
        }
        codeContent = []
        inCodeBlock = false
        codeLanguage = ''
      }
    }

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock()
        } else {
          flushParagraph()
          flushList()
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeContent.push(line)
        return
      }

      // Handle headings
      if (line.startsWith('# ')) {
        flushParagraph()
        flushList()
        elements.push(
          <h1 key={elements.length} className="mb-4 text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            {line.slice(2)}
          </h1>
        )
        return
      }

      if (line.startsWith('## ')) {
        flushParagraph()
        flushList()
        elements.push(
          <h2 key={elements.length} className="mb-3 text-xl font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
            {line.slice(3)}
          </h2>
        )
        return
      }

      if (line.startsWith('### ')) {
        flushParagraph()
        flushList()
        elements.push(
          <h3 key={elements.length} className="mb-3 text-lg font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
            {line.slice(4)}
          </h3>
        )
        return
      }

      // Handle list items
      if (line.match(/^[-*+]\s/)) {
        flushParagraph()
        listItems.push(line.slice(2))
        return
      }

      if (line.match(/^\d+\.\s/)) {
        flushParagraph()
        flushList()
        const match = line.match(/^(\d+)\.\s(.*)/)
        if (match) {
          elements.push(
            <ol key={elements.length} className="mb-4 ml-4 space-y-1" start={parseInt(match[1])}>
              <li className="text-[14px] leading-6 list-decimal" style={{ color: 'var(--surbee-fg-primary)' }}>
                {parseInlineMarkdown(match[2])}
              </li>
            </ol>
          )
        }
        return
      }

      // Handle empty lines
      if (line.trim() === '') {
        flushParagraph()
        flushList()
        return
      }

      // Regular paragraph content
      flushList()
      currentParagraph.push(line)
    })

    // Flush remaining content
    flushParagraph()
    flushList()
    flushCodeBlock()

    return elements
  }

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let currentText = text
    let key = 0

    // Handle bold text (**text**)
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${key}__`
      parts.push(
        <strong key={`bold-${key}`} className="font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
          {content}
        </strong>
      )
      key++
      return placeholder
    })

    // Handle italic text (*text*)
    currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
      const placeholder = `__ITALIC_${key}__`
      parts.push(
        <em key={`italic-${key}`} className="italic">
          {content}
        </em>
      )
      key++
      return placeholder
    })

    // Handle inline code (`code`)
    currentText = currentText.replace(/`(.*?)`/g, (match, content) => {
      const placeholder = `__CODE_${key}__`
      parts.push(
        <code key={`code-${key}`} className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {content}
        </code>
      )
      key++
      return placeholder
    })

    // Mentions: @filename -> pill with link to /kb?file=filename
    currentText = currentText.replace(/@([\w.-]+)/g, (m, name) => {
      const placeholder = `__MENTION_${key}__`
      parts.push(
        <a
          key={`mention-${key}`}
          href={`/kb?file=${encodeURIComponent(name)}`}
          className="inline-block align-baseline px-1.5 py-0.5 rounded-md border border-zinc-900 bg-[#1a1a1a] text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          @{name}
        </a>
      )
      key++
      return placeholder
    })

    // Split text and insert formatted elements
    const textParts = currentText.split(/(__(?:BOLD|ITALIC|CODE)_\d+__)/)
    const result: React.ReactNode[] = []

    textParts.forEach((part, index) => {
      const boldMatch = part.match(/__BOLD_(\d+)__/)
      const italicMatch = part.match(/__ITALIC_(\d+)__/)
      const codeMatch = part.match(/__CODE_(\d+)__/)

      if (boldMatch) {
        const boldKey = parseInt(boldMatch[1])
        const boldElement = parts.find((p: any) => p.key === `bold-${boldKey}`)
        if (boldElement) result.push(boldElement)
      } else if (italicMatch) {
        const italicKey = parseInt(italicMatch[1])
        const italicElement = parts.find((p: any) => p.key === `italic-${italicKey}`)
        if (italicElement) result.push(italicElement)
      } else if (codeMatch) {
        const codeKey = parseInt(codeMatch[1])
        const codeElement = parts.find((p: any) => p.key === `code-${codeKey}`)
        if (codeElement) result.push(codeElement)
      } else if (part) {
        const mentionMatch = part.match(/__MENTION_(\d+)__/)
        if (mentionMatch) {
          const mKey = parseInt(mentionMatch[1])
          const mEl = parts.find((p: any) => p.key === `mention-${mKey}`)
          if (mEl) {
            result.push(mEl)
          } else {
            result.push(part)
          }
        } else {
          result.push(part)
        }
      }
    })

    return result.length > 0 ? result : [text]
  }

  const elements = parseMarkdown(content)

  return (
    <div className={`max-w-none ${className}`}>
      {elements}
    </div>
  )
}
