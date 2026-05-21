"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { EXAMPLE_CASES, generateFundingSourcesForCase } from "@/lib/mock-data"
import type { FundingSource } from "@/lib/sof-types"
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  ChevronRight,
  X,
  Sparkles,
  PoundSterling,
  User,
  FileCheck,
  HelpCircle,
  ArrowRight,
} from "lucide-react"

interface UploadedDocument {
  id: string
  name: string
  docType: string
  status: "uploading" | "uploaded" | "verified" | "needs_review"
}

interface RequiredDocInfo {
  id: string
  name: string
  forSource: string
  uploaded: boolean
}

type JourneyStage = "select" | "statement" | "analysis" | "documents" | "verification" | "clarification" | "complete"

export default function CustomerJourneyPage() {
  const [stage, setStage] = useState<JourneyStage>("select")
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [statement, setStatement] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocInfo[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [clarificationNeeded, setClarificationNeeded] = useState<string | null>(null)
  const [clarificationResponse, setClarificationResponse] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadDocId, setCurrentUploadDocId] = useState<string | null>(null)

  // Progress calculation
  const stageOrder: JourneyStage[] = ["select", "statement", "analysis", "documents", "verification", "clarification", "complete"]
  const currentStageIndex = stageOrder.indexOf(stage)
  const progressPercentage = Math.min(100, (currentStageIndex / (stageOrder.length - 1)) * 100)

  // Handle demo case selection
  const handleSelectCase = (caseId: string) => {
    const selectedCase = EXAMPLE_CASES.find(c => c.id === caseId)
    if (!selectedCase) return
    
    setSelectedCaseId(caseId)
    setStatement(selectedCase.statement)
    setStage("statement")
  }

  // Handle statement submission and AI analysis
  const handleSubmitStatement = async () => {
    if (!statement.trim()) return
    
    setIsProcessing(true)
    setStage("analysis")
    
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 2500))
    
    // Generate funding sources based on selected case or default
    const sources = selectedCaseId 
      ? generateFundingSourcesForCase(selectedCaseId)
      : generateFundingSourcesForCase("case-3")
    
    setFundingSources(sources)
    
    // Extract required documents
    const docs: RequiredDocInfo[] = []
    sources.forEach(source => {
      source.requiredDocuments.forEach(doc => {
        docs.push({
          id: doc.id,
          name: doc.name,
          forSource: source.description,
          uploaded: doc.status !== "missing",
        })
      })
    })
    setRequiredDocs(docs)
    
    await new Promise(r => setTimeout(r, 1000))
    setIsProcessing(false)
    setStage("documents")
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    const newDoc: UploadedDocument = {
      id: `upload-${Date.now()}`,
      name: file.name,
      docType: docId,
      status: "uploading",
    }
    
    setUploadedDocs(prev => [...prev, newDoc])
    setRequiredDocs(prev => prev.map(d => d.id === docId ? { ...d, uploaded: true } : d))
    
    // Simulate upload
    setTimeout(() => {
      setUploadedDocs(prev =>
        prev.map(doc => doc.id === newDoc.id ? { ...doc, status: "uploaded" } : doc)
      )
    }, 1500)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setCurrentUploadDocId(null)
  }

  // Handle document submission for verification
  const handleSubmitDocuments = async () => {
    setIsProcessing(true)
    setStage("verification")
    
    // Simulate verification
    await new Promise(r => setTimeout(r, 3000))
    
    // Determine if clarification needed based on case
    const needsClarification = selectedCaseId === "case-4" || selectedCaseId === "case-6"
    
    if (needsClarification) {
      setClarificationNeeded(
        selectedCaseId === "case-4"
          ? "We noticed the salary amount in your payslip (£45,000) doesn't match your stated income (£75,000). Could you please clarify this discrepancy?"
          : "The investment portfolio value shown in documents (£95,000) differs from your stated amount (£120,000). Please provide clarification or updated documentation."
      )
      setIsProcessing(false)
      setStage("clarification")
    } else {
      setIsProcessing(false)
      setStage("complete")
    }
  }

  // Handle clarification submission
  const handleSubmitClarification = async () => {
    if (!clarificationResponse.trim()) return
    
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsProcessing(false)
    setStage("complete")
  }

  // Reset journey
  const handleReset = () => {
    setStage("select")
    setSelectedCaseId(null)
    setStatement("")
    setFundingSources([])
    setRequiredDocs([])
    setUploadedDocs([])
    setClarificationNeeded(null)
    setClarificationResponse("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* NatWest Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Source of Funds Verification</h1>
              <p className="text-xs text-primary-foreground/70">Secure document verification portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <a 
                href="/" 
                className="px-3 py-1.5 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 rounded-md transition-colors"
              >
                Analyst View
              </a>
              <div className="px-3 py-1.5 text-sm font-medium bg-white text-primary rounded-md">
                Customer View
              </div>
            </div>
            <Badge variant="outline" className="border-white/30 text-white text-xs">
              <Clock className="w-3 h-3 mr-1" />
              ~5 minutes
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span className={cn(stage === "select" || stage === "statement" ? "text-primary font-medium" : "")}>Statement</span>
              <span className={cn(stage === "analysis" ? "text-primary font-medium" : "")}>Analysis</span>
              <span className={cn(stage === "documents" ? "text-primary font-medium" : "")}>Documents</span>
              <span className={cn(stage === "verification" || stage === "clarification" ? "text-primary font-medium" : "")}>Verification</span>
              <span className={cn(stage === "complete" ? "text-primary font-medium" : "")}>Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Stage: Select Demo Case */}
        {stage === "select" && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Select a Demo Scenario
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-6">
                Choose a demonstration case to see how the Source of Funds verification process works. 
                Each scenario represents a different customer situation.
              </p>
              
              <div className="grid gap-4">
                {EXAMPLE_CASES.map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => handleSelectCase(caseItem.id)}
                    className={cn(
                      "text-left p-5 rounded-xl border-2 transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            caseItem.complexity === "Simple" && "border-green-600 text-green-600",
                            caseItem.complexity === "Moderate" && "border-amber-600 text-amber-600",
                            caseItem.complexity === "Complex" && "border-red-600 text-red-600",
                          )}>
                            {caseItem.complexity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{caseItem.applicantName}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{caseItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                        <p className="text-xs text-muted-foreground mt-2 italic">{caseItem.scenario}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage: Statement Entry/Review */}
        {stage === "statement" && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Step 1: Your Source of Funds Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What we need from you:</p>
                    <ul className="list-disc ml-4 space-y-1 text-blue-700">
                      <li>Describe where your funds are coming from</li>
                      <li>Include amounts and sources (salary, savings, gifts, etc.)</li>
                      <li>Mention any relevant dates or employment details</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Statement
                </label>
                <Textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Please describe the source(s) of your funds..."
                  className="min-h-[200px] text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStage("select")}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitStatement}
                  disabled={!statement.trim()}
                  className="gap-2"
                >
                  Submit for Analysis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage: AI Analysis */}
        {stage === "analysis" && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Step 2: Analyzing Your Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Agent Processing</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our AI is analyzing your statement to identify funding sources and determine 
                  which documents we&apos;ll need to verify your information.
                </p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" /> Reading statement...
                  </p>
                  <p className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Identifying funding sources...
                  </p>
                  <p className="flex items-center gap-2 opacity-50">
                    <Clock className="w-4 h-4" /> Determining required documents...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage: Document Upload */}
        {stage === "documents" && (
          <div className="space-y-6">
            {/* Analysis Results */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-success/10 to-success/5">
                <CardTitle className="text-lg flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We&apos;ve identified the following funding sources from your statement:
                </p>
                <div className="space-y-3">
                  {fundingSources.map((source, index) => (
                    <div 
                      key={source.id}
                      className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg border border-border"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <PoundSterling className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{source.description}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {source.type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          £{source.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Source {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Upload Section */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Step 3: Upload Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Please upload the following documents to verify your funding sources:
                </p>

                {requiredDocs.map((doc) => {
                  const isUploaded = doc.uploaded || uploadedDocs.some(u => u.docType === doc.id)
                  const uploadedFile = uploadedDocs.find(u => u.docType === doc.id)
                  
                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        isUploaded 
                          ? "border-success/30 bg-success/5" 
                          : "border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          isUploaded ? "bg-success/20" : "bg-primary/10"
                        )}>
                          {isUploaded ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <FileText className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">For: {doc.forSource}</p>
                          {uploadedFile && (
                            <p className="text-xs text-success mt-1 flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {uploadedFile.name}
                            </p>
                          )}
                        </div>
                        {isUploaded ? (
                          <Badge className="bg-success text-xs">Uploaded</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentUploadDocId(doc.id)
                              fileInputRef.current?.click()
                            }}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => currentUploadDocId && handleFileUpload(e, currentUploadDocId)}
                />

                <Separator className="my-6" />

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setStage("statement")}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmitDocuments}
                    disabled={requiredDocs.filter(d => !d.uploaded).length > 0 && uploadedDocs.length === 0}
                    className="gap-2"
                  >
                    Submit for Verification
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stage: Verification */}
        {stage === "verification" && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Step 4: Verifying Your Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Verification in Progress</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our AI agents are reviewing your documents and verifying the information 
                  against your statement.
                </p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" /> Documents received
                  </p>
                  <p className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Extracting data...
                  </p>
                  <p className="flex items-center gap-2 opacity-50">
                    <Clock className="w-4 h-4" /> Cross-referencing claims...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage: Clarification Needed */}
        {stage === "clarification" && clarificationNeeded && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-warning/10 to-warning/5">
              <CardTitle className="text-lg flex items-center gap-2 text-warning">
                <AlertCircle className="w-5 h-5" />
                Clarification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-foreground">{clarificationNeeded}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Response
                </label>
                <Textarea
                  value={clarificationResponse}
                  onChange={(e) => setClarificationResponse(e.target.value)}
                  placeholder="Please provide your explanation or additional information..."
                  className="min-h-[120px] text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Additional Document
                </Button>
                <Button
                  onClick={handleSubmitClarification}
                  disabled={!clarificationResponse.trim() || isProcessing}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Clarification
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage: Complete */}
        {stage === "complete" && (
          <Card className="border-2 border-success/30">
            <CardHeader className="bg-gradient-to-r from-success/10 to-success/5">
              <CardTitle className="text-lg flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                Verification Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Your Source of Funds Has Been Verified
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for providing your information. Your documents have been reviewed 
                  and your source of funds has been successfully verified.
                </p>
              </div>

              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Summary:</h4>
                <div className="space-y-2">
                  {fundingSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        {source.description}
                      </span>
                      <span className="font-medium text-foreground">
                        £{source.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Total Verified</span>
                    <span className="text-primary">
                      £{fundingSources.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>What happens next?</strong> Your application will now proceed to the 
                  next stage. You will receive a confirmation email with your verification 
                  reference number.
                </p>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Start New Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center text-xs text-muted-foreground">
          <p>This is a demonstration of the Source of Funds verification process.</p>
          <p className="mt-1">Your data is processed securely in compliance with regulations.</p>
        </div>
      </footer>
    </div>
  )
}
