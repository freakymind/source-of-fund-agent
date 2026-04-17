"use client"

import { cn } from "@/lib/utils"
import type { WorkflowStage } from "@/lib/sof-types"
import { FileText, CheckCircle, Bot, ClipboardList } from "lucide-react"

interface StageIndicatorProps {
  currentStage: WorkflowStage
  onStageClick?: (stage: WorkflowStage) => void
}

const stages = [
  { number: 1, label: "Statement Analysis", icon: FileText },
  { number: 2, label: "Document Checklist", icon: CheckCircle },
  { number: 3, label: "Agent Validation", icon: Bot },
  { number: 4, label: "Audit Report", icon: ClipboardList },
] as const

export function StageIndicator({ currentStage, onStageClick }: StageIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isActive = stage.number === currentStage
        const isComplete = stage.number < currentStage
        const isClickable = stage.number <= currentStage

        return (
          <div key={stage.number} className="flex items-center flex-1">
            <button
              onClick={() => isClickable && onStageClick?.(stage.number as WorkflowStage)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center gap-2 transition-all",
                isClickable && "cursor-pointer hover:opacity-80",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isComplete && "bg-success text-success-foreground",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px]",
                  isActive && "text-primary",
                  isComplete && "text-success",
                  !isActive && !isComplete && "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </button>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  stage.number < currentStage ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
