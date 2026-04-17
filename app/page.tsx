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
  generateMockFundingSources,
  generateMockValidationResult,
  generateMockAuditReport,
  INITIAL_CHAT_MESSAGES,
} from "@/lib/mock-data"

export default function SOFAgentPage() {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(1)
  const [statement, setStatement] = useState("")
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

  const handleAnalyzeStatement = useCallback(async () => {
    setIsProcessing(true)
    addChatMessage(
      "Analyzing your statement to identify funding sources and required documents...",
      "assistant"
    )

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const sources = generateMockFundingSources()
    setFundingSources(sources)

    const totalDocs = sources.reduce(
      (sum, fs) => sum + fs.requiredDocuments.length,
      0
    )

    addChatMessage(
      `Analysis complete! I identified ${sources.length} funding sources requiring ${totalDocs} documents for verification:\n\n` +
        sources
          .map(
            (s) =>
              `- ${s.description} (${s.requiredDocuments.length} documents needed)`
          )
          .join("\n"),
      "assistant"
    )

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
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setFundingSources((prev) =>
      prev.map((source) => ({
        ...source,
        requiredDocuments: source.requiredDocuments.map((doc) => {
          if (doc.status === "uploaded") {
            const result = generateMockValidationResult(doc.type, Math.random() > 0.15)
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

    addChatMessage(
      "Validation complete! The specialized agents have processed all documents. Review the results and I can answer any questions about the findings.",
      "assistant"
    )

    setCurrentStage(3)
    setIsProcessing(false)
  }, [addChatMessage])

  const handleRerunAgent = useCallback(
    async (agentType: AgentType, documentId: string) => {
      setIsProcessing(true)
      addChatMessage(
        `Re-running ${agentType} agent on the selected document...`,
        "assistant",
        agentType
      )

      await new Promise((resolve) => setTimeout(resolve, 1500))

      addChatMessage(
        `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent validation complete. Results have been updated.`,
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

    const report = generateMockAuditReport(fundingSources)
    setAuditReport(report)

    addChatMessage(
      `Audit report generated successfully!\n\nSummary:\n- Total Funds Verified: £${report.totalFundsVerified.toLocaleString()}\n- Documents Validated: ${report.validationSummary.validatedDocuments}/${report.validationSummary.totalDocuments}\n- Plausibility Score: ${report.plausibilityScore}%\n- Status: ${report.overallStatus.toUpperCase()}`,
      "assistant"
    )

    setCurrentStage(4)
    setIsProcessing(false)
  }, [addChatMessage, fundingSources])

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

      // Simple response logic based on message content
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes("flag") || lowerMessage.includes("issue")) {
        addChatMessage(
          "Based on my analysis, the flagged items typically indicate:\n\n1. Discrepancies between stated amounts and document evidence\n2. Unexplained large transactions\n3. Missing signatures or dates\n4. Inconsistent information across documents\n\nWould you like me to focus on a specific flagged item?",
          "assistant"
        )
      } else if (lowerMessage.includes("re-run") || lowerMessage.includes("rerun")) {
        const agents = ["payroll", "banking", "legal", "property"]
        const mentionedAgent = agents.find((a) => lowerMessage.includes(a))
        if (mentionedAgent) {
          addChatMessage(
            `I'll re-run the ${mentionedAgent} agent with the current documents. This may help if you've provided additional context or if you want a fresh analysis.`,
            "assistant",
            mentionedAgent as AgentType
          )
        } else {
          addChatMessage(
            "Which agent would you like me to re-run? Available agents are: Payroll, Banking, Legal, and Property.",
            "assistant"
          )
        }
      } else if (lowerMessage.includes("summary") || lowerMessage.includes("finding")) {
        addChatMessage(
          `Here's a summary of the current findings:\n\n- ${fundingSources.length} funding sources identified\n- ${fundingSources.reduce((sum, fs) => sum + fs.requiredDocuments.length, 0)} total documents processed\n- Most documents show strong correlation with the applicant's statement\n\nThe verification process is ${currentStage < 4 ? "still in progress" : "complete"}.`,
          "assistant"
        )
      } else if (lowerMessage.includes("missing") || lowerMessage.includes("document")) {
        const missingDocs = fundingSources.flatMap((fs) =>
          fs.requiredDocuments.filter((d) => d.status === "missing")
        )
        if (missingDocs.length > 0) {
          addChatMessage(
            `There are ${missingDocs.length} documents still missing:\n\n${missingDocs.map((d) => `- ${d.name}`).join("\n")}\n\nPlease upload these to proceed with validation.`,
            "assistant"
          )
        } else {
          addChatMessage(
            "All required documents have been uploaded! You can proceed with the validation process.",
            "assistant"
          )
        }
      } else {
        addChatMessage(
          "I understand you're asking about the source of funds verification. I can help you with:\n\n- Explaining flagged items\n- Re-running specific agents\n- Summarizing findings\n- Checking document status\n\nWhat would you like to know more about?",
          "assistant"
        )
      }

      setIsProcessing(false)
    },
    [addChatMessage, fundingSources, currentStage]
  )

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
      <header className="border-b border-border bg-card">
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
            <div className="text-sm text-muted-foreground">
              Demo Version
            </div>
          </div>
        </div>
      </header>

      {/* Stage Indicator */}
      <div className="border-b border-border bg-card/50 py-6">
        <div className="container mx-auto px-4">
          <StageIndicator
            currentStage={currentStage}
            onStageClick={setCurrentStage}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stage Content */}
          <div className="lg:col-span-2">{renderStageContent()}</div>

          {/* Chat Panel */}
          <div className="lg:col-span-1 h-[calc(100vh-280px)] min-h-[500px]">
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
