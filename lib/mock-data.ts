import type {
  FundingSource,
  AuditReport,
  ValidationResult,
  RequiredDocument,
  ClaimToVerify,
  PlausibilityAnalysis,
} from "./sof-types"

// ============================================================================
// 6 EXAMPLE CASES WITH VARYING COMPLEXITY
// ============================================================================

export interface ExampleCase {
  id: string
  name: string
  complexity: "Simple" | "Moderate" | "Complex"
  description: string
  scenario: string
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
1. Employment income - I work as a Marketing Manager at Brand Solutions Ltd, earning £52,000 per annum. I have been employed there for 3 years. From my monthly salary of approximately £3,100 net, I save around £800 per month.

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
1. Personal savings - I have saved £15,000 over the past 2 years from my freelance income as a graphic designer earning approximately £28,000 per year.

These funds are from my personal savings account at HSBC.`,
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
1. Employment income - I am a Senior Accountant at FinanceFirst PLC, earning £65,000 per annum. I have worked there for 5 years. My take-home pay is approximately £4,200 per month.
2. Gift from grandmother - My grandmother Margaret Williams is gifting me £30,000 towards the deposit. She has confirmed this is a genuine gift with no expectation of repayment.

Total deposit contribution: £45,000 (£15,000 from my savings + £30,000 gift).`,
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
1. Employment income - I work as a Junior Developer at TechStart Ltd, earning £75,000 per annum for the past 6 months. I started in January 2024.
2. Inheritance - I recently inherited £50,000 from my late uncle James Thompson's estate in December 2023.

I will use the inheritance for the deposit and employment income for repayments.`,
  },

  // CASE 5: Complex - Multiple Sources, Some Docs Missing
  {
    id: "case-5",
    name: "Complex Multi-Source - Partial Docs",
    complexity: "Complex",
    description: "Four funding sources with some documents pending",
    scenario: "Most documents present, 2 still missing",
    applicantName: "Robert Anderson",
    statement: `I am applying for a mortgage of £450,000 to purchase a property at 42 Oak Lane, London.

My sources of funds include:
1. Employment income - I work as a Senior Software Engineer at TechCorp Ltd, earning £95,000 per annum. I have been employed there for 4 years. My monthly net pay is approximately £5,850.
2. Gift from parents - My parents John and Mary Anderson are gifting me £50,000 towards the deposit. They will provide a signed gift letter confirming this is not a loan.
3. Savings - I have accumulated £35,000 in my savings account over the past 3 years. With my salary I save approximately £1,000 per month after expenses.
4. Property sale - I am selling my current flat at 15 River Court for £200,000. I purchased it in 2018 for £165,000 with a mortgage that is now fully paid off.

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
1. Business income - My company Digital Dynamics Ltd has annual revenue of £1.2M and profit of £180,000. The company has been operating for 6 years.
2. Personal savings - I have £75,000 in personal savings accumulated over 5 years. I pay myself a salary of £60,000 from the business.
3. Property equity - My residential property at 88 High Street is valued at £650,000 with £200,000 remaining mortgage, providing £450,000 in equity.
4. Investment portfolio - I have investments worth £120,000 in ISAs and stocks managed by WealthPro Advisors since 2019.

Total collateral and funds: Approximately £825,000 supporting the loan application.`,
  },
]

export const MOCK_STATEMENT = EXAMPLE_CASES[4].statement

// ============================================================================
// FUNDING SOURCES GENERATOR BY CASE
// ============================================================================

export function generateFundingSourcesForCase(caseId: string): FundingSource[] {
  switch (caseId) {
    case "case-1": return generateCase1Sources()
    case "case-2": return generateCase2Sources()
    case "case-3": return generateCase3Sources()
    case "case-4": return generateCase4Sources()
    case "case-5": return generateCase5Sources()
    case "case-6": return generateCase6Sources()
    default: return generateCase5Sources()
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
      statementExcerpt: "I work as a Marketing Manager at Brand Solutions Ltd, earning £52,000 per annum. I have been employed there for 3 years. From my monthly salary of approximately £3,100 net, I save around £800 per month.",
      claimsToVerify: [
        { claim: "Employer: Brand Solutions Ltd", extractedValue: "Brand Solutions Ltd", verificationType: "identity" },
        { claim: "Position: Marketing Manager", extractedValue: "Marketing Manager", verificationType: "identity" },
        { claim: "Annual salary: £52,000", extractedValue: 52000, verificationType: "amount" },
        { claim: "Employment duration: 3 years", extractedValue: "3 years", verificationType: "duration" },
        { claim: "Monthly net pay: ~£3,100", extractedValue: 3100, verificationType: "amount" },
        { claim: "Monthly savings: ~£800", extractedValue: 800, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months of payslips from Brand Solutions Ltd",
          "Statement claims employment at Brand Solutions Ltd with £52,000 salary",
          ["Employer name matches Brand Solutions Ltd", "Gross salary aligns with £52,000 annual (£4,333/month)", "Net pay approximately £3,100", "Employment dates confirm 3 years tenure"],
          "validated",
          generatePayslipResult("Brand Solutions Ltd", "Sarah Johnson", 4333.33, 3120, 52000, true, {
            conclusion: "plausible",
            reasoning: [
              "Annual salary of £52,000 equates to £4,333 gross monthly - MATCHES payslip",
              "Net pay of £3,100 after tax is consistent with this salary level",
              "Claim of saving £800/month is plausible (26% savings rate from net)",
              "3 years employment tenure verified by start date on payslip"
            ],
            calculations: [
              { label: "Annual to Monthly", formula: "£52,000 ÷ 12", result: "£4,333 gross", assessment: "supports" },
              { label: "Savings Rate", formula: "£800 ÷ £3,100", result: "25.8%", assessment: "supports" },
              { label: "Tax Deduction Check", formula: "£4,333 - ~£1,233 tax/NI", result: "~£3,100 net", assessment: "supports" },
            ]
          })
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Current employment contract or offer letter",
          "To verify employment terms match stated position and salary",
          ["Job title: Marketing Manager", "Contracted salary: £52,000", "Start date confirms 3+ years employment"],
          "validated",
          generateContractResult("Marketing Manager", "Brand Solutions Ltd", "March 2021", "£52,000", true)
        ),
        createDocument("doc-3", "bank_statement", "Bank Statements (3 months)",
          "Personal bank statements showing salary deposits",
          "To verify salary credits match payslip amounts and savings pattern",
          ["Regular monthly deposits from Brand Solutions Ltd", "Credit amounts match ~£3,100 net pay", "Evidence of ~£800 monthly savings/transfers"],
          "validated",
          generateBankStatementResult("Sarah Johnson", "Brand Solutions Ltd", 3120, true, true, {
            conclusion: "plausible",
            reasoning: [
              "Monthly salary credits of £3,100-3,150 match claimed net pay",
              "Regular transfer of £800 to savings account each month observed",
              "Spending pattern leaves approximately £2,300 for expenses - reasonable for London area"
            ],
            calculations: [
              { label: "Savings Pattern", formula: "Average monthly transfer to savings", result: "£800", assessment: "supports" },
              { label: "Expense Ratio", formula: "(£3,100 - £800) ÷ £3,100", result: "74% expenses", assessment: "supports" },
            ]
          })
        ),
      ],
    },
  ]
}

// CASE 2: Savings - One doc missing
function generateCase2Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "savings",
      description: "Personal savings from freelance income - £15,000",
      amount: 15000,
      currency: "GBP",
      statementExcerpt: "I have saved £15,000 over the past 2 years from my freelance income as a graphic designer earning approximately £28,000 per year.",
      claimsToVerify: [
        { claim: "Savings amount: £15,000", extractedValue: 15000, verificationType: "amount" },
        { claim: "Accumulation period: 2 years", extractedValue: "2 years", verificationType: "duration" },
        { claim: "Source: Freelance graphic design", extractedValue: "Freelance graphic designer", verificationType: "identity" },
        { claim: "Annual freelance income: ~£28,000", extractedValue: 28000, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "bank_statement", "Savings Account Statements (24 months)",
          "24 months of savings account statements showing accumulation",
          "Statement claims £15,000 saved over 2 years from freelance income of £28,000/year",
          ["Current balance shows £15,000+", "Gradual accumulation pattern over 24 months", "Deposits align with freelance income pattern (irregular)", "Average monthly savings of ~£625"],
          "missing" // MISSING - key document
        ),
        createDocument("doc-2", "tax_return", "Self-Assessment Tax Return (SA302)",
          "HMRC SA302 tax calculation for last 2 years",
          "To verify freelance income as source of savings",
          ["Self-employment income: ~£28,000 p.a.", "Tax paid confirms legitimate income", "2 years of returns showing consistent earnings"],
          "validated",
          generateTaxReturnResult("Michael Chen", 28000, 2, true, {
            conclusion: "plausible",
            reasoning: [
              "Declared freelance income of £28,000 p.a. over 2 years = £56,000 total earnings",
              "Claiming to save £15,000 from £56,000 (26.8% of gross income) is reasonable",
              "After tax (~£4,500/year), net income ~£23,500/year leaves ~£7,500/year for savings",
              "Tax returns confirm consistent self-employment over the period"
            ],
            calculations: [
              { label: "Savings as % of Gross", formula: "£15,000 ÷ £56,000", result: "26.8%", assessment: "supports" },
              { label: "Monthly Savings Required", formula: "£15,000 ÷ 24 months", result: "£625/month", assessment: "supports" },
              { label: "Net Income After Tax", formula: "£28,000 - ~£4,500 tax", result: "~£23,500/year", assessment: "supports" },
            ]
          })
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
      statementExcerpt: "I am a Senior Accountant at FinanceFirst PLC, earning £65,000 per annum. I have worked there for 5 years. My take-home pay is approximately £4,200 per month.",
      claimsToVerify: [
        { claim: "Employer: FinanceFirst PLC", extractedValue: "FinanceFirst PLC", verificationType: "identity" },
        { claim: "Position: Senior Accountant", extractedValue: "Senior Accountant", verificationType: "identity" },
        { claim: "Annual salary: £65,000", extractedValue: 65000, verificationType: "amount" },
        { claim: "Employment duration: 5 years", extractedValue: "5 years", verificationType: "duration" },
        { claim: "Monthly net pay: ~£4,200", extractedValue: 4200, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months payslips from FinanceFirst PLC",
          "Statement claims employment at FinanceFirst PLC with £65,000 salary",
          ["Employer: FinanceFirst PLC", "Gross monthly: £5,416 (£65,000 ÷ 12)", "Net pay: ~£4,200", "5 years tenure shown"],
          "validated",
          generatePayslipResult("FinanceFirst PLC", "Emma Williams", 5416.67, 4180, 65000, true, {
            conclusion: "plausible",
            reasoning: [
              "Gross monthly of £5,416.67 correctly matches £65,000 annual salary",
              "Net pay of £4,180 is accurate for this salary level after tax/NI",
              "Payslip shows continuous employment since 2019 (5 years)"
            ],
            calculations: [
              { label: "Annual to Monthly", formula: "£65,000 ÷ 12", result: "£5,416.67 gross", assessment: "supports" },
              { label: "Tax/NI Deduction", formula: "£5,416 - £1,236", result: "£4,180 net", assessment: "supports" },
            ]
          })
        ),
        createDocument("doc-2", "bank_statement", "Bank Statements (3 months)",
          "Bank statements showing salary deposits",
          "To verify salary credits match stated amounts",
          ["Monthly credits from FinanceFirst PLC", "Amounts match ~£4,200 net pay", "Regular deposit pattern"],
          "validated",
          generateBankStatementResult("Emma Williams", "FinanceFirst PLC", 4180, true, false, undefined)
        ),
      ],
    },
    {
      id: "fs-2",
      type: "gift",
      description: "Gift from grandmother Margaret Williams - £30,000",
      amount: 30000,
      currency: "GBP",
      statementExcerpt: "My grandmother Margaret Williams is gifting me £30,000 towards the deposit. She has confirmed this is a genuine gift with no expectation of repayment.",
      claimsToVerify: [
        { claim: "Gift amount: £30,000", extractedValue: 30000, verificationType: "amount" },
        { claim: "Donor: Grandmother (Margaret Williams)", extractedValue: "Margaret Williams", verificationType: "identity" },
        { claim: "Relationship: Grandmother", extractedValue: "grandmother", verificationType: "relationship" },
        { claim: "No repayment expected", extractedValue: "gift, not loan", verificationType: "identity" },
      ],
      requiredDocuments: [
        createDocument("doc-3", "gift_letter", "Gift Declaration Letter",
          "Signed letter from Margaret Williams confirming the gift",
          "Statement mentions £30,000 gift from grandmother with no repayment",
          ["Gift amount: £30,000", "Donor: Margaret Williams", "Relationship confirmed", "Explicitly states no repayment required"],
          "validated",
          generateGiftLetterResult("Margaret Williams", "Emma Williams", 30000, "grandmother", true)
        ),
        createDocument("doc-4", "bank_statement", "Donor's Bank Statement",
          "Margaret Williams' bank statement showing funds available",
          "To verify grandmother has £30,000 available to gift",
          ["Account holder: Margaret Williams", "Balance: £30,000+ available", "No recent large deposits (funds are legitimate savings)"],
          "validated",
          generateDonorBankResult("Margaret Williams", 45000, true)
        ),
      ],
    },
  ]
}

// CASE 4: Employment + Inheritance - PLAUSIBILITY ISSUES
function generateCase4Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "employment",
      description: "Junior Developer at TechStart Ltd - £75,000 p.a. (CLAIMED)",
      amount: 75000,
      currency: "GBP",
      statementExcerpt: "I work as a Junior Developer at TechStart Ltd, earning £75,000 per annum for the past 6 months. I started in January 2024.",
      claimsToVerify: [
        { claim: "Employer: TechStart Ltd", extractedValue: "TechStart Ltd", verificationType: "identity" },
        { claim: "Position: Junior Developer", extractedValue: "Junior Developer", verificationType: "identity" },
        { claim: "Annual salary: £75,000", extractedValue: 75000, verificationType: "amount" },
        { claim: "Employment start: January 2024", extractedValue: "January 2024", verificationType: "duration" },
        { claim: "Duration: 6 months", extractedValue: "6 months", verificationType: "duration" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months payslips from TechStart Ltd",
          "Statement claims £75,000 salary as Junior Developer - VERIFY: This is unusually high for a junior role",
          ["Employer: TechStart Ltd", "Verify gross matches £75,000 annual claim", "Check job title matches Junior Developer", "Confirm start date January 2024"],
          "flagged",
          generatePayslipResult("TechStart Ltd", "David Thompson", 3750, 2850, 45000, false, {
            conclusion: "implausible",
            reasoning: [
              "DISCREPANCY: Payslip shows £3,750 gross monthly = £45,000 p.a., NOT £75,000 claimed",
              "Applicant overstated salary by £30,000 (66% higher than actual)",
              "Junior Developer salary of £45,000 is market-appropriate; £75,000 would be unusual",
              "This significantly impacts affordability assessment"
            ],
            calculations: [
              { label: "Claimed Salary", formula: "£75,000 ÷ 12", result: "£6,250/month (claimed)", assessment: "contradicts" },
              { label: "Actual Salary", formula: "Payslip gross × 12", result: "£45,000/year (actual)", assessment: "contradicts" },
              { label: "Discrepancy", formula: "£75,000 - £45,000", result: "£30,000 overstated", assessment: "contradicts" },
            ]
          })
        ),
        createDocument("doc-2", "employment_contract", "Employment Contract",
          "Employment contract from TechStart Ltd",
          "To verify contracted salary and employment terms",
          ["Contracted salary - does it match £75,000 or actual payslip?", "Job title: Junior Developer", "Start date: January 2024"],
          "validated",
          generateContractResult("Junior Developer", "TechStart Ltd", "January 2024", "£45,000", true)
        ),
      ],
    },
    {
      id: "fs-2",
      type: "inheritance",
      description: "Inheritance from uncle James Thompson - £50,000",
      amount: 50000,
      currency: "GBP",
      statementExcerpt: "I recently inherited £50,000 from my late uncle James Thompson's estate in December 2023.",
      claimsToVerify: [
        { claim: "Inheritance amount: £50,000", extractedValue: 50000, verificationType: "amount" },
        { claim: "Deceased: Uncle (James Thompson)", extractedValue: "James Thompson", verificationType: "identity" },
        { claim: "Relationship: Uncle", extractedValue: "uncle", verificationType: "relationship" },
        { claim: "Date received: December 2023", extractedValue: "December 2023", verificationType: "duration" },
      ],
      requiredDocuments: [
        createDocument("doc-3", "probate_document", "Grant of Probate / Estate Documents",
          "Official probate document for James Thompson's estate",
          "Statement claims £50,000 inheritance from uncle in December 2023",
          ["Deceased: James Thompson", "Beneficiary: David Thompson", "Amount: £50,000", "Distribution date: December 2023"],
          "validated",
          generateProbateResult("David Thompson", "James Thompson", 50000, true)
        ),
        createDocument("doc-4", "bank_statement", "Bank Statement Showing Inheritance Receipt",
          "Bank statement showing deposit of inheritance funds",
          "To verify £50,000 inheritance was actually received",
          ["Deposit of £50,000 from estate/executor", "Timing matches probate (December 2023)", "Account holder is applicant"],
          "flagged",
          generateInheritanceBankResult("David Thompson", 35000, 50000, {
            conclusion: "questionable",
            reasoning: [
              "DISCREPANCY: Only £35,000 deposited, not £50,000 as claimed",
              "Probate document shows £50,000 entitlement, but bank shows £35,000 received",
              "Possible explanations: estate fees, partial distribution, or funds held elsewhere",
              "Requires clarification: Where is the remaining £15,000?"
            ],
            calculations: [
              { label: "Claimed Amount", formula: "Per statement", result: "£50,000", assessment: "contradicts" },
              { label: "Actual Receipt", formula: "Bank deposit", result: "£35,000", assessment: "contradicts" },
              { label: "Unexplained Gap", formula: "£50,000 - £35,000", result: "£15,000 unaccounted", assessment: "contradicts" },
            ]
          })
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
      statementExcerpt: "I work as a Senior Software Engineer at TechCorp Ltd, earning £95,000 per annum. I have been employed there for 4 years. My monthly net pay is approximately £5,850.",
      claimsToVerify: [
        { claim: "Employer: TechCorp Ltd", extractedValue: "TechCorp Ltd", verificationType: "identity" },
        { claim: "Position: Senior Software Engineer", extractedValue: "Senior Software Engineer", verificationType: "identity" },
        { claim: "Annual salary: £95,000", extractedValue: 95000, verificationType: "amount" },
        { claim: "Employment duration: 4 years", extractedValue: "4 years", verificationType: "duration" },
        { claim: "Monthly net pay: ~£5,850", extractedValue: 5850, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "payslip", "Recent Payslips (3 months)",
          "Last 3 months payslips from TechCorp Ltd",
          "Statement claims £95,000 salary with £5,850 net monthly",
          ["Employer: TechCorp Ltd", "Gross: ~£7,916/month", "Net: ~£5,850", "4 years tenure"],
          "validated",
          generatePayslipResult("TechCorp Ltd", "Robert Anderson", 7916.67, 5850, 95000, true, {
            conclusion: "plausible",
            reasoning: [
              "Gross pay of £7,916.67 correctly equates to £95,000 annual",
              "Net pay of £5,850 is accurate after higher rate tax",
              "Senior Software Engineer role commands this salary in London market",
              "4 years tenure demonstrated by payslip start date"
            ],
            calculations: [
              { label: "Annual to Monthly", formula: "£95,000 ÷ 12", result: "£7,916.67 gross", assessment: "supports" },
              { label: "Higher Rate Tax", formula: "Approx 26% effective rate", result: "£5,850 net", assessment: "supports" },
            ]
          })
        ),
        createDocument("doc-2", "bank_statement", "Bank Statements (3 months)",
          "Bank statements showing salary deposits",
          "To verify salary credits and savings pattern",
          ["Monthly credits ~£5,850 from TechCorp Ltd", "Evidence of ~£1,000/month savings transfers"],
          "validated",
          generateBankStatementResult("Robert Anderson", "TechCorp Ltd", 5850, true, true, {
            conclusion: "plausible",
            reasoning: [
              "Consistent salary credits of ~£5,850 from TechCorp Ltd",
              "Regular transfers of £1,000+ to savings account",
              "Spending pattern consistent with stated savings goals"
            ]
          })
        ),
      ],
    },
    {
      id: "fs-2",
      type: "gift",
      description: "Gift from parents John & Mary Anderson - £50,000",
      amount: 50000,
      currency: "GBP",
      statementExcerpt: "My parents John and Mary Anderson are gifting me £50,000 towards the deposit. They will provide a signed gift letter confirming this is not a loan.",
      claimsToVerify: [
        { claim: "Gift amount: £50,000", extractedValue: 50000, verificationType: "amount" },
        { claim: "Donors: John and Mary Anderson", extractedValue: "John and Mary Anderson", verificationType: "identity" },
        { claim: "Relationship: Parents", extractedValue: "parents", verificationType: "relationship" },
        { claim: "Not a loan", extractedValue: "gift", verificationType: "identity" },
      ],
      requiredDocuments: [
        createDocument("doc-3", "gift_letter", "Gift Letter from Parents",
          "Signed letter from both parents confirming the gift",
          "Statement mentions £50,000 gift from parents, not a loan",
          ["Gift amount: £50,000", "Signed by both John and Mary Anderson", "Confirms no repayment required"],
          "validated",
          generateGiftLetterResult("John and Mary Anderson", "Robert Anderson", 50000, "parents", true)
        ),
        createDocument("doc-4", "bank_statement", "Parents' Bank Statement",
          "Bank statement showing parents have funds available",
          "To verify parents have £50,000 available to gift",
          ["Account holders: John and/or Mary Anderson", "Balance: £50,000+ available", "Source of funds legitimate"],
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
      statementExcerpt: "I have accumulated £35,000 in my savings account over the past 3 years. With my salary I save approximately £1,000 per month after expenses.",
      claimsToVerify: [
        { claim: "Savings amount: £35,000", extractedValue: 35000, verificationType: "amount" },
        { claim: "Accumulation period: 3 years", extractedValue: "3 years", verificationType: "duration" },
        { claim: "Monthly savings: ~£1,000", extractedValue: 1000, verificationType: "amount" },
        { claim: "Source: Employment income", extractedValue: "salary", verificationType: "identity" },
      ],
      requiredDocuments: [
        createDocument("doc-5", "bank_statement", "Savings Account Statements (12+ months)",
          "12+ months of savings account statements",
          "Statement claims £35,000 accumulated over 3 years saving ~£1,000/month",
          ["Current balance: £35,000+", "Pattern shows ~£1,000/month accumulation", "Deposits traceable to salary income"],
          "validated",
          generateSavingsResult("Robert Anderson", 37500, 1000, 36, true, {
            conclusion: "plausible",
            reasoning: [
              "Current balance of £37,500 exceeds claimed £35,000 - consistent",
              "Monthly deposits averaging £1,000 over 36 months = £36,000 potential",
              "With interest/growth, £37,500 balance is mathematically sound",
              "Deposit pattern aligns with employment income timing"
            ],
            calculations: [
              { label: "Expected Savings", formula: "£1,000 × 36 months", result: "£36,000", assessment: "supports" },
              { label: "With Interest", formula: "£36,000 + ~4% over 3 years", result: "~£37,500", assessment: "supports" },
              { label: "Savings Rate", formula: "£1,000 ÷ £5,850 net", result: "17% of income", assessment: "supports" },
            ]
          })
        ),
      ],
    },
    {
      id: "fs-4",
      type: "property_sale",
      description: "Sale of flat at 15 River Court - £200,000",
      amount: 200000,
      currency: "GBP",
      statementExcerpt: "I am selling my current flat at 15 River Court for £200,000. I purchased it in 2018 for £165,000 with a mortgage that is now fully paid off.",
      claimsToVerify: [
        { claim: "Property: 15 River Court", extractedValue: "15 River Court", verificationType: "ownership" },
        { claim: "Sale price: £200,000", extractedValue: 200000, verificationType: "amount" },
        { claim: "Purchase year: 2018", extractedValue: "2018", verificationType: "duration" },
        { claim: "Purchase price: £165,000", extractedValue: 165000, verificationType: "amount" },
        { claim: "Mortgage fully paid off", extractedValue: "paid off", verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-6", "property_deed", "Property Title Deed",
          "Land Registry title for 15 River Court",
          "Statement claims ownership of property at 15 River Court since 2018",
          ["Property: 15 River Court", "Owner: Robert Anderson", "Purchase date: 2018", "No charges/mortgages registered"],
          "validated",
          generatePropertyDeedResult("Robert Anderson", "15 River Court, London", "2018", true)
        ),
        createDocument("doc-7", "sale_agreement", "Sale Agreement / Memorandum of Sale",
          "Signed sale agreement for the property",
          "To verify agreed sale price of £200,000",
          ["Property: 15 River Court", "Sale price: £200,000", "Buyer details", "Expected completion date"],
          "missing" // MISSING
        ),
      ],
    },
  ]
}

// CASE 6: Complex - All docs but some flags
function generateCase6Sources(): FundingSource[] {
  return [
    {
      id: "fs-1",
      type: "business",
      description: "Digital Dynamics Ltd - £180,000 profit p.a.",
      amount: 180000,
      currency: "GBP",
      statementExcerpt: "My company Digital Dynamics Ltd has annual revenue of £1.2M and profit of £180,000. The company has been operating for 6 years.",
      claimsToVerify: [
        { claim: "Company: Digital Dynamics Ltd", extractedValue: "Digital Dynamics Ltd", verificationType: "ownership" },
        { claim: "Annual revenue: £1.2M", extractedValue: 1200000, verificationType: "amount" },
        { claim: "Annual profit: £180,000", extractedValue: 180000, verificationType: "amount" },
        { claim: "Trading duration: 6 years", extractedValue: "6 years", verificationType: "duration" },
      ],
      requiredDocuments: [
        createDocument("doc-1", "company_accounts", "Company Accounts (2 years)",
          "Audited accounts for Digital Dynamics Ltd",
          "Statement claims £1.2M revenue and £180,000 profit",
          ["Revenue matches £1.2M claim", "Profit matches £180,000 claim", "6 years trading confirmed"],
          "validated",
          generateCompanyAccountsResult("Digital Dynamics Ltd", 1200000, 180000, 6, true)
        ),
        createDocument("doc-2", "bank_statement", "Business Bank Statements (6 months)",
          "Business account statements",
          "To verify cash flow matches reported revenue",
          ["Cash flow consistent with £1.2M annual revenue", "Director drawings reasonable", "Healthy trading pattern"],
          "validated",
          generateBusinessBankResult("Digital Dynamics Ltd", 95000, true)
        ),
      ],
    },
    {
      id: "fs-2",
      type: "savings",
      description: "Personal savings - £75,000",
      amount: 75000,
      currency: "GBP",
      statementExcerpt: "I have £75,000 in personal savings accumulated over 5 years. I pay myself a salary of £60,000 from the business.",
      claimsToVerify: [
        { claim: "Savings amount: £75,000", extractedValue: 75000, verificationType: "amount" },
        { claim: "Accumulation period: 5 years", extractedValue: "5 years", verificationType: "duration" },
        { claim: "Director salary: £60,000 p.a.", extractedValue: 60000, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-3", "bank_statement", "Personal Savings Statements (12 months)",
          "12 months of personal savings account statements",
          "Statement claims £75,000 saved over 5 years from £60,000 salary",
          ["Current balance: £75,000+", "Accumulation pattern over 5 years", "Source of deposits traceable"],
          "flagged",
          generateSavingsResultFlagged("Jennifer Martinez", 75000, 25000, {
            conclusion: "questionable",
            reasoning: [
              "Balance of £75,000 confirmed, BUT unusual £25,000 lump sum deposit in March 2024",
              "This single deposit represents 33% of total savings - source unclear",
              "Regular monthly savings pattern only accounts for ~£50,000",
              "£25,000 deposit needs explanation - could be dividend, bonus, or unexplained"
            ],
            calculations: [
              { label: "Expected from Salary", formula: "~£1,000/month × 60 months", result: "~£60,000", assessment: "neutral" },
              { label: "Unexplained Deposit", formula: "Single lump sum", result: "£25,000", assessment: "contradicts" },
              { label: "Gap", formula: "£75,000 - £50,000 regular", result: "£25,000 unverified", assessment: "contradicts" },
            ]
          })
        ),
      ],
    },
    {
      id: "fs-3",
      type: "property_equity",
      description: "Property equity at 88 High Street - £450,000",
      amount: 450000,
      currency: "GBP",
      statementExcerpt: "My residential property at 88 High Street is valued at £650,000 with £200,000 remaining mortgage, providing £450,000 in equity.",
      claimsToVerify: [
        { claim: "Property: 88 High Street", extractedValue: "88 High Street", verificationType: "ownership" },
        { claim: "Property value: £650,000", extractedValue: 650000, verificationType: "amount" },
        { claim: "Mortgage outstanding: £200,000", extractedValue: 200000, verificationType: "amount" },
        { claim: "Equity: £450,000", extractedValue: 450000, verificationType: "amount" },
      ],
      requiredDocuments: [
        createDocument("doc-4", "property_valuation", "Property Valuation Report",
          "RICS valuation of 88 High Street",
          "Statement claims property valued at £650,000",
          ["Professional RICS valuation", "Value: £650,000", "Valuation within 3 months"],
          "validated",
          generateValuationResult("88 High Street", 650000, true)
        ),
        createDocument("doc-5", "mortgage_statement", "Mortgage Statement",
          "Current mortgage statement",
          "Statement claims £200,000 outstanding mortgage",
          ["Outstanding balance: £200,000", "Account in good standing", "Property address matches"],
          "validated",
          generateMortgageResult("Jennifer Martinez", "88 High Street", 198500, true, {
            conclusion: "plausible",
            reasoning: [
              "Mortgage balance of £198,500 closely matches claimed £200,000",
              "Account in good standing with no arrears",
              "Equity calculation: £650,000 - £198,500 = £451,500 (matches claim)",
            ],
            calculations: [
              { label: "Property Value", formula: "Per valuation", result: "£650,000", assessment: "supports" },
              { label: "Mortgage Balance", formula: "Per statement", result: "£198,500", assessment: "supports" },
              { label: "Available Equity", formula: "£650,000 - £198,500", result: "£451,500", assessment: "supports" },
            ]
          })
        ),
      ],
    },
    {
      id: "fs-4",
      type: "investments",
      description: "Investment portfolio with WealthPro - £120,000",
      amount: 120000,
      currency: "GBP",
      statementExcerpt: "I have investments worth £120,000 in ISAs and stocks managed by WealthPro Advisors since 2019.",
      claimsToVerify: [
        { claim: "Investment value: £120,000", extractedValue: 120000, verificationType: "amount" },
        { claim: "Investment types: ISAs and stocks", extractedValue: "ISAs and stocks", verificationType: "identity" },
        { claim: "Manager: WealthPro Advisors", extractedValue: "WealthPro Advisors", verificationType: "identity" },
        { claim: "Investment start: 2019", extractedValue: "2019", verificationType: "duration" },
      ],
      requiredDocuments: [
        createDocument("doc-6", "investment_statement", "Investment Portfolio Statement",
          "Statement from WealthPro Advisors",
          "Statement claims £120,000 in ISAs and stocks",
          ["Portfolio value: £120,000", "Account holder: Jennifer Martinez", "Asset breakdown provided"],
          "validated",
          generateInvestmentResult("Jennifer Martinez", "WealthPro Advisors", 122500, true)
        ),
        createDocument("doc-7", "source_of_investment", "Source of Investment Funds Documentation",
          "Evidence showing origin of investment capital",
          "To verify source of the £120,000 invested since 2019",
          ["Investment history from 2019", "Funded from declared income", "No unexplained capital injections"],
          "flagged",
          generateInvestmentSourceFlagged("Jennifer Martinez", 120000, {
            conclusion: "questionable",
            reasoning: [
              "Initial investment of £40,000 in 2019 - source not clearly documented",
              "Unable to trace the £40,000 back to declared income or savings",
              "Subsequent contributions (£80,000 over 5 years) align with director salary",
              "Recommendation: Request bank statements from 2019 showing source of initial capital"
            ],
            calculations: [
              { label: "Initial Capital (2019)", formula: "Opening investment", result: "£40,000 - SOURCE UNCLEAR", assessment: "contradicts" },
              { label: "Subsequent Additions", formula: "£80,000 over 5 years", result: "£16,000/year = reasonable", assessment: "supports" },
              { label: "Growth", formula: "£120,000 current + gains", result: "~£122,500 total", assessment: "supports" },
            ]
          })
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
    type: type as RequiredDocument["type"],
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

function generatePayslipResult(
  employer: string,
  employee: string,
  grossPay: number,
  netPay: number,
  annualSalary: number,
  isValid: boolean,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "payroll",
    extractedData: [
      { label: "Employer", value: employer, confidence: 0.98 },
      { label: "Employee Name", value: employee, confidence: 0.99 },
      { label: "Gross Monthly Pay", value: `£${grossPay.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.97 },
      { label: "Net Monthly Pay", value: `£${netPay.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.97 },
      { label: "Annual Equivalent", value: `£${annualSalary.toLocaleString()}`, confidence: 0.97 },
      { label: "Pay Period", value: "March 2024", confidence: 0.99 },
      { label: "Tax Code", value: "1257L", confidence: 0.95 },
    ],
    matches: isValid ? [
      { statementClaim: `Employment at ${employer}`, documentEvidence: `Employer on payslip: ${employer}`, status: "match", analysis: "Employer name matches exactly" },
      { statementClaim: `Salary of £${annualSalary.toLocaleString()} p.a.`, documentEvidence: `Gross: £${grossPay.toLocaleString()} × 12 = £${annualSalary.toLocaleString()}`, status: "match", analysis: "Annual calculation from monthly gross matches claimed salary" },
      { statementClaim: `Net pay ~£${netPay.toLocaleString()}`, documentEvidence: `Net on payslip: £${netPay.toLocaleString()}`, status: "match", analysis: "Net pay aligns with claimed take-home amount" },
    ] : [
      { statementClaim: `Employment at ${employer}`, documentEvidence: `Employer: ${employer}`, status: "match" },
      { statementClaim: `Salary of £75,000 p.a.`, documentEvidence: `Actual: £${annualSalary.toLocaleString()} p.a.`, status: "mismatch", analysis: "SIGNIFICANT DISCREPANCY: Claimed salary is 66% higher than actual documented salary" },
    ],
    flags: isValid ? [] : [
      {
        severity: "high",
        message: `Salary discrepancy: Statement claims £75,000 but payslip shows £${annualSalary.toLocaleString()} annual`,
        recommendation: "Request written clarification from applicant. Consider if this affects affordability assessment.",
      },
    ],
    summary: isValid 
      ? `Payslip verified successfully. ${employer} employment and £${annualSalary.toLocaleString()} salary confirmed.`
      : `ALERT: Payslip reveals salary significantly lower than claimed. Requires immediate review.`,
    plausibilityAnalysis: plausibility,
  }
}

function generateContractResult(
  title: string,
  employer: string,
  startDate: string,
  salary: string,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "payroll",
    extractedData: [
      { label: "Job Title", value: title, confidence: 0.99 },
      { label: "Employer", value: employer, confidence: 0.99 },
      { label: "Start Date", value: startDate, confidence: 0.98 },
      { label: "Annual Salary", value: salary, confidence: 0.99 },
    ],
    matches: [
      { statementClaim: `${title} position`, documentEvidence: `Contract states: ${title}`, status: "match" },
      { statementClaim: "Employment start date", documentEvidence: `Started: ${startDate}`, status: "match" },
    ],
    flags: [],
    summary: `Employment contract confirms ${title} position at ${employer} since ${startDate} with ${salary} salary.`,
  }
}

function generateBankStatementResult(
  holder: string,
  employer: string,
  netPay: number,
  salaryMatches: boolean,
  showsSavings: boolean,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: "valid",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Account Type", value: "Current Account", confidence: 0.98 },
      { label: "Statement Period", value: "Jan - Mar 2024", confidence: 0.98 },
      { label: "Monthly Salary Credit", value: `£${netPay.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, confidence: 0.99 },
      ...(showsSavings ? [{ label: "Monthly Savings Transfer", value: "Regular transfers observed", confidence: 0.95 }] : []),
    ],
    matches: [
      { statementClaim: "Regular salary deposits", documentEvidence: `Monthly credit from ${employer}: £${netPay.toLocaleString()}`, status: salaryMatches ? "match" : "mismatch", analysis: salaryMatches ? "Salary credits match payslip net amounts" : "Discrepancy in salary amount" },
      ...(showsSavings ? [{ statementClaim: "Monthly savings pattern", documentEvidence: "Regular transfers to savings account observed", status: "match" as const, analysis: "Consistent savings behaviour supports claimed savings rate" }] : []),
    ],
    flags: [],
    summary: `Bank statement confirms salary credits of £${netPay.toLocaleString()} from ${employer}.${showsSavings ? " Regular savings transfers observed." : ""}`,
    plausibilityAnalysis: plausibility,
  }
}

