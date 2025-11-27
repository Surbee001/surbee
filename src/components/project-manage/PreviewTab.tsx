import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
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
import { themeColors } from '@/lib/theme/colors';

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: {
    files: Record<string, string>;
    entry: string;
    dependencies?: string[];
    devDependencies?: string[];
  } | null;
  activeChatSessionId?: string | null;
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
    <div style={{
      backgroundColor: themeColors.dark.background.secondary,
      color: themeColors.dark.foreground.primary,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Search Header */}
      <div style={{
        padding: '15px',
        borderBottom: `1px solid ${themeColors.dark.border.primary}`
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              paddingLeft: '32px',
              paddingRight: '8px',
              backgroundColor: themeColors.dark.input.background,
              color: themeColors.dark.foreground.primary,
              border: `1px solid ${themeColors.dark.input.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              outline: 'none',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />
          <Search style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '14px',
            height: '14px',
            color: themeColors.dark.foreground.muted
          }} />
        </div>
      </div>

      {/* Scrollable Categories */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 15px 15px',
      }}>
        {filteredCategories.map(category => (
          <div key={category.id} style={{ position: 'relative', width: '100%' }}>
            {/* Panel Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              style={{
                width: '100%',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderTop: `1px solid ${themeColors.dark.border.primary}`,
                backgroundColor: 'transparent',
                border: 'none',
                color: themeColors.dark.foreground.primary,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <category.icon style={{ width: '16px', height: '16px', marginRight: '8px', color: themeColors.dark.foreground.muted }} />
              <span>{category.name}</span>
              <div style={{ flex: '1' }} />
              {category.expanded ? (
                <ChevronDown style={{ width: '14px', height: '14px', color: themeColors.dark.foreground.muted }} />
              ) : (
                <ChevronRight style={{ width: '14px', height: '14px', color: themeColors.dark.foreground.muted }} />
              )}
            </button>

            {/* Panel Content */}
            {category.expanded && (
              <div style={{ paddingBottom: '10px' }}>
                {category.elements.map(element => (
                  <div
                    key={element.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(element));
                    }}
                    onMouseEnter={() => onElementHover?.(element)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={() => onElementAdd(element)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      marginBottom: '2px',
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      cursor: 'grab',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = themeColors.dark.sidebar.hover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: themeColors.dark.background.primary,
                      borderRadius: '6px',
                      marginRight: '10px',
                    }}>
                      <element.icon style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: themeColors.dark.foreground.primary,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                      {element.name}
                    </span>
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
      <div style={{
        backgroundColor: themeColors.dark.background.secondary,
        color: themeColors.dark.foreground.primary,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <MousePointer style={{ width: '32px', height: '32px', color: themeColors.dark.foreground.muted, marginBottom: '12px' }} />
        <p style={{
          fontSize: '12px',
          color: themeColors.dark.foreground.muted,
          textAlign: 'center',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: themeColors.dark.background.secondary,
      color: themeColors.dark.foreground.primary,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Selected Element Header */}
      <div style={{
        padding: '15px',
        borderBottom: `1px solid ${themeColors.dark.border.primary}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: themeColors.dark.background.primary,
          borderRadius: '6px',
        }}>
          {selectedElement.tag === 'div' ? (
            <Square style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
          ) : selectedElement.tag === 'button' ? (
            <Square style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
          ) : selectedElement.tag === 'input' ? (
            <Edit3 style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
          ) : selectedElement.tag === 'img' ? (
            <Image style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
          ) : (
            <FileText style={{ width: '16px', height: '16px', color: themeColors.dark.foreground.muted }} />
          )}
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: themeColors.dark.foreground.primary,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          {selectedElement.text || selectedElement.tag}
        </span>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 15px 15px',
      }}>
        {/* Section Panels */}
        <div>
          {/* Design Panel */}
          <button
            onClick={() => setActiveSection('design')}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderTop: `1px solid ${themeColors.dark.border.primary}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: activeSection === 'design' ? themeColors.dark.accent.primary : themeColors.dark.foreground.primary,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <Palette style={{ width: '16px', height: '16px', marginRight: '8px', color: activeSection === 'design' ? themeColors.dark.accent.primary : themeColors.dark.foreground.muted }} />
            <span>Design</span>
            <div style={{ flex: '1' }} />
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: themeColors.dark.foreground.muted,
              transform: activeSection === 'design' ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Layout Panel */}
          <button
            onClick={() => setActiveSection('layout')}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderTop: `1px solid ${themeColors.dark.border.primary}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: activeSection === 'layout' ? themeColors.dark.accent.primary : themeColors.dark.foreground.primary,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <Layout style={{ width: '16px', height: '16px', marginRight: '8px', color: activeSection === 'layout' ? themeColors.dark.accent.primary : themeColors.dark.foreground.muted }} />
            <span>Layout</span>
            <div style={{ flex: '1' }} />
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: themeColors.dark.foreground.muted,
              transform: activeSection === 'layout' ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Effects Panel */}
          <button
            onClick={() => setActiveSection('effects')}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderTop: `1px solid ${themeColors.dark.border.primary}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: activeSection === 'effects' ? themeColors.dark.accent.primary : themeColors.dark.foreground.primary,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <Zap style={{ width: '16px', height: '16px', marginRight: '8px', color: activeSection === 'effects' ? themeColors.dark.accent.primary : themeColors.dark.foreground.muted }} />
            <span>Effects</span>
            <div style={{ flex: '1' }} />
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: themeColors.dark.foreground.muted,
              transform: activeSection === 'effects' ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Cursor Panel */}
          <button
            onClick={() => setActiveSection('cursor')}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderTop: `1px solid ${themeColors.dark.border.primary}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: activeSection === 'cursor' ? themeColors.dark.accent.primary : themeColors.dark.foreground.primary,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <Mouse style={{ width: '16px', height: '16px', marginRight: '8px', color: activeSection === 'cursor' ? themeColors.dark.accent.primary : themeColors.dark.foreground.muted }} />
            <span>Cursor</span>
            <div style={{ flex: '1' }} />
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: themeColors.dark.foreground.muted,
              transform: activeSection === 'cursor' ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }} />
          </button>
        </div>

        {/* Panel Content Area */}
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
                    style={{ backgroundColor: themeColors.dark.background.primary, borderColor: themeColors.dark.border.primary, color: themeColors.dark.foreground.primary }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded"
                      style={{
                        cursor: cursor.preview,
                        backgroundColor: themeColors.dark.background.tertiary
                      }}
                    >
                      <Mouse className="w-4 h-4" style={{ color: themeColors.dark.foreground.muted }} />
                    </div>
                    <span className="text-xs" style={{ color: themeColors.dark.foreground.secondary }}>{cursor.name}</span>
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
                      style={{ backgroundColor: themeColors.dark.background.primary, borderColor: themeColors.dark.border.primary, color: themeColors.dark.foreground.primary }}
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
    </div>
  );
};

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle, activeChatSessionId }) => {
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

  const [selectedTool, setSelectedTool] = useState<'select' | 'cursor'>('select');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      {/* Main Single-Column Layout - Preview Only */}
      <div className="flex-1 flex items-center justify-center px-6 pt-3 pb-32 h-full">
        {/* Center - Preview Canvas - Enlarged */}
        <div className="flex items-center justify-center overflow-hidden w-full h-full max-w-[1400px]">
          <div className={`bg-white overflow-hidden transition-all duration-300 ${
            device === 'desktop' ? 'w-full h-full rounded-2xl' :
            device === 'tablet' ? 'w-[768px] h-full rounded-2xl' :
            'w-[375px] h-[667px] rounded-2xl'
          }`} style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {sandboxBundle ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <iframe
                  src={`/project/${projectId}?sandbox=1${activeChatSessionId ? `&sessionId=${activeChatSessionId}` : ''}`}
                  className="w-full h-full border-none rounded-2xl"
                  title="Survey Preview"
                />
              </div>
              ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Survey preview will appear here
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/*
      ========================================
      PREVIEW TASKBAR - COMMENTED OUT FOR LATER USE
      ========================================
      This section contains a Framer-style floating toolbar that was removed.
      The code has been deleted to avoid syntax conflicts with nested comments.
      Refer to git history if you need to restore this feature.
      ========================================
      */}
    </div>
  );
};
