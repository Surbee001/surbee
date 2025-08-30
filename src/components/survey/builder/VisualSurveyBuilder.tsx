"use client"

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GripVertical, Plus, Trash2, Copy, Settings, Eye, EyeOff, 
  Type, AlignLeft, CheckSquare, RadioIcon, ListOrdered, Calendar,
  Star, ToggleLeft, ChevronDown, X
} from 'lucide-react'
import { ComponentRegistry, ComponentType } from '../base-components'
import { PreviewRenderer } from '../PreviewRenderer'
import PropertyEditor from './PropertyEditor'
import ComponentPreview from './ComponentPreview'
import PublishModal from './PublishModal'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'
import { surveyManager } from '@/lib/survey-manager'

// Component palette items
const COMPONENT_PALETTE = [
  { type: 'text-input' as ComponentType, label: 'Text Input', icon: Type },
  { type: 'textarea' as ComponentType, label: 'Text Area', icon: AlignLeft },
  { type: 'radio' as ComponentType, label: 'Radio Group', icon: RadioIcon },
  { type: 'checkbox' as ComponentType, label: 'Checkbox Group', icon: CheckSquare },
  { type: 'scale' as ComponentType, label: 'Scale Rating', icon: Star },
  { type: 'nps' as ComponentType, label: 'NPS Rating', icon: ListOrdered },
  { type: 'select' as ComponentType, label: 'Dropdown', icon: ChevronDown },
  { type: 'date-picker' as ComponentType, label: 'Date Picker', icon: Calendar },
  { type: 'yes-no' as ComponentType, label: 'Yes/No', icon: ToggleLeft },
]

export interface SurveyComponentData {
  id: string
  type: ComponentType
  label: string
  required: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  props?: Record<string, any>
  style?: {
    container?: React.CSSProperties
    label?: React.CSSProperties
    input?: React.CSSProperties
  }
  position: number
}

interface VisualSurveyBuilderProps {
  initialSurveyData?: AIGenerationOutput
  onSave?: (surveyData: AIGenerationOutput) => void
  onPublish?: (surveyData: AIGenerationOutput) => void
}