function generateGiftLetterResult(
  donor: string,
  recipient: string,
  amount: number,
  relationship: string,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "legal",
    extractedData: [
      { label: "Gift Amount", value: `£${amount.toLocaleString()}`, confidence: 0.99 },
      { label: "Donor Name(s)", value: donor, confidence: 0.98 },
      { label: "Recipient", value: recipient, confidence: 0.99 },
      { label: "Relationship", value: relationship, confidence: 0.97 },
      { label: "Date Signed", value: "1 April 2024", confidence: 0.97 },
      { label: "Repayment Required", value: "No - explicitly stated", confidence: 0.99 },
    ],
    matches: [
      { statementClaim: `£${amount.toLocaleString()} gift`, documentEvidence: `Letter states: "I/we gift £${amount.toLocaleString()}"`, status: "match", analysis: "Amount in letter matches statement exactly" },
      { statementClaim: `Gift from ${relationship}`, documentEvidence: `Donor: ${donor} (${relationship})`, status: "match", analysis: "Relationship confirmed in letter" },
      { statementClaim: "Not a loan / no repayment", documentEvidence: `"This is a gift with no requirement for repayment"`, status: "match", analysis: "Letter explicitly confirms no repayment expected" },
    ],
    flags: [],
    summary: `Gift letter properly executed. Confirms £${amount.toLocaleString()} gift from ${donor} (${relationship}) with no repayment required.`,
  }
}

