import type {
  FundingSource,
  AuditReport,
  ChatMessage,
  ValidationResult,
  RequiredDocument,
} from "./sof-types"

// ============================================================================
// 6 EXAMPLE CASES WITH VARYING COMPLEXITY
// ============================================================================

export interface ExampleCase {
  id: string
  name: string
  complexity: "Simple" | "Moderate" | "Complex"
  description: string
  scenario: string // describes doc status scenario
  statement: string
  applicantName: string
}

export const EXAMPLE_CASES: ExampleCase[] = [
  // CASE 1: Simple - Single Source, All Docs Present, Happy Path
  {
    id: "case-1",
    name: "Simple Employment Only",
    complexity: "Simple",
    description: "Single funding source with all documents present",
    scenario: "All documents uploaded and validated successfully",
    applicantName: "Sarah Johnson",
    statement: `I am applying for a personal loan of £25,000.

My source of funds is:
1. Employment income - I work as a Marketing Manager at Brand Solutions Ltd, earning £52,000 per annum. I have been employed there for 3 years.

The loan will be repaid from my regular monthly salary.`,
  },

  // CASE 2: Simple - Single Source, One Doc Missing
  {
    id: "case-2",
    name: "Savings Only - Missing Statement",
    complexity: "Simple",
    description: "Single savings source with one document missing",
    scenario: "Savings certificate uploaded but bank statement missing",
    applicantName: "Michael Chen",
    statement: `I am funding my investment account with £15,000.

My source of funds is:
1. Personal savings - I have saved £15,000 over the past 2 years from my freelance income as a graphic designer.

These funds are from my personal savings account.`,
  },

  // CASE 3: Moderate - Two Sources, All Docs Present, Happy Path
  {
    id: "case-3",
    name: "Employment + Gift",
    complexity: "Moderate",
    description: "Two funding sources with complete documentation",
    scenario: "All documents present and validation passed",
    applicantName: "Emma Williams",
    statement: `I am applying for a mortgage of £280,000 to purchase a property at 18 Maple Drive, Bristol.

My sources of funds include:
1. Employment income - I am a Senior Accountant at FinanceFirst PLC, earning £65,000 per annum. I have worked there for 5 years.
2. Gift from grandmother - My grandmother is gifting me £30,000 towards the deposit. She has provided a signed gift declaration.

Total deposit contribution: £45,000 including my savings.`,
  },

  // CASE 4: Moderate - Two Sources, Plausibility Fails
  {
    id: "case-4",
    name: "Employment + Inheritance - Flagged",
    complexity: "Moderate",
    description: "Two sources with documents present but plausibility issues",
    scenario: "Documents uploaded but inconsistencies detected",
    applicantName: "David Thompson",
    statement: `I am applying for a car loan of £35,000.

My sources of funds are:
1. Employment income - I work as a Junior Developer at TechStart Ltd, earning £75,000 per annum for the past 6 months.
2. Inheritance - I recently inherited £50,000 from my late uncle's estate.

I will use the inheritance for the deposit and employment income for repayments.`,
  },

  // CASE 5: Complex - Multiple Sources, Some Docs Missing
  {
    id: "case-5",
    name: "Complex Multi-Source - Partial Docs",
    complexity: "Complex",
    description: "Four funding sources with some documents pending",
    scenario: "Most documents present, 2 still missing, validation partial",
    applicantName: "Robert Anderson",
    statement: `I am applying for a mortgage of £450,000 to purchase a property at 42 Oak Lane, London.

My sources of funds include:
1. Employment income - I work as a Senior Software Engineer at TechCorp Ltd, earning £95,000 per annum. I have been employed there for 4 years.
2. Gift from parents - My parents are gifting me £50,000 towards the deposit. They will provide a gift letter confirming this is not a loan.
3. Savings - I have accumulated £35,000 in savings over the past 3 years from my employment income.
4. Property sale - I am selling my current flat at 15 River Court for £200,000 which I purchased in 2018.

The total funds available are approximately £380,000 for the deposit and associated costs.`,
  },

  // CASE 6: Complex - Multiple Sources, All Docs Present, Some Plausibility Issues
  {
    id: "case-6",
    name: "Complex Multi-Source - Mixed Results",
    complexity: "Complex",
    description: "Four funding sources with all docs but mixed validation results",
    scenario: "All documents uploaded, most valid, some flagged for review",
    applicantName: "Jennifer Martinez",
    statement: `I am applying for a business expansion loan of £500,000.

My sources of funds include:
1. Business income - My company Digital Dynamics Ltd has annual revenue of £1.2M and profit of £180,000. Operating for 6 years.
2. Personal savings - I have £75,000 in personal savings accumulated over 5 years.
3. Property equity - My residential property at 88 High Street is valued at £650,000 with £200,000 remaining mortgage, providing £450,000 equity.
4. Investment portfolio - I have investments worth £120,000 in ISAs and stocks managed by WealthPro Advisors.

Total collateral and funds: Approximately £825,000 supporting the loan application.`,
  },
]

