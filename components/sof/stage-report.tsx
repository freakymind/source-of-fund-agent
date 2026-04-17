"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AuditReport } from "@/lib/sof-types"
import {
  ClipboardList,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StageReportProps {
  report: AuditReport
  onExportPDF: () => void
  onPrint: () => void
}

export function StageReport({ report, onExportPDF, onPrint }: StageReportProps) {
  const statusConfig = {
    approved: {
      label: "APPROVED",
      color: "bg-success text-success-foreground",
      icon: CheckCircle2,
    },
    flagged: {
      label: "FLAGGED - REVIEW REQUIRED",
      color: "bg-destructive text-destructive-foreground",
      icon: AlertTriangle,
    },
    pending: {
      label: "PENDING",
      color: "bg-warning text-warning-foreground",
      icon: Clock,
    },
  }

  const status = statusConfig[report.overallStatus]
  const StatusIcon = status.icon

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: report.currency,
    }).format(amount)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date)

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-2 border-primary/30 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">
                  Official Compliance Document
                </p>
                <h2 className="text-3xl font-bold">Source of Funds Audit Report</h2>
                <p className="text-primary-foreground/80 mt-1">
                  Report ID: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{report.id}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onExportPDF}
                className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrint}
                className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-md"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="pt-8 space-y-8">
          {/* Status Banner */}
          <div className={cn(
            "p-5 rounded-xl flex items-center gap-4 shadow-sm",
            status.color,
            report.overallStatus === "approved" && "ring-2 ring-success/30",
            report.overallStatus === "flagged" && "ring-2 ring-destructive/30",
            report.overallStatus === "pending" && "ring-2 ring-warning/30"
          )}>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{status.label}</p>
              <p className="text-sm opacity-90">
                Generated on {formatDate(report.generatedAt)}
              </p>
            </div>
            {report.overallStatus === "approved" && (
              <Badge className="bg-white/20 text-white text-sm px-4 py-1">
                Ready for Approval
              </Badge>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-5">
            <Card className="p-5 bg-gradient-to-br from-accent/50 to-accent/20 border-2 border-border/50 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Applicant</p>
              <p className="font-bold text-lg text-foreground">{report.applicantName}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Total Funds Verified</p>
              <p className="font-bold text-xl text-primary">
                {formatCurrency(report.totalFundsVerified)}
              </p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-accent/50 to-accent/20 border-2 border-border/50 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Documents Reviewed</p>
              <p className="font-bold text-xl text-foreground">
                {report.validationSummary.totalDocuments}
              </p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-accent/50 to-accent/20 border-2 border-border/50 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Plausibility Score</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  report.plausibilityScore >= 80 ? "bg-success/20" : "bg-warning/20"
                )}>
                  <TrendingUp
                    className={cn(
                      "w-5 h-5",
                      report.plausibilityScore >= 80 ? "text-success" : "text-warning"
                    )}
                  />
                </div>
                <p className={cn(
                  "font-bold text-xl",
                  report.plausibilityScore >= 80 ? "text-success" : "text-warning"
                )}>
                  {report.plausibilityScore}%
                </p>
              </div>
            </Card>
          </div>

          {/* Executive Summary */}
          <Card className="p-4 border-primary/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Executive Summary
            </h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-3">
                This Source of Funds verification was conducted for <strong className="text-foreground">{report.applicantName}</strong> who 
                declared a total of <strong className="text-foreground">{formatCurrency(report.totalFundsVerified)}</strong> from{" "}
                <strong className="text-foreground">{report.fundingSources.length} funding source{report.fundingSources.length > 1 ? "s" : ""}</strong>.
              </p>
              <p className="mb-3">
                <strong className="text-foreground">Funding Sources Declared:</strong>{" "}
                {report.fundingSources.map((s, i) => (
                  <span key={s.id}>
                    {s.description} ({formatCurrency(s.amount)}){i < report.fundingSources.length - 1 ? ", " : "."}
                  </span>
                ))}
              </p>
              <p className="mb-3">
                <strong className="text-foreground">Verification Process:</strong> A total of{" "}
                <strong className="text-foreground">{report.validationSummary.totalDocuments} documents</strong> were submitted and processed 
                by specialized AI agents (Payroll, Banking, Legal, Property). Each document was cross-referenced against the 
                applicant&apos;s statement to verify claimed amounts, durations, and relationships.
              </p>
              <p className="mb-3">
                <strong className="text-foreground">Outcome:</strong>{" "}
                {report.validationSummary.validatedDocuments === report.validationSummary.totalDocuments ? (
                  <span className="text-success">All documents have been successfully validated. Claims align with documentary evidence.</span>
                ) : report.validationSummary.flaggedDocuments > 0 ? (
                  <span className="text-destructive">
                    {report.validationSummary.flaggedDocuments} document{report.validationSummary.flaggedDocuments > 1 ? "s" : ""} flagged 
                    for manual review due to discrepancies between stated claims and documentary evidence.
                  </span>
                ) : (
                  <span className="text-warning">
                    {report.validationSummary.pendingDocuments} document{report.validationSummary.pendingDocuments > 1 ? "s" : ""} still 
                    pending verification.
                  </span>
                )}
              </p>
              <p>
                <strong className="text-foreground">Plausibility Assessment:</strong> Based on income analysis, savings patterns, 
                and document verification, the overall plausibility score is{" "}
                <strong className={cn(
                  report.plausibilityScore >= 80 ? "text-success" : report.plausibilityScore >= 50 ? "text-warning" : "text-destructive"
                )}>
                  {report.plausibilityScore}%
                </strong>.
                {report.plausibilityScore >= 80 
                  ? " The declared source of funds appears consistent with documented evidence."
                  : report.plausibilityScore >= 50 
                    ? " Some aspects require additional clarification or documentation."
                    : " Significant concerns exist that warrant further investigation."
                }
              </p>
            </div>
          </Card>

          {/* Validation Summary */}
          <Card className="p-4 border-2 border-primary/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Validation Summary
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-accent/30 rounded-lg border border-border/50">
                <p className="text-3xl font-bold text-foreground">
                  {report.validationSummary.totalDocuments}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Documents</p>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg border border-success/30">
                <p className="text-3xl font-bold text-success">
                  {report.validationSummary.validatedDocuments}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Validated</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-3xl font-bold text-destructive">
                  {report.validationSummary.flaggedDocuments}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Flagged</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/30">
                <p className="text-3xl font-bold text-warning">
                  {report.validationSummary.pendingDocuments}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Pending</p>
              </div>
            </div>
          </Card>

          {/* Missing Documents Alert Section */}
          {report.validationSummary.pendingDocuments > 0 && (
            <Card className="p-5 border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-warning mb-2">
                    Verification Incomplete - Documents Required
                  </h3>
                  <p className="text-sm text-foreground mb-4">
                    This Source of Funds verification cannot be fully completed. The following documents 
                    are required from the applicant to validate their stated claims:
                  </p>
                  
                  <div className="bg-white/80 rounded-lg p-4 border border-warning/30 mb-4">
                    <p className="font-semibold text-foreground mb-3">Missing Documents:</p>
                    <div className="space-y-3">
                      {report.fundingSources.flatMap((source) =>
                        source.requiredDocuments
                          .filter((doc) => doc.status === "missing")
                          .map((doc) => (
                            <div key={doc.id} className="flex items-start gap-3 p-3 bg-warning/5 rounded border border-warning/20">
                              <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{doc.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">For:</span> {source.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Required to verify:</span> {doc.checksToPerform?.join(", ") || doc.reason}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="font-semibold text-primary mb-2">Action Required:</p>
                    <p className="text-sm text-foreground">
                      Please request the above documents from the applicant. Once received, upload them 
                      to the system and re-run the validation process to complete the Source of Funds verification.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Detailed Findings by Funding Source */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-foreground">Detailed Findings by Funding Source</h3>
            <div className="space-y-6">
              {report.fundingSources.map((source) => (
                <div key={source.id} className="border border-border/50 rounded-lg overflow-hidden">
                  {/* Source Header */}
                  <div className="flex items-center justify-between p-4 bg-accent/30">
                    <div>
                      <p className="font-medium text-foreground">{source.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Type: {source.type.replace("_", " ")} | Amount: {formatCurrency(source.amount)}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        source.requiredDocuments.every((d) => d.status === "validated")
                          ? "bg-success"
                          : source.requiredDocuments.some((d) => d.status === "flagged")
                            ? "bg-destructive"
                            : "bg-warning"
                      )}
                    >
                      {source.requiredDocuments.filter((d) => d.status === "validated").length}/
                      {source.requiredDocuments.length} verified
                    </Badge>
                  </div>
                  
                  {/* Statement Excerpt */}
                  <div className="p-3 bg-primary/5 border-b border-border/50">
                    <p className="text-xs font-semibold text-primary mb-1">Applicant Stated:</p>
                    <p className="text-sm text-foreground italic">&quot;{source.statementExcerpt}&quot;</p>
                  </div>
                  
                  {/* Document Findings */}
                  <div className="p-4 space-y-3">
                    {source.requiredDocuments.map((doc) => (
                      <div key={doc.id} className="p-3 bg-background rounded border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground text-sm">{doc.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              doc.status === "validated" && "border-success text-success",
                              doc.status === "flagged" && "border-destructive text-destructive",
                              doc.status === "uploaded" && "border-info text-info",
                              doc.status === "missing" && "border-muted-foreground text-muted-foreground"
                            )}
                          >
                            {doc.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {doc.validationResult && (
                          <div className="space-y-2 mt-2">
                            <p className="text-xs text-muted-foreground">
                              <strong>Checks Performed:</strong>
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                              {doc.validationResult.matches.map((match, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  {match.status === "match" ? (
                                    <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                                  ) : match.status === "partial" ? (
                                    <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                                  )}
                                  <span>
                                    {match.statementClaim}: {match.documentEvidence}
                                    {match.analysis && <span className="italic text-muted-foreground/70"> ({match.analysis})</span>}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {doc.validationResult.plausibilityAnalysis && (
                              <div className="mt-2 pt-2 border-t border-border/30">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Plausibility:</strong>{" "}
                                  <span className={cn(
                                    doc.validationResult.plausibilityAnalysis.conclusion === "plausible" && "text-success",
                                    doc.validationResult.plausibilityAnalysis.conclusion === "questionable" && "text-warning",
                                    doc.validationResult.plausibilityAnalysis.conclusion === "implausible" && "text-destructive"
                                  )}>
                                    {doc.validationResult.plausibilityAnalysis.conclusion.toUpperCase()}
                                  </span>
                                  {" - "}
                                  {doc.validationResult.plausibilityAnalysis.reasoning[0]}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-foreground mt-2 p-2 bg-accent/30 rounded">
                              <strong>Summary:</strong> {doc.validationResult.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Flagged Items */}
          {report.flaggedItems.length > 0 && (
            <Card className="p-4 border-destructive/30 bg-destructive/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Items Requiring Review
              </h3>
              <div className="space-y-3">
                {report.flaggedItems.map((item, i) => (
                  <div key={i} className="p-3 bg-background rounded border border-destructive/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={cn(
                          "text-xs",
                          item.severity === "high" && "bg-destructive",
                          item.severity === "medium" && "bg-warning",
                          item.severity === "low" && "bg-info"
                        )}
                      >
                        {item.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-foreground">{item.message}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-2">
                      Recommendation: {item.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Agent Detailed Analysis */}
          {report.notes && report.notes.length > 0 && (
            <Card className="p-5 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary text-lg">
                <FileText className="w-5 h-5" />
                AI Agent Detailed Analysis
              </h3>
              <div className="space-y-4">
                {report.notes.map((note, i) => {
                  const isFinalAssessment = note.startsWith("FINAL ASSESSMENT:")
                  const isSource = note.startsWith("SOURCE")
                  
                  // Function to format note content with highlighting
                  const formatNoteContent = (content: string) => {
                    // Split by lines and format each
                    return (
                      <div className="space-y-2">
                        {content.split("\n").map((line, lineIndex) => {
                          // Highlight specific patterns
                          if (line.startsWith("Statement Excerpt:")) {
                            return (
                              <div key={lineIndex} className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                                <span className="font-semibold text-yellow-800">Statement Excerpt:</span>
                                <p className="italic text-foreground mt-1">{line.replace("Statement Excerpt:", "").trim()}</p>
                              </div>
                            )
                          }
                          if (line.includes("[VERIFIED]")) {
                            return (
                              <div key={lineIndex} className="flex items-start gap-2 py-1">
                                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{line.replace("[VERIFIED]", "").replace("- ", "")}</span>
                              </div>
                            )
                          }
                          if (line.includes("[PARTIAL]")) {
                            return (
                              <div key={lineIndex} className="flex items-start gap-2 py-1">
                                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{line.replace("[PARTIAL]", "").replace("- ", "")}</span>
                              </div>
                            )
                          }
                          if (line.includes("[MISMATCH]")) {
                            return (
                              <div key={lineIndex} className="flex items-start gap-2 py-1">
                                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <span className="text-destructive">{line.replace("[MISMATCH]", "").replace("- ", "")}</span>
                              </div>
                            )
                          }
                          if (line.startsWith("CONCLUSION:")) {
                            const isFullyVerified = line.includes("FULLY VERIFIED")
                            const requiresReview = line.includes("REQUIRES REVIEW")
                            return (
                              <div key={lineIndex} className={cn(
                                "mt-3 p-3 rounded font-medium",
                                isFullyVerified && "bg-success/10 text-success border border-success/30",
                                requiresReview && "bg-warning/10 text-warning border border-warning/30",
                                !isFullyVerified && !requiresReview && "bg-destructive/10 text-destructive border border-destructive/30"
                              )}>
                                {line}
                              </div>
                            )
                          }
                          if (line.startsWith("Extracted Data:")) {
                            return (
                              <div key={lineIndex} className="py-1 px-2 bg-accent/50 rounded text-xs font-mono my-1">
                                <span className="font-semibold text-primary">Extracted:</span> {line.replace("Extracted Data:", "").trim()}
                              </div>
                            )
                          }
                          if (line.startsWith("Plausibility:")) {
                            const isPlausible = line.includes("PLAUSIBLE")
                            const isQuestionable = line.includes("QUESTIONABLE")
                            return (
                              <div key={lineIndex} className={cn(
                                "py-1 px-2 rounded text-xs my-1",
                                isPlausible && "bg-success/10 text-success",
                                isQuestionable && "bg-warning/10 text-warning",
                                !isPlausible && !isQuestionable && "bg-destructive/10 text-destructive"
                              )}>
                                {line}
                              </div>
                            )
                          }
                          if (line.includes("FLAG") && line.includes("):")) {
                            return (
                              <div key={lineIndex} className="flex items-start gap-2 py-1 px-2 bg-destructive/10 rounded my-1">
                                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <span className="text-destructive text-xs">{line}</span>
                              </div>
                            )
                          }
                          if (line.startsWith("[") && line.includes("]")) {
                            const docName = line.match(/\[([^\]]+)\]/)?.[1] || ""
                            const status = line.split(" - ")[1]?.trim() || ""
                            return (
                              <div key={lineIndex} className="flex items-center gap-2 py-2 mt-2 border-b border-border/30">
                                <Badge variant="outline" className="text-xs">{docName}</Badge>
                                <Badge className={cn(
                                  "text-xs",
                                  status === "VALIDATED" && "bg-success",
                                  status === "FLAGGED" && "bg-destructive",
                                  status === "MISSING" && "bg-muted"
                                )}>{status}</Badge>
                              </div>
                            )
                          }
                          if (line.trim() === "") return <div key={lineIndex} className="h-2" />
                          return <p key={lineIndex} className="text-foreground/80 text-sm py-0.5">{line}</p>
                        })}
                      </div>
                    )
                  }
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "rounded-lg text-sm",
                        isFinalAssessment 
                          ? "p-5 bg-white border-2 border-primary/40 shadow-sm" 
                          : isSource
                            ? "p-4 bg-white/70 border border-border/60"
                            : "p-4 bg-white/50 border border-border/50"
                      )}
                    >
                      {isFinalAssessment ? (
                        <div>
                          <Badge className="bg-primary mb-3">Final Assessment</Badge>
                          <div className="mt-2 space-y-2 text-foreground leading-relaxed">
                            {note.replace("FINAL ASSESSMENT: ", "").split("\n\n").map((para, pIndex) => (
                              <p key={pIndex} className={cn(
                                "text-sm",
                                para.startsWith("Total funds verified") && "font-semibold text-success",
                                para.startsWith("Recommendation") && "italic text-muted-foreground"
                              )}>{para}</p>
                            ))}
                          </div>
                        </div>
                      ) : isSource ? (
                        <div>
                          <Badge variant="outline" className="border-primary text-primary mb-3">
                            {note.split("\n")[0]}
                          </Badge>
                          <div className="mt-2">
                            {formatNoteContent(note.split("\n").slice(1).join("\n"))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-foreground leading-relaxed">
                          {formatNoteContent(note)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Audit Trail */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-foreground">Audit Trail</h3>
            <div className="space-y-0">
              {report.auditTrail.map((entry, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {i < report.auditTrail.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{entry.action}</p>
                      {entry.agent && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {entry.agent} Agent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="text-center py-6 px-8 bg-accent/20 rounded-xl border border-border/50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Source of Funds Verification System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This report is generated for compliance and audit purposes.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Report generated on {formatDate(report.generatedAt)} | Document ID: {report.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
