"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { FundingSource, RequiredDocument } from "@/lib/sof-types"
import {
  CheckCircle2,
  XCircle,
  Upload,
  ChevronDown,
  FileText,
  AlertTriangle,
  Briefcase,
  Gift,
  PiggyBank,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StageChecklistProps {
  fundingSources: FundingSource[]
  onUploadDocument: (sourceId: string, documentId: string) => void
  onValidateAll: () => void
  isProcessing: boolean
}

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  employment: Briefcase,
  gift: Gift,
  savings: PiggyBank,
  property_sale: Home,
  property_equity: Home,
  investment: FileText,
  investments: FileText,
  inheritance: FileText,
  business_income: Briefcase,
  business: Briefcase,
  loan: FileText,
}

function getStatusIcon(status: RequiredDocument["status"]) {
  switch (status) {
    case "validated":
      return <CheckCircle2 className="w-5 h-5 text-success" />
    case "flagged":
      return <AlertTriangle className="w-5 h-5 text-warning" />
    case "uploaded":
      return <CheckCircle2 className="w-5 h-5 text-info" />
    default:
      return <XCircle className="w-5 h-5 text-destructive" />
  }
}

function getStatusBadge(status: RequiredDocument["status"]) {
  const variants: Record<RequiredDocument["status"], { label: string; className: string }> = {
    missing: { label: "Missing", className: "bg-destructive text-destructive-foreground" },
    uploaded: { label: "Uploaded", className: "bg-info text-info-foreground" },
    validated: { label: "Validated", className: "bg-success text-success-foreground" },
    flagged: { label: "Flagged", className: "bg-warning text-warning-foreground" },
  }
  const { label, className } = variants[status]
  return <Badge className={className}>{label}</Badge>
}

export function StageChecklist({
  fundingSources,
  onUploadDocument,
  onValidateAll,
  isProcessing,
}: StageChecklistProps) {
  const [openSources, setOpenSources] = useState<string[]>(
    fundingSources.map((fs) => fs.id)
  )

  const toggleSource = (sourceId: string) => {
    setOpenSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const allDocumentsUploaded = fundingSources.every((fs) =>
    fs.requiredDocuments.every((doc) => doc.status !== "missing")
  )

  const totalDocs = fundingSources.reduce(
    (sum, fs) => sum + fs.requiredDocuments.length,
    0
  )
  const uploadedDocs = fundingSources.reduce(
    (sum, fs) =>
      sum + fs.requiredDocuments.filter((d) => d.status !== "missing").length,
    0
  )

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Stage 2: Document Checklist</CardTitle>
                <CardDescription>
                  Upload required documents for each funding source
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {uploadedDocs}/{totalDocs}
              </p>
              <p className="text-xs text-muted-foreground">Documents Ready</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {fundingSources.map((source) => {
            const Icon = sourceIcons[source.type] || FileText
            const isOpen = openSources.includes(source.id)
            const uploadedCount = source.requiredDocuments.filter(
              (d) => d.status !== "missing"
            ).length

            return (
              <Collapsible
                key={source.id}
                open={isOpen}
                onOpenChange={() => toggleSource(source.id)}
              >
                <Card className="border-border/50">
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{source.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {uploadedCount}/{source.requiredDocuments.length} documents
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border/50 p-4 space-y-4">
                      {source.requiredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 bg-accent/30 rounded-lg space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(doc.status)}
                              <div>
                                <p className="font-medium text-foreground">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.description}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(doc.status)}
                          </div>

                          <div className="ml-8 space-y-3">
                            <div className="p-3 bg-background rounded border border-border/50">
                              <p className="text-xs font-medium text-primary mb-1">
                                Why this document is needed:
                              </p>
                              <p className="text-sm text-muted-foreground">{doc.reason}</p>
                            </div>

                            <div className="p-3 bg-background rounded border border-border/50">
                              <p className="text-xs font-medium text-primary mb-2">
                                What will be checked:
                              </p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {doc.whatWillBeChecked.map((check, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    {check}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {doc.status === "missing" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onUploadDocument(source.id, doc.id)}
                                className="mt-2"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Document
                              </Button>
                            )}

                            {doc.file && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span>{doc.file.name}</span>
                                <span className="text-xs">
                                  ({(doc.file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}

          <div className="pt-4 border-t border-border space-y-3">
            <Button
              onClick={onValidateAll}
              disabled={uploadedDocs === 0 || isProcessing}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                "Processing Documents..."
              ) : uploadedDocs === totalDocs ? (
                "Run Validation Agents"
              ) : uploadedDocs > 0 ? (
                `Run Validation on ${uploadedDocs} Document${uploadedDocs > 1 ? "s" : ""} (${totalDocs - uploadedDocs} missing)`
              ) : (
                "Upload Documents to Continue"
              )}
            </Button>
            {uploadedDocs > 0 && uploadedDocs < totalDocs && (
              <p className="text-xs text-center text-muted-foreground">
                You can proceed with partial documents. Missing documents can be uploaded later and re-validated.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