// Default statement (Case 5 - complex multi-source)
export const MOCK_STATEMENT = EXAMPLE_CASES[4].statement

// ============================================================================
// FUNDING SOURCES GENERATOR BY CASE
// ============================================================================

export function generateFundingSourcesForCase(caseId: string): FundingSource[] {
  switch (caseId) {
    case "case-1":
      return generateCase1Sources()
    case "case-2":
      return generateCase2Sources()
    case "case-3":
      return generateCase3Sources()
    case "case-4":
      return generateCase4Sources()
    case "case-5":
      return generateCase5Sources()
    case "case-6":
      return generateCase6Sources()
    default:
      return generateCase5Sources() // Default to complex case
  }
}

// CASE 1: Simple Employment - All docs present, all valid
function generateCase1Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Marketing Manager at Brand Solutions Ltd - £52,000 p.a.",
      amount: 52000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)", 
          "Last 3 months of payslips from Brand Solutions Ltd",
          "Statement claims employment at Brand Solutions Ltd with £52,000 salary",
          ["Employer name matches Brand Solutions Ltd", "Gross salary aligns with £52,000 annual", "Employment dates confirm 3 years tenure"],
          "validated", generateValidPayslipResult("Brand Solutions Ltd", "Sarah Johnson", 4333.33)
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Current employment contract or letter",
          "To verify employment terms and salary details",
          ["Job title matches Marketing Manager", "Contracted salary confirms £52,000", "Start date aligns with 3 years tenure claim"],
          "validated", generateValidContractResult("Marketing Manager", "Brand Solutions Ltd", "2021")
        ),
        createDocument("doc-3", "bank_statement", "Bank Statements (3 months)",
          "Bank statements showing salary deposits",
          "To verify salary credits match payslip amounts",
          ["Regular salary deposits from Brand Solutions Ltd", "Amounts match payslip net pay", "Account holder name matches applicant"],
          "validated", generateValidBankResult("Sarah Johnson", 3450.00, "Brand Solutions Ltd")
        ),
      ],
    },
  ]
}

// CASE 2: Simple Savings - One doc missing
function generateCase2Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "savings",
      description: "Personal savings from freelance income - £15,000",
      amount: 15000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "bank_statement", "Savings Account Statements (12 months)",
          "12 months of savings account statements",
          "Statement claims £15,000 savings accumulated over 2 years from freelance work",
          ["Current balance shows £15,000+", "Gradual accumulation pattern visible", "Deposits align with freelance income pattern"],
          "missing" // MISSING
        ),
        createDocument("doc-2", "tax_return", "Self-Assessment Tax Return",
          "Latest tax return showing freelance income",
          "To verify freelance income as source of savings",
          ["Income declared matches savings accumulation", "Self-employment status confirmed", "Tax paid on declared income"],
          "validated", generateValidTaxReturn("Michael Chen", 28000)
        ),
      ],
    },
  ]
}

// CASE 3: Employment + Gift - All docs present, all valid
function generateCase3Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Senior Accountant at FinanceFirst PLC - £65,000 p.a.",
      amount: 65000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months of payslips from FinanceFirst PLC",
          "Statement claims employment at FinanceFirst PLC with £65,000 salary",
          ["Employer name matches FinanceFirst PLC", "Gross salary aligns with £65,000 annual", "Employment dates confirm 5 years tenure"],
          "validated", generateValidPayslipResult("FinanceFirst PLC", "Emma Williams", 5416.67)
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Current employment contract",
          "To verify employment terms and position",
          ["Job title matches Senior Accountant", "Salary confirms £65,000", "Start date aligns with 5 years claim"],
          "validated", generateValidContractResult("Senior Accountant", "FinanceFirst PLC", "2019")
        ),
        createDocument("doc-3", "bank_statement", "Bank Statements (3 months)",
          "Bank statements showing salary deposits",
          "To verify salary credits match payslip amounts",
          ["Regular salary deposits from FinanceFirst PLC", "Amounts match payslip net pay"],
          "validated", generateValidBankResult("Emma Williams", 4200.00, "FinanceFirst PLC")
        ),
      ],
    },
    {
      id: "fs-2",
      type: "gift",
      description: "Gift from grandmother - £30,000",
      amount: 30000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-4", "gift_letter", "Gift Declaration Letter",
          "Signed letter from grandmother confirming the gift",
          "Statement mentions £30,000 gift from grandmother",
          ["Letter confirms gift amount of £30,000", "Clearly states funds are a gift, not a loan", "Signed and dated by grandmother"],
          "validated", generateValidGiftLetter("Margaret Williams", "Emma Williams", 30000)
        ),
        createDocument("doc-5", "bank_statement", "Grandmother's Bank Statement",
          "Bank statement showing grandmother has the funds",
          "To verify grandmother has £30,000 available to gift",
          ["Account balance shows £30,000+ available", "Account holder name matches gift letter signatory", "No recent large deposits suggesting borrowed funds"],
          "validated", generateValidDonorBankResult("Margaret Williams", 45000)
        ),
      ],
    },
  ]
}