function generateDonorBankResult(
  holder: string,
  balance: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Statement Date", value: "March 2024", confidence: 0.98 },
      { label: "Recent Large Deposits", value: "None observed", confidence: 0.95 },
    ],
    matches: [
      { statementClaim: "Donor has sufficient funds", documentEvidence: `Balance: £${balance.toLocaleString()}`, status: "match", analysis: "Balance exceeds gift amount, confirming availability" },
      { statementClaim: "Funds are legitimate savings", documentEvidence: "No suspicious recent large deposits", status: "match", analysis: "Funds appear to be accumulated savings, not recently borrowed" },
    ],
    flags: [],
    summary: `Donor bank statement confirms £${balance.toLocaleString()} available. Funds appear to be legitimate savings.`,
  }
}

function generateTaxReturnResult(
  name: string,
  income: number,
  years: number,
  isValid: boolean,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "legal",
    extractedData: [
      { label: "Taxpayer Name", value: name, confidence: 0.99 },
      { label: "Tax Year", value: "2023/24", confidence: 0.99 },
      { label: "Self-Employment Income", value: `£${income.toLocaleString()}`, confidence: 0.98 },
      { label: "Tax Paid", value: `£${Math.round(income * 0.18).toLocaleString()}`, confidence: 0.97 },
      { label: "Years of Returns", value: `${years} years`, confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "Freelance/self-employment income", documentEvidence: `SA302 shows: £${income.toLocaleString()} self-employment`, status: "match", analysis: "Tax return confirms self-employment as stated" },
      { statementClaim: `Income of ~£${income.toLocaleString()} p.a.`, documentEvidence: `Declared: £${income.toLocaleString()}`, status: "match", analysis: "Declared income matches claimed amount" },
    ],
    flags: [],
    summary: `Tax return confirms self-employment income of £${income.toLocaleString()} p.a. with tax properly paid.`,
    plausibilityAnalysis: plausibility,
  }
}

