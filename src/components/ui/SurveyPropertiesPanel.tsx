"use client"

import React, { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SurveyPropertiesPanelProps {
  isOpen: boolean
  selectedComponent?: any
  onStyleChange?: (property: string, value: any) => void
  onComponentUpdate?: (componentId: string, updates: any) => void
}

// Framer-style panel header
const PanelHeader: React.FC<{
  title: string
  subtitle?: string
  isClickable?: boolean
  hasActions?: boolean
  isExpanded?: boolean
  onToggle?: () => void
}> = ({ title, subtitle, isClickable = false, hasActions = true, isExpanded, onToggle }) => (
  <div
    className={`relative flex w-full h-12 items-center justify-start border-t border-zinc-800 ${
      isClickable ? 'cursor-pointer hover:bg-zinc-800/30' : 'cursor-default'
    }`}
    onClick={isClickable ? onToggle : undefined}
  >
    <div className="flex-1 min-w-0 px-4">
      <span className="text-white text-xs font-semibold">{title}</span>
      {subtitle && (
        <span className="text-zinc-400 text-xs ml-2">{subtitle}</span>
      )}
    </div>
    {isClickable && (
      <div className="pr-4">
        <ChevronDown 
          className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>
    )}
    {hasActions && !isClickable && (
      <div className="pr-3">
        <button className="flex items-center justify-center w-5 h-7 text-zinc-400 hover:text-white">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    )}
  </div>
)

// Framer-style panel row
const PanelRow: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(62px,1fr))] gap-3 py-2">
    <div className="flex items-center h-8 pl-4">
      <span className="text-zinc-400 text-xs font-medium truncate pointer-events-none">
        {title}
      </span>
    </div>
    {children}
  </div>
)

// Framer-style text input
const FramerInput: React.FC<{
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  label?: string
}> = ({ value, placeholder, onChange, label }) => (
  <div className="relative flex items-center h-8 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
    <input
      type="text"
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="flex-1 px-2 py-0 bg-transparent text-white text-xs font-medium outline-none border-none"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    />
    {label && (
      <div className="absolute right-0 top-0 bottom-0 flex items-center px-2 bg-gradient-to-l from-zinc-900 via-zinc-900 to-transparent pointer-events-none">
        <span className="text-zinc-400 text-[9px] leading-3">{label}</span>
      </div>
    )}
  </div>
)

