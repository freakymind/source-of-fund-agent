"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Sparkles,
  FileText,
  Calculator,
  Scale,
  Building2,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentType } from "@/lib/sof-types"

export interface AgentActivity {
  id: string
  timestamp: Date
  agentType?: AgentType | "orchestrator"
  action: string
  detail?: string
  status: "running" | "complete" | "flagged" | "info"
}

interface AgentActivityFeedProps {
  activities: AgentActivity[]
  isProcessing: boolean
}

const agentConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, label: string }> = {
  orchestrator: { icon: Sparkles, color: "text-primary", label: "Orchestrator" },
  payroll: { icon: Calculator, color: "text-blue-500", label: "Payroll Agent" },
  banking: { icon: Building2, color: "text-emerald-500", label: "Banking Agent" },
  legal: { icon: Scale, color: "text-amber-500", label: "Legal Agent" },
  property: { icon: FileText, color: "text-violet-500", label: "Property Agent" },
}

function getStatusIcon(status: AgentActivity["status"]) {
  switch (status) {
    case "running":
      return <Loader2 className="w-3 h-3 animate-spin text-primary" />
    case "complete":
      return <CheckCircle2 className="w-3 h-3 text-success" />
    case "flagged":
      return <AlertTriangle className="w-3 h-3 text-destructive" />
    case "info":
      return <FileSearch className="w-3 h-3 text-muted-foreground" />
  }
}

function getStatusBadgeClass(status: AgentActivity["status"]) {
  switch (status) {
    case "running":
      return "bg-primary/10 text-primary border-primary/30"
    case "complete":
      return "bg-success/10 text-success border-success/30"
    case "flagged":
      return "bg-destructive/10 text-destructive border-destructive/30"
    case "info":
      return "bg-muted text-muted-foreground border-border"
  }
}

export function AgentActivityFeed({ activities, isProcessing }: AgentActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activities])

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)

  return (
    <Card className="flex flex-col h-full border-primary/20">
      <div className="p-3 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-foreground text-sm">
            <Bot className="w-4 h-4 text-primary" />
            Agent Activity
          </h3>
          {isProcessing && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary animate-pulse">
              Processing
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 space-y-2">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select an example case to see agent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = activity.agentType 
                ? agentConfig[activity.agentType] 
                : { icon: Bot, color: "text-muted-foreground", label: "System" }
              const Icon = config.icon

              return (
                <div 
                  key={activity.id}
                  className={cn(
                    "p-2 rounded-lg border transition-all",
                    activity.status === "running" 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-background border-border",
                    index === activities.length - 1 && activity.status === "running" && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn("mt-0.5", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground">{config.label}</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] px-1.5 py-0", getStatusBadgeClass(activity.status))}
                        >
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground">{activity.action}</p>
                      {activity.detail && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{activity.detail}</p>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Agent Legend */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground mb-2">Active Agents</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(agentConfig).slice(1).map(([key, { icon: Icon, color, label }]) => (
            <div key={key} className="flex items-center gap-1 text-[10px]">
              <Icon className={cn("w-3 h-3", color)} />
              <span className="text-muted-foreground">{label.replace(" Agent", "")}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