function generateProbateResult(
  beneficiary: string,
  deceased: string,
  amount: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "legal",
    extractedData: [
      { label: "Deceased", value: deceased, confidence: 0.99 },
      { label: "Beneficiary", value: beneficiary, confidence: 0.99 },
      { label: "Inheritance Amount", value: `£${amount.toLocaleString()}`, confidence: 0.98 },
      { label: "Probate Granted", value: "December 2023", confidence: 0.97 },
      { label: "Relationship", value: "Uncle (confirmed)", confidence: 0.96 },
    ],
    matches: [
      { statementClaim: `£${amount.toLocaleString()} inheritance`, documentEvidence: `Probate shows: £${amount.toLocaleString()} to ${beneficiary}`, status: "match", analysis: "Inheritance amount matches claim" },
      { statementClaim: `From uncle ${deceased}`, documentEvidence: `Deceased: ${deceased}`, status: "match", analysis: "Deceased person matches statement" },
    ],
    flags: [],
    summary: `Grant of Probate confirms ${beneficiary} entitled to £${amount.toLocaleString()} from ${deceased}'s estate.`,
  }
}

function generateInheritanceBankResult(
  holder: string,
  received: number,
  claimed: number,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Inheritance Deposit", value: `£${received.toLocaleString()}`, confidence: 0.99 },
      { label: "Deposit Date", value: "January 2024", confidence: 0.98 },
      { label: "Deposit Reference", value: "Estate of J Thompson", confidence: 0.95 },
    ],
    matches: [
      { statementClaim: `£${claimed.toLocaleString()} inheritance received`, documentEvidence: `Bank shows: £${received.toLocaleString()} deposited`, status: "mismatch", analysis: `DISCREPANCY: £${(claimed - received).toLocaleString()} difference between claimed and received amounts` },
    ],
    flags: [
      {
        severity: "medium",
        message: `Inheritance amount discrepancy: Claimed £${claimed.toLocaleString()} but only £${received.toLocaleString()} deposited`,
        recommendation: "Request explanation for the £15,000 difference. Possible causes: executor fees, partial distribution, or funds in another account.",
      },
    ],
    summary: `Bank shows £${received.toLocaleString()} inheritance deposit, but applicant claimed £${claimed.toLocaleString()}. Clarification required.`,
    plausibilityAnalysis: plausibility,
  }
}

