# Lesson 7: Make It Real — Original Project Design & Build

**Duration:** 3 hours (Term-time Saturday) (split across Week 7 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 7
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, plus learner-selected components from: LEDs, LDR, buzzer, push button, temperature sensor (TMP36), resistors, breadboard, jumper wires
**Software:** Arduino IDE 2.x
**Bloom's:** L5–L6 Evaluating / Creating
**DDD Phase:** CREATE — Learners write a full design brief, build an original Arduino project, test and iterate, and receive structured peer review feedback
**NCDC:** Uganda NCDC Curriculum P5/P6 — Literacy Strand: Design brief writing, drafting and revising technical documentation; Numeracy Strand: Applying measurement, data, or arithmetic sequences to a physical build

**Big Idea:** ILO 3.4 — Design, build, test, iterate, and present an original Arduino project that integrates at least one coding concept, one explicit English literacy connection, and one explicit Mathematics connection, supported by a written design brief.

**Source plan:** `Stage6_Week7_Project_Design_Build.docx`

## Learning Objectives

- Write a complete 7-section design brief: Problem Statement, Target User, Solution Description, How It Works (step-by-step), English/Math Connection, Test Results, Improvements Made
- Build a working Arduino prototype that responds to at least one input and produces at least one output
- Test the prototype systematically and record test results in the design brief (minimum 3 test runs)
- Iterate on the design based on test results — make at least one documented improvement
- Give and receive structured peer review feedback using the 5-question rubric
- Prepare a 5-minute Demo Day presentation: Problem → Solution → Live Demo → Evidence → Reflection

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK The Open Brief
1. Facilitator reads the open project brief aloud: "Build an Arduino project that connects coding, English or Math, and a real-world need."
2. Show 3 example project ideas (do NOT show code — only describe the concept): (1) A light-sensing alarm that beeps when the room gets too dark for reading. (2) A counting system that tracks how many times a button is pressed and displays the count. (3) A temperature logger that prints HIGH/MEDIUM/LOW based on the sensor value.
3. Emphasise: "These are examples to spark ideas — your project must be YOUR OWN. Different from these."
4. Distribute Design Brief Template. Pairs spend 10 minutes discussing and drafting their Problem Statement and Target User sections only — no hardware yet.
5. Facilitator circulates: "Who is this for? What problem does it solve? How do you know it is a problem?" Do NOT suggest solutions — ask questions only.
### 2. GUIDED ACTIVITY Design Brief + First Build
6. Session 1 / First 30 min — Complete the Design Brief: All 7 sections must be drafted before selecting components. Facilitator approves Problem Statement before learners touch hardware.
7. Sections completed in this phase: Problem Statement ✓, Target User ✓, Solution Description ✓, How It Works (step-by-step) ✓, English/Math Connection ✓. Test Results and Improvements Made are completed during and after building.
8. Session 2 / Second 30 min — First Build: Select components from tray (justify each choice: "I need the LDR because my project detects light."). Wire the circuit. Write a first draft of the sketch on paper before typing.
9. Facilitator coaching: use only these prompts — "What have you tried?" / "What does this line of code do?" / "Read that to me in plain English." Do NOT give code answers.
10. Upload first draft sketch. Does it compile? Does it do what the design brief says? Record first test in Test Record Table.
### 3. INDEPENDENT / PAIR WORK Iterate, Test & Peer Review
11. Task 1 (25 min): Iteration cycle — test → identify what does not work → fix → test again. Complete at least 3 rows in the Test Record Table. Each row must have a specific "Action Taken" — not just "Fixed it."
12. Task 2 (15 min): Peer Review — swap projects with an adjacent pair. The reviewing pair completes the 5-question Peer Review Rubric: (1) Does the project respond to input? (2) Does it produce a clear output? (3) Is the design brief complete? (4) Is the Math connection clearly demonstrated? (5) One suggestion for improvement.
13. Task 3 (10 min): Act on peer feedback — make at least one documented change based on the feedback. Record in "Improvements Made" section of the design brief.
14. Facilitator priority during this phase: check that EVERY design brief has an English/Math Connection section completed. This is a mandatory ILO 3.4 requirement.
15. Extension: Add Serial.println() output that displays a measurement, calculation, or data point during every loop iteration — quantifying the project's behaviour.
### 4. SHOWCASE & DEBRIEF
16. Each pair does a 2-minute preview demo — project must run during this time. One partner presents, one supports the hardware.
17. Class gives one piece of feedback per pair: "I noticed… / I wonder if…" Facilitator records on board.
18. Presentation preparation: facilitator explains Demo Day structure — Problem → Solution → Live Demo → Evidence (show the math) → Reflection. Write the 5 sections on the board. Learners spend last 5 minutes planning what they will say for each section.
19. English close: "Your design brief IS your evidence. A well-written brief shows you thought before you built."
20. Math close: "When you present your math connection, show the number. Don't just say 'it uses a loop' — say 'the loop runs 7 times and produces the 7 times table'. Numbers are evidence."
21. Collect completed Design Briefs (all 7 sections including Test Results and Improvements Made) as this week's artifact.

## Assessment

- Evidence Required
- Formative (During)
- Working prototype: responds to at least one input, produces at least one output. Test Record Table has minimum 3 completed rows with specific actions taken.
- Facilitator observation log. Prototype demonstrated to facilitator before peer review phase.
- Week 7 Artifact
- Completed Design Brief — all 7 sections, including Test Results (3 rows minimum) and Improvements Made. English/Math Connection section must be explicit and detailed.
- Physical document collected. Scored against 5-point artifact rubric (DDD Part 8.3). Peer Review Rubric also collected.
- Differentiation
- Support: provide a pre-approved project concept so pair focuses only on building and documenting. Extension: Serial.println() quantitative output + complete annotated code comments on every line.
- Peer Review Rubric received from partner pair also collected and filed.

## Key Vocabulary

design brief · prototype · iterate · test · debug · peer review · input · output · problem statement · target user · evidence · improvement · design sprint Date Delivered: Signature:

## Safeguarding

Learners choose their own project topic — facilitator must ensure no project involves surveillance of other people (e.g. motion-sensing another person without consent). All circuit wiring checked by facilitator before upload. Socratic coaching approach: never build the project for a learner.

## Full source extract (complete)

```
Open Project Design Sprint — Arduino Original Project
LEARNING OBJECTIVES
• Write a complete 7-section design brief: Problem Statement, Target User, Solution Description, How It Works (step-by-step), English/Math Connection, Test Results, Improvements Made
• Build a working Arduino prototype that responds to at least one input and produces at least one output
• Test the prototype systematically and record test results in the design brief (minimum 3 test runs)
• Iterate on the design based on test results — make at least one documented improvement
• Give and receive structured peer review feedback using the 5-question rubric
• Prepare a 5-minute Demo Day presentation: Problem → Solution → Live Demo → Evidence → Reflection
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4
• Component selection tray per pair: LEDs (assorted colours), LDR, buzzer, push button × 2, TMP36 temperature sensor, 10kΩ resistors × 4, 220Ω resistors × 4, breadboard, jumper wires
• Printed "Design Brief Template" — 7 headed sections with guidance notes and minimum requirements (A4, 2 pages per learner)
• Printed "Peer Review Rubric" — 5-question structured form with space for written comments (A5 per learner)
• Printed "Test Record Table" — columns: Test #, Expected Output, Actual Output, Pass/Fail, Action Taken (A5 per learner)
• Facilitator coaching prompt card — 5 Socratic questions to use when pairs ask for help
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term-time Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino
Lesson 7: Make It Real — Original Project Design & Build
Duration
3 hours (Term-time Saturday)
Term / Week
Term 1 · Week 7
Age Range
10–12 years
Group Size
8 learners (4 pairs — pair programming)
Hardware
Arduino Uno, USB cable, plus learner-selected components from: LEDs, LDR, buzzer, push button, temperature sensor (TMP36), resistors, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x
Bloom's Level
L5–L6 Evaluating / Creating
DDD Phase
CREATE — Learners write a full design brief, build an original Arduino project, test and iterate, and receive structured peer review feedback
NCDC Ref
Uganda NCDC Curriculum P5/P6 — Literacy Strand: Design brief writing, drafting and revising technical documentation; Numeracy Strand: Applying measurement, data, or arithmetic sequences to a physical build
Cambridge Ref
Cambridge Primary Computing 0845 — Stage 6: Designing and building a programme; Iterative testing and debugging; Presenting and evaluating work
Intended Learning Outcome (ILO)
Big Idea
ILO 3.4 — Design, build, test, iterate, and present an original Arduino project that integrates at least one coding concept, one explicit English literacy connection, and one explicit Mathematics connection, supported by a written design brief.
Engineers do not just code — they design, plan, build, test, improve, and communicate. Today you are the engineer. The brief is open. The constraints are real.
English Literacy Thread
Mathematics Thread
Design brief writing: a formal technical document with 7 required sections. Each section has a minimum word count and a specific writing purpose. The Problem Statement is written in 2–3 full sentences — present tense, specific and verifiable ("Children in this school cannot see whether the classroom is too dark to read."). The How It Works section uses numbered steps — this is procedural writing, the same genre as a method section in science. Learners draft, receive peer feedback, and revise — this mirrors the writing process: draft → feedback → redraft.
Every project must include one explicit mathematical element. Options: (1) a sensor reading with mean and range calculated during testing; (2) an arithmetic sequence implemented in a for loop within the project; (3) a geometric/measurement calculation used in the physical build (e.g. calculating resistor value needed for LED). Learners write the mathematical element explicitly in the English/Math Connection section of the design brief and demonstrate it during the peer review.
Phase
Time
Activities & Facilitator Actions
1. HOOK The Open Brief
20 min
• Facilitator reads the open project brief aloud: "Build an Arduino project that connects coding, English or Math, and a real-world need."
• Show 3 example project ideas (do NOT show code — only describe the concept): (1) A light-sensing alarm that beeps when the room gets too dark for reading. (2) A counting system that tracks how many times a button is pressed and displays the count. (3) A temperature logger that prints HIGH/MEDIUM/LOW based on the sensor value.
• Emphasise: "These are examples to spark ideas — your project must be YOUR OWN. Different from these."
• Distribute Design Brief Template. Pairs spend 10 minutes discussing and drafting their Problem Statement and Target User sections only — no hardware yet.
• Facilitator circulates: "Who is this for? What problem does it solve? How do you know it is a problem?" Do NOT suggest solutions — ask questions only.
2. GUIDED ACTIVITY Design Brief + First Build
60 min
• Session 1 / First 30 min — Complete the Design Brief: All 7 sections must be drafted before selecting components. Facilitator approves Problem Statement before learners touch hardware.
• Sections completed in this phase: Problem Statement ✓, Target User ✓, Solution Description ✓, How It Works (step-by-step) ✓, English/Math Connection ✓. Test Results and Improvements Made are completed during and after building.
• Session 2 / Second 30 min — First Build: Select components from tray (justify each choice: "I need the LDR because my project detects light."). Wire the circuit. Write a first draft of the sketch on paper before typing.
• Facilitator coaching: use only these prompts — "What have you tried?" / "What does this line of code do?" / "Read that to me in plain English." Do NOT give code answers.
• Upload first draft sketch. Does it compile? Does it do what the design brief says? Record first test in Test Record Table.
3. INDEPENDENT / PAIR WORK Iterate, Test & Peer Review
50 min
• Task 1 (25 min): Iteration cycle — test → identify what does not work → fix → test again. Complete at least 3 rows in the Test Record Table. Each row must have a specific "Action Taken" — not just "Fixed it."
• Task 2 (15 min): Peer Review — swap projects with an adjacent pair. The reviewing pair completes the 5-question Peer Review Rubric: (1) Does the project respond to input? (2) Does it produce a clear output? (3) Is the design brief complete? (4) Is the Math connection clearly demonstrated? (5) One suggestion for improvement.
• Task 3 (10 min): Act on peer feedback — make at least one documented change based on the feedback. Record in "Improvements Made" section of the design brief.
• Facilitator priority during this phase: check that EVERY design brief has an English/Math Connection section completed. This is a mandatory ILO 3.4 requirement.
• Extension: Add Serial.println() output that displays a measurement, calculation, or data point during every loop iteration — quantifying the project's behaviour.
4. SHOWCASE & DEBRIEF
30 min
• Each pair does a 2-minute preview demo — project must run during this time. One partner presents, one supports the hardware.
• Class gives one piece of feedback per pair: "I noticed… / I wonder if…" Facilitator records on board.
• Presentation preparation: facilitator explains Demo Day structure — Problem → Solution → Live Demo → Evidence (show the math) → Reflection. Write the 5 sections on the board. Learners spend last 5 minutes planning what they will say for each section.
• English close: "Your design brief IS your evidence. A well-written brief shows you thought before you built."
• Math close: "When you present your math connection, show the number. Don't just say 'it uses a loop' — say 'the loop runs 7 times and produces the 7 times table'. Numbers are evidence."
• Collect completed Design Briefs (all 7 sections including Test Results and Improvements Made) as this week's artifact.
Component
Description
Evidence Required
Formative (During)
Working prototype: responds to at least one input, produces at least one output. Test Record Table has minimum 3 completed rows with specific actions taken.
Facilitator observation log. Prototype demonstrated to facilitator before peer review phase.
Week 7 Artifact
Completed Design Brief — all 7 sections, including Test Results (3 rows minimum) and Improvements Made. English/Math Connection section must be explicit and detailed.
Physical document collected. Scored against 5-point artifact rubric (DDD Part 8.3). Peer Review Rubric also collected.
Differentiation
Support: provide a pre-approved project concept so pair focuses only on building and documenting. Extension: Serial.println() quantitative output + complete annotated code comments on every line.
Peer Review Rubric received from partner pair also collected and filed.
KEY VOCABULARY
design brief · prototype · iterate · test · debug · peer review · input · output · problem statement · target user · evidence · improvement · design sprint
Safeguarding Note
Learners choose their own project topic — facilitator must ensure no project involves surveillance of other people (e.g. motion-sensing another person without consent). All circuit wiring checked by facilitator before upload. Socratic coaching approach: never build the project for a learner.
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
