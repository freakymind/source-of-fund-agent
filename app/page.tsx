"use client"

import { useState, useCallback } from "react"
import { StageIndicator } from "@/components/sof/stage-indicator"
import { StageStatement } from "@/components/sof/stage-statement"
import { StageChecklist } from "@/components/sof/stage-checklist"
import { StageAgents } from "@/components/sof/stage-agents"
import { StageReport } from "@/components/sof/stage-report"
import { ChatPanel } from "@/components/sof/chat-panel"
import { AgentActivityFeed, type AgentActivity } from "@/components/sof/agent-activity-feed"
import type {
  WorkflowStage,
  FundingSource,
  AuditReport,
  ChatMessage,
  AgentType,
} from "@/lib/sof-types"
import {
  generateFundingSourcesForCase,
  generateMockValidationResult,
  generateMockAuditReport,
  INITIAL_CHAT_MESSAGES,
  EXAMPLE_CASES,
} from "@/lib/mock-data"

export default function SOFAgentPage() {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(1)
  const [statement, setStatement] = useState("")
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addActivity = useCallback((
    action: string, 
    agentType?: AgentActivity["agentType"], 
    status: AgentActivity["status"] = "info",
    detail?: string
  ) => {
    setAgentActivities(prev => [...prev, {
      id: `act-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      agentType,
      action,
      detail,
      status,
    }])
  }, [])

  const updateLastActivity = useCallback((status: AgentActivity["status"], detail?: string) => {
    setAgentActivities(prev => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        status,
        detail: detail || updated[updated.length - 1].detail,
      }
      return updated
    })
  }, [])

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

  const handleAnalyzeStatement = useCallback(async (caseId?: string) => {
    setIsProcessing(true)
    setAgentActivities([]) // Reset activity feed
    
    const selectedCase = caseId 
      ? EXAMPLE_CASES.find(c => c.id === caseId)
      : null
    
    // Activity: Start
    addActivity("Case selected, initializing analysis...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    if (selectedCase) {
      setSelectedCaseId(caseId!)
      setStatement(selectedCase.statement)
      updateLastActivity("complete", `Loaded: ${selectedCase.name}`)
      
      addChatMessage(
        `Loading case: "${selectedCase.name}" (${selectedCase.complexity} complexity)\n\nScenario: ${selectedCase.scenario}`,
        "assistant"
      )
    }

    // Activity: Parsing statement
    addActivity("Parsing applicant statement...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 600))
    updateLastActivity("complete", "Statement parsed successfully")

    // Activity: Identifying sources
    addActivity("Identifying funding sources from statement...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate sources based on case
    const sources = caseId 
      ? generateFundingSourcesForCase(caseId)
      : generateFundingSourcesForCase("case-5")

    setFundingSources(sources)
    updateLastActivity("complete", `Found ${sources.length} funding source(s)`)

    // Activity: Determine required docs
    addActivity("Determining required documents per source...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 400))

    const totalDocs = sources.reduce((sum, fs) => sum + fs.requiredDocuments.length, 0)
    updateLastActivity("complete", `${totalDocs} documents identified`)

    // Activity: Check existing documents
    addActivity("Checking pre-loaded documents...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const uploadedDocs = sources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.filter(d => d.status !== "missing").length,
      0
    )
    const missingDocs = totalDocs - uploadedDocs

    if (missingDocs > 0) {
      updateLastActivity("info", `${uploadedDocs} documents loaded, ${missingDocs} missing`)
    } else {
      updateLastActivity("complete", `All ${totalDocs} documents present`)
    }

    // Activity for each funding source
    for (const source of sources) {
      const sourceDocsLoaded = source.requiredDocuments.filter(d => d.status !== "missing").length
      const sourceTotalDocs = source.requiredDocuments.length
      
      if (sourceDocsLoaded < sourceTotalDocs) {
        addActivity(
          `${source.type.replace("_", " ")} source: ${sourceDocsLoaded}/${sourceTotalDocs} documents`,
          undefined,
          "info",
          source.description
        )
      } else {
        addActivity(
          `${source.type.replace("_", " ")} source: All documents loaded`,
          undefined,
          "complete",
          source.description
        )
      }
    }

    // Summary message
    let statusMessage = `Analysis complete! Identified ${sources.length} funding source${sources.length > 1 ? "s" : ""} requiring ${totalDocs} documents:\n\n`
    statusMessage += sources.map(s => {
      const missing = s.requiredDocuments.filter(d => d.status === "missing").length
      return `- ${s.description} (${missing > 0 ? missing + " missing" : "all loaded"})`
    }).join("\n")

    if (missingDocs > 0) {
      statusMessage += `\n\n${missingDocs} document${missingDocs > 1 ? "s" : ""} missing. You can upload or proceed with partial validation.`
    } else {
      statusMessage += "\n\nAll documents loaded. Ready for validation."
    }

    addChatMessage(statusMessage, "assistant")

    setCurrentStage(2)
    setIsProcessing(false)
  }, [addChatMessage, addActivity, updateLastActivity])

  const handleUploadDocument = useCallback(
    async (sourceId: string, documentId: string) => {
      setIsProcessing(true)

      const source = fundingSources.find(fs => fs.id === sourceId)
      const doc = source?.requiredDocuments.find(d => d.id === documentId)

      addActivity(`Uploading ${doc?.name || "document"}...`, "orchestrator", "running")
      await new Promise((resolve) => setTimeout(resolve, 500))

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

      updateLastActivity("complete", "Document uploaded successfully")
      addChatMessage("Document uploaded. Upload remaining documents or run validation.", "assistant")
      setIsProcessing(false)
    },
    [addChatMessage, addActivity, updateLastActivity, fundingSources]
  )

  const handleValidateAll = useCallback(async () => {
    setIsProcessing(true)
    addActivity("Starting document validation...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 300))
    updateLastActivity("complete")

    // Collect docs to validate
    const docsToValidate = fundingSources.flatMap(fs => 
      fs.requiredDocuments.filter(d => d.status === "uploaded" && !d.validationResult)
    )

    addChatMessage(
      `Running specialized agents on ${docsToValidate.length} document(s)...`,
      "assistant"
    )

    // Simulate each agent validating relevant documents
    const agentTypes: AgentType[] = ["payroll", "banking", "legal", "property"]
    
    for (const agentType of agentTypes) {
      const relevantDocs = docsToValidate.filter(d => {
        if (agentType === "payroll") return ["payslip", "employment_contract"].includes(d.type)
        if (agentType === "banking") return ["bank_statement"].includes(d.type)
        if (agentType === "legal") return ["gift_letter", "probate_document", "will_probate", "tax_return"].includes(d.type)
        if (agentType === "property") return ["property_deed", "sale_agreement", "property_valuation", "mortgage_statement"].includes(d.type)
        return false
      })

      if (relevantDocs.length > 0) {
        addActivity(`Processing ${relevantDocs.length} document(s)...`, agentType, "running")
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Check if any will be flagged based on case
        const willFlag = selectedCaseId === "case-4" || selectedCaseId === "case-6"
        const flaggedCount = willFlag && agentType === "payroll" ? 1 : 0
        
        if (flaggedCount > 0) {
          updateLastActivity("flagged", `${relevantDocs.length - flaggedCount} valid, ${flaggedCount} flagged`)
        } else {
          updateLastActivity("complete", `${relevantDocs.length} document(s) validated`)
        }
      }
    }

    // Also validate company accounts and investment docs
    const otherDocs = docsToValidate.filter(d => 
      ["company_accounts", "investment_statement", "source_of_investment", "business_accounts"].includes(d.type)
    )
    if (otherDocs.length > 0) {
      addActivity(`Processing business/investment documents...`, "banking", "running")
      await new Promise((resolve) => setTimeout(resolve, 600))
      updateLastActivity("complete", `${otherDocs.length} document(s) validated`)
    }

    // Update funding sources with validation results
    setFundingSources((prev) =>
      prev.map((source) => ({
        ...source,
        requiredDocuments: source.requiredDocuments.map((doc) => {
          if (doc.status === "uploaded" && !doc.validationResult) {
            // Determine if this doc should be flagged based on case
            let shouldFlag = false
            if (selectedCaseId === "case-4") {
              shouldFlag = doc.type === "payslip" || (doc.type === "bank_statement" && source.type === "inheritance")
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

    addActivity("Validation complete", "orchestrator", "complete")

    const validatedCount = docsToValidate.length
    addChatMessage(
      `Validation complete! ${validatedCount} document(s) processed. Review results in Stage 3.`,
      "assistant"
    )

    setCurrentStage(3)
    setIsProcessing(false)
  }, [addChatMessage, addActivity, updateLastActivity, fundingSources, selectedCaseId])

  const handleRerunAgent = useCallback(
    async (agentType: AgentType, documentId: string) => {
      setIsProcessing(true)
      
      const doc = fundingSources.flatMap(fs => fs.requiredDocuments).find(d => d.id === documentId)
      
      addActivity(`Re-analyzing ${doc?.name || "document"}...`, agentType, "running")
      addChatMessage(`Re-running ${agentType} agent with updated parameters...`, "assistant", agentType)

      await new Promise((resolve) => setTimeout(resolve, 1200))

      setFundingSources((prev) =>
        prev.map((source) => ({
          ...source,
          requiredDocuments: source.requiredDocuments.map((d) => {
            if (d.id === documentId) {
              const result = generateMockValidationResult(d.type, true) // Re-run tends to pass
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

      updateLastActivity("complete", "Document re-validated successfully")
      addChatMessage(`Re-validation complete. The flag has been resolved.`, "assistant", agentType)
      setIsProcessing(false)
    },
    [addChatMessage, addActivity, updateLastActivity, fundingSources]
  )

  const handleGenerateReport = useCallback(async () => {
    setIsProcessing(true)
    
    addActivity("Generating audit report...", "orchestrator", "running")
    addChatMessage("Compiling final audit report...", "assistant")

    await new Promise((resolve) => setTimeout(resolve, 600))
    addActivity("Aggregating validation results...", "orchestrator", "running")
    
    await new Promise((resolve) => setTimeout(resolve, 500))
    updateLastActivity("complete")
    
    addActivity("Calculating plausibility score...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 400))
    updateLastActivity("complete")

    addActivity("Generating recommendations...", "orchestrator", "running")
    await new Promise((resolve) => setTimeout(resolve, 400))
    updateLastActivity("complete")

    const applicantName = selectedCaseId 
      ? EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.applicantName || "Applicant"
      : "Applicant"
    
    const report = generateMockAuditReport(fundingSources, applicantName)
    setAuditReport(report)

    addActivity("Report generated successfully", "orchestrator", "complete")

    let summaryMsg = `Audit report ready!\n\n`
    summaryMsg += `- Applicant: ${report.applicantName}\n`
    summaryMsg += `- Verified: £${report.totalFundsVerified.toLocaleString()}\n`
    summaryMsg += `- Score: ${report.plausibilityScore}%\n`
    summaryMsg += `- Status: ${report.overallStatus.toUpperCase()}`

    addChatMessage(summaryMsg, "assistant")

    setCurrentStage(4)
    setIsProcessing(false)
  }, [addChatMessage, addActivity, updateLastActivity, fundingSources, selectedCaseId])

  const handleExportPDF = useCallback(() => {
    addChatMessage("PDF export ready in production. Use Print to save as PDF.", "assistant")
  }, [addChatMessage])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleSendMessage = useCallback(
    async (message: string) => {
      addChatMessage(message, "user")
      setIsProcessing(true)

      await new Promise((resolve) => setTimeout(resolve, 800))

      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes("flag") || lowerMessage.includes("issue")) {
        const flaggedDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "flagged")
        )
        if (flaggedDocs.length > 0) {
          const flagDetails = flaggedDocs.map(d => {
            const flags = d.validationResult?.flags || []
            return `**${d.name}:**\n${flags.map(f => `  - [${f.severity.toUpperCase()}] ${f.message}`).join("\n")}`
          }).join("\n\n")
          addChatMessage(
            `${flaggedDocs.length} flagged document(s):\n\n${flagDetails}\n\nRe-run agents to resolve, or upload supporting documents.`,
            "assistant"
          )
        } else {
          addChatMessage("No flagged items. All validated documents passed.", "assistant")
        }
      } else if (lowerMessage.includes("re-run") || lowerMessage.includes("rerun")) {
        const agents = ["payroll", "banking", "legal", "property"]
        const mentionedAgent = agents.find((a) => lowerMessage.includes(a))
        if (mentionedAgent) {
          addChatMessage(
            `Click "Re-run" on any ${mentionedAgent} agent document in Stage 3 to re-validate.`,
            "assistant",
            mentionedAgent as AgentType
          )
        } else {
          addChatMessage(
            "Which agent? Options: Payroll, Banking, Legal, Property. Or click Re-run buttons in Stage 3.",
            "assistant"
          )
        }
      } else if (lowerMessage.includes("missing") || lowerMessage.includes("upload")) {
        const missingDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "missing")
        )
        if (missingDocs.length > 0) {
          addChatMessage(
            `${missingDocs.length} missing document(s):\n\n${missingDocs.map((d) => `- ${d.name}`).join("\n")}\n\nUpload in Stage 2, then re-run validation.`,
            "assistant"
          )
        } else {
          addChatMessage("All required documents are uploaded.", "assistant")
        }
      } else if (lowerMessage.includes("summary") || lowerMessage.includes("status")) {
        const totalDocs = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.length, 0)
        const validated = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "validated").length, 0)
        const flagged = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "flagged").length, 0)
        const missing = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "missing").length, 0)
        
        addChatMessage(
          `Status: ${fundingSources.length} sources, ${totalDocs} docs\n- Validated: ${validated}\n- Flagged: ${flagged}\n- Missing: ${missing}\n\nStage: ${currentStage}/4`,
          "assistant"
        )
      } else {
        addChatMessage(
          "I can help with:\n- Explain flags\n- Re-run agents\n- Check missing docs\n- Show summary\n\nOr use the quick buttons below.",
          "assistant"
        )
      }

      setIsProcessing(false)
    },
    [addChatMessage, fundingSources, currentStage]
  )

  const handleStageClick = useCallback((stage: WorkflowStage) => {
    if (stage <= currentStage || (stage === 2 && fundingSources.length > 0)) {
      setCurrentStage(stage)
    }
  }, [currentStage, fundingSources])

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <StageStatement
            statement={statement}
            onStatementChange={setStatement}
            onAnalyze={handleAnalyzeStatement}
            isProcessing={isProcessing}
          />
        )
      case 2:
        return (
          <StageChecklist
            fundingSources={fundingSources}
            onUploadDocument={handleUploadDocument}
            onValidateAll={handleValidateAll}
            isProcessing={isProcessing}
            statement={statement}
          />
        )
      case 3:
        return (
          <StageAgents
            fundingSources={fundingSources}
            onRerunAgent={handleRerunAgent}
            onGenerateReport={handleGenerateReport}
            isProcessing={isProcessing}
          />
        )
      case 4:
        return auditReport ? (
          <StageReport
            report={auditReport}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
          />
        ) : null
      default:
        return null
    }
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
                <h1 className="text-base font-semibold text-foreground">
                  Source of Funds Agent
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Compliance Verification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCaseId && (
                <span className="text-xs bg-accent px-2 py-1 rounded text-foreground">
                  {EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stage Indicator */}
      <div className="border-b border-border bg-card/50 py-4 print:hidden">
        <div className="container mx-auto px-4">
          <StageIndicator
            currentStage={currentStage}
            onStageClick={handleStageClick}
          />
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Stage Content - Main Area */}
          <div className="lg:col-span-6 xl:col-span-7">{renderStageContent()}</div>

          {/* Agent Activity Feed */}
          <div className="lg:col-span-3 xl:col-span-2 h-[calc(100vh-220px)] min-h-[400px] print:hidden">
            <AgentActivityFeed 
              activities={agentActivities} 
              isProcessing={isProcessing} 
            />
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-3 h-[calc(100vh-220px)] min-h-[400px] print:hidden">
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
