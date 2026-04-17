// Source of Funds Types

export type FundingSourceType =
  | "employment"
  | "gift"
  | "property_sale"
  | "property_equity"
  | "investments"
  | "investment"
  | "inheritance"
  | "business_income"
  | "business"
  | "savings"
  | "loan"

export interface FundingSource {
  id: string
  type: FundingSourceType
  description: string
  amount: number
  currency: string
  statementExcerpt: string // The exact text from user statement that triggered this source
  claimsToVerify: ClaimToVerify[] // Specific claims extracted from statement
  requiredDocuments: RequiredDocument[]
}

export interface ClaimToVerify {
  claim: string // e.g., "Saved £10,000 over 2 years"
  extractedValue: string | number // e.g., "£10,000" or 10000
  verificationType: "amount" | "duration" | "identity" | "ownership" | "relationship"
}

export interface RequiredDocument {
  id: string
  type: DocumentType
  name: string
  description: string
  reason: string
  whatWillBeChecked: string[]
  status: "missing" | "uploaded" | "validated" | "flagged"
  file?: UploadedFile
  validationResult?: ValidationResult
}

export type DocumentType =
  | "payslip"
  | "employment_contract"
  | "bank_statement"
  | "tax_return"
  | "gift_letter"
  | "property_deed"
  | "sale_agreement"
  | "investment_statement"
  | "source_of_investment"
  | "will_probate"
  | "probate_document"
  | "business_accounts"
  | "company_accounts"
  | "property_valuation"
  | "mortgage_statement"
  | "loan_agreement"

export interface UploadedFile {
  id: string
  name: string
  size: number
  uploadedAt: Date
}

export interface ValidationResult {
  status: "valid" | "flagged" | "warning"
  agentType: AgentType
  extractedData: ExtractedDataItem[]
  matches: MatchItem[]
  flags: FlagItem[]
  summary: string
  plausibilityAnalysis?: PlausibilityAnalysis
}

export interface PlausibilityAnalysis {
  conclusion: "plausible" | "questionable" | "implausible"
  reasoning: string[]
  calculations?: {
    label: string
    formula: string
    result: string
    assessment: "supports" | "neutral" | "contradicts"
  }[]
}

export type AgentType = "payroll" | "banking" | "legal" | "property"

export interface ExtractedDataItem {
  label: string
  value: string
  confidence: number
}

export interface MatchItem {
  statementClaim: string
  documentEvidence: string
  status: "match" | "partial" | "mismatch"
  analysis?: string // Detailed reasoning for the match/mismatch
}

export interface FlagItem {
  severity: "high" | "medium" | "low"
  message: string
  recommendation: string
}

export interface AuditReport {
  id: string
  generatedAt: Date
  applicantName: string
  totalFundsVerified: number
  currency: string
  overallStatus: "approved" | "flagged" | "pending"
  fundingSources: FundingSource[]
  validationSummary: {
    totalDocuments: number
    validatedDocuments: number
    flaggedDocuments: number
    pendingDocuments: number
  }
  plausibilityScore: number
  flaggedItems: FlagItem[]
  notes?: string[]
  auditTrail: AuditTrailItem[]
}

export interface AuditTrailItem {
  timestamp: Date
  action: string
  agent?: AgentType
  details: string
}

export type WorkflowStage = 1 | 2 | 3 | 4

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentType?: AgentType
}

export interface SOFState {
  currentStage: WorkflowStage
  statement: string
  fundingSources: FundingSource[]
  auditReport: AuditReport | null
  chatMessages: ChatMessage[]
  isProcessing: boolean
}
