import React from 'react';
import { Crosshair, Eye, X } from 'lucide-react';

interface EditModeTooltipProps {
  isEditMode: boolean;
  onToggle: () => void;
  selectedElement?: HTMLElement | null;
  onClearSelection?: () => void;
}

export const EditModeTooltip: React.FC<EditModeTooltipProps> = ({
  isEditMode,
  onToggle,
  selectedElement,
  onClearSelection,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Edit Mode Toggle - tooltip opens upwards */}
      <div className="relative group">
        <button
          onClick={onToggle}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${isEditMode 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
              : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-700/50 hover:text-zinc-300'
            }
          `}
          title={isEditMode ? 'Exit edit mode' : 'Enter edit mode to select elements'}
        >
          {isEditMode ? (
            <>
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Edit</span>
            </>
          )}
        </button>
        
        {/* Tooltip upwards */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          {isEditMode ? 'Click to exit edit mode' : 'Click to select elements'}
        </div>
      </div>

      {/* Selected Element Display */}
      {selectedElement && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-400 font-medium">
              {selectedElement.tagName.toLowerCase()}
              {selectedElement.id && `#${selectedElement.id}`}
              {selectedElement.className && `.${selectedElement.className.split(' ')[0]}`}
            </span>
          </div>
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="text-green-400 hover:text-green-300 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Edit Mode Indicator */}
      {isEditMode && !selectedElement && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-400">
            Hover over elements to select
          </span>
        </div>
      )}
    </div>
  );
};
