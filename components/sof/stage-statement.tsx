"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MOCK_STATEMENT } from "@/lib/mock-data"
import { Loader2, FileText, Sparkles } from "lucide-react"

interface StageStatementProps {
  statement: string
  onStatementChange: (statement: string) => void
  onAnalyze: () => void
  isProcessing: boolean
}

export function StageStatement({
  statement,
  onStatementChange,
  onAnalyze,
  isProcessing,
}: StageStatementProps) {
  const [showExample, setShowExample] = useState(false)

  const handleLoadExample = () => {
    onStatementChange(MOCK_STATEMENT)
    setShowExample(true)
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
                Provide the applicant&apos;s source of funds statement for AI analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Applicant Statement
            </label>
            <Textarea
              placeholder="Paste the applicant's source of funds statement here..."
              value={statement}
              onChange={(e) => onStatementChange(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onAnalyze}
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
                  Analyze Statement
                </>
              )}
            </Button>

            {!showExample && (
              <Button variant="outline" onClick={handleLoadExample}>
                Load Example Statement
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/30 border-accent">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2 text-foreground">What happens next?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. AI analyzes the statement to identify all funding sources</li>
            <li>2. Required documents are automatically determined for each source</li>
            <li>3. A document checklist is generated with upload capabilities</li>
            <li>4. Specialized agents validate each uploaded document</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
