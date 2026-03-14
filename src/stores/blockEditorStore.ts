/**
 * Block Editor Zustand Store
 *
 * Central state management for the block-based survey page editor.
 * Uses immer for ergonomic nested updates and snapshot-based undo/redo.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type {
  Block,
  BlockType,
  BlockContentMap,
  BlockEditorSurvey,
  EditorPage,
  PageLogic,
  SurveyTheme,
  BlockMeta,
} from '@/lib/block-editor/types'
import { createDefaultBlock, createDefaultPage, createDefaultSurvey } from '@/lib/block-editor/block-defaults'

// ---------------------------------------------------------------------------
// Slash Menu State
// ---------------------------------------------------------------------------

interface SlashMenuState {
  isOpen: boolean
  position: { x: number; y: number } | null
  filter: string
  afterBlockId: string | null
  pageId: string | null
}

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export interface BlockEditorState {
  // Data
  survey: BlockEditorSurvey | null
  activePageId: string | null
  selectedBlockId: string | null
  focusedBlockId: string | null

  // UI state
  isDirty: boolean
  saveVersion: number // increments on every change, used to retrigger save
  editorMode: 'edit' | 'preview'
  slashMenu: SlashMenuState

  // History (undo/redo)
  history: string[] // JSON snapshots
  historyIndex: number

  // Actions — Survey level
  initSurvey: (survey: BlockEditorSurvey) => void
  createNewSurvey: (id: string, title?: string) => void
  updateSurveyTitle: (title: string) => void
  updateSurveyDescription: (description: string) => void
  updateSurveyTheme: (theme: Partial<SurveyTheme>) => void
  updateSurveySettings: (settings: Partial<BlockEditorSurvey['settings']>) => void

  // Actions — Page level
  addPage: (page?: Partial<EditorPage>) => string
  updatePage: (pageId: string, updates: Partial<Pick<EditorPage, 'title' | 'description' | 'style'>>) => void
  deletePage: (pageId: string) => void
  duplicatePageAt: (pageId: string) => string | null
  reorderPages: (orderedPageIds: string[]) => void
  setActivePage: (pageId: string) => void
  setPageLogic: (pageId: string, logic: PageLogic) => void

  // Actions — Block level
  addBlock: (pageId: string, type: BlockType, afterBlockId?: string | null, contentOverride?: Partial<BlockContentMap[BlockType]>) => string
  updateBlockContent: (pageId: string, blockId: string, content: Partial<BlockContentMap[BlockType]>) => void
  updateBlockMeta: (pageId: string, blockId: string, meta: Partial<BlockMeta>) => void
  deleteBlock: (pageId: string, blockId: string) => void
  moveBlock: (fromPageId: string, toPageId: string, blockId: string, newPosition: number) => void
  reorderBlocks: (pageId: string, orderedBlockIds: string[]) => void
  duplicateBlock: (pageId: string, blockId: string) => string | null

  // Actions — Selection & Focus
  selectBlock: (blockId: string | null) => void
  focusBlock: (blockId: string | null) => void

  // Actions — Slash menu
  openSlashMenu: (pageId: string, position: { x: number; y: number }, afterBlockId?: string | null) => void
  closeSlashMenu: () => void
  setSlashMenuFilter: (filter: string) => void

  // Actions — History
  undo: () => void
  redo: () => void

  // Actions — Mode
  setEditorMode: (mode: 'edit' | 'preview') => void

  // Computed helpers
  getActivePage: () => EditorPage | null
  getBlock: (pageId: string, blockId: string) => Block | null
  getAllQuestionBlocks: () => Block[]
}

// ---------------------------------------------------------------------------
// Helper: find page & block indices
// ---------------------------------------------------------------------------

function findPage(survey: BlockEditorSurvey, pageId: string) {
  const idx = survey.pages.findIndex(p => p.id === pageId)
  return idx >= 0 ? { page: survey.pages[idx], index: idx } : null
}

function findBlock(page: EditorPage, blockId: string) {
  const idx = page.blocks.findIndex(b => b.id === blockId)
  return idx >= 0 ? { block: page.blocks[idx], index: idx } : null
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBlockEditorStore = create<BlockEditorState>()(
  immer((set, get) => {
    // Push current state to history before mutation
    function pushHistory() {
      const { survey, history, historyIndex } = get()
      if (!survey) return
      const snapshot = JSON.stringify(survey)
      set(state => {
        // Truncate any future history if we branched
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push(snapshot)
        // Keep max 50 snapshots
        if (state.history.length > 50) {
          state.history = state.history.slice(state.history.length - 50)
        }
        state.historyIndex = state.history.length - 1
      })
    }

    function markDirty() {
      set(state => {
        state.isDirty = true
        state.saveVersion += 1
        if (state.survey) {
          state.survey.metadata.updatedAt = new Date().toISOString()
        }
      })
    }

    return {
      // Initial state
      survey: null,
      activePageId: null,
      selectedBlockId: null,
      focusedBlockId: null,
      isDirty: false,
      saveVersion: 0,
      editorMode: 'edit',
      slashMenu: { isOpen: false, position: null, filter: '', afterBlockId: null, pageId: null },
      history: [],
      historyIndex: -1,

      // --- Survey Actions ---

      initSurvey: (survey) => {
        set(state => {
          state.survey = survey
          state.activePageId = survey.pages[0]?.id ?? null
          state.selectedBlockId = null
          state.focusedBlockId = null
          state.isDirty = false
          state.history = [JSON.stringify(survey)]
          state.historyIndex = 0
        })
      },

      createNewSurvey: (id, title) => {
        const survey = createDefaultSurvey(id, title)
        get().initSurvey(survey)
      },

      updateSurveyTitle: (title) => {
        pushHistory()
        set(state => {
          if (state.survey) state.survey.title = title
        })
        markDirty()
      },

      updateSurveyDescription: (description) => {
        pushHistory()
        set(state => {
          if (state.survey) state.survey.description = description
        })
        markDirty()
      },

      updateSurveyTheme: (theme) => {
        pushHistory()
        set(state => {
          if (state.survey) Object.assign(state.survey.theme, theme)
        })
        markDirty()
      },

      updateSurveySettings: (settings) => {
        pushHistory()
        set(state => {
          if (state.survey) Object.assign(state.survey.settings, settings)
        })
        markDirty()
      },

      // --- Page Actions ---

      addPage: (partial) => {
        pushHistory()
        const { survey } = get()
        const position = survey?.pages.length ?? 0
        const page: EditorPage = {
          ...createDefaultPage(position),
          ...partial,
          id: partial?.id || nanoid(10),
          position,
        }
        set(state => {
          if (state.survey) {
            state.survey.pages.push(page)
            state.activePageId = page.id
          }
        })
        markDirty()
        return page.id
      },

      updatePage: (pageId, updates) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (found) Object.assign(found.page, updates)
        })
        markDirty()
      },

      deletePage: (pageId) => {
        const { survey } = get()
        if (!survey || survey.pages.length <= 1) return // keep at least 1 page
        pushHistory()
        set(state => {
          if (!state.survey) return
          state.survey.pages = state.survey.pages.filter(p => p.id !== pageId)
          // Re-index positions
          state.survey.pages.forEach((p, i) => { p.position = i })
          // If deleted page was active, switch
          if (state.activePageId === pageId) {
            state.activePageId = state.survey.pages[0]?.id ?? null
          }
        })
        markDirty()
      },

      duplicatePageAt: (pageId) => {
        pushHistory()
        let newPageId: string | null = null
        set(state => {
          if (!state.survey) return
          const idx = state.survey.pages.findIndex(p => p.id === pageId)
          if (idx === -1) return
          const clone: EditorPage = JSON.parse(JSON.stringify(state.survey.pages[idx]))
          clone.id = nanoid(10)
          clone.title = `${clone.title} (copy)`
          clone.blocks.forEach(b => {
            b.id = nanoid(10)
            if (b.meta.questionId) b.meta.questionId = `q${nanoid(6)}`
          })
          state.survey.pages.splice(idx + 1, 0, clone)
          state.survey.pages.forEach((p, i) => { p.position = i })
          newPageId = clone.id
          state.activePageId = clone.id
        })
        markDirty()
        return newPageId
      },

      reorderPages: (orderedPageIds) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const pageMap = new Map(state.survey.pages.map(p => [p.id, p]))
          state.survey.pages = orderedPageIds
            .map(id => pageMap.get(id))
            .filter(Boolean) as EditorPage[]
          state.survey.pages.forEach((p, i) => { p.position = i })
        })
        markDirty()
      },

      setActivePage: (pageId) => {
        set(state => { state.activePageId = pageId })
      },

      setPageLogic: (pageId, logic) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (found) found.page.logic = logic
        })
        markDirty()
      },

      // --- Block Actions ---

      addBlock: (pageId, type, afterBlockId, contentOverride) => {
        pushHistory()
        const block = createDefaultBlock(type, 0, contentOverride as any)
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (!found) return
          const { page } = found

          if (afterBlockId) {
            const afterIdx = page.blocks.findIndex(b => b.id === afterBlockId)
            if (afterIdx >= 0) {
              page.blocks.splice(afterIdx + 1, 0, block)
            } else {
              page.blocks.push(block)
            }
          } else {
            page.blocks.push(block)
          }
          // Re-index positions
          page.blocks.forEach((b, i) => { b.meta.position = i })
          state.selectedBlockId = block.id
          state.focusedBlockId = block.id
        })
        markDirty()
        return block.id
      },

      updateBlockContent: (pageId, blockId, content) => {
        // Don't push history on every keystroke — only on meaningful changes
        // The caller should pushHistory for discrete actions
        set(state => {
          if (!state.survey) return
          const pageFound = findPage(state.survey, pageId)
          if (!pageFound) return
          const blockFound = findBlock(pageFound.page, blockId)
          if (!blockFound) return
          Object.assign(blockFound.block.content, content)
        })
        markDirty()
      },

      updateBlockMeta: (pageId, blockId, meta) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const pageFound = findPage(state.survey, pageId)
          if (!pageFound) return
          const blockFound = findBlock(pageFound.page, blockId)
          if (!blockFound) return
          // Deep merge style to preserve existing style properties
          if (meta.style) {
            blockFound.block.meta.style = { ...blockFound.block.meta.style, ...meta.style }
            const { style, ...rest } = meta
            Object.assign(blockFound.block.meta, rest)
          } else {
            Object.assign(blockFound.block.meta, meta)
          }
        })
        markDirty()
      },

      deleteBlock: (pageId, blockId) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (!found) return
          found.page.blocks = found.page.blocks.filter(b => b.id !== blockId)
          found.page.blocks.forEach((b, i) => { b.meta.position = i })
          if (state.selectedBlockId === blockId) state.selectedBlockId = null
          if (state.focusedBlockId === blockId) state.focusedBlockId = null
        })
        markDirty()
      },

      moveBlock: (fromPageId, toPageId, blockId, newPosition) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const fromFound = findPage(state.survey, fromPageId)
          if (!fromFound) return
          const blockFound = findBlock(fromFound.page, blockId)
          if (!blockFound) return

          // Remove from source
          const [block] = fromFound.page.blocks.splice(blockFound.index, 1)
          fromFound.page.blocks.forEach((b, i) => { b.meta.position = i })

          // Insert into target
          const toFound = findPage(state.survey, toPageId)
          if (!toFound) return
          const insertIdx = Math.min(newPosition, toFound.page.blocks.length)
          toFound.page.blocks.splice(insertIdx, 0, block)
          toFound.page.blocks.forEach((b, i) => { b.meta.position = i })
        })
        markDirty()
      },

      reorderBlocks: (pageId, orderedBlockIds) => {
        pushHistory()
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (!found) return
          const blockMap = new Map(found.page.blocks.map(b => [b.id, b]))
          found.page.blocks = orderedBlockIds
            .map(id => blockMap.get(id))
            .filter(Boolean) as Block[]
          found.page.blocks.forEach((b, i) => { b.meta.position = i })
        })
        markDirty()
      },

      duplicateBlock: (pageId, blockId) => {
        pushHistory()
        let newBlockId: string | null = null
        set(state => {
          if (!state.survey) return
          const found = findPage(state.survey, pageId)
          if (!found) return
          const blockFound = findBlock(found.page, blockId)
          if (!blockFound) return
          const clone: Block = JSON.parse(JSON.stringify(blockFound.block))
          clone.id = nanoid(10)
          if (clone.meta.questionId) {
            clone.meta.questionId = `q${nanoid(6)}`
          }
          found.page.blocks.splice(blockFound.index + 1, 0, clone)
          found.page.blocks.forEach((b, i) => { b.meta.position = i })
          newBlockId = clone.id
          state.selectedBlockId = clone.id
        })
        markDirty()
        return newBlockId
      },

      // --- Selection & Focus ---

      selectBlock: (blockId) => {
        set(state => { state.selectedBlockId = blockId })
      },

      focusBlock: (blockId) => {
        set(state => { state.focusedBlockId = blockId })
      },

      // --- Slash Menu ---

      openSlashMenu: (pageId, position, afterBlockId) => {
        set(state => {
          state.slashMenu = {
            isOpen: true,
            position,
            filter: '',
            afterBlockId: afterBlockId ?? null,
            pageId,
          }
        })
      },

      closeSlashMenu: () => {
        set(state => {
          state.slashMenu = { isOpen: false, position: null, filter: '', afterBlockId: null, pageId: null }
        })
      },

      setSlashMenuFilter: (filter) => {
        set(state => { state.slashMenu.filter = filter })
      },

      // --- History ---

      undo: () => {
        const { historyIndex, history } = get()
        if (historyIndex <= 0) return
        const newIndex = historyIndex - 1
        const snapshot = JSON.parse(history[newIndex]) as BlockEditorSurvey
        set(state => {
          state.survey = snapshot
          state.historyIndex = newIndex
          state.isDirty = true
        })
      },

      redo: () => {
        const { historyIndex, history } = get()
        if (historyIndex >= history.length - 1) return
        const newIndex = historyIndex + 1
        const snapshot = JSON.parse(history[newIndex]) as BlockEditorSurvey
        set(state => {
          state.survey = snapshot
          state.historyIndex = newIndex
          state.isDirty = true
        })
      },

      // --- Mode ---

      setEditorMode: (mode) => {
        set(state => { state.editorMode = mode })
      },

      // --- Computed ---

      getActivePage: () => {
        const { survey, activePageId } = get()
        if (!survey || !activePageId) return null
        return survey.pages.find(p => p.id === activePageId) ?? null
      },

      getBlock: (pageId, blockId) => {
        const { survey } = get()
        if (!survey) return null
        const found = findPage(survey, pageId)
        if (!found) return null
        return found.page.blocks.find(b => b.id === blockId) ?? null
      },

      getAllQuestionBlocks: () => {
        const { survey } = get()
        if (!survey) return []
        return survey.pages.flatMap(p =>
          p.blocks.filter(b => !['heading', 'paragraph', 'divider', 'spacer', 'image', 'video'].includes(b.type))
        )
      },
    }
  })
)