function generateSavingsResult(
  holder: string,
  balance: number,
  monthlySavings: number,
  months: number,
  isValid: boolean,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Average Monthly Deposit", value: `£${monthlySavings.toLocaleString()}`, confidence: 0.95 },
      { label: "Accumulation Period", value: `${months} months observed`, confidence: 0.97 },
    ],
    matches: [
      { statementClaim: "Savings accumulated", documentEvidence: `Current balance: £${balance.toLocaleString()}`, status: "match", analysis: "Balance meets or exceeds claimed savings" },
      { statementClaim: `~£${monthlySavings.toLocaleString()}/month savings`, documentEvidence: `Average deposit: £${monthlySavings.toLocaleString()}/month`, status: "match", analysis: "Monthly savings pattern consistent with claim" },
    ],
    flags: [],
    summary: `Savings account shows £${balance.toLocaleString()} with consistent £${monthlySavings.toLocaleString()}/month accumulation pattern.`,
    plausibilityAnalysis: plausibility,
  }
}

function generateSavingsResultFlagged(
  holder: string,
  balance: number,
  unexplainedDeposit: number,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Current Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Unexplained Lump Sum", value: `£${unexplainedDeposit.toLocaleString()}`, confidence: 0.98 },
      { label: "Deposit Date", value: "March 2024", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `£${balance.toLocaleString()} in savings`, documentEvidence: `Balance confirmed: £${balance.toLocaleString()}`, status: "match", analysis: "Balance matches claimed amount" },
      { statementClaim: "Accumulated from salary over 5 years", documentEvidence: `Large unexplained £${unexplainedDeposit.toLocaleString()} deposit`, status: "partial", analysis: "Bulk of savings traceable, but one large deposit lacks clear source" },
    ],
    flags: [
      {
        severity: "medium",
        message: `Unexplained £${unexplainedDeposit.toLocaleString()} deposit in March 2024 - source not clear from statements`,
        recommendation: "Request explanation and supporting documentation for this deposit. Could be dividend, bonus, or other legitimate source.",
      },
    ],
    summary: `Savings balance of £${balance.toLocaleString()} confirmed, but £${unexplainedDeposit.toLocaleString()} deposit requires explanation.`,
    plausibilityAnalysis: plausibility,
  }
}