// CASE 4: Employment + Inheritance - Plausibility issues
function generateCase4Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Junior Developer at TechStart Ltd - £75,000 p.a. (claimed)",
      amount: 75000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months of payslips from TechStart Ltd",
          "Statement claims £75,000 salary as Junior Developer",
          ["Employer name matches TechStart Ltd", "Gross salary aligns with £75,000 annual", "Job title and salary appropriate"],
          "flagged", generateFlaggedPayslipResult("TechStart Ltd", "David Thompson", 3750.00, "£45,000") // Actually £45k
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Current employment contract",
          "To verify employment terms and salary",
          ["Job title matches Junior Developer", "Contracted salary confirms £75,000", "Employment duration verified"],
          "validated", generateValidContractResult("Junior Developer", "TechStart Ltd", "2024", "£45,000")
        ),
      ],
    },
    {
      id: "fs-2",
      type: "inheritance",
      description: "Inheritance from late uncle - £50,000",
      amount: 50000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-3", "probate_document", "Grant of Probate",
          "Official probate document for uncle's estate",
          "Statement claims £50,000 inheritance from uncle",
          ["Estate value and distribution confirmed", "Applicant named as beneficiary", "Probate granted by court"],
          "validated", generateValidProbateResult("David Thompson", "James Thompson", 50000)
        ),
        createDocument("doc-4", "bank_statement", "Bank Statement Showing Inheritance",
          "Bank statement showing receipt of inheritance funds",
          "To verify inheritance funds received",
          ["Deposit of £50,000 from estate executor", "Timing matches probate completion", "Account holder is applicant"],
          "flagged", generateFlaggedInheritanceBankResult("David Thompson", 35000, 50000) // Only £35k received
        ),
      ],
    },
  ]
}

// CASE 5: Complex Multi-Source - Some docs missing
function generateCase5Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Senior Software Engineer at TechCorp Ltd - £95,000 p.a.",
      amount: 95000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months of payslips from TechCorp Ltd",
          "Statement claims employment at TechCorp Ltd with £95,000 salary",
          ["Employer name matches TechCorp Ltd", "Gross salary aligns with £95,000 annual", "Employment dates confirm 4+ years tenure"],
          "validated", generateValidPayslipResult("TechCorp Ltd", "Robert Anderson", 7916.67)
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Current employment contract or letter",
          "To verify employment terms and salary details",
          ["Job title matches Senior Software Engineer", "Contracted salary confirms £95,000", "Start date aligns with 4 years tenure"],
          "validated", generateValidContractResult("Senior Software Engineer", "TechCorp Ltd", "2020")
        ),
        createDocument("doc-3", "bank_statement", "Bank Statements (3 months)",
          "Bank statements showing salary deposits",
          "To verify salary credits match payslip amounts",
          ["Regular salary deposits from TechCorp Ltd", "Amounts match payslip net pay", "Account holder name matches applicant"],
          "validated", generateValidBankResult("Robert Anderson", 5850.00, "TechCorp Ltd")
        ),
      ],
    },
    {
      id: "fs-2",
      type: "gift",
      description: "Gift from parents - £50,000",
      amount: 50000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-4", "gift_letter", "Gift Letter",
          "Signed letter from parents confirming the gift",
          "Statement mentions £50,000 gift from parents",
          ["Letter confirms gift amount of £50,000", "Clearly states funds are a gift, not a loan", "Signed and dated by both parents"],
          "validated", generateValidGiftLetter("John & Mary Anderson", "Robert Anderson", 50000)
        ),
        createDocument("doc-5", "bank_statement", "Parents Bank Statement",
          "Bank statement showing parents have the funds",
          "To verify parents have £50,000 available to gift",
          ["Account balance shows £50,000+ available", "Account holder names match gift letter signatories", "No recent large deposits suggesting borrowed funds"],
          "missing" // MISSING
        ),
      ],
    },
    {
      id: "fs-3",
      type: "savings",
      description: "Personal savings accumulated - £35,000",
      amount: 35000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-6", "bank_statement", "Savings Account Statements (12 months)",
          "12 months of savings account statements",
          "Statement claims £35,000 savings accumulated over 3 years",
          ["Current balance shows £35,000+", "Gradual accumulation pattern visible", "Deposits align with claimed employment income"],
          "validated", generateValidSavingsResult("Robert Anderson", 37500)
        ),
      ],
    },
    {
      id: "fs-4",
      type: "property_sale",
      description: "Sale of flat at 15 River Court - £200,000",
      amount: 200000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-7", "property_deed", "Property Title/Deed",
          "Title deed for 15 River Court",
          "Statement claims ownership of property at 15 River Court",
          ["Property address matches 15 River Court", "Applicant listed as registered owner", "No restrictions on sale"],
          "validated", generateValidPropertyDeed("Robert Anderson", "15 River Court, London", "2018")
        ),
        createDocument("doc-8", "sale_agreement", "Sale Agreement/Contract",
          "Signed sale agreement for the property",
          "To verify agreed sale price of £200,000",
          ["Sale price matches £200,000 claim", "Buyer and seller details complete", "Completion date and terms clear"],
          "missing" // MISSING
        ),
      ],
    },
  ]
}

