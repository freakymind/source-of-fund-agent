"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EXAMPLE_CASES, type ExampleCase } from "@/lib/mock-data"
import { Loader2, FileText, Sparkles, CheckCircle2, AlertTriangle, Clock, ChevronRight } from "lucide-react"

interface StageStatementProps {
  statement: string
  onStatementChange: (statement: string) => void
  onAnalyze: (caseId?: string) => void
  isProcessing: boolean
}

function getComplexityColor(complexity: ExampleCase["complexity"]) {
  switch (complexity) {
    case "simple":
      return "bg-success/10 text-success border-success/30"
    case "moderate":
      return "bg-warning/10 text-warning border-warning/30"
    case "complex":
      return "bg-primary/10 text-primary border-primary/30"
  }
}

function getScenarioIcon(scenario: string) {
  if (scenario.toLowerCase().includes("all documents") && scenario.toLowerCase().includes("success")) {
    return <CheckCircle2 className="w-4 h-4 text-success" />
  }
  if (scenario.toLowerCase().includes("missing")) {
    return <Clock className="w-4 h-4 text-warning" />
  }
  if (scenario.toLowerCase().includes("flag") || scenario.toLowerCase().includes("inconsisten")) {
    return <AlertTriangle className="w-4 h-4 text-destructive" />
  }
  return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
}

export function StageStatement({
  statement,
  onStatementChange,
  onAnalyze,
  isProcessing,
}: StageStatementProps) {

  const handleSelectCase = (caseItem: ExampleCase) => {
    onStatementChange(caseItem.statement)
    // Trigger analyze with the case ID
    setTimeout(() => onAnalyze(caseItem.id), 100)
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Stage 1: Statement Analysis</CardTitle>
              <CardDescription>
                Select an example case or paste a custom funding statement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Example Cases Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Example Cases (6 scenarios with varying complexity)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXAMPLE_CASES.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => handleSelectCase(caseItem)}
                  disabled={isProcessing}
                  className="group text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getComplexityColor(caseItem.complexity)}>
                        {caseItem.complexity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{caseItem.id.split("-")[1]}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h5 className="font-medium text-foreground mb-1">{caseItem.name}</h5>
                  <p className="text-xs text-muted-foreground mb-2">{caseItem.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {getScenarioIcon(caseItem.scenario)}
                    <span className="text-muted-foreground">{caseItem.scenario}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enter custom statement</span>
            </div>
          </div>

          {/* Custom Statement Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Custom Applicant Statement
            </label>
            <Textarea
              placeholder="Paste the applicant's source of funds statement here..."
              value={statement}
              onChange={(e) => onStatementChange(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={() => onAnalyze()}
            disabled={!statement.trim() || isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Custom Statement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-accent/30 border-accent">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3 text-foreground">Case Scenarios Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="font-medium text-foreground">Happy Path</span>
              </div>
              <p className="text-muted-foreground text-xs">Cases #1, #3: All documents present and validated</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="font-medium text-foreground">Missing Documents</span>
              </div>
              <p className="text-muted-foreground text-xs">Cases #2, #5: Some documents still pending upload</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-foreground">Plausibility Issues</span>
              </div>
              <p className="text-muted-foreground text-xs">Cases #4, #6: Documents present but flags raised</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