export const VisualSurveyBuilder: React.FC<VisualSurveyBuilderProps> = ({
  initialSurveyData,
  onSave,
  onPublish
}) => {
  // Extract initial components from survey data
  const extractComponents = (data?: AIGenerationOutput): SurveyComponentData[] => {
    if (!data?.survey?.pages) return []
    
    return data.survey.pages.flatMap(page => 
      (page.components || []).map((comp, index) => ({
        id: comp.id || `comp_${Date.now()}_${index}`,
        type: comp.type as ComponentType,
        label: comp.label || 'Untitled Question',
        required: comp.required || false,
        placeholder: comp.placeholder,
        helpText: comp.helpText,
        options: comp.options || comp.props?.options,
        props: comp.props,
        style: comp.style,
        position: comp.position || index
      }))
    )
  }

  const [components, setComponents] = useState<SurveyComponentData[]>(
    extractComponents(initialSurveyData)
  )
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Add new component
  const addComponent = (type: ComponentType) => {
    const newComponent: SurveyComponentData = {
      id: `comp_${Date.now()}`,
      type,
      label: `New ${type.replace('-', ' ')} question`,
      required: false,
      position: components.length,
      options: ['radio', 'checkbox', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    }
    setComponents([...components, newComponent])
    setSelectedComponent(newComponent.id)
  }

  // Update component
  const updateComponent = useCallback((id: string, updates: Partial<SurveyComponentData>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ))
  }, [])

  // Delete component
  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
    if (selectedComponent === id) {
      setSelectedComponent(null)
    }
  }

  // Duplicate component
  const duplicateComponent = (id: string) => {
    const component = components.find(c => c.id === id)
    if (component) {
      const newComponent = {
        ...component,
        id: `comp_${Date.now()}`,
        label: `${component.label} (Copy)`,
        position: components.length
      }
      setComponents([...components, newComponent])
    }
  }

  // Convert to survey data for preview
  const getSurveyData = (): AIGenerationOutput => {
    return {
      survey: {
        id: initialSurveyData?.survey?.id || `survey_${Date.now()}`,
        title: initialSurveyData?.survey?.title || 'Visual Survey Builder',
        description: initialSurveyData?.survey?.description || 'Build your survey visually',
        pages: [{
          id: 'page_1',
          name: 'Main Page',
          title: 'Survey Questions',
          position: 1,
          components: components.map((comp, index) => ({
            ...comp,
            position: index + 1,
            pageId: 'page_1'
          }))
        }],
        theme: initialSurveyData?.survey?.theme || {
          primaryColor: '#3b82f6',
          secondaryColor: '#6366f1',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          spacing: 16,
          animations: true
        },
        settings: { showProgress: true, allowBack: true },
        analytics: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: 'visual-builder',
          version: '2.0',
          originalPrompt: 'Visual Builder',
          tags: ['visual-builder']
        }
      },
      components: [],
      designSystem: initialSurveyData?.designSystem,
      validationRules: initialSurveyData?.validationRules,
      analyticsConfig: initialSurveyData?.analyticsConfig,
      followUpSuggestions: []
    }
  }

  // Convert components for preview
  const getPreviewComponents = () => components.map(comp => ({
    id: comp.id,
    type: comp.type,
    label: comp.label,
    required: comp.required,
    placeholder: comp.placeholder,
    helpText: comp.helpText,
    options: comp.options,
    props: comp.props,
    style: comp.style
  }))

  // Save survey
  const handleSave = () => {
    const surveyData = getSurveyData()
    if (currentSurveyId) {
      surveyManager.updateSurvey(currentSurveyId, surveyData)
    } else {
      const savedSurvey = surveyManager.saveDraft(surveyData)
      setCurrentSurveyId(savedSurvey.id)
    }
    console.log('💾 Survey saved successfully')
  }

  // Publish survey (opens modal)
  const handlePublish = () => {
    setShowPublishModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50 visual-survey-builder">
      {/* Left Sidebar - Component Palette */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Components</h3>
        <div className="space-y-2">
          {COMPONENT_PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addComponent(item.type)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {item.label}
              </span>
              <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-blue-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Survey Builder</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Share & Publish
              </button>
            </div>
          </div>

          {/* Survey Canvas */}
          {showPreview ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <PreviewRenderer
                components={getPreviewComponents()}
                surveyData={getSurveyData()}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[600px]">
              {components.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Start Building Your Survey
                  </h3>
                  <p className="text-gray-600">
                    Click on components from the left sidebar to add them here
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={components.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {components.map((component) => (
                        <SortableComponentItem
                          key={component.id}
                          component={component}
                          isSelected={selectedComponent === component.id}
                          onSelect={() => setSelectedComponent(component.id)}
                          onDelete={() => deleteComponent(component.id)}
                          onDuplicate={() => duplicateComponent(component.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-white rounded-lg shadow-2xl p-4 opacity-90">
                        <div className="text-sm font-medium">
                          {components.find(c => c.id === activeId)?.label}
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Property Editor */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        {selectedComponent ? (
          <PropertyEditor
            component={components.find(c => c.id === selectedComponent)!}
            onUpdate={(updates) => updateComponent(selectedComponent, updates)}
            onClose={() => setSelectedComponent(null)}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        surveyData={getSurveyData()}
        surveyId={currentSurveyId}
      />
    </div>
  )
}

// Sortable Component Item
const SortableComponentItem: React.FC<{
  component: SurveyComponentData
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}> = ({ component, isSelected, onSelect, onDelete, onDuplicate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onSelect}
    >
      <div className="absolute left-0 top-0 bottom-0 flex items-center -ml-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {component.type.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
        
        {/* Component Preview */}
        <div className="pointer-events-none opacity-75">
          <ComponentPreview
            id={component.id}
            type={component.type}
            label={component.label}
            required={component.required}
            placeholder={component.placeholder}
            helpText={component.helpText}
            options={component.options}
            style={component.style}
            props={component.props}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default VisualSurveyBuilder