// CASE 6: Complex Multi-Source - All docs but mixed results
function generateCase6Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "business",
      description: "Digital Dynamics Ltd - £180,000 profit p.a.",
      amount: 180000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-1", "company_accounts", "Company Accounts (2 years)",
          "Audited accounts for Digital Dynamics Ltd",
          "Statement claims annual profit of £180,000 and £1.2M revenue",
          ["Revenue matches £1.2M claim", "Profit matches £180,000 claim", "6 years trading history confirmed"],
          "validated", generateValidCompanyAccounts("Digital Dynamics Ltd", 1200000, 180000, 6)
        ),
        createDocument("doc-2", "bank_statement", "Business Bank Statements (6 months)",
          "Business account statements",
          "To verify business cash flow matches accounts",
          ["Cash flow patterns match reported revenue", "Director drawings reasonable", "No unusual transactions"],
          "validated", generateValidBusinessBankResult("Digital Dynamics Ltd", 95000)
        ),
        createDocument("doc-3", "tax_return", "Corporation Tax Return",
          "Latest CT600 corporation tax return",
          "To verify tax compliance and declared profits",
          ["Profits declared match accounts", "Tax paid appropriately", "HMRC compliance confirmed"],
          "validated", generateValidCorpTaxReturn("Digital Dynamics Ltd", 180000)
        ),
      ],
    },
    {
      id: "fs-2",
      type: "savings",
      description: "Personal savings - £75,000",
      amount: 75000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-4", "bank_statement", "Personal Savings Statements (12 months)",
          "12 months of personal savings statements",
          "Statement claims £75,000 personal savings over 5 years",
          ["Current balance shows £75,000+", "Accumulation pattern over 5 years visible", "Source of deposits traceable"],
          "flagged", generateFlaggedSavingsResult("Jennifer Martinez", 75000, 25000) // Large unexplained deposit
        ),
      ],
    },
    {
      id: "fs-3",
      type: "property_equity",
      description: "Property equity at 88 High Street - £450,000",
      amount: 450000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-5", "property_valuation", "Property Valuation Report",
          "Professional valuation of 88 High Street",
          "Statement claims property valued at £650,000",
          ["Valuation from RICS surveyor", "Value matches £650,000 claim", "Valuation date within 3 months"],
          "validated", generateValidValuationReport("88 High Street", 650000)
        ),
        createDocument("doc-6", "mortgage_statement", "Mortgage Statement",
          "Current mortgage statement showing balance",
          "Statement claims £200,000 remaining mortgage",
          ["Outstanding balance matches £200,000 claim", "Account in good standing", "Property address matches"],
          "validated", generateValidMortgageStatement("Jennifer Martinez", "88 High Street", 198500)
        ),
      ],
    },
    {
      id: "fs-4",
      type: "investments",
      description: "Investment portfolio with WealthPro - £120,000",
      amount: 120000,
      currency: "GBP",
      requiredDocuments: [
        createDocument("doc-7", "investment_statement", "Investment Portfolio Statement",
          "Statement from WealthPro Advisors",
          "Statement claims £120,000 in ISAs and stocks",
          ["Total value matches £120,000 claim", "Account holder is applicant", "Asset breakdown clear"],
          "validated", generateValidInvestmentStatement("Jennifer Martinez", "WealthPro Advisors", 122500)
        ),
        createDocument("doc-8", "source_of_investment", "Source of Investment Funds",
          "Documentation showing origin of investment capital",
          "To verify legitimate source of invested funds",
          ["Investment history traceable", "Funded from declared income", "No unexplained deposits"],
          "flagged", generateFlaggedInvestmentSource("Jennifer Martinez", 120000) // Incomplete trail
        ),
      ],
    },
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createDocument(
  id: string,
  type: string,
  name: string,
  description: string,
  reason: string,
  whatWillBeChecked: string[],
  status: "missing" | "uploaded" | "validated" | "flagged",
  validationResult?: ValidationResult
): RequiredDocument {
  const doc: RequiredDocument = {
    id,
    type,
    name,
    description,
    reason,
    whatWillBeChecked,
    status,
  }
  
  if (status === "validated" || status === "flagged") {
    doc.file = {
      id: `file-${id}`,
      name: `${name.replace(/\s+/g, "_")}.pdf`,
      size: Math.floor(Math.random() * 500000) + 100000,
      uploadedAt: new Date(Date.now() - Math.random() * 86400000),
    }
    doc.validationResult = validationResult
  }
  
  return doc
}

