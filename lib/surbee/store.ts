import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DNAMix, AtomStyle, SurveyAtom } from './types';
import { generateStyle } from './dna-engine';

interface SurveyState {
  // Core state
  atoms: SurveyAtom[];
  currentDNA: DNAMix;
  currentStyle: AtomStyle;
  history: SurveyState[];
  historyIndex: number;

  // UI state
  selectedAtomId: string | null;
  isGenerating: boolean;

  // Actions
  addAtom: (atom: Omit<SurveyAtom, 'id' | 'style'>) => void;
  updateAtom: (id: string, props: Partial<SurveyAtom>) => void;
  removeAtom: (id: string) => void;
  reorderAtoms: (fromIndex: number, toIndex: number) => void;

  // DNA actions
  updateDNA: (newDNA: DNAMix) => void;
  lockDNAProperty: (property: keyof DNAMix) => void;
  unlockDNAProperty: (property: keyof DNAMix) => void;
  suggestAlternatives: () => void;

  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Export
  exportSurvey: () => { atoms: SurveyAtom[]; dna: DNAMix; style: AtomStyle };
}

const initialState: Omit<SurveyState, 'actions'> = {
  atoms: [],
  currentDNA: {
    Academic: 30,
    TypeformPro: 20,
    Corporate: 20,
    Minimalist: 15,
    Playful: 15,
  },
  currentStyle: generateStyle({
    Academic: 30,
    TypeformPro: 20,
    Corporate: 20,
    Minimalist: 15,
    Playful: 15,
  }),
  history: [],
  historyIndex: -1,
  selectedAtomId: null,
  isGenerating: false,
};

export const useSurveyStore = create<SurveyState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addAtom: (atomData) => {
        const { currentStyle } = get();
        const newAtom: SurveyAtom = {
          id: `atom-${Date.now()}`,
          style: currentStyle,
          position: get().atoms.length,
          ...atomData,
        };

        set((state) => ({
          atoms: [...state.atoms, newAtom],
        }));
        get().saveToHistory();
      },

      updateAtom: (id, props) => {
        set((state) => ({
          atoms: state.atoms.map((atom) =>
            atom.id === id ? { ...atom, ...props } : atom,
          ),
        }));
        get().saveToHistory();
      },

      removeAtom: (id) => {
        set((state) => ({
          atoms: state.atoms.filter((atom) => atom.id !== id),
        }));
        get().saveToHistory();
      },

      reorderAtoms: (fromIndex, toIndex) => {
        set((state) => {
          const newAtoms = [...state.atoms];
          const [movedAtom] = newAtoms.splice(fromIndex, 1);
          newAtoms.splice(toIndex, 0, movedAtom);

          // Update positions
          newAtoms.forEach((atom, index) => {
            atom.position = index;
          });

          return { atoms: newAtoms };
        });
        get().saveToHistory();
      },

      updateDNA: (newDNA) => {
        const newStyle = generateStyle(newDNA);
        set((state) => ({
          currentDNA: newDNA,
          currentStyle: newStyle,
          atoms: state.atoms.map((atom) => ({
            ...atom,
            style: newStyle,
          })),
        }));
        get().saveToHistory();
      },

      lockDNAProperty: (property) => {
        // Implementation for locking DNA properties
        console.log('Locking DNA property:', property);
      },

      unlockDNAProperty: (property) => {
        // Implementation for unlocking DNA properties
        console.log('Unlocking DNA property:', property);
      },

      suggestAlternatives: () => {
        const { currentDNA } = get();
        const alternatives = [
          { ...currentDNA, Academic: Math.min(100, currentDNA.Academic + 20) },
          {
            ...currentDNA,
            TypeformPro: Math.min(100, currentDNA.TypeformPro + 20),
          },
          { ...currentDNA, Playful: Math.min(100, currentDNA.Playful + 20) },
        ];

        // For now, just log alternatives
        console.log('Suggested alternatives:', alternatives);
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const previousState = history[historyIndex - 1];
          set({
            ...previousState,
            historyIndex: historyIndex - 1,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const nextState = history[historyIndex + 1];
          set({
            ...nextState,
            historyIndex: historyIndex + 1,
          });
        }
      },

      saveToHistory: () => {
        const { atoms, currentDNA, currentStyle, history, historyIndex } =
          get();
        const currentState = { atoms, currentDNA, currentStyle };

        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentState);

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      exportSurvey: () => {
        const { atoms, currentDNA, currentStyle } = get();
        return { atoms, dna: currentDNA, style: currentStyle };
      },
    }),
    {
      name: 'survey-store',
    },
  ),
);