function generatePropertyDeedResult(
  owner: string,
  address: string,
  purchaseYear: string,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "property",
    extractedData: [
      { label: "Property Address", value: address, confidence: 0.99 },
      { label: "Registered Owner", value: owner, confidence: 0.99 },
      { label: "Purchase Date", value: purchaseYear, confidence: 0.98 },
      { label: "Title Number", value: "TGL123456", confidence: 0.99 },
      { label: "Charges Registered", value: "None", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Property at ${address}`, documentEvidence: `Title shows: ${address}`, status: "match", analysis: "Property address matches statement" },
      { statementClaim: "Applicant owns property", documentEvidence: `Owner: ${owner}`, status: "match", analysis: "Applicant confirmed as registered owner" },
      { statementClaim: `Purchased in ${purchaseYear}`, documentEvidence: `Purchase recorded: ${purchaseYear}`, status: "match", analysis: "Purchase date matches claim" },
      { statementClaim: "Mortgage fully paid", documentEvidence: "No charges registered", status: "match", analysis: "Title shows property is unencumbered" },
    ],
    flags: [],
    summary: `Land Registry confirms ${owner} as sole owner of ${address} since ${purchaseYear} with no outstanding charges.`,
  }
}

function generateValuationResult(
  address: string,
  value: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "property",
    extractedData: [
      { label: "Property Address", value: address, confidence: 0.99 },
      { label: "Market Value", value: `£${value.toLocaleString()}`, confidence: 0.98 },
      { label: "Valuation Date", value: "15 March 2024", confidence: 0.99 },
      { label: "Valuer", value: "RICS Registered Surveyor", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: `Property valued at £${value.toLocaleString()}`, documentEvidence: `RICS valuation: £${value.toLocaleString()}`, status: "match", analysis: "Professional valuation confirms stated value" },
    ],
    flags: [],
    summary: `RICS valuation confirms ${address} market value of £${value.toLocaleString()}.`,
  }
}

function generateMortgageResult(
  holder: string,
  address: string,
  balance: number,
  isValid: boolean,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Property Address", value: address, confidence: 0.99 },
      { label: "Outstanding Balance", value: `£${balance.toLocaleString()}`, confidence: 0.99 },
      { label: "Account Status", value: "Good Standing", confidence: 0.98 },
      { label: "Monthly Payment", value: "£1,250", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: "~£200,000 remaining mortgage", documentEvidence: `Actual balance: £${balance.toLocaleString()}`, status: "match", analysis: "Balance within acceptable variance of claimed amount" },
      { statementClaim: "Mortgage on 88 High Street", documentEvidence: `Property: ${address}`, status: "match", analysis: "Property address matches statement" },
    ],
    flags: [],
    summary: `Mortgage statement confirms £${balance.toLocaleString()} outstanding on ${address}. Account in good standing.`,
    plausibilityAnalysis: plausibility,
  }
}

function generateCompanyAccountsResult(
  company: string,
  revenue: number,
  profit: number,
  years: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "legal",
    extractedData: [
      { label: "Company Name", value: company, confidence: 0.99 },
      { label: "Annual Revenue", value: `£${(revenue / 1000000).toFixed(1)}M`, confidence: 0.98 },
      { label: "Net Profit", value: `£${profit.toLocaleString()}`, confidence: 0.98 },
      { label: "Years Trading", value: `${years} years`, confidence: 0.97 },
      { label: "Profit Margin", value: `${((profit / revenue) * 100).toFixed(1)}%`, confidence: 0.96 },
    ],
    matches: [
      { statementClaim: `Revenue of £${(revenue / 1000000).toFixed(1)}M`, documentEvidence: `Accounts show: £${(revenue / 1000000).toFixed(1)}M turnover`, status: "match", analysis: "Revenue matches stated amount" },
      { statementClaim: `Profit of £${profit.toLocaleString()}`, documentEvidence: `Net profit: £${profit.toLocaleString()}`, status: "match", analysis: "Profit figure confirmed in audited accounts" },
      { statementClaim: `${years} years operating`, documentEvidence: `Incorporation: ${2024 - years}`, status: "match", analysis: "Trading history confirmed" },
    ],
    flags: [],
    summary: `Audited accounts confirm ${company} with £${(revenue / 1000000).toFixed(1)}M revenue and £${profit.toLocaleString()} profit over ${years} years trading.`,
  }
}

function generateBusinessBankResult(
  company: string,
  avgBalance: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Name", value: company, confidence: 0.99 },
      { label: "Average Balance", value: `£${avgBalance.toLocaleString()}`, confidence: 0.97 },
      { label: "Monthly Turnover", value: "~£100,000", confidence: 0.95 },
      { label: "Account Status", value: "Active - Good Standing", confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "Active business operations", documentEvidence: "Consistent trading cash flow observed", status: "match", analysis: "Bank activity consistent with £1.2M annual revenue" },
    ],
    flags: [],
    summary: `Business bank statements show healthy trading activity consistent with reported turnover.`,
  }
}

function generateInvestmentResult(
  holder: string,
  manager: string,
  value: number,
  isValid: boolean
): ValidationResult {
  return {
    status: isValid ? "valid" : "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Investment Manager", value: manager, confidence: 0.99 },
      { label: "Portfolio Value", value: `£${value.toLocaleString()}`, confidence: 0.98 },
      { label: "Asset Types", value: "ISAs, Stocks, Bonds", confidence: 0.97 },
    ],
    matches: [
      { statementClaim: "~£120,000 in investments", documentEvidence: `Portfolio value: £${value.toLocaleString()}`, status: "match", analysis: "Current value slightly exceeds claimed amount" },
      { statementClaim: "Managed by WealthPro", documentEvidence: `Manager: ${manager}`, status: "match", analysis: "Investment manager confirmed" },
    ],
    flags: [],
    summary: `Investment portfolio of £${value.toLocaleString()} confirmed with ${manager}.`,
  }
}

function generateInvestmentSourceFlagged(
  holder: string,
  totalValue: number,
  plausibility?: PlausibilityAnalysis
): ValidationResult {
  return {
    status: "flagged",
    agentType: "banking",
    extractedData: [
      { label: "Account Holder", value: holder, confidence: 0.99 },
      { label: "Initial Investment (2019)", value: "£40,000", confidence: 0.97 },
      { label: "Subsequent Contributions", value: "£80,000 (2019-2024)", confidence: 0.96 },
      { label: "Current Value", value: `£${totalValue.toLocaleString()}`, confidence: 0.98 },
    ],
    matches: [
      { statementClaim: "Investments since 2019", documentEvidence: "Account opened 2019 confirmed", status: "match", analysis: "Timeline matches statement" },
      { statementClaim: "Funded from income", documentEvidence: "Initial £40,000 source unclear", status: "partial", analysis: "Cannot fully trace initial capital to declared income" },
    ],
    flags: [
      {
        severity: "medium",
        message: "Initial £40,000 investment in 2019 - source documentation incomplete",
        recommendation: "Request 2019 bank statements showing source of initial investment capital. Need to establish clear audit trail.",
      },
    ],
    summary: `Investment account confirmed but initial £40,000 capital injection in 2019 lacks clear source documentation.`,
    plausibilityAnalysis: plausibility,
  }
}

// ============================================================================
// AUDIT REPORT GENERATOR
// ============================================================================

export function generateAuditReport(
  applicantName: string,
  fundingSources: FundingSource[]
): AuditReport {
  const totalFunds = fundingSources.reduce((sum, fs) => sum + fs.amount, 0)

  let totalDocs = 0
  let validatedDocs = 0
  let flaggedDocs = 0
  let pendingDocs = 0
  const allFlags: { severity: "high" | "medium" | "low"; message: string; recommendation: string }[] = []

  fundingSources.forEach((fs) => {
    fs.requiredDocuments.forEach((doc) => {
      totalDocs++
      if (doc.status === "validated") validatedDocs++
      else if (doc.status === "flagged") {
        flaggedDocs++
        doc.validationResult?.flags.forEach((f) => allFlags.push(f))
      } else pendingDocs++
    })
  })

  const overallStatus: "approved" | "flagged" | "pending" =
    pendingDocs > 0 ? "pending" : flaggedDocs > 0 ? "flagged" : "approved"

  const plausibilityScore = pendingDocs > 0 ? 0 : flaggedDocs > 0 ? 65 : 95

  const notes: string[] = []
  if (flaggedDocs > 0) {
    notes.push(`${flaggedDocs} document(s) flagged for review - see detailed flags below`)
  }
  if (pendingDocs > 0) {
    notes.push(`${pendingDocs} document(s) still pending - cannot complete full assessment`)
  }
  if (overallStatus === "approved") {
    notes.push("All documents validated successfully. Source of funds verified.")
  }

  return {
    id: `audit-${Date.now()}`,
    generatedAt: new Date(),
    applicantName,
    totalFundsVerified: totalFunds,
    currency: "GBP",
    overallStatus,
    fundingSources,
    validationSummary: {
      totalDocuments: totalDocs,
      validatedDocuments: validatedDocs,
      flaggedDocuments: flaggedDocs,
      pendingDocuments: pendingDocs,
    },
    plausibilityScore,
    flaggedItems: allFlags,
    notes,
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000),
        action: "Case Opened",
        details: `SOF verification initiated for ${applicantName}`,
      },
      {
        timestamp: new Date(Date.now() - 3000000),
        action: "Statement Analyzed",
        agent: "payroll",
        details: `Identified ${fundingSources.length} funding source(s)`,
      },
      {
        timestamp: new Date(Date.now() - 2400000),
        action: "Documents Processed",
        details: `${totalDocs} documents required, ${totalDocs - pendingDocs} uploaded`,
      },
      {
        timestamp: new Date(Date.now() - 1800000),
        action: "Validation Complete",
        details: `${validatedDocs} validated, ${flaggedDocs} flagged, ${pendingDocs} pending`,
      },
      {
        timestamp: new Date(),
        action: "Report Generated",
        details: `Final status: ${overallStatus.toUpperCase()}`,
      },
    ],
  }
}

// ============================================================================
// CHAT RESPONSES
// ============================================================================

export function generateChatResponse(
  userMessage: string,
  fundingSources: FundingSource[],
  currentStage: number
): string {
  const lowerMsg = userMessage.toLowerCase()

  if (lowerMsg.includes("flag") || lowerMsg.includes("issue") || lowerMsg.includes("problem")) {
    const flaggedDocs = fundingSources.flatMap((fs) =>
      fs.requiredDocuments.filter((d) => d.status === "flagged")
    )
    if (flaggedDocs.length === 0) {
      return "No flags have been raised in the current validation. All processed documents have passed verification."
    }
    const flagSummary = flaggedDocs
      .map((d) => {
        const flags = d.validationResult?.flags || []
        return `**${d.name}**: ${flags.map((f) => f.message).join("; ")}`
      })
      .join("\n\n")
    return `The following documents have been flagged:\n\n${flagSummary}\n\nWould you like me to explain any of these in more detail?`
  }

  if (lowerMsg.includes("missing") || lowerMsg.includes("pending") || lowerMsg.includes("upload")) {
    const missingDocs = fundingSources.flatMap((fs) =>
      fs.requiredDocuments.filter((d) => d.status === "missing")
    )
    if (missingDocs.length === 0) {
      return "All required documents have been uploaded. No documents are currently missing."
    }
    const missingList = missingDocs.map((d) => `- **${d.name}**: ${d.reason}`).join("\n")
    return `The following documents are still required:\n\n${missingList}\n\nPlease upload these to complete the verification process.`
  }

  if (lowerMsg.includes("plausib") || lowerMsg.includes("analysis") || lowerMsg.includes("calculation")) {
    const docsWithPlausibility = fundingSources.flatMap((fs) =>
      fs.requiredDocuments.filter((d) => d.validationResult?.plausibilityAnalysis)
    )
    if (docsWithPlausibility.length === 0) {
      return "Plausibility analysis is performed during document validation. Process documents to see detailed analysis."
    }
    const analysis = docsWithPlausibility
      .map((d) => {
        const pa = d.validationResult?.plausibilityAnalysis
        return `**${d.name}** (${pa?.conclusion.toUpperCase()}):\n${pa?.reasoning.map((r) => `  - ${r}`).join("\n")}`
      })
      .join("\n\n")
    return `Here's the plausibility analysis:\n\n${analysis}`
  }

  if (lowerMsg.includes("salary") || lowerMsg.includes("income") || lowerMsg.includes("employment")) {
    const empSource = fundingSources.find((fs) => fs.type === "employment" || fs.type === "business")
    if (!empSource) {
      return "No employment or business income source has been identified in this case."
    }
    return `**Employment/Income Analysis:**\n\nStatement excerpt: "${empSource.statementExcerpt}"\n\nClaims to verify:\n${empSource.claimsToVerify.map((c) => `- ${c.claim}`).join("\n")}\n\nThe payroll agent will verify these against submitted documents.`
  }

  if (lowerMsg.includes("summary") || lowerMsg.includes("status") || lowerMsg.includes("overview")) {
    const total = fundingSources.reduce((sum, fs) => sum + fs.amount, 0)
    const validated = fundingSources.flatMap((fs) => fs.requiredDocuments).filter((d) => d.status === "validated").length
    const flagged = fundingSources.flatMap((fs) => fs.requiredDocuments).filter((d) => d.status === "flagged").length
    const missing = fundingSources.flatMap((fs) => fs.requiredDocuments).filter((d) => d.status === "missing").length
    
    return `**Case Summary:**\n\n- Funding sources: ${fundingSources.length}\n- Total claimed: £${total.toLocaleString()}\n- Documents validated: ${validated}\n- Documents flagged: ${flagged}\n- Documents missing: ${missing}\n\nCurrent stage: ${currentStage}/4`
  }

  return `I can help you understand this SOF verification case. You can ask me about:\n\n- **Flagged items** - explain issues found\n- **Missing documents** - what's still needed\n- **Plausibility analysis** - the calculations and reasoning\n- **Income/salary verification** - employment checks\n- **Case summary** - overall status\n\nWhat would you like to know?`
}

// ============================================================================
// INITIAL CHAT MESSAGES
// ============================================================================

export const INITIAL_CHAT_MESSAGES: { id: string; role: "assistant"; content: string; timestamp: Date }[] = [
  {
    id: "init-1",
    role: "assistant",
    content: "Welcome to the Source of Funds Verification Agent. Select an example case or enter a statement to begin analysis. I'll guide you through the verification process and help identify any issues.",
    timestamp: new Date(),
  },
]

// ============================================================================
// MOCK VALIDATION RESULT GENERATOR (for simulating agent work)
// ============================================================================

export function generateMockValidationResult(doc: RequiredDocument): ValidationResult {
  // Return the existing validation result if available
  if (doc.validationResult) {
    return doc.validationResult
  }
  
  // Safely determine agent type
  const docType = doc.type || ""
  const docName = doc.name || "Document"
  
  const getAgentType = (): "payroll" | "banking" | "legal" | "property" => {
    if (docType.includes("payslip") || docType.includes("contract") || docType.includes("employment")) {
      return "payroll"
    }
    if (docType.includes("bank")) {
      return "banking"
    }
    if (docType.includes("property") || docType.includes("valuation") || docType.includes("deed")) {
      return "property"
    }
    return "legal"
  }
  
  // Generate a simple valid result for newly uploaded docs
  return {
    status: "valid",
    agentType: getAgentType(),
    extractedData: [
      { label: "Document Type", value: docName, confidence: 0.95 },
      { label: "Upload Date", value: new Date().toLocaleDateString("en-GB"), confidence: 0.99 },
    ],
    matches: [
      { statementClaim: "Document uploaded", documentEvidence: "Document received and processed", status: "match" },
    ],
    flags: [],
    summary: `${docName} has been processed successfully.`,
  }
}

// ============================================================================
// MOCK AUDIT REPORT GENERATOR
// ============================================================================

export function generateMockAuditReport(
  applicantName: string,
  fundingSources: FundingSource[]
): AuditReport {
  return generateAuditReport(applicantName, fundingSources)
}