// Framer-style segmented control
const SegmentedControl: React.FC<{
  options: string[]
  selectedIndex?: number
  onChange?: (index: number, value: string) => void
  gridColumn?: string
}> = ({ options, selectedIndex = 0, onChange, gridColumn }) => (
  <div 
    className="relative flex h-8 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
    style={gridColumn ? { gridColumn } : {}}
  >
    <div className="absolute inset-0 flex">
      <div 
        className="h-full bg-blue-600 transition-all duration-200 ease-out"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${selectedIndex * 100}%)`
        }}
      />
    </div>
    {options.map((option, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <div 
            className={`w-px h-4 bg-zinc-600 self-center transition-opacity ${
              selectedIndex === index - 1 || selectedIndex === index ? 'opacity-0' : 'opacity-100'
            }`} 
          />
        )}
        <button
          onClick={() => onChange?.(index, option)}
          className="relative flex-1 flex items-center justify-center text-xs font-medium transition-colors z-10"
          style={{
            color: selectedIndex === index ? 'white' : '#9ca3af',
            fontWeight: selectedIndex === index ? 600 : 500
          }}
        >
          {option}
        </button>
      </React.Fragment>
    ))}
  </div>
)

// Framer-style slider
const FramerSlider: React.FC<{
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}> = ({ value, min, max, step = 1, onChange }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-full h-8 bg-transparent appearance-none cursor-pointer framer-slider"
  />
)

// Framer-style dropdown
const FramerSelect: React.FC<{
  value?: string
  options: { value: string; label: string }[]
  onChange?: (value: string) => void
  gridColumn?: string
}> = ({ value, options, onChange, gridColumn }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs font-medium appearance-none cursor-pointer truncate"
    style={gridColumn ? { gridColumn } : {}}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

export default function SurveyPropertiesPanel({ 
  isOpen, 
  selectedComponent, 
  onStyleChange, 
  onComponentUpdate 
}: SurveyPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    position: false,
    size: false,
    styles: true,
    transforms: false,
    effects: false,
    cursor: false,
    content: selectedComponent ? true : false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-600">
        <div className="p-4 space-y-0">
          
          {/* Content Panel - Only show when component is selected */}
          {selectedComponent && (
            <>
              <PanelHeader 
                title="Content" 
                isClickable={true}
                isExpanded={expandedSections.content}
                onToggle={() => toggleSection('content')}
                hasActions={false}
              />
              {expandedSections.content && (
                <div className="pb-3">
                  <PanelRow title="Label">
                    <FramerInput
                      value={selectedComponent.label}
                      placeholder="Question label"
                      onChange={(value) => onComponentUpdate?.(selectedComponent.id, { label: value })}
                    />
                    <div />
                  </PanelRow>

                  <PanelRow title="Required">
                    <SegmentedControl 
                      options={["No", "Yes"]} 
                      selectedIndex={selectedComponent.required ? 1 : 0}
                      onChange={(index) => onComponentUpdate?.(selectedComponent.id, { required: index === 1 })}
                      gridColumn="2 / -1"
                    />
                  </PanelRow>

                  {selectedComponent.type !== 'text-display' && (
                    <PanelRow title="Placeholder">
                      <FramerInput
                        value={selectedComponent.placeholder}
                        placeholder="Enter placeholder"
                        onChange={(value) => onComponentUpdate?.(selectedComponent.id, { placeholder: value })}
                      />
                      <div />
                    </PanelRow>
                  )}

                  {['radio', 'checkbox', 'select'].includes(selectedComponent.type) && (
                    <div className="space-y-2 px-4">
                      <div className="text-zinc-400 text-xs font-medium pt-2">Options</div>
                      {selectedComponent.options?.map((option: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <FramerInput
                            value={option}
                            onChange={(value) => {
                              const newOptions = [...(selectedComponent.options || [])]
                              newOptions[index] = value
                              onComponentUpdate?.(selectedComponent.id, { options: newOptions })
                            }}
                          />
                          <button
                            onClick={() => {
                              const newOptions = selectedComponent.options?.filter((_: any, i: number) => i !== index)
                              onComponentUpdate?.(selectedComponent.id, { options: newOptions })
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOptions = [...(selectedComponent.options || []), `Option ${(selectedComponent.options?.length || 0) + 1}`]
                          onComponentUpdate?.(selectedComponent.id, { options: newOptions })
                        }}
                        className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-zinc-800 rounded"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Position Panel */}
          <PanelHeader 
            title="Position" 
            isClickable={true}
            isExpanded={expandedSections.position}
            onToggle={() => toggleSection('position')}
            hasActions={false}
          />
          {expandedSections.position && (
            <div className="pb-3">
              <PanelRow title="">
                <FramerInput defaultValue="0" label="T" />
                <div />
              </PanelRow>
              <PanelRow title="">
                <FramerInput placeholder="0" label="L" />
                <div className="h-8 bg-zinc-900 border border-zinc-700 rounded-lg" />
                <FramerInput placeholder="0" label="R" />
              </PanelRow>
              <PanelRow title="">
                <FramerInput placeholder="0" label="B" />
                <div />
              </PanelRow>
              <PanelRow title="Type">
                <FramerSelect
                  value="absolute"
                  options={[
                    { value: 'absolute', label: 'Absolute' },
                    { value: 'relative', label: 'Relative' },
                    { value: 'fixed', label: 'Fixed' },
                    { value: 'sticky', label: 'Sticky' }
                  ]}
                  gridColumn="2 / -1"
                />
              </PanelRow>
            </div>
          )}

          {/* Size Panel */}
          <PanelHeader 
            title="Size" 
            isClickable={true}
            isExpanded={expandedSections.size}
            onToggle={() => toggleSection('size')}
            hasActions={false}
          />
          {expandedSections.size && (
            <div className="pb-3">
              <PanelRow title="Width">
                <FramerInput defaultValue="100%" />
                <SegmentedControl options={["Fixed", "Fill", "Fit"]} selectedIndex={1} />
              </PanelRow>
              <PanelRow title="Height">
                <FramerInput defaultValue="auto" />
                <SegmentedControl options={["Fixed", "Fill", "Fit"]} selectedIndex={2} />
              </PanelRow>
            </div>
          )}

          {/* Styles Panel */}
          <PanelHeader 
            title="Styles" 
            isClickable={true}
            isExpanded={expandedSections.styles}
            onToggle={() => toggleSection('styles')}
            hasActions={false}
          />
          {expandedSections.styles && (
            <div className="pb-3">
              <PanelRow title="Opacity">
                <FramerInput defaultValue="1" />
                <FramerSlider 
                  value={1} 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  onChange={(value) => onStyleChange?.('opacity', value.toString())}
                />
              </PanelRow>
              <PanelRow title="Visible">
                <SegmentedControl 
                  options={["Yes", "No"]} 
                  selectedIndex={0}
                  onChange={(index) => onStyleChange?.('visibility', index === 0 ? 'visible' : 'hidden')}
                  gridColumn="2 / -1"
                />
              </PanelRow>
              <PanelRow title="Z Index">
                <FramerInput defaultValue="1" />
                <SegmentedControl 
                  options={["-", "+"]}
                  onChange={(index, value) => {
                    const currentZ = 1
                    const newZ = value === '+' ? currentZ + 1 : Math.max(0, currentZ - 1)
                    onStyleChange?.('zIndex', newZ.toString())
                  }}
                />
              </PanelRow>
            </div>
          )}

          {/* Transforms Panel */}
          <PanelHeader 
            title="Transforms" 
            isClickable={true}
            isExpanded={expandedSections.transforms}
            onToggle={() => toggleSection('transforms')}
            hasActions={false}
          />
          {expandedSections.transforms && (
            <div className="pb-3">
              <PanelRow title="Rotate">
                <FramerInput defaultValue="0°" />
                <SegmentedControl options={["2D", "3D"]} selectedIndex={0} />
              </PanelRow>
            </div>
          )}

          {/* Empty Panels */}
          {["Effects", "Cursor"].map((title) => (
            <PanelHeader 
              key={title}
              title={title} 
              isClickable={true}
              isExpanded={expandedSections[title.toLowerCase() as keyof typeof expandedSections]}
              onToggle={() => toggleSection(title.toLowerCase() as keyof typeof expandedSections)}
              hasActions={false}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .framer-slider::-webkit-slider-track {
          background: #27272a;
          height: 4px;
          border-radius: 2px;
        }
        
        .framer-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          margin-top: -6px;
        }
        
        .framer-slider::-moz-range-track {
          background: #27272a;
          height: 4px;
          border-radius: 2px;
          border: none;
        }
        
        .framer-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          margin-top: -6px;
        }
      `}</style>
    </div>
  )
}