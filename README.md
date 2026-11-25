# Isoma UG (`isomaug.com`) - Platform, Open Academy & School ERP Architecture

## 1. System Topology & 3-Tier Multi-Tenant Hierarchy

Isoma UG operates as a **3-tier multi-tenant platform** on a shared backend infrastructure:

1. **Tier 1 - Root Super Account & Control Plane (`isomaug.com`)**:
   - The central platform hub where all client/institution accounts are created, provisioned, and billed.
   - **Even `learn.isomaug.com` (Isoma's Public Open Academy) is a Client/Tenant of `isomaug.com`**, alongside every external school or institution.
   - Handles organisation account creation, subdomain/custom-domain allocation, subscription plans, and Super-Admin oversight.

2. **Tier 2 - Client / Tenant Workspaces (`learn.isomaug.com`, `*.isomaug.com`, or Custom Domains)**:
   - **Open Academy Tenant (`learn.isomaug.com`)**: Isoma's flagship public learning client - open course catalog, self-paced learning, quizzes, past papers, coding labs, and verified certificates.
   - **Institutional School Tenants (`stmarys.isomaug.com`, `portal.stmarys.ac.ug`, `lms.greenhill.edu`, `learn.kingscollege.com`)**: Private, isolated school ecosystems.
   - **Tenant Onboarding** runs directly on the tenant's own domain (branding, country & curriculum selection, academic calendar, custom domain DNS verification, and initial staff/student setup).

3. **Tier 3 - Dedicated Role-Based Portals Inside Each Tenant**:
   - Every authenticated user inside a tenant is routed to their role-specific portal: **Principal/Admin**, **Teacher/Instructor**, **Student/Learner**, **Parent/Guardian**, **Bursar/Accountant**, **Nurse/Sickbay**, **Security Guard/Gate**, and **Librarian**.

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │          TIER 1: ROOT SUPER ACCOUNT (isomaug.com)           │
                               │   Account Creation · Client Provisioning · Global Billing   │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                               ┌──────────────────────────────▼──────────────────────────────┐
                               │         Edge Router & Custom Domain TLS Manager             │
                               │       (Cloudflare for SaaS / Caddy On-Demand TLS)           │
                               │  isomaug.com | learn.isomaug.com | *.isomaug.com | custom   │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                               ┌──────────────────────────────▼──────────────────────────────┐
                               │                Unified Backend API Gateway                  │
                               │                (Django REST + Neon Postgres)                │
                               │            Tenant Resolution Middleware (Host Header)       │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     │                                                                                 │
                     ▼                                                                                 ▼
       ┌───────────────────────────┐                                                     ┌───────────────────────────┐
       │   CLIENT #1: OPEN ACADEMY │                                                     │  CLIENT #N: SCHOOL TENANT │
       │    (learn.isomaug.com)    │                                                     │ (Subdomain or Custom Dom) │
       │  - Public Course Catalog  │                                                     │  - Tenant Onboarding      │
       │  - Direct Student Checkout│                                                     │  - Country & Curriculum   │
       │  - Self-Paced Learning    │                                                     │  - 8 Role Portals:        │
       │  - Verified Certificates  │                                                     │    Admin·Teacher·Student  │
       │  - Cohorts & Past Papers  │                                                     │    Parent·Bursar·Nurse    │
       └───────────────────────────┘                                                     │    Security·Librarian     │
                                                                                         └───────────────────────────┘
```

---

## 2. Dynamic Curriculum Definition Engine & Strict Scoping

Isoma UG provides an extensible, user-definable **Curriculum Definition Engine**. Schools select their specific country and curriculum type during onboarding.

### Strict Curriculum Scoping & Module Isolation

To ensure teachers and administrators are never confused by irrelevant subject schemes or foreign curriculum rubrics:

1. **Strict Context Filtering**:
   - When an institution is set to a specific country (e.g., *Uganda*) and curriculum (e.g., *UNEB Lower Secondary*), all subject creation menus, class stream selectors, grading presets, and scheme of work templates are **strictly filtered** to that curriculum.
   - A Cambridge International school will only see Cambridge stages, IGCSE/A-Level syllabi, and Cambridge component assessments.
   - An ACE (Accelerated Christian Education) school will only see PACE progress trackers, goal cards, and diagnostic score keys.
   - A national curriculum school (e.g., Kenya CBC or Nigeria WAEC) will only see national learning areas and examination standards.

2. **The Universal Cross-Curriculum Resource & Template Exchange**:
   - While academic subjects and exam schemes are strictly isolated, institutions share a universal pool of non-curriculum-bound administrative and pedagogical tools:
     - **Shared Report Card Layout & Theme Designer**: Universal drag-and-drop report card templates (Classic, Modern Grid, Nursery Visual Milestone, Semester Transcript).
     - **Shared Certificate & Award Builder**: Graduation diplomas, termly excellence certificates, sports trophies, and character awards with customizable school borders and watermarks.
     - **Shared STEM & E-Library Assets**: Interactive science simulations, 3D math geometry tools, periodic tables, general programming exercises, and open-source public domain digital textbooks.
     - **Shared Verification Engine**: Tamper-proof cryptographic QR code verification infrastructure (`learn.isomaug.com/verify/...`) functions universally across all institutions.

---

### Extensible Curriculum Types & Supported Frameworks

1. **National Curriculums**:
   - **Uganda**: UNEB/NCDC (Old syllabus and New Lower Secondary Competency-Based Curriculum with Activities of Integration and 20% Formative + 80% Summative splits).
   - **Kenya**: Competency Based Curriculum (CBC / 2-6-3-3-3 structure) and 8-4-4.
   - **Nigeria**: NERDC Basic Education Curriculum / WAEC / NECO.
   - **Rwanda / Tanzania / Ghana / South Africa**: National examination council syllabus standards.

2. **Cambridge International Frameworks**:
   - **Cambridge Early Years / Primary** (Stages 1 to 6 with Checkpoint).
   - **Cambridge Lower Secondary** (Stages 7 to 9 with Checkpoint).
   - **Cambridge Upper Secondary** (IGCSE / O-Level).
   - **Cambridge Advanced** (International AS & A Level / Cambridge AICE Diploma).

3. **Accelerated Christian Education (ACE)**:
   - Individualized self-instructional PACE (Packet of Accelerated Christian Education) architecture.
   - Daily goal cards, PACE score keys, diagnostic testing, checkups, self-tests, and final PACE tests.
   - Mastery-based grading thresholds (e.g., minimum 80% or 90% required to advance to the next PACE).
   - Character building traits, Bible memory verses, and scripture integration metrics.

4. **International Baccalaureate (IB)**:
   - **Primary Years Programme (PYP)**: Transdisciplinary themes, learner profile attributes, and inquiry units.
   - **Middle Years Programme (MYP)**: Subject group criterion-related assessments (Criteria A, B, C, D on 1-8 scale).
   - **Diploma Programme (DP)**: Internal assessments, TOK, EE, CAS tracking, and 1-7 grade scale.

5. **Montessori & Early Childhood Frameworks**:
   - Practical life, sensorial, language, mathematics, and cultural subjects.
   - Multi-age developmental plane tracking without numerical letter testing.

6. **Custom Institutional Curriculum**:
   - Allows any school to define custom subject lists, assessment components (e.g., Project Work, Mid-Term, Practical, Oral, Final Exam), custom grading bands, and custom report card layouts.

---

### Institutional Tiers Breakdown

#### 1. Nursery & Early Childhood Development (ECD / Pre-Primary / Kindergarten) Tier
- **Class Levels**: Baby Class, Middle Class, Top Class / Reception, Pre-K, KG1, KG2, Nursery 1, 2, 3, Daycare.
- **Academic Unit Terminology**: Termed **Learning Areas / Developmental Domains** rather than formal subjects:
  - Language, Literacy & Phonics.
  - Mathematical Concepts, Numbers & Shapes.
  - Environmental Studies & World Around Us.
  - Psychomotor, Physical Play & Fine/Gross Motor Skills.
  - Creative Arts, Drawing, Craft & Music.
  - Social-Emotional, Moral & Spiritual Development.
  - Health, Hygiene, Self-Care & Nutrition.
- **Formative Observation & Milestone Rubrics**:
  - Milestone mastery levels (e.g., Emerging, Developing, Consolidating, Secure / Needs Support, Good, Excellent).
  - Daily nursery logs: Attendance, nap times, feeding/appetite logs, potty routines, and mood tracking.
- **Nursery Visual Report Cards**:
  - Visual developmental progress charts, skill milestone stickers, teacher qualitative remarks, health status, and next term resumption notices.

#### 2. Primary Education Tier
- **Class Levels**: Primary 1 to Primary 7 (or Grade 1 to Grade 6).
- **Curriculum Choices**: National (e.g., Uganda UNEB/PLE, Kenya CBC, Nigeria Primary) or International (Cambridge Primary, ACE PACEs, IB PYP, British National).
- **Academic Unit Terminology**: Strictly termed **Subjects** (e.g., Mathematics, Integrated Science, English Language, Social Studies & RE, Literacy 1 & 2, French, ICT / Computer Studies).
- **Assessment Streams**: Continuous homework, weekly topical tests, Beginning of Term (BOT), Mid-Term (MOT), End of Term (EOT) exams.

#### 3. Secondary Education Tier
- **Class Levels**: Senior 1 to Senior 6 (or Year 7 to Year 13 / Grades 7 to 12).
- **Curriculum Choices**: National O/A-Level (UNEB UCE/UACE, WAEC, KCSE) or International (Cambridge IGCSE / AICE / AS & A Level, ACE High School, IB MYP & DP).
- **Academic Unit Terminology**: Strictly termed **Subjects** (e.g., Physics, Chemistry, Biology, Mathematics, Additional Mathematics, History, Geography, Economics, Literature in English, Entrepreneurship, Computer Studies).
- **Assessment Streams**: Continuous Assessment Tests, Activities of Integration (AOI), Lab Practicals, End of Term Examinations.

#### 4. Higher Education, Vocational & TVET Tier
- **Class Levels**: Year 1 to Year 5, Semesters, Trimesters, Modular Certificate/Diploma tracks.
- **Curriculum Choices**: National Higher Education Council Accredited Degree/Diploma frameworks, TVET / City & Guilds vocational frameworks, Professional Certifications.
- **Academic Unit Terminology**: Termed **Course Units / Modules** with allocated Credit Units (CUs), Lecture Hours, Practical Lab Hours, and Coursework / Exam weights.

---

### Geographic & Regional Scoping
- **Country Selection**: Uganda, Kenya, Tanzania, Rwanda, Nigeria, Ghana, South Africa, United Kingdom, United States, Global International, etc.
- **Timezone & Academic Calendar**: Automatic term/semester calendar formatting based on the host nation's academic cycle.
- **National Grading Scales & Currency**: Localized currency (e.g., UGX, KES, NGN, USD, GBP, EUR) and grading frameworks.

---

## 3. Custom Domain & White-Label Provisioning Engine

When a school desires to run the system entirely on their own custom domain (e.g., `portal.stmarys.ac.ug`, `lms.greenhill.edu`, `learn.kingscollege.com`, or `academy.myschool.org`), the platform provides an automated self-service custom domain engine with dynamic SSL/TLS certificate generation.

### Custom Domain Onboarding Workflow

```
[ School Admin Portal (Settings -> Custom Domain) ]
  ├── School enters custom domain (e.g. portal.greenhill.ac.ug)
  └── Backend generates DNS configuration instructions & TXT challenge
             │
             ▼
[ School Configures Their Domain Registrar / DNS Provider ]
  ├── CNAME Record: portal.greenhill.ac.ug  ->  cname.isomaug.com
  └── TXT Record:   _isoma-verify.portal.greenhill.ac.ug  ->  isoma-token-8f92a1c7
             │
             ▼
[ Automated DNS Verification & SSL Engine ]
  ├── Background worker verifies CNAME and TXT resolution via DNS queries
  ├── Triggers Cloudflare for SaaS or Caddy On-Demand TLS
  └── Free, auto-renewing Let's Encrypt / Cloudflare SSL certificate issued instantly
             │
             ▼
[ Dynamic Tenant Resolution Middleware ]
  ├── Incoming request arrives with Host: portal.greenhill.ac.ug
  ├── Backend resolves Tenant by custom_domain (cached in Redis)
  └── Frontend serves 100% white-labeled portal (School logo, colors, name, favicon)
```

---

## 4. End-to-End Staff Recruitment, Biometric Integration, Leave & Payroll Lifecycle

Isoma UG features an automated, step-by-step Human Resource pipeline that connects staff recruitment directly to contract creation, biometric attendance logging, leave reconciliation, and monthly salary disbursement.

```
[ 1. Job Requisition & Application ]
  ├── Department Head / Principal posts opening (e.g. Physics Teacher, School Nurse)
  └── Public Applicant submits CV, Transcripts, Teacher License, and Bio-data online
             │
             ▼
[ 2. Screening, Interview & Offer ]
  ├── HR shortlists candidate & scores interview panel evaluations
  └── Offer Letter & Digital Contract generated (Salary, Allowances, Leave Days, NSSF/PAYE)
             │
             ▼
[ 3. Hire Confirmation & Biometric Enrollment ]
  ├── Candidate signs contract -> Status changes to HIRED
  ├── System auto-provisions Staff ID (e.g. STAFF-SMK-2026-042) & System Role
  ├── Smart QR Staff Badge generated
  └── Physical Biometric Hardware Enrollment: Fingerprint/Face ID linked to Staff ID
             │
             ▼
[ 4. Daily Attendance & Leave Correlator ]
  ├── Staff punches Biometric Terminal daily on arrival & departure
  ├── Approved Leave requests automatically mark attendance as APPROVED_LEAVE
  └── Unapproved missed days automatically flag as UNAUTHORIZED_ABSENCE
             │
             ▼
[ 5. Automated Monthly Payroll Run ]
  ├── Reconciliation: Base Gross + Allowances - Absence Deductions
  ├── Statutory Deductions Calculation: PAYE Tax + Social Security (NSSF) + LST
  ├── Voluntary Deductions: Staff SACCO, Welfare, and Salary Advances
  └── Net Salary finalized -> Principal / Bursar approves payroll batch
             │
             ▼
[ 6. Automated Salary Disbursement & Payslips ]
  ├── Automated Bank Batch File (Stanbic, Centenary, Equity, ABSA)
  ├── Direct Mobile Money Bulk Payout API (MTN MoMo / Airtel Money)
  └── Encrypted PDF Payslips issued via Email & Staff Portal download
```

---

## 5. The 18 Comprehensive Operational Departments & Strategic Modules

### Module 1: Admissions & Student Registry
- **Online Application Portal**: Custom application forms capturing student bio-data, previous academic history (PLE/UCE/Pass Slips), medical info, and parent contacts.
- **Application Review Workflow**: Admissions office verifies credentials, assigns interview/entrance test slots, and logs evaluation notes.
- **Automated Registration Number Generator**: Formats unique student numbers based on institution rules (e.g., `SMK/2026/NUR/0042`, `SMK/2026/S1/0142`, or `UCU/2026/BCS/0091`).
- **Admission Letter Generator**: Instant tamper-proof PDF admission letter complete with institution seal, dynamic verification QR code, and fee schedule.
- **Parent & Next-of-Kin Management**: Links students to parent accounts with automated SMS/Email onboarding.

### Module 2: Academics, Subjects & Report Cards Engine
- **Curriculum & Scheme of Work**: Lesson plans, weekly syllabus coverage trackers, and downloadable teaching aids.
- **Digital LMS & Classrooms**: Notes, reading assignments, video lectures, and integrated **EkebuLive** live interactive classrooms with automated attendance logs.
- **Automated Report Card Issuing Pipeline**:
  - Continuous Assessment Engine: Configurable weighting (e.g., Nursery Milestone Rubrics, Primary 30% CA + 70% Exam, Secondary AOI + EOT, ACE PACE Test mastery).
  - Automated Grade & Aggregate Calculation: Supports letter grades (A*, A, B, C, D, E, U), numerical scales (D1, D2, C3, P7, F9), GPA (4.0/5.0 scale), or Developmental Descriptors (Emerging, Secure).
  - Ranking & Class Position: Automatic calculation of stream and class positions.
  - Automated Competency Descriptors: Maps student numerical scores to qualitative curriculum descriptors.
  - Multi-Level Remarks: Class Teacher, Housemaster, and Headteacher automated or custom remarks.
  - High-Fidelity PDF Generator: Includes institutional watermark, official digital stamp, next term resumption date, fee breakdown, and cryptographic verification QR code.
  - Bulk Distribution: 1-click batch generation of 1,000+ report cards and automated delivery via Parent Portal, SMS link, and WhatsApp.

### Module 3: Attendance, Biometrics & Dynamic QR Code Engine
- **Biometric Hardware Integration**: Direct webhook/API receiver for physical biometric terminals (ZKTeco, Suprema, Fingerprint, and Facial Recognition hardware) logging check-in/out timestamps.
- **Dynamic QR Code Smart Badges**: Digital and printable smart ID cards containing encrypted QR tokens scanned by the **Isoma Mobile Gate App**.
- **Automated Parent SMS Notifications**: Instant arrival, departure, and truancy alerts.

### Module 4: Automated WhatsApp Bot & Multi-Channel Parent Communication Hub
- **Interactive WhatsApp Bot**: Parents send simple WhatsApp messages (e.g. `FEES`, `REPORT CARD`, `TIMETABLE`) to the school's verified WhatsApp number and receive instant PDF statements, receipts, and report cards.
- **Multi-Channel Broadcast Engine**: 1-click mass communication dispatch across WhatsApp API, Bulk SMS, Email, and In-App Push Notifications.
- **Secure Parent-Teacher Chat**: In-app messaging connecting parents with assigned subject teachers without exposing personal private phone numbers.

### Module 5: Boarding House, Dormitory & Cashless Canteen Smart Wallet
- **Dormitory & Bed Allocation**: House/Dorm management (e.g. *Mandela House, Lumumba Dorm*), bed number assignments, room capacity tracking.
- **Evening Roll-Call Scan**: Housemasters conduct evening dorm roll-calls using the mobile QR scanner app.
- **Cashless Pocket Money Wallet (Smart Badge Canteen POS)**:
  - Parents deposit pocket money into the student's digital wallet via Mobile Money (MTN MoMo / Airtel Money).
  - Students purchase snacks, stationery, and uniforms at the canteen by tapping their Smart QR badge or fingerprint.
  - Zero cash on campus prevents theft and loss; parents receive real-time transaction notifications.

### Module 6: AI Teacher Co-Pilot & Scheme-of-Work Generator (Isoma AI)
- **Automated Scheme of Work & Lesson Plan Generator**: Teacher inputs subject and topic -> AI generates a compliant 4-week lesson plan complete with learning objectives, activities, and references.
- **Question Bank & Exam Generator**: Generates 20+ curriculum-aligned questions (Multiple-Choice, Structured, Essay) with marking schemes.
- **Intelligent Report Card Comment Engine**: Analyzes student test trends, homework completion, and attendance to draft constructive, personalized teacher comments.

### Module 7: Conflict-Free AI School Timetable Scheduler
- **Constraint-Based Solver**: Ingests teacher availability, class streams, science and ICT laboratory room limits, sports grounds, and double-period rules.
- **1-Click Generation**: Produces a 100% clash-free master institutional timetable and individual teacher/student timetables in seconds.

### Module 8: Co-Curricular, Sports & Disciplinary Conduct System
- **Clubs & Societies**: Registry for Debate Club, Red Cross, Scouting, Robotics, Drama, MDD, and Choir.
- **Inter-House Sports Day Scoreboard**: Live scorekeeping and leaderboard for annual sports competitions.
- **Merit & Demerit Behavior Tracking**: Teachers award merits (Leadership, Integrity) and demerits (Tardiness, Indiscipline) that automatically feed into report card conduct ratings.

### Module 9: Alumni Network, Digital Transcripts & Endowment Donations
- **Alumni Directory**: Graduated cohorts directory with career tracking and industry networking.
- **Digital Transcript & Recommendation Requests**: Automated workflow for graduates to request verified digital transcripts with instant university verification links.
- **School Endowment & Project Fundraising**: In-app fundraising campaigns for school building projects, scholarships, and sports equipment with MoMo/Card payment checkout.

### Module 10: Offline LAN School Box & Edge Sync Appliance
- **Local Micro-Server Deployment**: A local caching appliance in the school's computer lab runs the platform over local Wi-Fi.
- **Zero-Data Learning**: Students watch video lessons, access past paper PDFs, and complete quizzes with **zero internet data consumption**.
- **Bidirectional Cloud Sync**: Automatically pushes student grades, marks, and attendance to the cloud once an internet connection is established.

### Module 11: Library Management
- **Cataloging System**: ISBN, Dewey Decimal Classification, Barcode and QR code labeling for physical books.
- **Circulation Desk**: High-speed checkout and check-in via barcode scanners.
- **Overdue Tracking & Penalty Automation**: Automated calculation of overdue fines charged directly to the student's finance ledger.
- **Digital E-Library**: Centralized repository for PDF past papers, marking schemes, digital textbooks, and research journals.

### Module 12: Sickbay & Health Center
- **Student Medical Profiles**: Blood group, known allergies, chronic illnesses, immunization history, and emergency contact details.
- **Clinic Visit Log**: Nurse triage notes, recorded vital signs (temperature, BP), diagnosis, and administered treatments.
- **Dispensary & Pharmaceutical Inventory**: Batch tracking, expiry alerts, and stock reduction upon prescription fulfillment.
- **Emergency Escalation**: 1-click automated alert to parents and administration when emergency hospital transfer is required.

### Module 13: Transport & Fleet Management
- **Route & Zone Management**: Bus route mappings, designated stops, fee zones, and driver assignments.
- **Passenger Manifest & Boarding Scan**: Dynamic passenger lists with driver QR code check-in upon boarding.
- **Fleet Maintenance**: Scheduled service logs, fuel consumption records, insurance renewal alerts, and roadworthiness compliance.

### Module 14: Security & Gate Pass Management
- **Visitor Management**: Digital visitor registration with photo capture, host notification, and printed visitor badges.
- **Student Exit / Exeat Pass**: Multi-stage authorization workflow (Nurse/Teacher -> Housemaster -> Security Gate scan) ensuring no student leaves without verified authorization.
- **Incident & Disciplinary Log**: Digital security incident register with parent notifications.

### Module 15: Procurement & Inventory
- **Requisition Workflow**: Multi-tier approval chain (Department Head -> Bursar -> Principal).
- **Purchase Orders & Vendor Ledger**: Supplier management, price quotation comparisons, and delivery confirmations.
- **Stock & Asset Management**: Lab chemicals, sports equipment, stationery, uniform stock, and asset depreciation tracking.

### Module 16: Finance, Fees & Billing
- **Configurable Fee Structures**: Breakdown by Tuition, Boarding, Development, Laboratory, Nursery Activity fee, Uniform, and Transport zones.
- **Multi-Gateway Payment Integration**: Direct Mobile Money (MTN MoMo, Airtel Money), Bank integrations, and Card/Stripe.
- **Real-Time Financial Reconciliation**: Automated ledger update and instant SMS payment receipt generation.
- **Clearance Slips**: Automated generation of exam and graduation clearance slips based on real-time fee balance status.

### Module 17: Staff Recruitment, Contracts & HR Management
- **Job Requisitions & Public Careers Portal**: Online vacancy postings, applicant CV/license screening, and interview panel scoring.
- **Digital Employment Contracts**: Gross salary, allowances, tax/pension configuration, and leave entitlements with e-signatures.
- **Biometric Enrollment**: Linking physical biometric IDs with staff profile accounts.

### Module 18: Automated Payroll & Leave Days Reconciliation Engine
- **Attendance & Leave Reconciliation**: Automatic salary deduction for unapproved absences correlated from daily biometric logs.
- **Gross & Net Calculation**: Automated calculation of PAYE Tax, NSSF/Pension, LST, SACCO deductions, and allowances.
- **Multi-Gateway Disbursement**: Bank batch electronic file export + direct Mobile Money bulk payout API for support/casual staff.
- **Encrypted PDF Payslips**: Dispatched via email and downloadable on Staff Self-Service Portal.

---

## 6. Unified Database Schema Blueprint

```
Institution (Tenant)
  ├── Name, Subdomain, Country, Timezone, Currency
  ├── InstitutionTier (NURSERY, PRIMARY, SECONDARY, HIGHER_ED, VOCATIONAL, COMPREHENSIVE_K12)
  │
  ├── CustomDomainSettings
  │     ├── CustomDomain (e.g. portal.greenhill.ac.ug)
  │     ├── VerificationToken (TXT challenge hash)
  │     ├── Status (PENDING_DNS, ACTIVE, FAILED, EXPIRED)
  │     ├── CNameTarget (cname.isomaug.com)
  │     ├── SSLStatus (PENDING, ISSUED, ACTIVE)
  │     └── LastVerifiedAt
  │
  ├── CurriculumDefinition
  │     ├── Code (e.g. UNEB_PRIMARY, CAMBRIDGE_IGCSE, ACE_PACE, IB_PYP, CUSTOM)
  │     ├── Name, Description, CountryOrigin
  │     ├── AssessmentComponents (e.g. [{name: "AOI", weight: 20}, {name: "EOT", weight: 80}])
  │     ├── GradingScale (e.g. [{min: 80, max: 100, grade: "D1", gpa: 5.0, remark: "Distinction"}])
  │     └── ReportCardLayoutTemplate
  │
  ├── SharedUniversalResource
  │     ├── Title, ResourceType (REPORT_THEME, CERTIFICATE_DESIGN, STEM_SIMULATION, OER_BOOK)
  │     ├── AssetURL, LayoutConfigJSON, IsUniversal (True)
  │     └── SupportedTiers (NURSERY, PRIMARY, SECONDARY, HIGHER_ED)
  │
  ├── Dormitory & BedAllocation
  │     ├── HouseName (e.g. Mandela House), Gender (MALE, FEMALE), Capacity
  │     └── Bed (BedNumber, StudentProfile, Status: OCCUPIED/VACANT)
  │
  ├── StudentCanteenWallet
  │     ├── StudentProfile (OneToOne), Balance, DailySpendingLimit
  │     └── WalletTransaction (Amount, Type: TOPUP/PURCHASE, ItemDetails, Timestamp)
  │
  ├── TimetableMaster
  │     ├── AcademicYear, Term, ConstraintsJSON
  │     └── TimetableSlot (ClassStream, Subject, Teacher, Room, DayOfWeek, PeriodNumber)
  │
  ├── CoCurricularClub & MeritDemerit
  │     ├── ClubName, PatronTeacher, StudentMembers
  │     └── ConductRecord (StudentProfile, Type: MERIT/DEMERIT, Category, Points, TeacherNotes)
  │
  ├── AlumniProfile & TranscriptRequest
  │     ├── StudentProfile, GraduationYear, CurrentEmployer, Industry, ContactDetails
  │     └── TranscriptRequest (TargetInstitution, Status: PENDING/ISSUED/VERIFIED, VerificationToken)
  │
  ├── JobPosting & StaffApplication
  │     ├── Title, Department, RequirementsJSON, SalaryRange
  │     ├── ApplicantName, Email, Phone, CV_URL, Transcripts_URL, LicenseNumber
  │     ├── Status (SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, HIRED, REJECTED)
  │     └── InterviewScoresJSON, VettingNotes
  │
  ├── StaffProfile
  │     ├── StaffNumber (e.g. STAFF-SMK-2026-042), User (OneToOne)
  │     ├── Department, Designation, EmploymentStatus (ACTIVE, ON_LEAVE, TERMINATED)
  │     ├── BiometricID, DynamicQRToken
  │     ├── BankName, BankAccountNumber, BankBranch, MoMoNumber
  │     └── EmploymentContract (OneToOne / History)
  │           ├── ContractType (FULL_TIME, FIXED_TERM, ADJUNCT, PROBATIONARY)
  │           ├── StartDate, EndDate, BaseSalary, AllowancesJSON
  │           ├── StatutoryConfig (PAYE_Enabled, NSSF_Number, LST_Rate)
  │           ├── LeaveEntitlementDays (Annual, Sick, Maternity, Paternity)
  │           └── SignedContractURL
  │
  ├── StaffLeaveRequest
  │     ├── StaffProfile, LeaveType (ANNUAL, SICK, MATERNITY, PATERNITY, COMPASSIONATE, STUDY)
  │     ├── StartDate, EndDate, DaysCount, Reason, MedicalCertURL, ReliefStaff
  │     ├── Status (PENDING, APPROVED, REJECTED, CANCELLED)
  │     └── ApprovedBy, ApprovalTimestamp
  │
  ├── PayrollPeriod & Payslip
  │     ├── Month, Year, Status (DRAFT, CALCULATED, APPROVED, DISBURSED)
  │     └── Payslip
  │           ├── StaffProfile, BaseGross, TotalAllowances, AbsenceDeductions, GrossPay
  │           ├── PAYETax, NSSF_Employee, NSSF_Employer, LST, SACCO_Deduction, LoanDeduction
  │           ├── NetSalary, DisbursementStatus (PENDING, PAID_BANK, PAID_MOMO), DisbursedAt
  │           └── PDFPayslipBlob, QRVerificationSignature
  │
  ├── AcademicYear (e.g., 2026/2027)
  │     └── Term / Semester (Term 1, Term 2, Term 3 / Sem 1, Sem 2)
  ├── Department (Sciences, Humanities, EarlyYears, Administration, Sickbay, Security, Library)
  │
  ├── User (SuperAdmin, Principal, Teacher, Student, Parent, Nurse, Guard, Bursar, Librarian)
  │
  ├── StudentProfile
  │     ├── RegistrationNumber, ClassStream (e.g., Nursery Top Blue, P.6 Blue, S.4 Science), Cohort
  │     ├── Parents (Many-to-Many linked profiles)
  │     ├── BiometricID, DynamicQRToken
  │     ├── MedicalProfile (BloodGroup, Allergies, ChronicConditions)
  │     └── FeeAccount (Ledger, Invoices, Payments, Balance)
  │
  ├── Subject / CourseUnit / LearningArea
  │     ├── IsPublicCourse (Boolean: True if standalone open course, False if school subject)
  │     ├── CurriculumScope (Foreign Key to CurriculumDefinition)
  │     ├── Code, Name, Syllabus, SchemeOfWork
  │     ├── AssignedTeachers
  │     └── Assessment (MilestoneRubric, BOT, MOT, EOT, AOI, PACE_Test, Coursework)
  │           └── StudentGrade (RawScore, ComputedGrade, CompetencyRemark, MilestoneStatus)
  │
  ├── ReportCardSnapshot (Term, Student, Aggregates, Position, StampURL, QRSignature, PDFBlob)
  ├── AttendanceLog (User, Timestamp, Type: CHECK_IN/CHECK_OUT, Method: BIOMETRIC/QR/MANUAL)
  ├── LibraryItem & BorrowRecord (Barcode, ISBN, DueDate, FineAmount)
  ├── InventoryItem & RequisitionRequest (ItemCode, StockQty, ApprovalStatus)
  ├── SickbayVisit & Prescription (Symptoms, Diagnosis, DrugsDispensed)
  └── GatePass (Student, ExeatReason, Approver, DepartureTime, ReturnTime, Status)
```

---

## 7. Frontend Structure (`lms-isomaug/`)

The frontend application in `lms-isomaug/` is organized into modular directories:

```
lms-isomaug/
├── public/
├── src/
│   ├── assets/                 # Brand assets, seal templates, certificate frames
│   ├── components/
│   │   ├── layout/             # Sidebar, TopNav, TenantSwitcher, RoleGuard
│   │   ├── scanner/            # Mobile QR Scanner Component (HTML5-QRCode)
│   │   ├── reports/            # Report Card Template Renderer & PDF Generator
│   │   ├── timetable/          # Interactive Timetable Grid & AI Solver Viewer
│   │   ├── canteen/            # Cashless POS Terminal & QR Reader Component
│   │   ├── payroll/            # Payroll Register Table, Payslip Generator
│   │   ├── templates/          # Universal Shared Report Card & Certificate Themes
│   │   └── ui/                 # Reusable buttons, modals, data tables, metrics
│   ├── contexts/               # TenantContext, AuthContext, SocketContext
│   ├── pages/
│   │   ├── public/             # Public Open Academy on learn.isomaug.com (Home, Course Catalog, Careers)
│   │   ├── portal/             # Role-based Dashboard Router
│   │   ├── academics/          # Nursery Learning Areas, Subjects, LMS Classroom, EkebuLive
│   │   ├── ai_assistant/       # AI Lesson Plan Generator, Quiz Maker, Comment Engine
│   │   ├── timetable/          # AI Timetable Solver & Master Grid
│   │   ├── admissions/         # Online Application, Screening, Registration
│   │   ├── attendance/         # Real-time scan log, Biometrics monitor
│   │   ├── communications/     # WhatsApp Bot Manager, Multi-Channel Broadcasts, Parent Chat
│   │   ├── boarding/           # Dormitories, Bed Allocation, Evening Roll Call
│   │   ├── canteen/            # Cashless Wallet Management & Canteen POS
│   │   ├── cocurricular/       # Clubs, Sports Day Leaderboard, Merits/Demerits
│   │   ├── alumni/             # Alumni Directory, Transcript Requests, Donations
│   │   ├── offline_sync/       # LAN Edge Caching Hub & Sync Status
│   │   ├── hr/                 # Job Requisitions, Applications, Contracts, Staff Profiles
│   │   ├── leave/              # Leave Applications, Approvals, Relief Assignment
│   │   ├── payroll/            # Monthly Payroll Runs, Bank Batch Export, MoMo Payout, Payslips
│   │   ├── finance/            # Invoices, MoMo Pay, Receipts, Clearance
│   │   ├── health/             # Sickbay visits, Patient charts, Dispensary
│   │   ├── library/            # Book inventory, Checkout desk, E-Library
│   │   ├── logistics/          # Transport routes, Fleet logs, Gate security
│   │   ├── procurement/        # Requisitions, Stock ledger, Vendor POs
│   │   ├── reports/            # Report card builder & Bulk PDF exporter
│   │   └── settings/           # School branding, Custom Domain, Curriculum Engine, Biometrics Config
│   └── services/               # API clients, WebSocket listeners, PDF builders
```

---

## 8. Role-Based Access Control (RBAC) Matrix

| Module / Operation | Super Admin | Principal / DOS | Teacher | Student | Parent | Bursar / Accountant | Nurse | Security Guard | Librarian |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **School Settings & Config** | Full | Full | None | None | None | None | None | None | None |
| **Custom Domain Config** | Full | Full | None | None | None | None | None | None | None |
| **Curriculum Definition** | Full | Full | View | None | None | None | None | None | None |
| **Admissions & Enrollment** | Full | Full | View | None | View (Own) | Fee Check | None | None | None |
| **AI Lesson Co-Pilot** | Full | Full | Full | None | None | None | None | None | None |
| **Timetable Auto-Scheduler** | Full | Full | View (Own) | View (Own) | View (Child) | None | None | None | None |
| **WhatsApp & Broadcasts** | Full | Full | Broadcast Class| None | Recv / Chat | Broadcast Fees| None | None | None |
| **Boarding & Dormitories** | Full | Full | View / RollCall| View (Own) | View Room | None | View Sick | Scan Curfew | None |
| **Cashless Canteen Wallet** | Full | Full | None | Scan to Pay | Top-Up / Logs| Manage POS | None | None | None |
| **Co-Curricular & Conduct** | Full | Full | Award Merits | View (Own) | View (Child) | None | None | Report Incident| None |
| **Alumni & Transcripts** | Full | Full | None | Request (Grad) | None | Verify Fee | None | None | None |
| **Offline LAN School Box** | Full | Full | Sync / Use | Use Local | None | Sync | None | None | None |
| **Staff Recruitment & Hires**| Full | Full | None | None | None | View | None | None | None |
| **Contracts & Staff Files** | Full | Full | View (Own) | None | None | View | None | None | None |
| **Leave Management** | Full | Approve | Request / View | None | None | View Impact | Request / View | Request / View | Request / View |
| **Biometric Attendance Sync**| Full | Full | Punch / View | None | None | View Attendance| Punch / View | Scan & Punch | Punch / View |
| **Payroll Calculation & Pay**| Full | Approve Batch | View (Own Payslip)| None | None | Process & Pay | View (Own Payslip)| View (Own Payslip)| View (Own Payslip)|
| **Subject Schemes & LMS** | Full | Full | Manage Assigned | View Enrolled | View (Child) | None | None | None | None |
| **Marks Entry & Grading** | Full | Full | Manage Assigned | View (Own) | View (Child) | None | None | None | None |
| **Report Cards Issuance** | Full | Approve & Issue | Draft / Remarks | View (Own) | View / Download | None | None | None | None |
| **Universal Template Hub** | Full | Full | Use Templates | None | None | None | None | None | None |
| **Live Classroom (EkebuLive)**| Full | Full | Host | Attend | None | None | None | None | None |
| **Fees, Invoicing & Receipts**| Full | View | None | View (Own) | Pay / View | Full | None | None | None |
| **Sickbay & Medical Logs** | Full | View Urgent | None | View (Own) | View Alerts | None | Full | None | None |
| **Transport & Manifests** | Full | Full | None | View Route | View Route | Fee Check | None | Scan Boarding | None |
| **Security & Gate Passes** | Full | Approve Exeat | Request Exeat | View Pass | View Alerts | None | Auth Sick | Verify Gate Pass| None |
| **Library Circulation** | Full | View | View | Borrow / Search| None | Overdue Fines | None | None | Full |
| **Procurement Requisitions** | Full | Approve | Requisition | None | None | Budget Check | Requisition | None | Requisition |
