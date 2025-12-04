'use client'

import { Button } from '@/components/ui/button'
import { 
  Highlighter, 
  MessageSquare, 
  Underline, 
  Strikethrough,
  Eraser,
  Type
} from 'lucide-react'

interface PdfToolbarProps {
  selectedTool: 'none' | 'highlight' | 'comment' | 'underline' | 'strikethrough'
  onToolSelect: (tool: 'none' | 'highlight' | 'comment' | 'underline' | 'strikethrough') => void
  highlightColor: string
  onColorSelect: (color: string) => void
}

const COLORS = [
  { name: 'yellow', value: '#FFFF00' },
  { name: 'green', value: '#00FF00' },
  { name: 'blue', value: '#0096FF' },
  { name: 'pink', value: '#FFC0CB' },
  { name: 'orange', value: '#FFA500' },
]

export function PdfToolbar({
  selectedTool,
  onToolSelect,
  highlightColor,
  onColorSelect,
}: PdfToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-lg shadow-sm">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Annotation Tools:
      </span>
      
      {/* Highlight Tool */}
      <Button
        size="sm"
        variant={selectedTool === 'highlight' ? 'default' : 'outline'}
        onClick={() => onToolSelect(selectedTool === 'highlight' ? 'none' : 'highlight')}
        title="Highlight text"
      >
        <Highlighter className="w-4 h-4" />
      </Button>

      {/* Underline Tool */}
      <Button
        size="sm"
        variant={selectedTool === 'underline' ? 'default' : 'outline'}
        onClick={() => onToolSelect(selectedTool === 'underline' ? 'none' : 'underline')}
        title="Underline text"
      >
        <Underline className="w-4 h-4" />
      </Button>

      {/* Strikethrough Tool */}
      <Button
        size="sm"
        variant={selectedTool === 'strikethrough' ? 'default' : 'outline'}
        onClick={() => onToolSelect(selectedTool === 'strikethrough' ? 'none' : 'strikethrough')}
        title="Strikethrough text"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>

      {/* Comment Tool */}
      <Button
        size="sm"
        variant={selectedTool === 'comment' ? 'default' : 'outline'}
        onClick={() => onToolSelect(selectedTool === 'comment' ? 'none' : 'comment')}
        title="Add comment"
      >
        <MessageSquare className="w-4 h-4" />
      </Button>

      {/* Eraser Tool */}
      <Button
        size="sm"
        variant={selectedTool === 'none' ? 'default' : 'outline'}
        onClick={() => onToolSelect('none')}
        title="Clear selection"
      >
        <Eraser className="w-4 h-4" />
      </Button>

      {/* Color Picker - show when text annotation tool is selected */}
      {(selectedTool === 'highlight' || selectedTool === 'underline' || selectedTool === 'strikethrough') && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <span className="text-sm text-muted-foreground">Color:</span>
          <div className="flex gap-1">
            {COLORS.map(color => (
              <button
                key={color.name}
                className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                  highlightColor === color.name 
                    ? 'border-gray-800 dark:border-white ring-2 ring-offset-1 ring-gray-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => onColorSelect(color.name)}
                aria-label={`Select ${color.name} color`}
                title={color.name}
              />
            ))}
          </div>
        </>
      )}

      {/* Tool hint */}
      {selectedTool !== 'none' && (
        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-1">
          <Type className="w-3 h-3" />
          {selectedTool === 'highlight' && 'Select text to highlight'}
          {selectedTool === 'underline' && 'Select text to underline'}
          {selectedTool === 'strikethrough' && 'Select text to strikethrough'}
          {selectedTool === 'comment' && 'Click anywhere to add a comment'}
        </div>
      )}
    </div>
  )
}
