# Lesson T2–7: Second Original Project: Design, Build, Iterate & Document

**Duration:** 3 hours (Saturday) / 90 min × 3 days (Holiday) (split across Week 7 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 7
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, full component kit per pair: LEDs (red, green, yellow), LDR, TMP36, buzzer, push button × 2, 220Ω and 10kΩ resistors, breadboard, jumper wires
**Bloom's:** L5 Evaluating → L6 Creating
**DDD ILO:** ILO 3.4 – Design, build, test, iterate, and present an original Arduino project that integrates at least one coding concept, one explicit English literacy connection, and one explicit Mathematics connection, supported by a written design brief; Term Two requirement: the project must incorporate at least one concept from T2 Weeks 1–6 not used in the Term One project
**NCDC:** Uganda NCDC P5–P6 – English Strand: Technical report writing with iterative revision, design documentation, peer feedback as analytical reading; ICT Strand: Project design cycle, build-test-iterate, systems thinking; Mathematics Strand: Mathematical integration in original design — sensor data statistics, sequences, or geometry
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Design, make, and evaluate; programming with purpose; technical documentation; peer review and iteration

**Big Idea:** Your second project is not a repeat — it is proof of growth. It must do something your Term One project could not do. The design brief is not a formality; it is the engineering thinking made visible.

**Context:** Term Two Context: Term One Week 7 was the first design-build sprint: learners experienced the full cycle — brief, circuit, sketch, test, iterate — for the first time. Many projects were simple (single LED, single button, single condition). Term Two Week 7 demands a step up on every dimension. The project must incorporate at least one new concept from Term Two: multi-function code architecture (T2 W1), arrays (T2 W2), nested loops (T2 W3), a finite state machine (T2 W4), dual sensors (T2 W5), or a rule-based classifier (T2 W6). The written design brief must include a Reflection on Term One section explaining what was learned and how this project improves upon it. The peer review rubric is now a 7-question form — two questions added to assess Term Two concept integration and code quality.

## Learning Objectives

- Write a full 9-section design brief: the 7 sections from Term One PLUS Section 8 (Reflection on Term One Project — what was built, what limitation was identified, how this project addresses it) and Section 9 (Term Two Concept Integration — which T2 Week 1–6 concept is used and why)
- Build a working Arduino prototype that incorporates at least one Term Two concept AND responds to at least two distinct inputs OR produces at least two distinct outputs
- Write an Arduino sketch from scratch that uses at least 3 named functions, at least one array or state variable, and has every function annotated with a plain-English comment
- Conduct at least 2 distinct test cycles — document each test result and each improvement made as a result in the Test Results section of the design brief
- Complete a 7-question peer review rubric for a partner pair with specific, evidence-based written comments on every question
- Deliver a 5-minute Demo Day presentation rehearsal in the full required format: Problem → Solution → Live Demo → Evidence → Reflection

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- Full component kit per pair (all components from T2 Weeks 1–6 available)
- Printed 9-section design brief template (A4, 2 pages per learner) — Sections 1–7 from Term One PLUS Sections 8 and 9
- Printed 7-question peer review rubric (A4 per learner) — updated from Term One: Q1–Q5 as before, Q6: "Does the project use at least one Term Two concept? Describe it.", Q7: "Is the code quality high — multiple functions, comments, no redundancy?"
- Printed component reference card (A5 per pair) — updated wiring reference for all T2 components
- Printed Test Results log (A4 per learner) — 2 rows: Test 1 | Expected output | Actual output | Change made; Test 2 same format
- Squared paper (2 sheets per learner — for circuit sketch and any graphs in Test Results)
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** The 9-section design brief represents the most extended and structured technical writing task of the programme. Section 8 (Reflection on Term One) requires learners to evaluate their own previous work critically and honestly — this is self-assessment writing, a P6-level skill. "My Term One project used a single LED and one if/else condition. It was limited because it could not respond to more than one input at the same time. This project addresses that limitation by using a finite state machine that responds to both a button and a temperature threshold." Section 9 (Term Two Concept Integration) requires precise technical vocabulary used correctly in context. The peer review rubric now has 7 questions — each answer must be specific and reference evidence from the design brief: not "the code is good" but "the code uses 4 named functions including blinkAlarm() and readTemperature(), each with a plain-English comment."

**Maths:** The project must contain a named, demonstrable mathematical element — more specific than Term One. Acceptable Term Two mathematical elements: (1) Statistical analysis of dual sensor readings collected during testing — mean, range, and mode calculated and presented in a table in the Test Results section. (2) An arithmetic sequence generated by a nested loop as a visible output (e.g. a timed sequence where delays follow a pattern). (3) A finite state machine with a named probability calculation — e.g. "Over 20 test cycles, the FAULT state was triggered 4 times — that is a 20% fault rate." (4) An array sorted using bubble sort with the number of comparisons calculated and printed. The Test Results section must include at least one number — a measurement, calculation, or count — that demonstrates the mathematical element.

## Lesson Structure

### SESSION 1 / DAY 1 — Reflection, Design, and Brief Writing  (60 min)
1. Term One reflection (10 min): each learner writes on a sticky note — "My Term One project: what it did, one thing that worked well, one limitation." Share in pairs. "Your second project must address that limitation. If your Term One project could only respond to one input, your Term Two project must respond to two. If your Term One project had no array, your Term Two project must use one."
2. Brainstorm and select (10 min): pairs generate 3 project ideas on the design brief template margin. Each idea must name the Term Two concept it uses and the real-world problem it solves. Choose one. Feasibility check: is every required component in the kit? Facilitator approves chosen project before design brief writing begins.
3. Design brief Sections 1–5 (20 min): Problem Statement (3–5 sentences including the specific real-world context), Target User (named and described), Solution Description (what the project does and why it solves the problem), How It Works (numbered pseudocode steps — each step must map to an identifiable function in the final sketch), Components List (every component, every resistor value, every pin number).
4. Design brief Sections 8 and 9 (10 min): Section 8 — Reflection on Term One Project (minimum 4 sentences: what was built, what worked, what was limited, how this project improves it). Section 9 — Term Two Concept Integration (minimum 3 sentences: which concept, what week it was introduced, how it is specifically implemented in this project).
5. Peer review of design brief Sections 1–5 and 8–9: swap with partner pair. Is the Term Two concept named specifically (not just "I used loops")? Is the reflection honest and analytical? Write one comment per section in the margin.

### SESSION 2 / DAY 2 — Circuit Build, Sketch Writing, and First Test  (60 min)
6. Circuit sketch (10 min): draw the full circuit on squared paper before touching any component. Label every pin, every resistor value, every component. Pair checks the sketch against the component reference card. Facilitator approves the circuit sketch before the build begins.
7. Circuit build (15 min): following the approved sketch, assemble on the breadboard. Facilitator checks every build before USB connection. Confirm: correct resistor values, no reversed sensor orientation, all jumper wires seated firmly.
8. Sketch writing (25 min): open Arduino IDE, write from scratch following the "How It Works" numbered steps in the design brief. Must use: at least 3 named functions (one per major behaviour), at least one array OR state variable (from T2 Weeks 2 or 4), comments on every function declaration. The sketch must not exceed 80 lines — if it does, decompose into more functions.
9. First test — Test 1 in the Test Results log (10 min): upload the sketch. Record in Test 1: Expected output (from the design brief), Actual output (what actually happened), Change Made (what was modified as a result). If the project works perfectly on first upload, the facilitator poses a deliberate challenge: "What happens if both inputs activate simultaneously? Is that handled in your code?"
10. Second test — Test 2 in the Test Results log (10 min): implement the change identified in Test 1. Upload. Record Test 2: Expected output after the change, Actual output, Change Made (if a second change was needed). Document the mathematical element in the Test Results: print a measurement, calculation, or data count to the Serial Monitor and photograph or transcribe it.

### SESSION 3 / DAY 3 — Second Test, Documentation, Peer Review, and Rehearsal  (50 min)
11. Complete design brief Sections 6 and 7 (10 min): Section 6 — English/Math Connection (2 sentences each, specifically naming the skill and explaining how the project demonstrates it — more precise than Term One). Section 7 — Test Results and Improvements (completed from the Test Results log — paste or summarise both tests; include the mathematical element with the actual number recorded).
12. Peer review session (15 min): swap the completed 9-section design brief with the partner pair. Each learner completes all 7 questions of the updated peer review rubric. Q6 and Q7 are new — learners must identify the Term Two concept in the partner's brief and evaluate the code quality description. Every question must have a specific written comment — not a score alone. Return with feedback. Read and initial receipt of feedback.
13. Presentation rehearsal (10 min): each learner delivers the full 5-minute structure to their partner: Problem → Solution → Live Demo → Evidence (show the number from Test Results) → Reflection (what worked, what would be improved, what Term Two concept made this project possible). Partner gives 1 Star + 1 Wish.
14. Facilitator collects all design briefs for review. Returns with written comments minimum 48 hours before Demo Day. Notes any learner who has not completed Sections 8 or 9 — these are required for the T2 assessment.
15. 2 pairs give a full presentation rehearsal (5 minutes each). The class observes and each observer completes the first 3 questions of the peer review rubric for the presenter — practice for Demo Day.

### SHOWCASE & DEBRIEF  (30 min)
16. Facilitator gives targeted whole-class feedback on three specific dimensions: (1) Term Two concept integration — "I heard one pair explain their FSM clearly. I heard another pair mention arrays but not explain how they are used. On Demo Day, be specific." (2) Code quality — "3 of 4 pairs used named functions. 1 pair had all code in loop(). That will cost points on the code quality rubric criterion." (3) Mathematical element — "I need to see a number in your Test Results section. A measurement, a count, a calculation. Not a description — an actual number."
17. Remind learners of the exact Demo Day assessment weights from the DDD: Prototype Functionality 10%, Code Quality 10%, Integration (English + Math) 10%, Presentation 20%, Written Design Brief 10%, Peer Review 5%, Weekly Artifacts 25%, Participation 10%. "Your design brief is worth 10% of your total grade. Sections 8 and 9 are required. They cannot be added after Demo Day."
18. Learners update their design brief with any corrections identified by the facilitator or peer reviewer. Submit final version via USB flash drive at the end of this session.
19. Facilitator confirms Demo Day logistics: panel composition (facilitator + invited assessor), timing (5 minutes per learner + 3 minutes Q&A), presentation order (to be announced), certificate eligibility requirements from DDD Part 9.2.
20. Exit question (written): "Name the Term Two concept your project uses and write one sentence explaining what it contributes to the project that your Term One project could not do." Collect as formative evidence.

## Assessment

- Formative | (During) | Sticky note Term One reflection: specific limitation identified (checked during Session 1) | Facilitator approval of project idea and circuit sketch before building (Session 1 and Session 2 — both required) | Test Results log: both tests documented with expected output, actual output, and change made — with a mathematical number recorded (collected) | Peer review rubric: all 7 questions answered with specific written comments — Q6 and Q7 completed (collected)
- Exit Assessment | Working prototype: responds to ≥2 inputs OR produces ≥2 outputs, incorporates ≥1 Term Two concept (verified by facilitator) | Sketch: ≥3 named functions, ≥1 array or state variable, every function annotated — compiles and uploads (verified) | Full 9-section design brief including Sections 8 (Reflection) and 9 (Term Two Concept) — submitted (assessed against 5-point artifact rubric) | Peer review rubric: 7 questions with specific comments (submitted) | Presentation rehearsal: full 5-part structure attempted (observed by facilitator) | Exit question: Term Two concept named with a one-sentence contribution statement (collected)
- Differentiation | Support: Reduce to 8 design brief sections (Section 9 optional but encouraged). Accept a single Term Two concept at the most basic level (e.g. a single array of 3 values rather than a full FSM). Pre-approved project ideas available from the facilitator for pairs who cannot settle on a concept after 10 minutes. Peer review rubric reduced to 5 questions (Q6 and Q7 attempted but not scored for this group). | Extension: Write a 200-word technical appendix to the design brief: "Algorithmic Analysis." Identify the time complexity of the main loop (how many operations run per second?). Calculate the total number of function calls in 1 minute of operation. Identify one algorithmic improvement that could make the code more efficient and explain it. This introduces computational thinking at L5–L6 and previews Stage 6 content.

## Key Vocabulary

design brief · iteration · test cycle · decomposition · state variable · array · finite state machine · classifier · peer review · algorithmic analysis · code quality · reflection · Term Two concept integration

## Safeguarding

Safeguarding Note: All project ideas must be reviewed and approved by the facilitator before building begins. Projects that monitor or track people (motion detectors aimed at individuals, sound recorders, proximity alerts aimed at other learners) must be declined and redirected to a general engineering problem. Circuit builds with multiple sensors require facilitator verification of all wiring before USB connection — two sensors simultaneously increase the risk of incorrect connections. All personal data in design briefs (first name only) must be confirmed compliant before submission.

## Full source extract (complete)

### Detail body

```
Write a full 9-section design brief: the 7 sections from Term One PLUS Section 8 (Reflection on Term One Project — what was built, what limitation was identified, how this project addresses it) and Section 9 (Term Two Concept Integration — which T2 Week 1–6 concept is used and why)
Build a working Arduino prototype that incorporates at least one Term Two concept AND responds to at least two distinct inputs OR produces at least two distinct outputs
Write an Arduino sketch from scratch that uses at least 3 named functions, at least one array or state variable, and has every function annotated with a plain-English comment
Conduct at least 2 distinct test cycles — document each test result and each improvement made as a result in the Test Results section of the design brief
Complete a 7-question peer review rubric for a partner pair with specific, evidence-based written comments on every question
Deliver a 5-minute Demo Day presentation rehearsal in the full required format: Problem → Solution → Live Demo → Evidence → Reflection
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards + USB cables
Full component kit per pair (all components from T2 Weeks 1–6 available)
Printed 9-section design brief template (A4, 2 pages per learner) — Sections 1–7 from Term One PLUS Sections 8 and 9
Printed 7-question peer review rubric (A4 per learner) — updated from Term One: Q1–Q5 as before, Q6: "Does the project use at least one Term Two concept? Describe it.", Q7: "Is the code quality high — multiple functions, comments, no redundancy?"
Printed component reference card (A5 per pair) — updated wiring reference for all T2 components
Printed Test Results log (A4 per learner) — 2 rows: Test 1 | Expected output | Actual output | Change made; Test 2 same format
Squared paper (2 sheets per learner — for circuit sketch and any graphs in Test Results)
USB flash drives
Facilitator device + projected screen
Term One reflection (10 min): each learner writes on a sticky note — "My Term One project: what it did, one thing that worked well, one limitation." Share in pairs. "Your second project must address that limitation. If your Term One project could only respond to one input, your Term Two project must respond to two. If your Term One project had no array, your Term Two project must use one."
Brainstorm and select (10 min): pairs generate 3 project ideas on the design brief template margin. Each idea must name the Term Two concept it uses and the real-world problem it solves. Choose one. Feasibility check: is every required component in the kit? Facilitator approves chosen project before design brief writing begins.
Design brief Sections 1–5 (20 min): Problem Statement (3–5 sentences including the specific real-world context), Target User (named and described), Solution Description (what the project does and why it solves the problem), How It Works (numbered pseudocode steps — each step must map to an identifiable function in the final sketch), Components List (every component, every resistor value, every pin number).
Design brief Sections 8 and 9 (10 min): Section 8 — Reflection on Term One Project (minimum 4 sentences: what was built, what worked, what was limited, how this project improves it). Section 9 — Term Two Concept Integration (minimum 3 sentences: which concept, what week it was introduced, how it is specifically implemented in this project).
Peer review of design brief Sections 1–5 and 8–9: swap with partner pair. Is the Term Two concept named specifically (not just "I used loops")? Is the reflection honest and analytical? Write one comment per section in the margin.
Circuit sketch (10 min): draw the full circuit on squared paper before touching any component. Label every pin, every resistor value, every component. Pair checks the sketch against the component reference card. Facilitator approves the circuit sketch before the build begins.
Circuit build (15 min): following the approved sketch, assemble on the breadboard. Facilitator checks every build before USB connection. Confirm: correct resistor values, no reversed sensor orientation, all jumper wires seated firmly.
Sketch writing (25 min): open Arduino IDE, write from scratch following the "How It Works" numbered steps in the design brief. Must use: at least 3 named functions (one per major behaviour), at least one array OR state variable (from T2 Weeks 2 or 4), comments on every function declaration. The sketch must not exceed 80 lines — if it does, decompose into more functions.
First test — Test 1 in the Test Results log (10 min): upload the sketch. Record in Test 1: Expected output (from the design brief), Actual output (what actually happened), Change Made (what was modified as a result). If the project works perfectly on first upload, the facilitator poses a deliberate challenge: "What happens if both inputs activate simultaneously? Is that handled in your code?"
Second test — Test 2 in the Test Results log (10 min): implement the change identified in Test 1. Upload. Record Test 2: Expected output after the change, Actual output, Change Made (if a second change was needed). Document the mathematical element in the Test Results: print a measurement, calculation, or data count to the Serial Monitor and photograph or transcribe it.
Complete design brief Sections 6 and 7 (10 min): Section 6 — English/Math Connection (2 sentences each, specifically naming the skill and explaining how the project demonstrates it — more precise than Term One). Section 7 — Test Results and Improvements (completed from the Test Results log — paste or summarise both tests; include the mathematical element with the actual number recorded).
Peer review session (15 min): swap the completed 9-section design brief with the partner pair. Each learner completes all 7 questions of the updated peer review rubric. Q6 and Q7 are new — learners must identify the Term Two concept in the partner's brief and evaluate the code quality description. Every question must have a specific written comment — not a score alone. Return with feedback. Read and initial receipt of feedback.
Presentation rehearsal (10 min): each learner delivers the full 5-minute structure to their partner: Problem → Solution → Live Demo → Evidence (show the number from Test Results) → Reflection (what worked, what would be improved, what Term Two concept made this project possible). Partner gives 1 Star + 1 Wish.
Facilitator collects all design briefs for review. Returns with written comments minimum 48 hours before Demo Day. Notes any learner who has not completed Sections 8 or 9 — these are required for the T2 assessment.
2 pairs give a full presentation rehearsal (5 minutes each). The class observes and each observer completes the first 3 questions of the peer review rubric for the presenter — practice for Demo Day.
Facilitator gives targeted whole-class feedback on three specific dimensions: (1) Term Two concept integration — "I heard one pair explain their FSM clearly. I heard another pair mention arrays but not explain how they are used. On Demo Day, be specific." (2) Code quality — "3 of 4 pairs used named functions. 1 pair had all code in loop(). That will cost points on the code quality rubric criterion." (3) Mathematical element — "I need to see a number in your Test Results section. A measurement, a count, a calculation. Not a description — an actual number."
Remind learners of the exact Demo Day assessment weights from the DDD: Prototype Functionality 10%, Code Quality 10%, Integration (English + Math) 10%, Presentation 20%, Written Design Brief 10%, Peer Review 5%, Weekly Artifacts 25%, Participation 10%. "Your design brief is worth 10% of your total grade. Sections 8 and 9 are required. They cannot be added after Demo Day."
Learners update their design brief with any corrections identified by the facilitator or peer reviewer. Submit final version via USB flash drive at the end of this session.
Facilitator confirms Demo Day logistics: panel composition (facilitator + invited assessor), timing (5 minutes per learner + 3 minutes Q&A), presentation order (to be announced), certificate eligibility requirements from DDD Part 9.2.
Exit question (written): "Name the Term Two concept your project uses and write one sentence explaining what it contributes to the project that your Term One project could not do." Collect as formative evidence.
design brief · iteration · test cycle · decomposition · state variable · array · finite state machine · classifier · peer review · algorithmic analysis · code quality · reflection · Term Two concept integration
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5  (Ages 10–12 · AI Engineers) | Lesson T2–7: Second Original Project: Design, Build, Iterate & Document
Duration | 3 hours (Saturday) / 90 min × 3 days (Holiday) | Term / Week | Term 2 · Week 7
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, full component kit per pair: LEDs (red, green, yellow), LDR, TMP36, buzzer, push button × 2, 220Ω and 10kΩ resistors, breadboard, jumper wires | Bloom's Level | L5 Evaluating → L6 Creating
NCDC Ref | Uganda NCDC P5–P6 – English Strand: Technical report writing with iterative revision, design documentation, peer feedback as analytical reading; ICT Strand: Project design cycle, build-test-iterate, systems thinking; Mathematics Strand: Mathematical integration in original design — sensor data statistics, sequences, or geometry | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Design, make, and evaluate; programming with purpose; technical documentation; peer review and iteration
DDD ILO | ILO 3.4 – Design, build, test, iterate, and present an original Arduino project that integrates at least one coding concept, one explicit English literacy connection, and one explicit Mathematics connection, supported by a written design brief; Term Two requirement: the project must incorporate at least one concept from T2 Weeks 1–6 not used in the Term One project | Big Idea | Your second project is not a repeat — it is proof of growth. It must do something your Term One project could not do. The design brief is not a formality; it is the engineering thinking made visible.
Term Two Context: Term One Week 7 was the first design-build sprint: learners experienced the full cycle — brief, circuit, sketch, test, iterate — for the first time. Many projects were simple (single LED, single button, single condition). Term Two Week 7 demands a step up on every dimension. The project must incorporate at least one new concept from Term Two: multi-function code architecture (T2 W1), arrays (T2 W2), nested loops (T2 W3), a finite state machine (T2 W4), dual sensors (T2 W5), or a rule-based classifier (T2 W6). The written design brief must include a Reflection on Term One section explaining what was learned and how this project improves upon it. The peer review rubric is now a 7-question form — two questions added to assess Term Two concept integration and code quality.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | The 9-section design brief represents the most extended and structured technical writing task of the programme. Section 8 (Reflection on Term One) requires learners to evaluate their own previous work critically and honestly — this is self-assessment writing, a P6-level skill. "My Term One project used a single LED and one if/else condition. It was limited because it could not respond to more than one input at the same time. This project addresses that limitation by using a finite state machine that responds to both a button and a temperature threshold." Section 9 (Term Two Concept Integration) requires precise technical vocabulary used correctly in context. The peer review rubric now has 7 questions — each answer must be specific and reference evidence from the design brief: not "the code is good" but "the code uses 4 named functions including blinkAlarm() and readTemperature(), each with a plain-English comment."
Maths | The project must contain a named, demonstrable mathematical element — more specific than Term One. Acceptable Term Two mathematical elements: (1) Statistical analysis of dual sensor readings collected during testing — mean, range, and mode calculated and presented in a table in the Test Results section. (2) An arithmetic sequence generated by a nested loop as a visible output (e.g. a timed sequence where delays follow a pattern). (3) A finite state machine with a named probability calculation — e.g. "Over 20 test cycles, the FAULT state was triggered 4 times — that is a 20% fault rate." (4) An array sorted using bubble sort with the number of comparisons calculated and printed. The Test Results section must include at least one number — a measurement, calculation, or count — that demonstrates the mathematical element.
LESSON STRUCTURE
SESSION 1 / DAY 1 — Reflection, Design, and Brief Writing  (60 min)
SESSION 2 / DAY 2 — Circuit Build, Sketch Writing, and First Test  (60 min)
SESSION 3 / DAY 3 — Second Test, Documentation, Peer Review, and Rehearsal  (50 min)
SHOWCASE & DEBRIEF  (30 min)
ASSESSMENT
Formative | (During) | Sticky note Term One reflection: specific limitation identified (checked during Session 1) | Facilitator approval of project idea and circuit sketch before building (Session 1 and Session 2 — both required) | Test Results log: both tests documented with expected output, actual output, and change made — with a mathematical number recorded (collected) | Peer review rubric: all 7 questions answered with specific written comments — Q6 and Q7 completed (collected)
Exit Assessment | Working prototype: responds to ≥2 inputs OR produces ≥2 outputs, incorporates ≥1 Term Two concept (verified by facilitator) | Sketch: ≥3 named functions, ≥1 array or state variable, every function annotated — compiles and uploads (verified) | Full 9-section design brief including Sections 8 (Reflection) and 9 (Term Two Concept) — submitted (assessed against 5-point artifact rubric) | Peer review rubric: 7 questions with specific comments (submitted) | Presentation rehearsal: full 5-part structure attempted (observed by facilitator) | Exit question: Term Two concept named with a one-sentence contribution statement (collected)
Differentiation | Support: Reduce to 8 design brief sections (Section 9 optional but encouraged). Accept a single Term Two concept at the most basic level (e.g. a single array of 3 values rather than a full FSM). Pre-approved project ideas available from the facilitator for pairs who cannot settle on a concept after 10 minutes. Peer review rubric reduced to 5 questions (Q6 and Q7 attempted but not scored for this group). | Extension: Write a 200-word technical appendix to the design brief: "Algorithmic Analysis." Identify the time complexity of the main loop (how many operations run per second?). Calculate the total number of function calls in 1 minute of operation. Identify one algorithmic improvement that could make the code more efficient and explain it. This introduces computational thinking at L5–L6 and previews Stage 6 content.
KEY VOCABULARY
Safeguarding Note: All project ideas must be reviewed and approved by the facilitator before building begins. Projects that monitor or track people (motion detectors aimed at individuals, sound recorders, proximity alerts aimed at other learners) must be declined and redirected to a general engineering problem. Circuit builds with multiple sensors require facilitator verification of all wiring before USB connection — two sensors simultaneously increase the risk of incorrect connections. All personal data in design briefs (first name only) must be confirmed compliant before submission.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
