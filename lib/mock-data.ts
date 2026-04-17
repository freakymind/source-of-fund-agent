import type {
  FundingSource,
  AuditReport,
  ChatMessage,
  ValidationResult,
} from "./sof-types"

export const MOCK_STATEMENT = `I am applying for a mortgage of £450,000 to purchase a property at 42 Oak Lane, London.

My source of funds includes:
1. Employment income - I work as a Senior Software Engineer at TechCorp Ltd, earning £85,000 per annum. I have been employed there for 4 years.
2. Gift from parents - My parents are gifting me £50,000 towards the deposit. They will provide a gift letter confirming this is not a loan.
3. Savings - I have accumulated £25,000 in savings over the past 3 years from my employment income.
4. Property sale - I am selling my current flat at 15 River Court for £180,000 which I purchased in 2019.

The total funds available are approximately £340,000 for the deposit and associated costs.`

export function generateMockFundingSources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Senior Software Engineer at TechCorp Ltd - £85,000 p.a.",
      amount: 85000,
      currency: "GBP",
      requiredDocuments: [
        {
          id: "doc-1",
          type: "payslip",
          name: "Recent Payslips (3 months)",
          description: "Last 3 months of payslips from TechCorp Ltd",
          reason: "Statement claims employment at TechCorp Ltd with £85,000 salary",
          whatWillBeChecked: [
            "Employer name matches TechCorp Ltd",
            "Gross salary aligns with £85,000 annual",
            "Employment dates confirm 4+ years tenure",
            "Consistent payment pattern",
          ],
          status: "missing",
        },
        {
          id: "doc-2",
          type: "employment_contract",
          name: "Employment Contract",
          description: "Current employment contract or letter",
          reason: "To verify employment terms and salary details",
          whatWillBeChecked: [
            "Job title matches Senior Software Engineer",
            "Contracted salary confirms £85,000",
            "Start date aligns with 4 years tenure claim",
          ],
          status: "missing",
        },
        {
          id: "doc-3",
          type: "bank_statement",
          name: "Bank Statements (3 months)",
          description: "Bank statements showing salary deposits",
          reason: "To verify salary credits match payslip amounts",
          whatWillBeChecked: [
            "Regular salary deposits from TechCorp Ltd",
            "Amounts match payslip net pay",
            "Account holder name matches applicant",
          ],
          status: "missing",
        },
      ],
    },
    {
      id: "fs-2",
      type: "gift",
      description: "Gift from parents - £50,000",
      amount: 50000,
      currency: "GBP",
      requiredDocuments: [
        {
          id: "doc-4",
          type: "gift_letter",
          name: "Gift Letter",
          description: "Signed letter from parents confirming the gift",
          reason: "Statement mentions £50,000 gift from parents",
          whatWillBeChecked: [
            "Letter confirms gift amount of £50,000",
            "Clearly states funds are a gift, not a loan",
            "Signed and dated by both parents",
            "No expectation of repayment stated",
          ],
          status: "missing",
        },
        {
          id: "doc-5",
          type: "bank_statement",
          name: "Parents Bank Statement",
          description: "Bank statement showing parents have the funds",
          reason: "To verify parents have £50,000 available to gift",
          whatWillBeChecked: [
            "Account balance shows £50,000+ available",
            "Account holder names match gift letter signatories",
            "No recent large deposits suggesting borrowed funds",
          ],
          status: "missing",
        },
      ],
    },
    {
      id: "fs-3",
      type: "savings",
      description: "Personal savings accumulated - £25,000",
      amount: 25000,
      currency: "GBP",
      requiredDocuments: [
        {
          id: "doc-6",
          type: "bank_statement",
          name: "Savings Account Statements (12 months)",
          description: "12 months of savings account statements",
          reason: "Statement claims £25,000 savings accumulated over 3 years",
          whatWillBeChecked: [
            "Current balance shows £25,000+",
            "Gradual accumulation pattern visible",
            "Deposits align with claimed employment income",
            "No unexplained large deposits",
          ],
          status: "missing",
        },
      ],
    },
    {
      id: "fs-4",
      type: "property_sale",
      description: "Sale of flat at 15 River Court - £180,000",
      amount: 180000,
      currency: "GBP",
      requiredDocuments: [
        {
          id: "doc-7",
          type: "property_deed",
          name: "Property Title/Deed",
          description: "Title deed for 15 River Court",
          reason: "Statement claims ownership of property at 15 River Court",
          whatWillBeChecked: [
            "Property address matches 15 River Court",
            "Applicant listed as registered owner",
            "No restrictions on sale",
          ],
          status: "missing",
        },
        {
          id: "doc-8",
          type: "sale_agreement",
          name: "Sale Agreement/Contract",
          description: "Signed sale agreement for the property",
          reason: "To verify agreed sale price of £180,000",
          whatWillBeChecked: [
            "Sale price matches £180,000 claim",
            "Buyer and seller details complete",
            "Completion date and terms clear",
          ],
          status: "missing",
        },
      ],
    },
  ]
}