// ============================================================================
// VALIDATION RESULT GENERATORS
// ============================================================================

function generateValidPayslipResult(employer: string, employee: string, grossPay: number): ValidationResult {
  return {
    status: "valid",
    agentType: "payroll",
    extractedData: [
      { label: "Employer", value: employer, confidence: 0.98 },
      { label: "Employee Name", value: employee, confidence: 0.99 },
      { label: "Gross Pay", value: `£${grossPay.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.97 },
      { label: "Net Pay", value: `£${(grossPay * 0.72).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.97 },
      { label: "Pay Period", value: "March 2024", confidence: 0.99 },
      { label: "Tax Code", value: "1257L", confidence: 0.95 },
    ],
    matches: [
      { statementClaim: `Employment at ${employer}`, documentEvidence: `Employer: ${employer}`, status: "match" },
      { statementClaim: `Salary of £${(grossPay * 12).toLocaleString()} p.a.`, documentEvidence: `Gross monthly: £${grossPay.toLocaleString()} (matches annual)`, status: "match" },
    ],
    flags: [],
    summary: "Payslip verified successfully. Employer and salary match applicant statement.",
  }
}

function generateFlaggedPayslipResult(employer: string, employee: string, actualGross: number, statedSalary: string): ValidationResult {
  return {
    status: "flagged",
    agentType: "payroll",
    extractedData: [
      { label: "Employer", value: employer, confidence: 0.98 },
      { label: "Employee Name", value: employee, confidence: 0.99 },
      { label: "Gross Pay", value: `£${actualGross.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.97 },
      { label: "Annual Equivalent", value: `£${(actualGross * 12).toLocaleString()}`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Employment at ${employer}`, documentEvidence: `Employer: ${employer}`, status: "match" },
      { statementClaim: `Salary of £75,000 p.a.`, documentEvidence: `Actual: ${statedSalary} p.a.`, status: "mismatch" },
    ],
    flags: [
      {
        severity: "high",
        message: `Salary discrepancy: Statement claims £75,000 but payslip shows ${statedSalary} annual equivalent`,
        recommendation: "Request clarification from applicant on salary discrepancy. May need updated employment letter.",
      },
    ],
    summary: "Payslip shows significant salary variance from stated amount. Requires investigation.",
  }
}

function generateValidContractResult(title: string, employer: string, year: string, salary?: string): ValidationResult {
  return {
    status: "valid",
    agentType: "payroll",
    extractedData: [
      { label: "Job Title", value: title, confidence: 0.99 },
      { label: "Start Date", value: `15 March ${year}`, confidence: 0.98 },
      { label: "Employer", value: employer, confidence: 0.99 },
      ...(salary ? [{ label: "Annual Salary", value: salary, confidence: 0.99 }] : []),
    ],
    matches: [
      { statementClaim: `${title} role`, documentEvidence: `Job Title: ${title}`, status: "match" },
      { statementClaim: "Employment tenure claim", documentEvidence: `Start date: ${year} confirms tenure`, status: "match" },
    ],
    flags: [],
    summary: "Employment contract validates tenure and position as claimed in statement.",
  }
}

function generateValidBankResult(holder: string, netPay: number, employer: string): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Account Number", value: "****4521", confidence: 0.95 },
      { label: "Statement Period", value: "Jan - Mar 2024", confidence: 0.98 },
      { label: "Monthly Salary Credit", value: `£${netPay.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.99 },
    ],
    matches: [
      { statementClaim: "Regular salary deposits", documentEvidence: `Monthly credits from ${employer}: £${netPay.toLocaleString()}`, status: "match" },
    ],
    flags: [],
    summary: "Bank statement confirms regular salary deposits matching payslip amounts.",
  }
}

function generateValidGiftLetter(donor: string, recipient: string, amount: number): ValidationResult {
  return {
    status: "valid",
    agentType: "legal",
    extractedData: [
      { label: "Gift Amount", value: `£${amount.toLocaleString()}`, confidence: 0.99 },
      { label: "Donor Name(s)", value: donor, confidence: 0.98 },
      { label: "Recipient", value: recipient, confidence: 0.99 },
      { label: "Date Signed", value: "1 April 2024", confidence: 0.97 },
      { label: "Repayment Required", value: "No", confidence: 0.99 },
    ],
    matches: [
      { statementClaim: `£${amount.toLocaleString()} gift`, documentEvidence: `Gift letter confirms £${amount.toLocaleString()}`, status: "match" },
      { statementClaim: "Not a loan", documentEvidence: "Letter explicitly states no repayment expected", status: "match" },
    ],
    flags: [],
    summary: "Gift letter properly executed. Confirms gift amount and non-repayable nature.",
  }
}

function generateValidDonorBankResult(holder: string, balance: number): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Statement Date", value: "March 2024", confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "Sufficient funds for gift", documentEvidence: `Balance of £${balance.toLocaleString()} available`, status: "match" },
    ],
    flags: [],
    summary: "Donor bank statement confirms sufficient funds available for the gift.",
  }
}

function generateValidTaxReturn(name: string, income: number): ValidationResult {
  return {
    status: "valid",
    agentType: "legal",
    extractedData: [
      { label: "Taxpayer Name", value: name, confidence: 0.99 },
      { label: "Tax Year", value: "2023/24", confidence: 0.99 },
      { label: "Self-Employment Income", value: `£${income.toLocaleString()}`, confidence: 0.98 },
      { label: "Tax Paid", value: `£${(income * 0.2).toLocaleString()}`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: "Freelance income source", documentEvidence: "Self-employment income declared and taxed", status: "match" },
    ],
    flags: [],
    summary: "Tax return confirms declared self-employment income supporting savings accumulation.",
  }
}

function generateValidProbateResult(beneficiary: string, deceased: string, amount: number): ValidationResult {
  return {
    status: "valid",
    agentType: "legal",
    extractedData: [
      { label: "Deceased", value: deceased, confidence: 0.99 },
      { label: "Beneficiary", value: beneficiary, confidence: 0.99 },
      { label: "Inheritance Amount", value: `£${amount.toLocaleString()}`, confidence: 0.98 },
      { label: "Probate Granted", value: "December 2023", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `£${amount.toLocaleString()} inheritance`, documentEvidence: `Probate confirms £${amount.toLocaleString()} to beneficiary`, status: "match" },
    ],
    flags: [],
    summary: "Grant of Probate validates inheritance claim. Beneficiary and amount confirmed.",
  }
}

function generateFlaggedInheritanceBankResult(holder: string, received: number, claimed: number): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Inheritance Deposit", value: `£${received.toLocaleString()}`, confidence: 0.99 },
      { label: "Deposit Date", value: "January 2024", confidence: 0.98 },
    ],
    matches: [
      { statementClaim: `£${claimed.toLocaleString()} inheritance received`, documentEvidence: `Only £${received.toLocaleString()} deposited`, status: "mismatch" },
    ],
    flags: [
      {
        severity: "medium",
        message: `Inheritance amount discrepancy: Claimed £${claimed.toLocaleString()} but only £${received.toLocaleString()} deposited`,
        recommendation: "Request explanation for £15,000 difference. May be held in escrow or deducted for fees.",
      },
    ],
    summary: "Bank statement shows inheritance deposit differs from claimed amount. Requires clarification.",
  }
}

function generateValidSavingsResult(holder: string, balance: number): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "12-Month Deposits", value: "Regular monthly contributions", confidence: 0.95 },
    ],
    matches: [
      { statementClaim: "Savings accumulated", documentEvidence: `Balance of £${balance.toLocaleString()} confirmed`, status: "match" },
      { statementClaim: "From employment income", documentEvidence: "Deposit pattern matches salary credits", status: "match" },
    ],
    flags: [],
    summary: "Savings account shows healthy balance with accumulation pattern matching employment income.",
  }
}

function generateFlaggedSavingsResult(holder: string, balance: number, unexplained: number): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Unexplained Deposit", value: `£${unexplained.toLocaleString()}`, confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "Savings from declared income", documentEvidence: "Large deposit not matching income pattern", status: "mismatch" },
    ],
    flags: [
      {
        severity: "medium",
        message: `Large unexplained deposit of £${unexplained.toLocaleString()} on 15 Feb 2024`,
        recommendation: "Request explanation and supporting documentation for this deposit. May be legitimate (bonus, tax refund) but needs verification.",
      },
    ],
    summary: "Savings balance confirmed but contains unexplained large deposit requiring investigation.",
  }
}

function generateValidPropertyDeed(owner: string, address: string, year: string): ValidationResult {
  return {
    status: "valid",
    agentType: "property",
    extractedData: [
      { label: "Property Address", value: address, confidence: 0.99 },
      { label: "Registered Owner", value: owner, confidence: 0.99 },
      { label: "Title Number", value: "NGL123456", confidence: 0.98 },
      { label: "Purchase Date", value: `June ${year}`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Owns property at ${address.split(",")[0]}`, documentEvidence: `Registered owner at ${address}`, status: "match" },
      { statementClaim: `Purchased in ${year}`, documentEvidence: `Registration date: June ${year}`, status: "match" },
    ],
    flags: [],
    summary: "Title deed confirms applicant ownership of property as stated.",
  }
}

