'use client'

import { Save, Link2, ClipboardList, FileText, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onSave?: () => void
  onShare?: () => void
  onScenario?: () => void
  onPDF?: () => void
  onReset?: () => void
  statusMessage?: string
}

export function Header({
  onSave,
  onShare,
  onScenario,
  onPDF,
  onReset,
  statusMessage,
}: HeaderProps) {
  return (
    <header role="banner" className="header-gradient rounded-xl p-4 sm:p-6 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
          Mortgage Payment Calculator
        </h1>
        <p className="text-sm text-white/90">
          Primary Residence Analysis with Tax Benefits — All 50 States
        </p>
        <p className="hidden sm:block text-xs text-white/70">
          Data verified Feb 2026 · No data leaves your browser · Free &
          open-source
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-blue-700 rounded-lg hover:bg-white/90"
          onClick={onSave}
        >
          <Save className="size-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-blue-700 rounded-lg hover:bg-white/90"
          onClick={onShare}
        >
          <Link2 className="size-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-blue-700 rounded-lg hover:bg-white/90"
          onClick={onScenario}
        >
          <ClipboardList className="size-4" />
          <span className="hidden sm:inline">Scenario</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-blue-700 rounded-lg hover:bg-white/90"
          onClick={onPDF}
        >
          <FileText className="size-4" />
          <span className="hidden sm:inline">PDF</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/80 text-blue-700 rounded-lg hover:bg-white/70"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      {statusMessage && (
        <p className="mt-2 text-center text-xs text-white/80">
          {statusMessage}
        </p>
      )}
    </header>
  )
}
