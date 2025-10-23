import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Edit2,
  Settings,
  Eye,
  Code,
  Terminal,
  Type,
  Palette,
  Minus,
  Plus,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Image,
  FileText,
  Layout,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  Mouse,
  Edit3,
  Eye as EyeIcon,
  Upload,
  Link,
  Hand,
  Video,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: {
    files: Record<string, string>;
    entry: string;
    dependencies?: string[];
    devDependencies?: string[];
  } | null;
}

type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface SelectedElement {
  id: string;
    tag: string;
    text: string;
    styles: Record<string, string>;
  type: 'text' | 'image' | 'button' | 'input' | 'div' | 'other';
}

interface ElementCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  elements: ElementItem[];
}

interface ElementItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'text' | 'image' | 'button' | 'input' | 'div' | 'shape';
  preview: string;
}

interface CursorTemplate {
  id: string;
  name: string;
  preview: string;
  type: 'pointer' | 'text' | 'wait' | 'crosshair' | 'help' | 'move' | 'grab' | 'grabbing' | 'custom';
}

const ElementsSidebar: React.FC<{
  onElementAdd: (element: ElementItem) => void;
  onElementHover?: (element: ElementItem | null) => void;
}> = ({ onElementAdd, onElementHover }) => {
  const [categories, setCategories] = useState<ElementCategory[]>([
    {
      id: 'layout',
      name: 'Layout',
      icon: Layout,
      expanded: true,
      elements: [
        { id: 'div', name: 'Container', icon: Square, type: 'div', preview: 'div' },
        { id: 'section', name: 'Section', icon: Grid3X3, type: 'div', preview: 'section' },
        { id: 'header', name: 'Header', icon: AlignLeft, type: 'div', preview: 'header' },
        { id: 'footer', name: 'Footer', icon: AlignCenter, type: 'div', preview: 'footer' },
      ]
    },
    {
      id: 'text',
      name: 'Text',
      icon: Type,
      expanded: true,
      elements: [
        { id: 'heading', name: 'Heading', icon: Type, type: 'text', preview: 'h1' },
        { id: 'paragraph', name: 'Paragraph', icon: FileText, type: 'text', preview: 'p' },
        { id: 'span', name: 'Text Span', icon: Minus, type: 'text', preview: 'span' },
        { id: 'blockquote', name: 'Quote', icon: AlignLeft, type: 'text', preview: 'blockquote' },
      ]
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: Edit3,
      expanded: false,
      elements: [
        { id: 'input', name: 'Text Input', icon: Edit3, type: 'input', preview: 'input' },
        { id: 'textarea', name: 'Text Area', icon: FileText, type: 'input', preview: 'textarea' },
        { id: 'select', name: 'Dropdown', icon: ChevronDown, type: 'input', preview: 'select' },
        { id: 'checkbox', name: 'Checkbox', icon: Square, type: 'input', preview: 'checkbox' },
        { id: 'radio', name: 'Radio', icon: Circle, type: 'input', preview: 'radio' },
        { id: 'button', name: 'Button', icon: Square, type: 'button', preview: 'button' },
      ]
    },
    {
      id: 'media',
      name: 'Media',
      icon: Image,
      expanded: false,
      elements: [
        { id: 'image', name: 'Image', icon: Image, type: 'image', preview: 'img' },
        { id: 'video', name: 'Video', icon: Video, type: 'image', preview: 'video' },
        { id: 'audio', name: 'Audio', icon: Music, type: 'image', preview: 'audio' },
      ]
    },
    {
      id: 'shapes',
      name: 'Shapes',
      icon: Triangle,
      expanded: false,
      elements: [
        { id: 'rectangle', name: 'Rectangle', icon: Square, type: 'shape', preview: 'rect' },
        { id: 'circle', name: 'Circle', icon: Circle, type: 'shape', preview: 'circle' },
        { id: 'triangle', name: 'Triangle', icon: Triangle, type: 'shape', preview: 'triangle' },
        { id: 'line', name: 'Line', icon: Minus, type: 'shape', preview: 'line' },
      ]
    },
    {
      id: 'interactive',
      name: 'Interactive',
      icon: MousePointer,
      expanded: false,
      elements: [
        { id: 'link', name: 'Link', icon: Link, type: 'button', preview: 'a' },
        { id: 'hover', name: 'Hover Area', icon: Mouse, type: 'div', preview: 'hover' },
        { id: 'click', name: 'Click Area', icon: Hand, type: 'button', preview: 'click' },
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.elements.length > 0 || searchTerm === '');

  return (
    <div className="p-4" style={{ backgroundColor: '#2A2A2A', color: 'white' }}>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3 text-sm rounded-xl focus:outline-none"
            style={{
              backgroundColor: '#1C1C1C',
              color: 'white',
              border: '1px solid #404040'
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredCategories.map(category => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-600 transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <category.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">{category.name}</span>
              </div>
              {category.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {category.expanded && (
              <div className="ml-7 mt-2 space-y-1">
                {category.elements.map(element => (
                  <div
                    key={element.id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-grab hover:bg-gray-600 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(element));
                    }}
                    onMouseEnter={() => onElementHover?.(element)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={() => onElementAdd(element)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded" style={{ backgroundColor: '#1C1C1C' }}>
                      <element.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-300">{element.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PropertiesPanel: React.FC<{
  selectedElement: SelectedElement | null;
  onElementUpdate: (updates: Record<string, string>) => void;
}> = ({ selectedElement, onElementUpdate }) => {
  const [activeSection, setActiveSection] = useState<'design' | 'layout' | 'effects' | 'cursor'>('design');

  // Cursor templates
  const cursorTemplates: CursorTemplate[] = [
    { id: 'pointer', name: 'Pointer', preview: 'default', type: 'pointer' },
    { id: 'text', name: 'Text', preview: 'text', type: 'text' },
    { id: 'crosshair', name: 'Crosshair', preview: 'crosshair', type: 'crosshair' },
    { id: 'grab', name: 'Grab', preview: 'grab', type: 'grab' },
    { id: 'help', name: 'Help', preview: 'help', type: 'help' },
    { id: 'wait', name: 'Wait', preview: 'wait', type: 'wait' },
    { id: 'move', name: 'Move', preview: 'move', type: 'move' },
  ];

  const predefinedEffects = [
    { id: 'fadeIn', name: 'Fade In', type: 'appear' },
    { id: 'slideUp', name: 'Slide Up', type: 'appear' },
    { id: 'slideDown', name: 'Slide Down', type: 'appear' },
    { id: 'slideLeft', name: 'Slide Left', type: 'appear' },
    { id: 'slideRight', name: 'Slide Right', type: 'appear' },
    { id: 'bounce', name: 'Bounce', type: 'appear' },
    { id: 'scale', name: 'Scale', type: 'appear' },
    { id: 'rotate', name: 'Rotate', type: 'appear' },
    { id: 'onPress', name: 'On Press', type: 'interaction' },
    { id: 'onHover', name: 'On Hover', type: 'interaction' },
    { id: 'onScroll', name: 'On Scroll', type: 'scroll' },
  ];

  if (!selectedElement) {
    return (
      <div className="p-4" style={{ backgroundColor: '#2A2A2A', color: 'white' }}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MousePointer className="w-8 h-8 mb-3 text-gray-400" />
          <p className="text-sm text-gray-400">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#2A2A2A', color: 'white' }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#1C1C1C' }}>
          {selectedElement.tag === 'div' ? (
            <Square className="w-4 h-4 text-gray-400" />
          ) : selectedElement.tag === 'button' ? (
            <Square className="w-4 h-4 text-gray-400" />
          ) : selectedElement.tag === 'input' ? (
            <Edit3 className="w-4 h-4 text-gray-400" />
          ) : selectedElement.tag === 'img' ? (
            <Image className="w-4 h-4 text-gray-400" />
          ) : (
            <FileText className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-white">
            {selectedElement.text || selectedElement.tag}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <button
          onClick={() => setActiveSection('design')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
            activeSection === 'design' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">Design</span>
        </button>
        <button
          onClick={() => setActiveSection('layout')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
            activeSection === 'layout' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span className="text-sm font-medium">Layout</span>
        </button>
        <button
          onClick={() => setActiveSection('effects')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
            activeSection === 'effects' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Effects</span>
        </button>
        <button
          onClick={() => setActiveSection('cursor')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
            activeSection === 'cursor' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Mouse className="w-4 h-4" />
          <span className="text-sm font-medium">Cursor</span>
        </button>
      </div>

      <div className="space-y-6">
        {activeSection === 'design' && (
          <div className="space-y-6">
            {/* Typography for text elements */}
            {selectedElement.type === 'text' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Typography</h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300">Font Size</label>
                    <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="8"
                        max="72"
                        defaultValue="16"
                        onChange={(e) => onElementUpdate({ fontSize: `${e.target.value}px` })}
                        className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-mono w-12 text-right text-gray-400">16px</span>
              </div>
            </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300">Font Weight</label>
                    <Select onValueChange={(value) => onElementUpdate({ fontWeight: value })}>
                      <SelectTrigger className="h-8" style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                        <SelectValue placeholder="Normal" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                        <SelectItem value="normal" style={{ color: 'white' }}>Normal</SelectItem>
                        <SelectItem value="bold" style={{ color: 'white' }}>Bold</SelectItem>
                        <SelectItem value="lighter" style={{ color: 'white' }}>Light</SelectItem>
                        <SelectItem value="100" style={{ color: 'white' }}>100</SelectItem>
                        <SelectItem value="200" style={{ color: 'white' }}>200</SelectItem>
                        <SelectItem value="300" style={{ color: 'white' }}>300</SelectItem>
                        <SelectItem value="400" style={{ color: 'white' }}>400</SelectItem>
                        <SelectItem value="500" style={{ color: 'white' }}>500</SelectItem>
                        <SelectItem value="600" style={{ color: 'white' }}>600</SelectItem>
                        <SelectItem value="700" style={{ color: 'white' }}>700</SelectItem>
                        <SelectItem value="800" style={{ color: 'white' }}>800</SelectItem>
                        <SelectItem value="900" style={{ color: 'white' }}>900</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300">Color</label>
                    <div className="flex items-center gap-3">
                <input
                  type="color"
                        defaultValue="#000000"
                        onChange={(e) => onElementUpdate({ color: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ borderColor: '#404040' }}
                      />
                      <span className="text-xs font-mono flex-1 text-gray-400">#000000</span>
                    </div>
              </div>
            </div>
          </div>
            )}

            {/* Background */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Background</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Background</label>
                  <div className="flex items-center gap-3">
                <input
                  type="color"
                      defaultValue="#ffffff"
                      onChange={(e) => onElementUpdate({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ borderColor: '#404040' }}
                    />
                    <span className="text-xs font-mono flex-1 text-gray-400">#ffffff</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Opacity</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="1"
                      onChange={(e) => onElementUpdate({ opacity: e.target.value })}
                      className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-12 text-right text-gray-400">100%</span>
                  </div>
              </div>
            </div>
          </div>

            {/* Border */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Border</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Border Width</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      defaultValue="0"
                      onChange={(e) => onElementUpdate({ borderWidth: `${e.target.value}px` })}
                      className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-12 text-right text-gray-400">0px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Border Color</label>
                  <div className="flex items-center gap-3">
                <input
                  type="color"
                      defaultValue="#000000"
                      onChange={(e) => onElementUpdate({ borderColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ borderColor: '#404040' }}
                    />
                    <span className="text-xs font-mono flex-1 text-gray-400">#000000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Border Radius</label>
                  <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                      defaultValue="0"
                      onChange={(e) => onElementUpdate({ borderRadius: `${e.target.value}px` })}
                      className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-12 text-right text-gray-400">0px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transform */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Transform</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Rotation</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      defaultValue="0"
                      onChange={(e) => onElementUpdate({ transform: `rotate(${e.target.value}deg)` })}
                      className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-12 text-right text-gray-400">0°</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Scale</label>
                  <div className="flex items-center gap-3">
                <input
                  type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      defaultValue="1"
                      onChange={(e) => onElementUpdate({ transform: `scale(${e.target.value})` })}
                      className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-12 text-right text-gray-400">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Visibility</h3>

              <Button
                onClick={() => onElementUpdate({
                  visibility: selectedElement.styles.visibility === 'hidden' ? 'visible' : 'hidden'
                })}
                className={`w-full justify-start ${selectedElement.styles.visibility !== 'hidden' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                {selectedElement.styles.visibility !== 'hidden' ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          </div>
        )}

        {activeSection === 'layout' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Position</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">X Position</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => onElementUpdate({ left: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Y Position</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => onElementUpdate({ top: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Position Type</label>
                  <Select onValueChange={(value) => onElementUpdate({ position: value })}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="Static" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="static" style={{ color: 'white' }}>Static</SelectItem>
                      <SelectItem value="relative" style={{ color: 'white' }}>Relative</SelectItem>
                      <SelectItem value="absolute" style={{ color: 'white' }}>Absolute</SelectItem>
                      <SelectItem value="fixed" style={{ color: 'white' }}>Fixed</SelectItem>
                      <SelectItem value="sticky" style={{ color: 'white' }}>Sticky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Size</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Width</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="100"
                      onChange={(e) => onElementUpdate({ width: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Height</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="100"
                      onChange={(e) => onElementUpdate({ height: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Size Type</label>
                  <Select onValueChange={(value) => {
                    if (value === 'fill') {
                      onElementUpdate({ width: '100%', height: '100%' });
                    } else if (value === 'fit') {
                      onElementUpdate({ width: 'auto', height: 'auto' });
                    }
                  }}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="Fixed" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="fixed" style={{ color: 'white' }}>Fixed</SelectItem>
                      <SelectItem value="fill" style={{ color: 'white' }}>Fill</SelectItem>
                      <SelectItem value="fit" style={{ color: 'white' }}>Fit Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Alignment</h3>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementUpdate({ textAlign: 'left' })}
                  className="h-8 w-8 p-0"
                  style={{ borderColor: '#404040' }}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementUpdate({ textAlign: 'center' })}
                  className="h-8 w-8 p-0"
                  style={{ borderColor: '#404040' }}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementUpdate({ textAlign: 'right' })}
                  className="h-8 w-8 p-0"
                  style={{ borderColor: '#404040' }}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementUpdate({ textAlign: 'justify' })}
                  className="h-8 w-8 p-0"
                  style={{ borderColor: '#404040' }}
                >
                  <AlignJustify className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Spacing</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Padding</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => onElementUpdate({ padding: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Margin</label>
                  <div className="flex items-center gap-2">
                <input
                      type="number"
                      placeholder="0"
                  onChange={(e) => onElementUpdate({ margin: `${e.target.value}px` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeSection === 'effects' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Animation Effects</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">On Appear</label>
                  <Select onValueChange={(value) => onElementUpdate({ animation: value })}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="" style={{ color: 'white' }}>None</SelectItem>
                      {predefinedEffects.filter(e => e.type === 'appear').map(effect => (
                        <SelectItem key={effect.id} value={effect.id} style={{ color: 'white' }}>{effect.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
          </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">On Press</label>
                  <Select onValueChange={(value) => onElementUpdate({ pressEffect: value })}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="" style={{ color: 'white' }}>None</SelectItem>
                      {predefinedEffects.filter(e => e.type === 'interaction').map(effect => (
                        <SelectItem key={effect.id} value={effect.id} style={{ color: 'white' }}>{effect.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">On Scroll</label>
                  <Select onValueChange={(value) => onElementUpdate({ scrollEffect: value })}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="" style={{ color: 'white' }}>None</SelectItem>
                      {predefinedEffects.filter(e => e.type === 'scroll').map(effect => (
                        <SelectItem key={effect.id} value={effect.id} style={{ color: 'white' }}>{effect.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Animation Settings</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.3"
                      step="0.1"
                      onChange={(e) => onElementUpdate({ animationDuration: `${e.target.value}s` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Delay</label>
                  <div className="flex items-center gap-2">
                <input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      onChange={(e) => onElementUpdate({ animationDelay: `${e.target.value}s` })}
                      className="flex-1 h-8 px-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: '#1C1C1C',
                        borderColor: '#404040',
                        color: 'white'
                      }}
                    />
                    <span className="text-xs text-gray-400">s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Easing</label>
                  <Select onValueChange={(value) => onElementUpdate({ animationTimingFunction: value })}>
                    <SelectTrigger style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}>
                      <SelectValue placeholder="Ease" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#1C1C1C', borderColor: '#404040' }}>
                      <SelectItem value="ease" style={{ color: 'white' }}>Ease</SelectItem>
                      <SelectItem value="ease-in" style={{ color: 'white' }}>Ease In</SelectItem>
                      <SelectItem value="ease-out" style={{ color: 'white' }}>Ease Out</SelectItem>
                      <SelectItem value="ease-in-out" style={{ color: 'white' }}>Ease In Out</SelectItem>
                      <SelectItem value="linear" style={{ color: 'white' }}>Linear</SelectItem>
                      <SelectItem value="cubic-bezier(0.4, 0, 0.2, 1)" style={{ color: 'white' }}>Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cursor' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Cursor Templates</h3>

              <div className="grid grid-cols-3 gap-2">
                {cursorTemplates.map(cursor => (
                  <Button
                    key={cursor.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onElementUpdate({ cursor: cursor.preview })}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    title={cursor.name}
                    style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded"
                      style={{
                        cursor: cursor.preview,
                        backgroundColor: '#2A2A2A'
                      }}
                    >
                      <Mouse className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-300">{cursor.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Custom Cursor</h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Upload Image</label>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        onElementUpdate({ cursor: `url(${url}), auto` });
                      }
                    }}
                    className="hidden"
                    id="cursor-upload"
                  />
                  <label htmlFor="cursor-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      style={{ backgroundColor: '#1C1C1C', borderColor: '#404040', color: 'white' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle }) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [sidebarView, setSidebarView] = useState<'preview' | 'code' | 'console'>('preview');
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementItem | null>(null);
  const [canvasElements, setCanvasElements] = useState<SelectedElement[]>([]);

  const handleElementAdd = (element: ElementItem) => {
    const newElement: SelectedElement = {
      id: `element-${Date.now()}`,
      tag: element.preview,
      text: element.name,
      styles: {},
      type: element.type,
    };

    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const handleElementUpdate = (updates: Record<string, string>) => {
    if (!selectedElement) return;

    setCanvasElements(prev =>
      prev.map(el =>
        el.id === selectedElement.id
          ? { ...el, styles: { ...el.styles, ...updates } }
          : el
      )
    );

    setSelectedElement(prev =>
      prev ? { ...prev, styles: { ...prev.styles, ...updates } } : null
    );
  };

  const handleElementSelect = (element: SelectedElement) => {
    setSelectedElement(element);
  };

  const handleOpenInNewTab = () => {
    window.open(`/project/${projectId}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1C1C1C' }}>
      {/* Top Control Container */}
      <div className="flex items-center justify-center p-6" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#2A2A2A' }}>
          <Button
            onClick={handleOpenInNewTab}
            className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-xl"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <div className="w-px h-6" style={{ backgroundColor: '#404040' }} />

          <Button
            variant={device === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('desktop')}
            className="px-3 py-2 rounded-xl"
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={device === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('tablet')}
            className="px-3 py-2 rounded-xl"
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Tablet
          </Button>
          <Button
            variant={device === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('mobile')}
            className="px-3 py-2 rounded-xl"
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>

          <div className="w-px h-6" style={{ backgroundColor: '#404040' }} />

          <Button variant="ghost" size="sm" className="px-3 py-2 rounded-xl">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-2 rounded-xl">
            <Code className="w-4 h-4 mr-1" />
            Code
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-2 rounded-xl">
            <Terminal className="w-4 h-4 mr-1" />
            Console
          </Button>
          <Button variant="ghost" size="sm" className="px-3 py-2 rounded-xl">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="flex-1 grid grid-cols-[300px_1fr_340px] gap-6 p-6 h-[calc(100vh-120px)]">
        {/* Left Sidebar - Elements */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
          <ElementsSidebar
            onElementAdd={handleElementAdd}
            onElementHover={setHoveredElement}
          />
        </div>

        {/* Center - Preview Canvas */}
        <div className="flex items-center justify-center rounded-2xl overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
          <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
            device === 'desktop' ? 'w-full h-[600px] max-w-[1000px]' :
            device === 'tablet' ? 'w-[768px] h-[900px]' :
            'w-[375px] h-[667px]'
          }`}>
            {sandboxBundle ? (
              <div className="relative w-full h-full">
                <iframe
                  src={`/project/${projectId}?sandbox=1`}
                  className="w-full h-full border-none"
                  title="Survey Preview"
                />

                {/* Overlay canvas elements for visual editing */}
                <div className="absolute inset-0 pointer-events-none">
                  {canvasElements.map(element => (
                    <div
                      key={element.id}
                      className={`pointer-events-auto cursor-pointer border-2 transition-all duration-150 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                        selectedElement?.id === element.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-300'
                      }`}
                      style={element.styles}
                      onClick={() => handleElementSelect(element)}
                    >
                      {element.type === 'text' && (
                        <span>{element.text}</span>
                      )}
                      {element.type === 'button' && (
                        <Button size="sm">{element.text}</Button>
                      )}
                      {element.type === 'image' && (
                        <div className="bg-gray-100 border border-gray-300 rounded flex items-center justify-center min-w-[60px] min-h-[60px]">
                          <Image className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      {element.type === 'input' && (
                        <input
                          type="text"
                          placeholder={element.text}
                          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                      {element.type === 'div' && (
                        <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-600">
                          {element.text}
                        </div>
                      )}
                      {element.type === 'shape' && (
                        <div className="bg-blue-500 rounded flex items-center justify-center">
                          {element.tag === 'circle' && <Circle className="w-5 h-5 text-white" />}
                          {element.tag === 'rectangle' && <Square className="w-5 h-5 text-white" />}
                          {element.tag === 'triangle' && <Triangle className="w-5 h-5 text-white" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-50">
                <div className="text-center">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Drag elements from the left sidebar to start creating your survey
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
          <PropertiesPanel
              selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            />
          </div>
      </div>

    </div>
  );
};