function generateValidCompanyAccounts(company: string, revenue: number, profit: number, years: number): ValidationResult {
  return {
    status: "valid",
    agentType: "legal",
    extractedData: [
      { label: "Company Name", value: company, confidence: 0.99 },
      { label: "Annual Revenue", value: `£${(revenue / 1000000).toFixed(1)}M`, confidence: 0.98 },
      { label: "Net Profit", value: `£${profit.toLocaleString()}`, confidence: 0.98 },
      { label: "Years Trading", value: `${years} years`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Revenue of £${(revenue / 1000000).toFixed(1)}M`, documentEvidence: "Audited accounts confirm revenue", status: "match" },
      { statementClaim: `Profit of £${profit.toLocaleString()}`, documentEvidence: "Net profit verified in accounts", status: "match" },
    ],
    flags: [],
    summary: "Company accounts verified by auditor. Revenue and profit match applicant claims.",
  }
}

function generateValidBusinessBankResult(company: string, avgBalance: number): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Name", value: company, confidence: 0.99 },
      { label: "Average Balance", value: `£${avgBalance.toLocaleString()}`, confidence: 0.98 },
      { label: "Statement Period", value: "Oct 2023 - Mar 2024", confidence: 0.99 },
    ],
    matches: [
      { statementClaim: "Healthy business cash flow", documentEvidence: "Consistent cash flow pattern confirmed", status: "match" },
    ],
    flags: [],
    summary: "Business bank statements show healthy cash flow consistent with reported accounts.",
  }
}

function generateValidCorpTaxReturn(company: string, profit: number): ValidationResult {
  return {
    status: "valid",
    agentType: "legal",
    extractedData: [
      { label: "Company", value: company, confidence: 0.99 },
      { label: "Taxable Profit", value: `£${profit.toLocaleString()}`, confidence: 0.98 },
      { label: "Corporation Tax Paid", value: `£${(profit * 0.25).toLocaleString()}`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: "Business profit as stated", documentEvidence: "CT return confirms declared profit", status: "match" },
    ],
    flags: [],
    summary: "Corporation tax return confirms declared profits and tax compliance.",
  }
}

function generateValidValuationReport(address: string, value: number): ValidationResult {
  return {
    status: "valid",
    agentType: "property",
    extractedData: [
      { label: "Property", value: address, confidence: 0.99 },
      { label: "Market Value", value: `£${value.toLocaleString()}`, confidence: 0.98 },
      { label: "Valuation Date", value: "February 2024", confidence: 0.99 },
      { label: "Surveyor", value: "RICS Registered", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Property valued at £${value.toLocaleString()}`, documentEvidence: "Professional valuation confirms value", status: "match" },
    ],
    flags: [],
    summary: "RICS valuation report confirms property value as stated by applicant.",
  }
}

