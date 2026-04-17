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
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Source of Funds Audit Report</h2>
                <p className="text-primary-foreground/80">
                  Report ID: {report.id}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onExportPDF}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrint}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Status Banner */}
          <div className={cn("p-4 rounded-lg flex items-center gap-3", status.color)}>
            <StatusIcon className="w-6 h-6" />
            <div>
              <p className="font-bold">{status.label}</p>
              <p className="text-sm opacity-90">
                Generated on {formatDate(report.generatedAt)}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Applicant</p>
              <p className="font-semibold text-foreground">{report.applicantName}</p>
            </Card>
            <Card className="p-4 bg-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Total Funds Verified</p>
              <p className="font-semibold text-foreground">
                {formatCurrency(report.totalFundsVerified)}
              </p>
            </Card>
            <Card className="p-4 bg-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Documents Reviewed</p>
              <p className="font-semibold text-foreground">
                {report.validationSummary.totalDocuments}
              </p>
            </Card>
            <Card className="p-4 bg-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Plausibility Score</p>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={cn(
                    "w-4 h-4",
                    report.plausibilityScore >= 80 ? "text-success" : "text-warning"
                  )}
                />
                <p className="font-semibold text-foreground">{report.plausibilityScore}%</p>
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
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Validation Summary
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-accent/30 rounded">
                <p className="text-2xl font-bold text-foreground">
                  {report.validationSummary.totalDocuments}
                </p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded">
                <p className="text-2xl font-bold text-success">
                  {report.validationSummary.validatedDocuments}
                </p>
                <p className="text-xs text-muted-foreground">Validated</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded">
                <p className="text-2xl font-bold text-destructive">
                  {report.validationSummary.flaggedDocuments}
                </p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded">
                <p className="text-2xl font-bold text-warning">
                  {report.validationSummary.pendingDocuments}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>

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

          {/* Analyst Notes */}
          {report.notes && report.notes.length > 0 && (
            <Card className="p-4 border-primary/30 bg-primary/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                Analyst Notes &amp; Recommendations
              </h3>
              <ul className="space-y-2">
                {report.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
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

          <Separator />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This report is generated for compliance and audit purposes.</p>
            <p>NatWest Source of Funds Verification System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
