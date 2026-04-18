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
                                  <span className="font-medium">Required to verify:</span> {doc.whatWillBeChecked?.join(", ") || doc.reason}
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

          {/* Key Findings at a Glance */}
          <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-white to-accent/10">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Key Findings at a Glance
            </h3>
            <div className="grid gap-4">
              {report.fundingSources.map((source) => {
                const allVerified = source.requiredDocuments.every((d) => d.status === "validated")
                const hasFlags = source.requiredDocuments.some((d) => d.status === "flagged")
                const hasMissing = source.requiredDocuments.some((d) => d.status === "missing")
                
                return (
                  <div 
                    key={source.id} 
                    className={cn(
                      "p-4 rounded-xl border-2 flex items-center gap-4",
                      allVerified && "bg-success/5 border-success/30",
                      hasFlags && "bg-destructive/5 border-destructive/30",
                      hasMissing && !hasFlags && "bg-warning/5 border-warning/30"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                      allVerified && "bg-success/20",
                      hasFlags && "bg-destructive/20",
                      hasMissing && !hasFlags && "bg-warning/20"
                    )}>
                      {allVerified ? (
                        <CheckCircle2 className="w-7 h-7 text-success" />
                      ) : hasFlags ? (
                        <AlertTriangle className="w-7 h-7 text-destructive" />
                      ) : (
                        <Clock className="w-7 h-7 text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {source.type.replace("_", " ")}
                        </Badge>
                        <Badge className={cn(
                          "text-xs",
                          allVerified && "bg-success",
                          hasFlags && "bg-destructive",
                          hasMissing && !hasFlags && "bg-warning"
                        )}>
                          {allVerified ? "VERIFIED" : hasFlags ? "FLAGGED" : "PENDING"}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground truncate">{source.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {source.requiredDocuments.filter((d) => d.status === "validated").length} of {source.requiredDocuments.length} documents verified
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(source.amount)}</p>
                      <p className="text-xs text-muted-foreground">Claimed Amount</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Detailed Findings by Funding Source */}
          <Card className="p-5 border-2 border-border/50">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Detailed Verification Results
            </h3>
            <div className="space-y-6">
              {report.fundingSources.map((source, sourceIndex) => (
                <div key={source.id} className="border-2 border-border/30 rounded-xl overflow-hidden">
                  {/* Source Header */}
                  <div className={cn(
                    "flex items-center justify-between p-5",
                    source.requiredDocuments.every((d) => d.status === "validated")
                      ? "bg-success/10"
                      : source.requiredDocuments.some((d) => d.status === "flagged")
                        ? "bg-destructive/10"
                        : "bg-warning/10"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary">{sourceIndex + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{source.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {source.type.replace("_", " ")}
                          </Badge>
                          <span className="text-sm font-semibold text-primary">{formatCurrency(source.amount)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-sm px-4 py-1",
                        source.requiredDocuments.every((d) => d.status === "validated")
                          ? "bg-success"
                          : source.requiredDocuments.some((d) => d.status === "flagged")
                            ? "bg-destructive"
                            : "bg-warning"
                      )}
                    >
                      {source.requiredDocuments.filter((d) => d.status === "validated").length}/
                      {source.requiredDocuments.length} Verified
                    </Badge>
                  </div>
                  
                  {/* Statement Excerpt */}
                  <div className="p-4 bg-yellow-50 border-y border-yellow-200">
                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Applicant&apos;s Statement</p>
                    <p className="text-sm text-foreground italic leading-relaxed">&quot;{source.statementExcerpt}&quot;</p>
                  </div>
                  
                  {/* Document Findings */}
                  <div className="p-5 space-y-4 bg-white">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Analysis</p>
                    {source.requiredDocuments.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={cn(
                          "p-4 rounded-lg border-2",
                          doc.status === "validated" && "bg-success/5 border-success/20",
                          doc.status === "flagged" && "bg-destructive/5 border-destructive/20",
                          doc.status === "missing" && "bg-muted/30 border-muted",
                          doc.status === "uploaded" && "bg-accent/30 border-border/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {doc.status === "validated" ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : doc.status === "flagged" ? (
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            ) : doc.status === "missing" ? (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary" />
                            )}
                            <p className="font-semibold text-foreground">{doc.name}</p>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs",
                              doc.status === "validated" && "bg-success",
                              doc.status === "flagged" && "bg-destructive",
                              doc.status === "missing" && "bg-muted text-muted-foreground",
                              doc.status === "uploaded" && "bg-primary"
                            )}
                          >
                            {doc.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {doc.validationResult && (
                          <div className="space-y-3">
                            {/* Extracted Data Highlight */}
                            {doc.validationResult.extractedData && doc.validationResult.extractedData.length > 0 && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Key Data Extracted</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {doc.validationResult.extractedData.map((data, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">{data.label}:</span>
                                      <span className="font-semibold text-foreground">{data.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Verification Checks */}
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verification Checks</p>
                              <div className="space-y-1.5">
                                {doc.validationResult.matches.map((match, i) => (
                                  <div 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-3 p-2.5 rounded-lg text-sm",
                                      match.status === "match" && "bg-success/10",
                                      match.status === "partial" && "bg-warning/10",
                                      match.status === "mismatch" && "bg-destructive/10"
                                    )}
                                  >
                                    {match.status === "match" ? (
                                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    ) : match.status === "partial" ? (
                                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-foreground">{match.statementClaim}</p>
                                      <p className="text-muted-foreground text-xs mt-0.5">
                                        Document shows: <span className="font-medium text-foreground">{match.documentEvidence}</span>
                                      </p>
                                      {match.analysis && (
                                        <p className="text-xs italic text-muted-foreground mt-1">{match.analysis}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Plausibility */}
                            {doc.validationResult.plausibilityAnalysis && (
                              <div className={cn(
                                "p-3 rounded-lg border",
                                doc.validationResult.plausibilityAnalysis.conclusion === "plausible" && "bg-success/5 border-success/30",
                                doc.validationResult.plausibilityAnalysis.conclusion === "questionable" && "bg-warning/5 border-warning/30",
                                doc.validationResult.plausibilityAnalysis.conclusion === "implausible" && "bg-destructive/5 border-destructive/30"
                              )}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plausibility:</span>
                                  <Badge className={cn(
                                    "text-xs",
                                    doc.validationResult.plausibilityAnalysis.conclusion === "plausible" && "bg-success",
                                    doc.validationResult.plausibilityAnalysis.conclusion === "questionable" && "bg-warning",
                                    doc.validationResult.plausibilityAnalysis.conclusion === "implausible" && "bg-destructive"
                                  )}>
                                    {doc.validationResult.plausibilityAnalysis.conclusion.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground">{doc.validationResult.plausibilityAnalysis.reasoning[0]}</p>
                              </div>
                            )}

                            {/* Summary */}
                            <div className="p-3 bg-accent/50 rounded-lg">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                              <p className="text-sm text-foreground">{doc.validationResult.summary}</p>
                            </div>
                          </div>
                        )}

                        {doc.status === "missing" && (
                          <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 mt-2">
                            <p className="text-sm text-warning font-medium">This document is required to verify: {doc.reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Flagged Items - Action Required */}
          {report.flaggedItems.length > 0 && (
            <Card className="p-5 border-2 border-destructive/40 bg-gradient-to-br from-destructive/10 to-destructive/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-destructive">Action Required</h3>
                    <p className="text-sm text-muted-foreground">{report.flaggedItems.length} item(s) require analyst review</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {report.flaggedItems.map((item, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border-2 border-destructive/20 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Badge
                          className={cn(
                            "text-xs mt-0.5 flex-shrink-0",
                            item.severity === "high" && "bg-destructive",
                            item.severity === "medium" && "bg-warning",
                            item.severity === "low" && "bg-info"
                          )}
                        >
                          {item.severity.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground mb-2">{item.message}</p>
                          <div className="p-2 bg-primary/5 rounded border border-primary/20">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended Action</p>
                            <p className="text-sm text-foreground">{item.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