function generateValidMortgageStatement(holder: string, address: string, balance: number): ValidationResult {
  return {
    status: "valid",
    agentType: "property",
    extractedData: [
      { label: "Borrower", value: holder, confidence: 0.99 },
      { label: "Property", value: address, confidence: 0.99 },
      { label: "Outstanding Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Account Status", value: "Good Standing", confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "£200,000 remaining mortgage", documentEvidence: `Balance: £${balance.toLocaleString()} (within range)`, status: "match" },
    ],
    flags: [],
    summary: "Mortgage statement confirms outstanding balance and good payment history.",
  }
}

function generateValidInvestmentStatement(holder: string, provider: string, value: number): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Provider", value: provider, confidence: 0.99 },
      { label: "Portfolio Value", value: `£${value.toLocaleString()}`, confidence: 0.98 },
      { label: "Statement Date", value: "March 2024", confidence: 0.99 },
    ],
    matches: [
      { statementClaim: "£120,000 in investments", documentEvidence: `Current value: £${value.toLocaleString()}`, status: "match" },
    ],
    flags: [],
    summary: "Investment portfolio statement confirms holdings exceeding stated amount.",
  }
}

function generateFlaggedInvestmentSource(holder: string, value: number): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Investment Value", value: `£${value.toLocaleString()}`, confidence: 0.98 },
      { label: "Funding Source", value: "Partially documented", confidence: 0.75 },
    ],
    matches: [
      { statementClaim: "Investments from declared income", documentEvidence: "Only 60% of contributions traceable to income", status: "partial" },
    ],
    flags: [
      {
        severity: "low",
        message: "Investment funding trail incomplete - approximately £48,000 of contributions lack clear source documentation",
        recommendation: "Request additional bank statements from 2019-2021 period to complete the audit trail for investment contributions.",
      },
    ],
    summary: "Investment value confirmed but source of some contributions needs additional documentation.",
  }
}

