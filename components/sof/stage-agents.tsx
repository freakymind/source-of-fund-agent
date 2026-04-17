"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FundingSource, ValidationResult, AgentType } from "@/lib/sof-types"
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Info,
  Banknote,
  Scale,
  Building2,
  User,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StageAgentsProps {
  fundingSources: FundingSource[]
  onRerunAgent: (agentType: AgentType, documentId: string) => void
  onGenerateReport: () => void
  isProcessing: boolean
}

const agentConfig: Record<
  AgentType,
  { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  payroll: { name: "Payroll Agent", icon: User, color: "bg-blue-500" },
  banking: { name: "Banking Agent", icon: Banknote, color: "bg-emerald-500" },
  legal: { name: "Legal Agent", icon: Scale, color: "bg-amber-500" },
  property: { name: "Property Agent", icon: Building2, color: "bg-violet-500" },
}

function getMatchIcon(status: "match" | "partial" | "mismatch") {
  switch (status) {
    case "match":
      return <CheckCircle2 className="w-4 h-4 text-success" />
    case "partial":
      return <Info className="w-4 h-4 text-warning" />
    case "mismatch":
      return <AlertTriangle className="w-4 h-4 text-destructive" />
  }
}

function ValidationResultCard({
  result,
  documentName,
  onRerun,
}: {
  result: ValidationResult
  documentName: string
  onRerun: () => void
}) {
  const agent = agentConfig[result.agentType]
  const AgentIcon = agent.icon

  return (
    <Card className={cn(
      "border-l-4",
      result.status === "valid" && "border-l-success",
      result.status === "flagged" && "border-l-destructive",
      result.status === "warning" && "border-l-warning"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", agent.color)}>
              <AgentIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{documentName}</CardTitle>
              <CardDescription className="text-xs">
                Processed by {agent.name}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                result.status === "valid" && "bg-success text-success-foreground",
                result.status === "flagged" && "bg-destructive text-destructive-foreground",
                result.status === "warning" && "bg-warning text-warning-foreground"
              )}
            >
              {result.status === "valid" ? "VALID" : result.status === "flagged" ? "FLAGGED" : "WARNING"}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onRerun}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Extracted Data */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Extracted Data
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {result.extractedData.map((item, i) => (
              <div key={i} className="p-2 bg-accent/50 rounded text-sm">
                <span className="text-muted-foreground">{item.label}:</span>{" "}
                <span className="font-medium text-foreground">{item.value}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({Math.round(item.confidence * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Matches */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Statement Matches
          </h4>
          <div className="space-y-2">
            {result.matches.map((match, i) => (
              <div
                key={i}
                className="p-3 bg-accent/30 rounded border border-border/50"
              >
                <div className="flex items-start gap-2">
                  {getMatchIcon(match.status)}
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Claim:</span>{" "}
                      <span className="font-medium text-foreground">{match.statementClaim}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Evidence:</span>{" "}
                      <span className="text-foreground">{match.documentEvidence}</span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      match.status === "match" && "border-success text-success",
                      match.status === "partial" && "border-warning text-warning",
                      match.status === "mismatch" && "border-destructive text-destructive"
                    )}
                  >
                    {match.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        {result.flags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Flags & Issues
            </h4>
            <div className="space-y-2">
              {result.flags.map((flag, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded border",
                    flag.severity === "high" && "bg-destructive/10 border-destructive/30",
                    flag.severity === "medium" && "bg-warning/10 border-warning/30",
                    flag.severity === "low" && "bg-info/10 border-info/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={cn(
                        "text-xs",
                        flag.severity === "high" && "bg-destructive",
                        flag.severity === "medium" && "bg-warning",
                        flag.severity === "low" && "bg-info"
                      )}
                    >
                      {flag.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{flag.message}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-2">
                    Recommendation: {flag.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="p-3 bg-primary/5 rounded border border-primary/20">
          <p className="text-sm text-foreground">{result.summary}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function StageAgents({
  fundingSources,
  onRerunAgent,
  onGenerateReport,
  isProcessing,
}: StageAgentsProps) {
  const allValidated = fundingSources.every((fs) =>
    fs.requiredDocuments.every(
      (doc) => doc.status === "validated" || doc.status === "flagged"
    )
  )

  const validatedDocs = fundingSources.flatMap((fs) =>
    fs.requiredDocuments.filter((doc) => doc.validationResult)
  )

  const validCount = validatedDocs.filter(
    (doc) => doc.validationResult?.status === "valid"
  ).length
  const flaggedCount = validatedDocs.filter(
    (doc) => doc.validationResult?.status === "flagged"
  ).length

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Stage 3: Agent Validation</CardTitle>
                <CardDescription>
                  Specialized agents have processed and validated your documents
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">{validCount}</p>
                <p className="text-xs text-muted-foreground">Valid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{flaggedCount}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Agent Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(Object.keys(agentConfig) as AgentType[]).map((type) => {
              const config = agentConfig[type]
              const Icon = config.icon
              const docsForAgent = validatedDocs.filter(
                (doc) => doc.validationResult?.agentType === type
              )
              return (
                <Card key={type} className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{config.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {docsForAgent.length} docs
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Validation Results */}
          <div className="space-y-4">
            {fundingSources.map((source) =>
              source.requiredDocuments
                .filter((doc) => doc.validationResult)
                .map((doc) => (
                  <ValidationResultCard
                    key={doc.id}
                    result={doc.validationResult!}
                    documentName={doc.name}
                    onRerun={() =>
                      onRerunAgent(doc.validationResult!.agentType, doc.id)
                    }
                  />
                ))
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              onClick={onGenerateReport}
              disabled={!allValidated || isProcessing}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Generate Audit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
