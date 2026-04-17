# Source of Funds (SOF) Verification Agent - Requirements Document

## Overview

A compliance tool for banks to verify the legitimacy of customer funds through AI-powered document analysis. The system reads customer statements, identifies funding sources, requests supporting documents, and validates claims against documentary evidence.

---

## Business Context

### Why Source of Funds Verification?
Banks must verify where customer money comes from to:
- Comply with Anti-Money Laundering (AML) regulations
- Prevent fraud and financial crimes
- Meet Know Your Customer (KYC) requirements
- Create audit trails for regulatory review

### Current Pain Points
- Manual document review is slow and error-prone
- Analysts spend hours cross-referencing statements with documents
- Inconsistent verification standards across analysts
- Difficult to scale during high-volume periods

---

## System Requirements

### Stage 1: Statement Analysis

**Input:** Customer's written statement explaining their source of funds

**Process:**
1. Parse the statement to identify all funding sources mentioned
2. Extract specific claims (amounts, dates, employers, relationships)
3. Determine which documents are needed to verify each claim

**Output:**
- List of identified funding sources (employment, savings, gift, inheritance, property sale, etc.)
- Specific claims extracted from each source
- Required documents for verification

**Example:**
```
Statement: "I have saved £35,000 over the past 3 years from my job as a Senior 
Accountant at FinanceFirst PLC where I earn £65,000 per year."

Identified Source: Employment Savings
Claims to Verify:
- Employer: FinanceFirst PLC
- Role: Senior Accountant  
- Annual Salary: £65,000
- Savings Amount: £35,000
- Duration: 3 years

Required Documents:
- Recent payslips (3 months)
- Employment contract
- Bank statements (showing salary deposits and savings accumulation)
```

---

### Stage 2: Document Checklist

**Display:**
- Statement excerpt highlighted for each funding source
- List of required documents with status indicators:
  - RED: Missing document
  - YELLOW: Uploaded, pending validation
  - GREEN: Validated successfully
- Explanation of WHY each document is needed
- List of WHAT will be checked in each document

**Functionality:**
- Upload interface for each document type
- Progress tracker showing completion status
- Ability to proceed with partial documents (with warnings)

---

### Stage 3: Specialized Agent Validation

**Four Agent Types:**

#### Payroll Agent
Validates employment-related documents:
- Payslips: employer name, gross/net salary, date, employee name
- Employment contracts: role, salary, start date, employer details
- Cross-references salary amounts with statement claims

#### Banking Agent
Validates financial documents:
- Bank statements: account holder, transaction history, balances
- Savings accounts: deposit patterns, balance growth
- Verifies salary credits match payslip amounts
- Analyzes savings accumulation plausibility

#### Legal Agent
Validates legal documents:
- Gift letters: donor details, relationship, amount, declaration
- Wills/probate: beneficiary, inheritance amount, estate details
- Loan agreements: lender, amount, terms

#### Property Agent
Validates property-related documents:
- Sale agreements: property address, sale price, parties
- Deeds: ownership verification
- Valuations: property value assessment

**Validation Output for Each Document:**
```
Document: Payslip (March 2024)
Status: VALIDATED

Extracted Data:
- Employer: FinanceFirst PLC
- Employee: John Smith
- Gross Monthly: £5,416.67
- Net Monthly: £3,890.45
- Pay Date: 28/03/2024

Statement vs Document Verification:
✓ VERIFIED: "Employer is FinanceFirst PLC" → Document shows "FinanceFirst PLC"
✓ VERIFIED: "Salary £65,000 annual" → Document shows £5,416.67 monthly (£65,000/12)

Plausibility Analysis: PLAUSIBLE
- Monthly salary of £5,416.67 gross is consistent with £65,000 annual
- Calculation: £65,000 ÷ 12 = £5,416.67 ✓
- Tax deductions appear reasonable for this salary band
```

---

### Stage 4: Audit Report

**Executive Summary:**
- Applicant name and case reference
- Total funds declared and verified
- Number of funding sources
- Overall verification status (Approved/Flagged/Incomplete)
- Plausibility score (0-100%)

**Detailed Findings per Source:**
- Statement excerpt that triggered this source
- Each document's validation results
- Specific checks performed with outcomes
- Plausibility calculations with reasoning
- Any flags or concerns raised

**AI Agent Analysis:**
- Comprehensive written narrative for each funding source
- Cross-referencing summary
- Risk assessment
- Recommendations for further action (if needed)

**Export Options:**
- Print-ready format
- PDF export
- Audit trail with timestamps

---

## User Interactions

### SOF Assistant Chat
Right-side panel allowing analysts to:
- Ask questions about the analysis ("Why was this flagged?")
- Request re-validation of specific documents
- Get explanations of plausibility calculations
- Receive guidance on missing documents

### Manual Override
Analysts can:
- Upload additional documents at any stage
- Re-run validation on specific items
- Add notes to the case file
- Override agent decisions with justification

---

## Example Cases (Demo Data)

| Case | Complexity | Sources | Document Status | Scenario |
|------|------------|---------|-----------------|----------|
| 1 | Simple | Employment only | All present | Happy path - all verified |
| 2 | Simple | Savings only | 1 missing | Missing bank statement |
| 3 | Moderate | Employment + Gift | All present | Multiple sources, verified |
| 4 | Moderate | Employment + Inheritance | All present | Plausibility issues (amounts don't match) |
| 5 | Complex | 4 sources | 2 missing | Multiple sources, incomplete docs |
| 6 | Complex | Business + Property + Investments | All present | Mixed results with flags |

---

## Technical Architecture

### Data Flow
```
Customer Statement
       ↓
[Statement Analysis Agent]
       ↓
Funding Sources + Required Documents
       ↓
[Document Upload]
       ↓
[Specialized Validation Agents]
  - Payroll Agent
  - Banking Agent  
  - Legal Agent
  - Property Agent
       ↓
Validation Results + Plausibility Analysis
       ↓
[Report Generation Agent]
       ↓
Audit-Ready Report
```

### Key Data Structures

**FundingSource:**
- Type (employment, gift, property_sale, inheritance, savings, etc.)
- Amount claimed
- Statement excerpt (exact text that identified this source)
- Claims to verify (specific assertions to check)
- Required documents

**RequiredDocument:**
- Document type
- Why needed (explanation)
- What will be checked (list of validations)
- Status (missing/uploaded/validated/flagged)
- Validation result (if processed)

**ValidationResult:**
- Extracted data from document
- Statement matches (claim vs evidence)
- Plausibility analysis with calculations
- Flags/concerns
- Written summary

---

## Success Criteria

1. **Accuracy:** Correctly identify all funding sources from statements
2. **Completeness:** Request all necessary documents for each source type
3. **Transparency:** Clear explanation of what was checked and why
4. **Auditability:** Full trail of verification steps and decisions
5. **Usability:** Intuitive interface for compliance analysts
6. **Efficiency:** Reduce manual review time by 60%+

---

## Future Enhancements

- OCR integration for automatic document data extraction
- Real-time AI model for statement analysis
- Integration with banking systems for automatic document retrieval
- Risk scoring based on historical patterns
- Multi-language support
- Batch processing for high-volume cases