export function generateMockValidationResult(
  documentType: string,
  isValid: boolean = true
): ValidationResult {
  const validResults: Record<string, ValidationResult> = {
    payslip: {
      status: "valid",
      agentType: "payroll",
      extractedData: [
        { label: "Employer", value: "TechCorp Ltd", confidence: 0.98 },
        { label: "Employee Name", value: "John Smith", confidence: 0.99 },
        { label: "Gross Pay", value: "£7,083.33", confidence: 0.97 },
        { label: "Net Pay", value: "£5,234.67", confidence: 0.97 },
        { label: "Pay Period", value: "March 2024", confidence: 0.99 },
        { label: "Tax Code", value: "1257L", confidence: 0.95 },
      ],
      matches: [
        {
          statementClaim: "Employment at TechCorp Ltd",
          documentEvidence: "Employer: TechCorp Ltd",
          status: "match",
        },
        {
          statementClaim: "Salary of £85,000 p.a.",
          documentEvidence: "Gross monthly: £7,083.33 (£85,000 annualized)",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Payslip verified successfully. Employer and salary match applicant statement.",
    },
    employment_contract: {
      status: "valid",
      agentType: "payroll",
      extractedData: [
        { label: "Job Title", value: "Senior Software Engineer", confidence: 0.99 },
        { label: "Start Date", value: "15 March 2020", confidence: 0.98 },
        { label: "Annual Salary", value: "£85,000", confidence: 0.99 },
        { label: "Employer", value: "TechCorp Ltd", confidence: 0.99 },
      ],
      matches: [
        {
          statementClaim: "4 years employment tenure",
          documentEvidence: "Start date: March 2020 (4+ years)",
          status: "match",
        },
        {
          statementClaim: "Senior Software Engineer role",
          documentEvidence: "Job Title: Senior Software Engineer",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Employment contract validates tenure and position as claimed in statement.",
    },
    bank_statement: {
      status: "valid",
      agentType: "banking",
      extractedData: [
        { label: "Account Holder", value: "John Smith", confidence: 0.99 },
        { label: "Account Number", value: "****4521", confidence: 0.95 },
        { label: "Statement Period", value: "Jan - Mar 2024", confidence: 0.98 },
        { label: "Closing Balance", value: "£27,845.23", confidence: 0.99 },
      ],
      matches: [
        {
          statementClaim: "Regular salary deposits",
          documentEvidence: "Monthly credits from TechCorp Ltd: £5,234.67",
          status: "match",
        },
        {
          statementClaim: "£25,000 in savings",
          documentEvidence: "Current balance: £27,845.23",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Bank statement confirms regular salary deposits and savings balance exceeds claimed amount.",
    },
    gift_letter: {
      status: "valid",
      agentType: "legal",
      extractedData: [
        { label: "Gift Amount", value: "£50,000", confidence: 0.99 },
        { label: "Donor Names", value: "Robert & Mary Smith", confidence: 0.98 },
        { label: "Recipient", value: "John Smith", confidence: 0.99 },
        { label: "Date Signed", value: "1 April 2024", confidence: 0.97 },
        { label: "Repayment Required", value: "No", confidence: 0.99 },
      ],
      matches: [
        {
          statementClaim: "£50,000 gift from parents",
          documentEvidence: "Gift letter confirms £50,000 from parents",
          status: "match",
        },
        {
          statementClaim: "Not a loan",
          documentEvidence: "Letter explicitly states no repayment expected",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Gift letter properly executed. Confirms gift amount and non-repayable nature.",
    },
    property_deed: {
      status: "valid",
      agentType: "property",
      extractedData: [
        { label: "Property Address", value: "15 River Court, London", confidence: 0.99 },
        { label: "Registered Owner", value: "John Smith", confidence: 0.99 },
        { label: "Title Number", value: "NGL123456", confidence: 0.98 },
        { label: "Purchase Date", value: "June 2019", confidence: 0.97 },
      ],
      matches: [
        {
          statementClaim: "Owns flat at 15 River Court",
          documentEvidence: "Registered owner at 15 River Court",
          status: "match",
        },
        {
          statementClaim: "Purchased in 2019",
          documentEvidence: "Registration date: June 2019",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Title deed confirms applicant ownership of property since 2019 as stated.",
    },
    sale_agreement: {
      status: "valid",
      agentType: "property",
      extractedData: [
        { label: "Property", value: "15 River Court, London", confidence: 0.99 },
        { label: "Sale Price", value: "£180,000", confidence: 0.99 },
        { label: "Seller", value: "John Smith", confidence: 0.99 },
        { label: "Completion Date", value: "15 May 2024", confidence: 0.98 },
      ],
      matches: [
        {
          statementClaim: "Selling for £180,000",
          documentEvidence: "Agreed sale price: £180,000",
          status: "match",
        },
      ],
      flags: [],
      summary:
        "Sale agreement confirms property sale at stated price of £180,000.",
    },
  }

  const flaggedResults: Record<string, ValidationResult> = {
    bank_statement: {
      status: "flagged",
      agentType: "banking",
      extractedData: [
        { label: "Account Holder", value: "John Smith", confidence: 0.99 },
        { label: "Closing Balance", value: "£27,845.23", confidence: 0.99 },
      ],
      matches: [
        {
          statementClaim: "Regular salary deposits",
          documentEvidence: "Monthly credits from TechCorp Ltd: £5,234.67",
          status: "match",
        },
      ],
      flags: [
        {
          severity: "high",
          message: "Large unexplained deposit of £15,000 on 15 Feb 2024",
          recommendation:
            "Request explanation and supporting documentation for this deposit",
        },
      ],
      summary:
        "Bank statement shows unexplained large deposit requiring further investigation.",
    },
  }

  return isValid
    ? validResults[documentType] || validResults.bank_statement
    : flaggedResults[documentType] || flaggedResults.bank_statement
}

export function generateMockAuditReport(
  fundingSources: FundingSource[]
): AuditReport {
  const totalDocs = fundingSources.reduce(
    (sum, fs) => sum + fs.requiredDocuments.length,
    0
  )
  const validatedDocs = fundingSources.reduce(
    (sum, fs) =>
      sum + fs.requiredDocuments.filter((d) => d.status === "validated").length,
    0
  )
  const flaggedDocs = fundingSources.reduce(
    (sum, fs) =>
      sum + fs.requiredDocuments.filter((d) => d.status === "flagged").length,
    0
  )

  return {
    id: `AUDIT-${Date.now()}`,
    generatedAt: new Date(),
    applicantName: "John Smith",
    totalFundsVerified: fundingSources.reduce((sum, fs) => sum + fs.amount, 0),
    currency: "GBP",
    overallStatus: flaggedDocs > 0 ? "flagged" : validatedDocs === totalDocs ? "approved" : "pending",
    fundingSources,
    validationSummary: {
      totalDocuments: totalDocs,
      validatedDocuments: validatedDocs,
      flaggedDocuments: flaggedDocs,
      pendingDocuments: totalDocs - validatedDocs - flaggedDocs,
    },
    plausibilityScore: flaggedDocs > 0 ? 72 : validatedDocs === totalDocs ? 95 : 50,
    flaggedItems:
      flaggedDocs > 0
        ? [
            {
              severity: "high",
              message: "Unexplained large deposit detected in bank statement",
              recommendation: "Request additional documentation",
            },
          ]
        : [],
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000),
        action: "Statement Submitted",
        details: "Applicant statement received and analyzed",
      },
      {
        timestamp: new Date(Date.now() - 3000000),
        action: "Documents Identified",
        details: `${totalDocs} documents required for verification`,
      },
      {
        timestamp: new Date(Date.now() - 2400000),
        action: "Documents Uploaded",
        agent: "payroll",
        details: "Payroll documents processed",
      },
      {
        timestamp: new Date(Date.now() - 1800000),
        action: "Validation Complete",
        agent: "banking",
        details: "Bank statements verified",
      },
      {
        timestamp: new Date(),
        action: "Report Generated",
        details: "Final audit report compiled",
      },
    ],
  }
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Welcome to the Source of Funds verification system. Please paste your funding statement to begin the analysis process.",
    timestamp: new Date(),
  },
]
