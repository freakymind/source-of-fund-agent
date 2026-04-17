"use client"

import { useState, useCallback } from "react"
import { StageIndicator } from "@/components/sof/stage-indicator"
import { StageStatement } from "@/components/sof/stage-statement"
import { StageChecklist } from "@/components/sof/stage-checklist"
import { StageAgents } from "@/components/sof/stage-agents"
import { StageReport } from "@/components/sof/stage-report"
import { ChatPanel } from "@/components/sof/chat-panel"
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
  const [isProcessing, setIsProcessing] = useState(false)

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
    
    const selectedCase = caseId 
      ? EXAMPLE_CASES.find(c => c.id === caseId)
      : null
    
    if (selectedCase) {
      setSelectedCaseId(caseId!)
      addChatMessage(
        `Loading example case: "${selectedCase.name}" (${selectedCase.complexity} complexity)\n\nScenario: ${selectedCase.scenario}`,
        "assistant"
      )
    } else {
      addChatMessage(
        "Analyzing your custom statement to identify funding sources and required documents...",
        "assistant"
      )
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate sources based on case or default
    const sources = caseId 
      ? generateFundingSourcesForCase(caseId)
      : generateFundingSourcesForCase("case-5") // Default complex case

    setFundingSources(sources)

    const totalDocs = sources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.length,
      0
    )
    const uploadedDocs = sources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.filter(d => d.status !== "missing").length,
      0
    )
    const missingDocs = totalDocs - uploadedDocs

    let statusMessage = `Analysis complete! Identified ${sources.length} funding source${sources.length > 1 ? "s" : ""} requiring ${totalDocs} documents:\n\n`
    statusMessage += sources.map(s => {
      const docsStatus = s.requiredDocuments.map(d => {
        if (d.status === "validated") return "validated"
        if (d.status === "flagged") return "flagged"
        if (d.status === "uploaded") return "uploaded"
        return "missing"
      })
      const validated = docsStatus.filter(s => s === "validated").length
      const flagged = docsStatus.filter(s => s === "flagged").length
      const missing = docsStatus.filter(s => s === "missing").length
      
      let statusText = ""
      if (validated > 0) statusText += `${validated} validated`
      if (flagged > 0) statusText += `${statusText ? ", " : ""}${flagged} flagged`
      if (missing > 0) statusText += `${statusText ? ", " : ""}${missing} missing`
      
      return `- ${s.description} (${statusText || "pending"})`
    }).join("\n")

    if (missingDocs > 0) {
      statusMessage += `\n\n${missingDocs} document${missingDocs > 1 ? "s" : ""} still required for upload.`
    } else {
      statusMessage += "\n\nAll documents are already uploaded. Review the validation results."
    }

    addChatMessage(statusMessage, "assistant")

    setCurrentStage(2)
    setIsProcessing(false)
  }, [addChatMessage])

  const handleUploadDocument = useCallback(
    async (sourceId: string, documentId: string) => {
      setIsProcessing(true)

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFundingSources((prev) =>
        prev.map((source) =>
          source.id === sourceId
            ? {
                ...source,
                requiredDocuments: source.requiredDocuments.map((doc) =>
                  doc.id === documentId
                    ? {
                        ...doc,
                        status: "uploaded" as const,
                        file: {
                          id: `file-${Date.now()}`,
                          name: `${doc.name.replace(/\s+/g, "_")}.pdf`,
                          size: Math.floor(Math.random() * 500000) + 100000,
                          uploadedAt: new Date(),
                        },
                      }
                    : doc
                ),
              }
            : source
        )
      )

      addChatMessage(
        "Document uploaded successfully. You can continue uploading remaining documents or run validation when ready.",
        "assistant"
      )

      setIsProcessing(false)
    },
    [addChatMessage]
  )

  const handleValidateAll = useCallback(async () => {
    setIsProcessing(true)
    addChatMessage(
      "Running specialized validation agents on all uploaded documents...",
      "assistant"
    )

    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 2500))

    setFundingSources((prev) =>
      prev.map((source) => ({
        ...source,
        requiredDocuments: source.requiredDocuments.map((doc) => {
          if (doc.status === "uploaded" && !doc.validationResult) {
            const result = generateMockValidationResult(doc.type, Math.random() > 0.2)
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

    // Count results
    const validatedCount = fundingSources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "validated" || d.status === "uploaded").length,
      0
    )

    addChatMessage(
      `Validation complete! The specialized agents have processed ${validatedCount} documents. Review the results in Stage 3, and I can answer any questions about the findings.`,
      "assistant"
    )

    setCurrentStage(3)
    setIsProcessing(false)
  }, [addChatMessage, fundingSources])

  const handleRerunAgent = useCallback(
    async (agentType: AgentType, documentId: string) => {
      setIsProcessing(true)
      addChatMessage(
        `Re-running ${agentType} agent on the selected document with updated parameters...`,
        "assistant",
        agentType
      )

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the specific document with new validation
      setFundingSources((prev) =>
        prev.map((source) => ({
          ...source,
          requiredDocuments: source.requiredDocuments.map((doc) => {
            if (doc.id === documentId) {
              const result = generateMockValidationResult(doc.type, true) // Re-run tends to pass
              return {
                ...doc,
                status: "validated" as const,
                validationResult: result,
              }
            }
            return doc
          }),
        }))
      )

      addChatMessage(
        `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent re-validation complete. The results have been updated - check if the flags have been resolved.`,
        "assistant",
        agentType
      )

      setIsProcessing(false)
    },
    [addChatMessage]
  )

  const handleGenerateReport = useCallback(async () => {
    setIsProcessing(true)
    addChatMessage(
      "Generating comprehensive audit report with all validation results...",
      "assistant"
    )

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const applicantName = selectedCaseId 
      ? EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.applicantName || "Applicant"
      : "Applicant"
    
    const report = generateMockAuditReport(fundingSources, applicantName)
    setAuditReport(report)

    let summaryMsg = `Audit report generated successfully!\n\nSummary:\n`
    summaryMsg += `- Applicant: ${report.applicantName}\n`
    summaryMsg += `- Total Funds Verified: £${report.totalFundsVerified.toLocaleString()}\n`
    summaryMsg += `- Documents: ${report.validationSummary.validatedDocuments} validated, ${report.validationSummary.flaggedDocuments} flagged, ${report.validationSummary.pendingDocuments} pending\n`
    summaryMsg += `- Plausibility Score: ${report.plausibilityScore}%\n`
    summaryMsg += `- Status: ${report.overallStatus.toUpperCase()}`

    if (report.notes && report.notes.length > 0) {
      summaryMsg += `\n\nAnalyst Notes:\n${report.notes.map(n => `- ${n}`).join("\n")}`
    }

    addChatMessage(summaryMsg, "assistant")

    setCurrentStage(4)
    setIsProcessing(false)
  }, [addChatMessage, fundingSources, selectedCaseId])

  const handleExportPDF = useCallback(() => {
    addChatMessage(
      "PDF export functionality will be available in the production version. For now, you can use the Print option to save as PDF.",
      "assistant"
    )
  }, [addChatMessage])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleSendMessage = useCallback(
    async (message: string) => {
      addChatMessage(message, "user")
      setIsProcessing(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))

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
            `There are ${flaggedDocs.length} flagged document(s):\n\n${flagDetails}\n\nWould you like me to re-run validation on any of these, or do you want to upload additional supporting documents?`,
            "assistant"
          )
        } else {
          addChatMessage(
            "Good news - there are currently no flagged items in this verification. All validated documents have passed the plausibility checks.",
            "assistant"
          )
        }
      } else if (lowerMessage.includes("re-run") || lowerMessage.includes("rerun") || lowerMessage.includes("run again")) {
        const agents = ["payroll", "banking", "legal", "property"]
        const mentionedAgent = agents.find((a) => lowerMessage.includes(a))
        if (mentionedAgent) {
          const relevantDocs = fundingSources.flatMap((fs) =>
            fs.requiredDocuments.filter((d) => d.validationResult?.agentType === mentionedAgent)
          )
          if (relevantDocs.length > 0) {
            addChatMessage(
              `I'll re-run the ${mentionedAgent} agent on ${relevantDocs.length} document(s). Click the "Re-run" button on any specific document in Stage 3 to trigger re-validation with updated parameters.`,
              "assistant",
              mentionedAgent as AgentType
            )
          } else {
            addChatMessage(
              `No documents are currently processed by the ${mentionedAgent} agent. Please upload relevant documents first.`,
              "assistant"
            )
          }
        } else {
          addChatMessage(
            "Which agent would you like me to re-run? Available agents:\n\n- **Payroll Agent**: Validates employment documents (payslips, contracts)\n- **Banking Agent**: Analyzes bank statements and financial records\n- **Legal Agent**: Reviews legal documents (gift letters, probate, tax returns)\n- **Property Agent**: Verifies property deeds, valuations, and sale agreements",
            "assistant"
          )
        }
      } else if (lowerMessage.includes("upload") || lowerMessage.includes("add document") || lowerMessage.includes("more doc")) {
        const missingDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "missing")
        )
        if (missingDocs.length > 0) {
          addChatMessage(
            `You can upload the following missing documents:\n\n${missingDocs.map((d) => `- ${d.name}`).join("\n")}\n\nGo to Stage 2 (Document Checklist) and click "Upload Document" for each missing item. After uploading, run validation to process them.`,
            "assistant"
          )
        } else {
          addChatMessage(
            "All required documents have been uploaded! You can still upload additional supporting documents if needed to address any flags or strengthen the verification.",
            "assistant"
          )
        }
      } else if (lowerMessage.includes("summary") || lowerMessage.includes("finding") || lowerMessage.includes("status")) {
        const totalDocs = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.length, 0)
        const validated = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "validated").length, 0)
        const flagged = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "flagged").length, 0)
        const missing = fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.filter(d => d.status === "missing").length, 0)
        
        addChatMessage(
          `Current verification status:\n\n- **Funding Sources:** ${fundingSources.length} identified\n- **Total Documents:** ${totalDocs}\n  - Validated: ${validated}\n  - Flagged: ${flagged}\n  - Missing: ${missing}\n- **Stage:** ${currentStage} of 4\n\n${missing > 0 ? "Upload missing documents to proceed." : flagged > 0 ? "Review flagged items before generating the final report." : "Ready to generate the audit report!"}`,
          "assistant"
        )
      } else if (lowerMessage.includes("note") || lowerMessage.includes("comment") || lowerMessage.includes("add observation")) {
        addChatMessage(
          "Analyst notes will be included in the final audit report. You can add specific observations by mentioning:\n\n- Request additional documentation\n- Highlight specific concerns\n- Add contextual information\n\nThese will appear in the Notes section of the final report.",
          "assistant"
        )
      } else if (lowerMessage.includes("missing") || lowerMessage.includes("document")) {
        const missingDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "missing")
        )
        if (missingDocs.length > 0) {
          addChatMessage(
            `There are ${missingDocs.length} document(s) still missing:\n\n${missingDocs.map((d) => `- ${d.name}: ${d.reason}`).join("\n")}\n\nPlease upload these to complete the verification.`,
            "assistant"
          )
        } else {
          addChatMessage(
            "All required documents have been uploaded. You can proceed with validation or generate the audit report.",
            "assistant"
          )
        }
      } else {
        addChatMessage(
          "I can help you with:\n\n- **Review flags** - Explain flagged items and issues\n- **Re-run agents** - Re-validate specific documents\n- **Upload documents** - Guide you through missing documents\n- **Check status** - Show current verification progress\n- **Add notes** - Include analyst observations in the report\n\nWhat would you like to do?",
          "assistant"
        )
      }

      setIsProcessing(false)
    },
    [addChatMessage, fundingSources, currentStage]
  )

  const handleStageClick = useCallback((stage: WorkflowStage) => {
    // Allow going back to previous stages or current stage
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Source of Funds Agent
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Compliance Verification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCaseId && (
                <span className="text-xs bg-accent px-2 py-1 rounded text-muted-foreground">
                  Case: {EXAMPLE_CASES.find(c => c.id === selectedCaseId)?.name}
                </span>
              )}
              <span className="text-sm text-muted-foreground">Demo Version</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stage Indicator */}
      <div className="border-b border-border bg-card/50 py-6 print:hidden">
        <div className="container mx-auto px-4">
          <StageIndicator
            currentStage={currentStage}
            onStageClick={handleStageClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stage Content */}
          <div className="lg:col-span-2">{renderStageContent()}</div>

          {/* Chat Panel */}
          <div className="lg:col-span-1 h-[calc(100vh-280px)] min-h-[500px] print:hidden">
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