// ============================================================================
// MOCK STATEMENT AND AUDIT REPORT GENERATORS (updated)
// ============================================================================

export function generateMockFundingSources(): FundingSource[] {
  // Default to Case 5 (complex with some missing docs)
  return generateCase5Sources()
}

export function generateMockValidationResult(
  documentType: string,
  isValid: boolean = true
): ValidationResult {
  if (isValid) {
    return generateValidBankResult("John Smith", 5000, "Example Corp")
  }
  return generateFlaggedSavingsResult("John Smith", 30000, 15000)
}

export function generateMockAuditReport(
  fundingSources: FundingSource[],
  applicantName: string = "Robert Anderson"
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
  const missingDocs = fundingSources.reduce(
    (sum, fs) =>
      sum + fs.requiredDocuments.filter((d) => d.status === "missing").length,
    0
  )

  // Collect all flags from documents
  const allFlags = fundingSources.flatMap((fs) =>
    fs.requiredDocuments
      .filter((d) => d.validationResult?.flags && d.validationResult.flags.length > 0)
      .flatMap((d) => d.validationResult!.flags)
  )

  // Calculate plausibility score
  let plausibilityScore = 100
  if (flaggedDocs > 0) plausibilityScore -= flaggedDocs * 12
  if (missingDocs > 0) plausibilityScore -= missingDocs * 8
  plausibilityScore = Math.max(plausibilityScore, 45)

  // Build additional notes
  const notes: string[] = []
  if (missingDocs > 0) {
    const missingDocNames = fundingSources
      .flatMap((fs) => fs.requiredDocuments.filter((d) => d.status === "missing"))
      .map((d) => d.name)
    notes.push(`Outstanding documents required: ${missingDocNames.join(", ")}`)
  }
  if (flaggedDocs > 0) {
    notes.push("Flagged items require review before approval. Consider requesting additional documentation.")
  }
  if (plausibilityScore >= 90) {
    notes.push("High confidence in source of funds verification. Recommend approval subject to standard checks.")
  }

  return {
    id: `AUDIT-${Date.now()}`,
    generatedAt: new Date(),
    applicantName,
    totalFundsVerified: fundingSources.reduce((sum, fs) => sum + fs.amount, 0),
    currency: "GBP",
    overallStatus: missingDocs > 0 ? "pending" : flaggedDocs > 0 ? "flagged" : "approved",
    fundingSources,
    validationSummary: {
      totalDocuments: totalDocs,
      validatedDocuments: validatedDocs,
      flaggedDocuments: flaggedDocs,
      pendingDocuments: missingDocs,
    },
    plausibilityScore,
    flaggedItems: allFlags,
    notes,
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
        action: "Documents Processed",
        agent: "payroll",
        details: "Employment documents validated",
      },
      {
        timestamp: new Date(Date.now() - 1800000),
        action: "Documents Processed",
        agent: "banking",
        details: "Bank statements analyzed",
      },
      {
        timestamp: new Date(Date.now() - 1200000),
        action: "Documents Processed",
        agent: "legal",
        details: "Legal documents reviewed",
      },
      {
        timestamp: new Date(Date.now() - 600000),
        action: "Documents Processed",
        agent: "property",
        details: "Property documents verified",
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
      "Welcome to the Source of Funds verification system. Select an example case or paste a custom funding statement to begin the analysis process.",
    timestamp: new Date(),
  },
]
