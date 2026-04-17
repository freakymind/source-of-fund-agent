"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { StageIndicator } from "@/components/sof/stage-indicator"
import { ChatPanel } from "@/components/sof/chat-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  FileText, Upload, CheckCircle2, AlertTriangle, XCircle, 
  Loader2, ChevronRight, Eye, RefreshCw, Printer, Download,
  Briefcase, Gift, Home, PiggyBank, Building2, TrendingUp,
  FileCheck, Clock, Bot, Sparkles
} from "lucide-react"
import type {
  WorkflowStage,
  FundingSource,
  AuditReport,
  ChatMessage,
  AgentType,
  RequiredDocument,
} from "@/lib/sof-types"
import {
  generateFundingSourcesForCase,
  generateMockValidationResult,
  generateMockAuditReport,
  INITIAL_CHAT_MESSAGES,
  EXAMPLE_CASES,
} from "@/lib/mock-data"

// Processing step component for showing agent work
function ProcessingStep({ 
  text, 
  status, 
  detail 
}: { 
  text: string
  status: "pending" | "running" | "complete" | "error"
  detail?: string 
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        {status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted" />}
        {status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        {status === "complete" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
        {status === "error" && <XCircle className="w-4 h-4 text-destructive" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          status === "running" && "text-primary font-medium",
          status === "complete" && "text-muted-foreground",
          status === "pending" && "text-muted-foreground/60"
        )}>
          {text}
        </p>
        {detail && status === "complete" && (
          <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  )
}

// Source type icon mapping
const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  employment: Briefcase,
  gift: Gift,
  savings: PiggyBank,
  property_sale: Home,
  property_equity: Home,
  investment: TrendingUp,
  investments: TrendingUp,
  inheritance: FileText,
  business_income: Building2,
  business: Building2,
  loan: FileText,
}

export default function SOFAgentPage() {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(1)
  const [statement, setStatement] = useState("")
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Processing state for visual feedback
  const [processingSteps, setProcessingSteps] = useState<Array<{
    text: string
    status: "pending" | "running" | "complete" | "error"
    detail?: string
  }>>([])
  
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when processing
  useEffect(() => {
    if (processingSteps.length > 0 && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [processingSteps])

  const addChatMessage = useCallback(
    (content: string, role: "user" | "assistant", agentType?: AgentType) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role,
          content,
          timestamp: new Date(),
          agentType,
        },
      ])
    },
    []
  )

  const updateStep = (index: number, status: "pending" | "running" | "complete" | "error", detail?: string) => {
    setProcessingSteps(prev => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], status, detail: detail || updated[index].detail }
      }
      return updated
    })
  }

  const handleSelectCase = useCallback(async (caseId: string) => {
    const selectedCase = EXAMPLE_CASES.find(c => c.id === caseId)
    if (!selectedCase) return

    setIsProcessing(true)
    setSelectedCaseId(caseId)
    setStatement(selectedCase.statement)
    setFundingSources([])
    
    // Initialize processing steps
    setProcessingSteps([
      { text: "Reading applicant statement...", status: "pending" },
      { text: "Identifying claimed funding sources...", status: "pending" },
      { text: "Extracting amounts and dates...", status: "pending" },
      { text: "Determining required documents...", status: "pending" },
      { text: "Checking available documents...", status: "pending" },
    ])

    addChatMessage(`Loading case: ${selectedCase.name}`, "assistant")

    // Step 1: Reading statement
    await new Promise(r => setTimeout(r, 300))
    updateStep(0, "running")
    await new Promise(r => setTimeout(r, 1200))
    updateStep(0, "complete", `${selectedCase.statement.split(" ").length} words analyzed`)

    // Step 2: Identifying sources
    updateStep(1, "running")
    await new Promise(r => setTimeout(r, 1500))
    const sources = generateFundingSourcesForCase(caseId)
    updateStep(1, "complete", `Found ${sources.length} funding source(s)`)

    // Step 3: Extracting amounts
    updateStep(2, "running")
    await new Promise(r => setTimeout(r, 1000))
    const totalAmount = sources.reduce((sum, s) => sum + s.amount, 0)
    updateStep(2, "complete", `Total claimed: £${totalAmount.toLocaleString()}`)

    // Step 4: Determining documents
    updateStep(3, "running")
    await new Promise(r => setTimeout(r, 1200))
    const totalDocs = sources.reduce((sum, s) => sum + s.requiredDocuments.length, 0)
    updateStep(3, "complete", `${totalDocs} documents required`)

    // Step 5: Checking available
    updateStep(4, "running")
    await new Promise(r => setTimeout(r, 800))
    const uploadedDocs = sources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.filter(d => d.status !== "missing").length, 0
    )
    const missingDocs = totalDocs - uploadedDocs
    updateStep(4, "complete", missingDocs > 0 
      ? `${uploadedDocs} loaded, ${missingDocs} missing` 
      : "All documents available"
    )

    setFundingSources(sources)

    // Summary message
    let msg = `Statement analyzed. Found ${sources.length} funding source(s):\n\n`
    msg += sources.map(s => {
      const missing = s.requiredDocuments.filter(d => d.status === "missing").length
      return `• ${s.description}: £${s.amount.toLocaleString()} ${missing > 0 ? `(${missing} doc missing)` : "(docs ready)"}`
    }).join("\n")
    
    addChatMessage(msg, "assistant")

    setCurrentStage(2)
    setIsProcessing(false)
  }, [addChatMessage])

  const handleUploadDocument = useCallback(
    async (sourceId: string, documentId: string) => {
      setIsProcessing(true)

      const source = fundingSources.find(fs => fs.id === sourceId)
      const doc = source?.requiredDocuments.find(d => d.id === documentId)

      setProcessingSteps([
        { text: `Uploading ${doc?.name || "document"}...`, status: "running" },
      ])

      await new Promise(r => setTimeout(r, 800))

      setFundingSources((prev) =>
        prev.map((s) =>
          s.id === sourceId
            ? {
                ...s,
                requiredDocuments: s.requiredDocuments.map((d) =>
                  d.id === documentId
                    ? {
                        ...d,
                        status: "uploaded" as const,
                        file: {
                          id: `file-${Date.now()}`,
                          name: `${d.name.replace(/\s+/g, "_")}.pdf`,
                          size: Math.floor(Math.random() * 500000) + 100000,
                          uploadedAt: new Date(),
                        },
                      }
                    : d
                ),
              }
            : s
        )
      )

      updateStep(0, "complete", "Document uploaded")
      addChatMessage(`${doc?.name} uploaded successfully.`, "assistant")
      setIsProcessing(false)
    },
    [addChatMessage, fundingSources]
  )

  const handleValidateAll = useCallback(async () => {
    setIsProcessing(true)

    // Collect docs to validate
    const docsToValidate = fundingSources.flatMap(fs => 
      fs.requiredDocuments.filter(d => d.status === "uploaded" || d.status === "validated" || d.status === "flagged")
    )

    // Build processing steps for each agent
    const steps: Array<{ text: string; status: "pending" | "running" | "complete" | "error"; detail?: string }> = [
      { text: "Initializing validation agents...", status: "pending" },
    ]

    // Group docs by agent type
    const payrollDocs = docsToValidate.filter(d => ["payslip", "employment_contract"].includes(d.type))
    const bankingDocs = docsToValidate.filter(d => ["bank_statement", "investment_statement", "company_accounts", "business_accounts"].includes(d.type))
    const legalDocs = docsToValidate.filter(d => ["gift_letter", "probate_document", "will_probate", "tax_return"].includes(d.type))
    const propertyDocs = docsToValidate.filter(d => ["property_deed", "sale_agreement", "property_valuation", "mortgage_statement"].includes(d.type))

    if (payrollDocs.length > 0) steps.push({ text: `Payroll Agent: Validating ${payrollDocs.length} document(s)...`, status: "pending" })
    if (bankingDocs.length > 0) steps.push({ text: `Banking Agent: Validating ${bankingDocs.length} document(s)...`, status: "pending" })
    if (legalDocs.length > 0) steps.push({ text: `Legal Agent: Validating ${legalDocs.length} document(s)...`, status: "pending" })
    if (propertyDocs.length > 0) steps.push({ text: `Property Agent: Validating ${propertyDocs.length} document(s)...`, status: "pending" })

    steps.push({ text: "Cross-referencing with statement...", status: "pending" })
    steps.push({ text: "Calculating plausibility score...", status: "pending" })

    setProcessingSteps(steps)
    addChatMessage(`Starting validation on ${docsToValidate.length} document(s)...`, "assistant")

    let stepIndex = 0

    // Step 1: Initialize
    updateStep(stepIndex, "running")
    await new Promise(r => setTimeout(r, 600))
    updateStep(stepIndex++, "complete")

    // Payroll Agent
    if (payrollDocs.length > 0) {
      updateStep(stepIndex, "running")
      await new Promise(r => setTimeout(r, 2000))
      const shouldFlag = selectedCaseId === "case-4"
      updateStep(stepIndex++, "complete", shouldFlag 
        ? "1 discrepancy found - salary mismatch" 
        : "All employment data verified"
      )
    }

    // Banking Agent  
    if (bankingDocs.length > 0) {
      updateStep(stepIndex, "running")
      await new Promise(r => setTimeout(r, 2200))
      const shouldFlag = selectedCaseId === "case-6"
      updateStep(stepIndex++, "complete", shouldFlag
        ? "Investment timeline flagged"
        : "Bank transactions verified"
      )
    }

    // Legal Agent
    if (legalDocs.length > 0) {
      updateStep(stepIndex, "running")
      await new Promise(r => setTimeout(r, 1800))
      const shouldFlag = selectedCaseId === "case-4" && legalDocs.some(d => d.type === "probate_document")
      updateStep(stepIndex++, "complete", shouldFlag
        ? "Inheritance amount discrepancy"
        : "Legal documents verified"
      )
    }

    // Property Agent
    if (propertyDocs.length > 0) {
      updateStep(stepIndex, "running")
      await new Promise(r => setTimeout(r, 1600))
      updateStep(stepIndex++, "complete", "Property documents verified")
    }

    // Cross-reference
    updateStep(stepIndex, "running")
    await new Promise(r => setTimeout(r, 1200))
    updateStep(stepIndex++, "complete", "Statement claims matched")

    // Plausibility
    updateStep(stepIndex, "running")
    await new Promise(r => setTimeout(r, 800))
    updateStep(stepIndex++, "complete")

    // Update funding sources with validation results
    setFundingSources((prev) =>
      prev.map((source) => ({
        ...source,
        requiredDocuments: source.requiredDocuments.map((doc) => {
          if (doc.status === "uploaded" || doc.status === "validated" || doc.status === "flagged") {
            let shouldFlag = false
            if (selectedCaseId === "case-4") {
              shouldFlag = doc.type === "payslip" || doc.type === "probate_document"
            }
            if (selectedCaseId === "case-6") {
              shouldFlag = doc.type === "investment_statement"
            }
            
            const result = generateMockValidationResult(doc.type, !shouldFlag)
            return {
              ...doc,
              status: result.status === "valid" ? ("validated" as const) : ("flagged" as const),
              validationResult: result,
            }
          }
          return doc
        }),
      }))
    )

    const flaggedCount = (selectedCaseId === "case-4" || selectedCaseId === "case-6") ? 1 : 0
    addChatMessage(
      flaggedCount > 0 
        ? `Validation complete. ${flaggedCount} issue(s) flagged for review.`
        : "Validation complete. All documents verified successfully.",
      "assistant"
    )

    setCurrentStage(3)
    setIsProcessing(false)
  }, [addChatMessage, fundingSources, selectedCaseId])

  const handleRerunAgent = useCallback(
    async (agentType: AgentType, documentId: string) => {
      setIsProcessing(true)
      
      const doc = fundingSources.flatMap(fs => fs.requiredDocuments).find(d => d.id === documentId)
      
      setProcessingSteps([
        { text: `Re-analyzing ${doc?.name || "document"}...`, status: "running" },
        { text: "Applying updated validation rules...", status: "pending" },
        { text: "Verifying against statement...", status: "pending" },
      ])

      addChatMessage(`Re-running ${agentType} agent...`, "assistant", agentType)

      await new Promise(r => setTimeout(r, 1500))
      updateStep(0, "complete")
      updateStep(1, "running")
      
      await new Promise(r => setTimeout(r, 1200))
      updateStep(1, "complete")
      updateStep(2, "running")
      
      await new Promise(r => setTimeout(r, 800))
      updateStep(2, "complete", "Issue resolved")

      setFundingSources((prev) =>
        prev.map((source) => ({
          ...source,
          requiredDocuments: source.requiredDocuments.map((d) => {
            if (d.id === documentId) {
              const result = generateMockValidationResult(d.type, true)
              return {
                ...d,
                status: "validated" as const,
                validationResult: result,
              }
            }
            return d
          }),
        }))
      )

      addChatMessage("Document re-validated successfully. Flag resolved.", "assistant", agentType)
      setIsProcessing(false)
    },
    [addChatMessage, fundingSources]
  )

  const handleGenerateReport = useCallback(async () => {
    setIsProcessing(true)
    
    setProcessingSteps([
      { text: "Compiling validation results...", status: "pending" },
      { text: "Generating audit trail...", status: "pending" },
      { text: "Creating compliance summary...", status: "pending" },
      { text: "Finalizing report...", status: "pending" },
    ])

    addChatMessage("Generating audit report...", "assistant")

    updateStep(0, "running")
    await new Promise(r => setTimeout(r, 1000))
    updateStep(0, "complete")

    updateStep(1, "running")
    await new Promise(r => setTimeout(r, 800))
    updateStep(1, "complete")

    updateStep(2, "running")
    await new Promise(r => setTimeout(r, 1200))
    updateStep(2, "complete")

    updateStep(3, "running")
    await new Promise(r => setTimeout(r, 600))
    updateStep(3, "complete")

    const applicantName = selectedCaseId 
      ? EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.applicantName || "Applicant"
      : "Applicant"
    
    const report = generateMockAuditReport(applicantName, fundingSources)
    setAuditReport(report)

    addChatMessage(
      `Report ready. Status: ${report.overallStatus.toUpperCase()}, Score: ${report.plausibilityScore}%`,
      "assistant"
    )

    setCurrentStage(4)
    setIsProcessing(false)
  }, [addChatMessage, fundingSources, selectedCaseId])

  const handleSendMessage = useCallback(
    async (message: string) => {
      addChatMessage(message, "user")
      setIsProcessing(true)

      await new Promise(r => setTimeout(r, 600))

      const lower = message.toLowerCase()

      if (lower.includes("flag") || lower.includes("issue")) {
        const flaggedDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "flagged")
        )
        if (flaggedDocs.length > 0) {
          const detail = flaggedDocs.map(d => `• ${d.name}: ${d.validationResult?.flags[0]?.message || "Issue detected"}`).join("\n")
          addChatMessage(`${flaggedDocs.length} flagged item(s):\n\n${detail}`, "assistant")
        } else {
          addChatMessage("No flagged items.", "assistant")
        }
      } else if (lower.includes("missing")) {
        const missingDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "missing")
        )
        if (missingDocs.length > 0) {
          addChatMessage(`${missingDocs.length} missing:\n\n${missingDocs.map(d => `• ${d.name}`).join("\n")}`, "assistant")
        } else {
          addChatMessage("All documents uploaded.", "assistant")
        }
      } else {
        addChatMessage("I can help explain flags, check missing docs, or guide you through the process.", "assistant")
      }

      setIsProcessing(false)
    },
    [addChatMessage, fundingSources]
  )

  const handleStageClick = useCallback((stage: WorkflowStage) => {
    if (stage <= currentStage || (stage === 2 && fundingSources.length > 0)) {
      setCurrentStage(stage)
    }
  }, [currentStage, fundingSources])

  // Render document card
  const renderDocCard = (doc: RequiredDocument, sourceId: string) => {
    const statusColors = {
      missing: "border-destructive/30 bg-destructive/5",
      uploaded: "border-amber-500/30 bg-amber-500/5",
      validated: "border-green-600/30 bg-green-600/5",
      flagged: "border-destructive/30 bg-destructive/5",
    }

    const statusIcons = {
      missing: <XCircle className="w-4 h-4 text-destructive" />,
      uploaded: <Clock className="w-4 h-4 text-amber-600" />,
      validated: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      flagged: <AlertTriangle className="w-4 h-4 text-destructive" />,
    }

    return (
      <div key={doc.id} className={cn("p-3 rounded-lg border", statusColors[doc.status])}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {statusIcons[doc.status]}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{doc.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.reason}</p>
            </div>
          </div>
          {doc.status === "missing" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="shrink-0 h-7 text-xs"
              onClick={() => handleUploadDocument(sourceId, doc.id)}
              disabled={isProcessing}
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
          )}
          {doc.status === "flagged" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="shrink-0 h-7 text-xs"
              onClick={() => handleRerunAgent(doc.validationResult?.agentType || "banking", doc.id)}
              disabled={isProcessing}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Re-run
            </Button>
          )}
        </div>
        
        {/* Validation result details */}
        {doc.validationResult && currentStage >= 3 && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Bot className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">{doc.validationResult.agentType} agent</span>
            </div>
            
            {/* Extracted data */}
            {doc.validationResult.extractedData.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {doc.validationResult.extractedData.slice(0, 4).map((item, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-muted-foreground">{item.label}:</span>{" "}
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Matches */}
            {doc.validationResult.matches.length > 0 && (
              <div className="space-y-1">
                {doc.validationResult.matches.map((match, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {match.status === "match" && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                    {match.status === "mismatch" && <XCircle className="w-3 h-3 text-destructive" />}
                    {match.status === "partial" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    <span className="text-muted-foreground truncate">{match.statementClaim}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Flags */}
            {doc.validationResult.flags.length > 0 && (
              <div className="space-y-1">
                {doc.validationResult.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-destructive/10 p-2 rounded">
                    <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">{flag.message}</p>
                      <p className="text-muted-foreground mt-0.5">{flag.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">N</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Source of Funds Agent</h1>
                <p className="text-xs text-muted-foreground">AML/KYC Compliance Verification</p>
              </div>
            </div>
            {selectedCaseId && (
              <Badge variant="secondary" className="text-xs">
                {EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.name}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Stage Indicator */}
      <div className="border-b border-border bg-card/50 py-4 print:hidden">
        <div className="container mx-auto px-4">
          <StageIndicator currentStage={currentStage} onStageClick={handleStageClick} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Workflow Area */}
          <div className="lg:col-span-2 space-y-6" ref={contentRef}>
            
            {/* Processing Steps (shown when processing) */}
            {isProcessing && processingSteps.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Agent Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {processingSteps.map((step, i) => (
                    <ProcessingStep key={i} text={step.text} status={step.status} detail={step.detail} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Statement Preview (Stage 2+) */}
            {currentStage >= 2 && statement && (
              <Card className="border-primary/20">
                <CardHeader className="py-3 bg-primary/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Applicant Statement
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{statement}</p>
                </CardContent>
              </Card>
            )}

            {/* Stage 2 & 3: Document Checklist with Validation */}
            {(currentStage === 2 || currentStage === 3) && fundingSources.length > 0 && (
              <div className="space-y-4">
                {fundingSources.map((source) => {
                  const SourceIcon = sourceIcons[source.type] || FileText
                  const uploadedCount = source.requiredDocuments.filter(d => d.status !== "missing").length
                  const totalCount = source.requiredDocuments.length
                  
                  return (
                    <Card key={source.id}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <SourceIcon className="w-4 h-4 text-primary" />
                            {source.description}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              £{source.amount.toLocaleString()}
                            </span>
                            <Badge variant={uploadedCount === totalCount ? "default" : "secondary"} className="text-xs">
                              {uploadedCount}/{totalCount}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 space-y-2">
                        {source.requiredDocuments.map(doc => renderDocCard(doc, source.id))}
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Action Button */}
                {currentStage === 2 && (
                  <Button
                    onClick={handleValidateAll}
                    disabled={isProcessing || fundingSources.every(fs => fs.requiredDocuments.every(d => d.status === "missing"))}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Run Validation Agents
                      </>
                    )}
                  </Button>
                )}

                {currentStage === 3 && (
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 mr-2" />
                        Generate Audit Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Stage 4: Audit Report */}
            {currentStage === 4 && auditReport && (
              <Card className="print:shadow-none">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 print:bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Audit Report</CardTitle>
                    <div className="flex items-center gap-2 print:hidden">
                      <Button size="sm" variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-1" />
                        Print
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-4 space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-accent/30">
                      <p className="text-2xl font-bold text-primary">{auditReport.plausibilityScore}%</p>
                      <p className="text-xs text-muted-foreground">Plausibility</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/30">
                      <p className="text-2xl font-bold text-foreground">£{(auditReport.totalFundsVerified / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/30">
                      <p className="text-2xl font-bold text-green-600">{auditReport.validationSummary.validatedDocuments}</p>
                      <p className="text-xs text-muted-foreground">Validated</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/30">
                      <p className={cn(
                        "text-2xl font-bold",
                        auditReport.validationSummary.flaggedDocuments > 0 ? "text-destructive" : "text-green-600"
                      )}>
                        {auditReport.validationSummary.flaggedDocuments}
                      </p>
                      <p className="text-xs text-muted-foreground">Flagged</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center p-4 rounded-lg border">
                    <Badge className={cn(
                      "text-lg px-4 py-1",
                      auditReport.overallStatus === "approved" && "bg-green-600",
                      auditReport.overallStatus === "flagged" && "bg-destructive",
                      auditReport.overallStatus === "pending" && "bg-amber-600",
                    )}>
                      {auditReport.overallStatus.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Flagged Items */}
                  {auditReport.flaggedItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Items Requiring Review
                      </h4>
                      {auditReport.flaggedItems.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                          <p className="text-sm font-medium text-foreground">{item.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {auditReport.notes && auditReport.notes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Analyst Notes</h4>
                      <ul className="space-y-1">
                        {auditReport.notes.map((note, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Audit Trail */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Audit Trail</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {auditReport.auditTrail.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-muted-foreground/60">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <span>{item.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Example Cases - Demo Section at Bottom (Stage 1 only) */}
            {currentStage === 1 && <Card>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Demo: Select Example Case
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a case to begin. The agent will analyze the applicant&apos;s statement and check uploaded documents.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXAMPLE_CASES.map((caseItem) => (
                    <button
                      key={caseItem.id}
                      onClick={() => handleSelectCase(caseItem.id)}
                      disabled={isProcessing}
                      className={cn(
                        "text-left p-4 rounded-lg border transition-all",
                        "hover:border-primary/50 hover:bg-accent/30",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedCaseId === caseItem.id && isProcessing && "border-primary bg-primary/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          caseItem.complexity === "Simple" && "border-green-600 text-green-600",
                          caseItem.complexity === "Moderate" && "border-amber-600 text-amber-600",
                          caseItem.complexity === "Complex" && "border-red-600 text-red-600",
                        )}>
                          {caseItem.complexity}
                        </Badge>
                        {selectedCaseId === caseItem.id && isProcessing ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm text-foreground">{caseItem.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{caseItem.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <FileCheck className="w-3 h-3" />
                        {caseItem.scenario}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-1 h-[calc(100vh-100px)] sticky top-4 print:hidden">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
