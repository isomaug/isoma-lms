# Lesson 23: Final Stage 3 Creative Sprint – Build Your Graduation Project

**Duration:** 60 minutes (split across Week 7 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 7
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L5–L6 Evaluating / Creating
**DDD Phase:** DISCOVER – Learners design and build their graduation Demo Day project, guided by their Week 22 improvement goal, incorporating Term Three skills (functions, debugging protocol, accelerometer or Bluetooth, AI classification) at the highest level of ambition reached in Stage 3
**NCDC:** Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3/4: Designing and building an original programme;

**Big Idea:** This is the project that represents everything you have learned. Not just what you built today — but what you can do.

**Source plan:** `Stage3_Term3_Week7_Microbit_LessonPlan.docx`

## Learning Objectives

- Read the improvement goal card from Week 22 and write a one-sentence design intention stating how the Final Sprint project will address it
- Complete a 6-section design brief: Title, Problem Statement, Who It Is For, How It Works (with pseudocode including at least one function call), What I Used (inputs, outputs, variables, conditions, Term Three skill used), Mathematical Element (calculation or graph)
- Build a working Micro:bit prototype that demonstrably uses all of: a named variable, at least one if/else condition, a sensor input, a self-created function, and either an accelerometer reading OR a Bluetooth service OR a classifier structure
- Run 3 planned test cases from a pre-written test log (input → expected output → actual output → pass/fail); fix all failing test cases before saving the final version
- Complete a 3-item self-evaluation: one strength from the test log results, one bug fixed during the session, one specific improvement that could be made with more time
- Rehearse the Demo Day 6-section presentation structure using the design brief as a script — timed at exactly 3 minutes with a partner

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Improvement goal cards from Week 22 (returned to learners at session start)
- 6-section Final Design Brief template (A4 per learner): Title / Problem Statement / Who It Is For / How It Works (with pseudocode box + function call box) / What I Used / Mathematical Element
- Test log template (A5 per learner) — 3 rows: Test # | Input | Expected Output | Actual Output | Pass/Fail | Fix Applied
- Self-evaluation frame (A5 per learner): Strength / Bug Fixed / Improvement With More Time
- Demo Day presentation structure card (A5 per learner): Problem → Solution → Live Demo → Mathematical Element → What I Learned → What I Would Improve
- Squared paper for calculations or graphs in design brief Section 6
- Sticky notes for bug log during build phase
- Vocabulary cards: 'design intention', 'pseudocode', 'function call', 'test case', 'pass/fail', 'iterate', 'graduation project', 'Term Three skill'

## Cross-Curricular Links

**English:** Design brief writing — the most formally assessed written piece of Stage 3. All 6 sections must be in full sentences. Section 4 (How It Works) must include pseudocode written line-by-line, with at least one function call written as: 'Call function [name] when [event] occurs.' Section 6 (Mathematical Element) requires a written calculation or graph on squared paper, with a sentence explaining what it demonstrates about the project. Self-evaluation writing: the 3-item evaluation uses precise evaluative language — 'strength' must cite test log evidence, 'bug fixed' must name the bug type (logic or syntax) and the fix applied, 'improvement' must be technically specific and honest. Rehearsal: 3-minute timed presentation is done with a partner using the design brief as a script — a direct preparation for Demo Day.

**Maths:** Mandatory mathematical element — the most rigorous mathematics required in Stage 3. The learner chooses one of: (a) a threshold value calculation derived from real sensor data collected in T3 Week 3 (accelerometer) or T1 Week 5 (temperature) — explaining why that value was chosen and what the margin of error is; (b) a loop counter calculation demonstrating multiplication (loop runs N times × change per iteration = final value); (c) a classifier accuracy calculation from T3 Week 4 data (accuracy% = correct predictions ÷ total tests × 100) used as the basis for a threshold decision in the project; or (d) a timing sequence where 3 or more function durations are summed, fractions calculated, and the total presented as a timeline diagram. All calculations shown in full working on squared paper. Connects to DDD Part 8.5 rubric Criterion 4: 'Math: data, graph, or logical structure demonstrated.'

## Lesson Structure

### HOOK – From Improvement Goal to Design Intention (8 min)
1. Return improvement goal cards from Week 22. Learners read their own card silently for 60 seconds. Ask: 'Is this goal still the right one? Or has something changed since last week?' Allow 30 seconds of reflection — learners may revise the goal on the back of the card if needed.
2. Each learner writes their one-sentence design intention at the top of the Final Design Brief: 'This project will address my improvement goal for ILO ___ by ___ .' Facilitator checks: is the design intention specific and connected to the improvement goal? If it is too vague, prompt: 'What specifically will you build to show ILO ___?'
3. Introduce the two constraints for today: ① The project must include at least one Term Three skill (function, systematic debugging evidence, accelerometer, AI classification, or Bluetooth). ② The project must be presentable in exactly 3 minutes using the Demo Day structure card. 'These are not suggestions — they are the conditions for your graduation project.'
### DESIGN – Complete the Full 6-Section Brief (15 min)
4. Sections 1–3 completed independently — 5 minutes: Title, Problem Statement, Who It Is For. Facilitator circulates: 'Is the problem real and specific? Can you name one person who has this problem?'
5. Sections 4–5 completed as a pair — 6 minutes: How It Works (pseudocode including one named function call) and What I Used (inputs, outputs, variable names, conditions, Term Three skill explicitly named). Navigator holds the improvement goal card while Driver writes the pseudocode — every line must be traceable to a MakeCode block.
6. Section 6 completed independently — 4 minutes: Mathematical Element. Learner selects from the 4 options, writes the calculation or draws the graph on squared paper, and writes one sentence explaining what it shows. Facilitator must sign off Section 6 before coding begins.
7. Facilitator approval gate: sign the design brief. Pre-write the 3 test cases in the test log header before laptops open. Facilitator checks: test cases span the condition's boundary (at least one above threshold, one below, one edge case).
### DELIVER – Build, Test, and Iterate (27 min)
8. Distribute Micro:bits and laptops. Assign Driver and Navigator. Driver codes strictly from the pseudocode in Section 4 — not from memory or improvisation.
9. Build Phase 1 (12 min): establish the core mechanic — variable, sensor input, condition. Include the function definition and at least one call point. Download and run Test Case 1. Record Actual Output. Pass or Fail? If Fail — write the bug type and fix on the test log immediately, do not defer.
10. Build Phase 2 (10 min): add the Term Three skill element — the feature that makes this project distinct from a Term One or Term Two project. Add sound or narrative if time allows. SWAP Driver and Navigator. New Driver runs Test Case 2, records result, and makes at least one refinement identified by the Navigator.
11. Test Case 3 and final fixes (5 min): run Test Case 3. Record. Address any remaining fails. Check: does the programme currently meet ≥2/4 on EVERY DDD Part 8.5 criterion? If any criterion is still at 1 — fix it now. Update the pseudocode in Section 4 if the code changed during build.
### DISCOVER – Rehearse and Self-Evaluate (8 min)
12. Each learner completes the self-evaluation frame independently: Strength (citing test log evidence), Bug Fixed (naming type and fix), Improvement With More Time (technically specific). Facilitator circulates: 'If your strength just says "it worked", that is not specific enough. Cite your test log — which test case passed, and what did it prove about your programme?'
13. Timed rehearsal: pairs take turns presenting to each other for exactly 3 minutes using the Demo Day structure card. Partner times with a phone or watch. After each rehearsal, partner says: 'You used ___ seconds too many / too few. The section that needs more time is ___.' Learner adjusts timing notes on the structure card.
14. Facilitator previews Demo Day: 'Next week, you present this project to the group. Your design brief is your script. Your test log is your evidence. Your self-evaluation is your reflection. Bring all three. Practice your 3 minutes at home this week.'
### WRAP-UP – Save and Collect (2 min)
15. Rename MakeCode project 'T3W7_[Name]_Graduation'. Disconnect Micro:bit. Learners may photograph their test log with facilitator permission to guide home practice.
16. Collect 6-section design briefs, test logs, and self-evaluation frames — all three are formally assessed artifacts and are returned on Demo Day as the presentation reference pack. Confirm all 6 sections complete and signed, 3 test cases recorded, self-evaluation written.

## Assessment

- Formative (During)
- Facilitator approval gate: all 6 brief sections and 3 test cases completed before coding — facilitator signed? (design gate check)
- Prototype uses a named variable, an if/else condition, a sensor input, a self-created function, AND one Term Three skill? (5-point ILO + T3 skill check)
- All 3 test cases run, recorded with pass/fail, and failing cases fixed before saving? (test log integrity check)
- 3-minute rehearsal completed and timing feedback noted on presentation card? (Demo Day preparation check)
- Exit Assessment
- Facilitator asks each learner: ① 'Which Term Three skill does your graduation project use — and where in the code is it?' ② 'Which test case was the hardest to pass — what was the bug and how did you fix it?' ③ 'What is your mathematical element and what does it prove about your project?' 3 points per learner. Flag any learner with a failing test case still unresolved — they must be offered targeted support before Demo Day. Record all scores on the cumulative assessment record per DDD Part 10.3.
- Differentiation
- Support: Reduce to 4 brief sections (skip Section 3 and Section 6). Reduce to 2 test cases. Allow learner to build upon and extend an existing project from a prior term rather than starting from scratch — the Term Three skill must be added as a new feature. Provide a partially built MakeCode template with the function structure already in place. Extension: Build two distinct projects — one that uses the accelerometer for data collection (ILO 2.3) and one that uses AI classification logic (ILO 2.2). Write a one-paragraph comparison of both projects explaining which better demonstrates Stage 3 mastery and why — evaluative writing at Bloom's L5.

## Key Vocabulary

design intention · pseudocode · function call · test case · pass/fail · iterate · graduation project · Term Three skill · mathematical element · threshold · rehearsal · script Date Delivered: Signature:

## Safeguarding

Safeguarding Note: Graduation project content must be appropriate for a public group presentation — the facilitator must review all design briefs at the approval gate and redirect any content that is personal, offensive, or exclusionary. Test log data is private between learner and facilitator until Demo Day. Remind learners that the project they present next week will be seen by all classmates — it must be something they are proud to share and that will not cause discomfort to anyone in the group.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)  |  Term Three
Lesson 23: Final Stage 3 Creative Sprint – Build Your Graduation Project
T3 · W7
(Week 23)
Duration
60 minutes
Term / Week
Term 3 · Week 7
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L5–L6 Evaluating / Creating
DDD Phase
DISCOVER – Learners design and build their graduation Demo Day project, guided by their Week 22 improvement goal, incorporating Term Three skills (functions, debugging protocol, accelerometer or Bluetooth, AI classification) at the highest level of ambition reached in Stage 3
NCDC Ref
Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3/4: Designing and building an original programme;
Evaluating and iterating on a solution; Documenting design decisions in a written brief; Preparing work for a formal presentation
Term Three Focus
The Final Stage 3 Creative Sprint mirrors DDD Part 7.2 Week 7 but represents the full extent of Stage 3 learning.
Unlike Term One Week 7 and Term Two Week 7, this sprint has no scaffold beyond the design brief — learners choose their own concept, select their own skills, and justify every decision.
The project built today IS the Demo Day project.
Key ILO(s)
ILOs 2.1–2.4 (all, at maximum depth) – Design, build, test, and document an original Micro:bit project that: uses at least one Term Three skill, demonstrates at least 3 of the 4 ILOs evidently and intentionally, achieves ≥2/4 on every DDD Part 8.5 rubric criterion, and is supported by a complete 6-section design brief and a 3-test-case test log.
Big Idea
This is the project that represents everything you have learned. Not just what you built today — but what you can do.
Every decision you make in the next 27 minutes of build time should be deliberate. Design carefully. Build from your plan. Test systematically. And fix what needs fixing before next week.
Prior Learning Link
Draws on the complete Stage 3 arc: T1 Weeks 1–8 (all foundations), T2 Weeks 1–8 (variables, Boolean logic, extended narrative, integration, JavaScript), T3 Weeks 1–6 (functions, debugging protocol, accelerometer, AI classification, Bluetooth, portfolio self-assessment).
The improvement goal from Week 22 is the guiding brief for this session.
LEARNING OBJECTIVES
#
Objective
1
Read the improvement goal card from Week 22 and write a one-sentence design intention stating how the Final Sprint project will address it
2
Complete a 6-section design brief: Title, Problem Statement, Who It Is For, How It Works (with pseudocode including at least one function call), What I Used (inputs, outputs, variables, conditions, Term Three skill used), Mathematical Element (calculation or graph)
3
Build a working Micro:bit prototype that demonstrably uses all of: a named variable, at least one if/else condition, a sensor input, a self-created function, and either an accelerometer reading OR a Bluetooth service OR a classifier structure
4
Run 3 planned test cases from a pre-written test log (input → expected output → actual output → pass/fail); fix all failing test cases before saving the final version
5
Complete a 3-item self-evaluation: one strength from the test log results, one bug fixed during the session, one specific improvement that could be made with more time
6
Rehearse the Demo Day 6-section presentation structure using the design brief as a script — timed at exactly 3 minutes with a partner
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open
Improvement goal cards from Week 22 (returned to learners at session start)
6-section Final Design Brief template (A4 per learner): Title / Problem Statement / Who It Is For / How It Works (with pseudocode box + function call box) / What I Used / Mathematical Element
Test log template (A5 per learner) — 3 rows: Test # | Input | Expected Output | Actual Output | Pass/Fail | Fix Applied
Self-evaluation frame (A5 per learner): Strength / Bug Fixed / Improvement With More Time
Demo Day presentation structure card (A5 per learner): Problem → Solution → Live Demo → Mathematical Element → What I Learned → What I Would Improve
Squared paper for calculations or graphs in design brief Section 6
Sticky notes for bug log during build phase
Vocabulary cards: 'design intention', 'pseudocode', 'function call', 'test case', 'pass/fail', 'iterate', 'graduation project', 'Term Three skill'
Cross-Curricular Links
English Literacy
Design brief writing — the most formally assessed written piece of Stage 3. All 6 sections must be in full sentences. Section 4 (How It Works) must include pseudocode written line-by-line, with at least one function call written as: 'Call function [name] when [event] occurs.' Section 6 (Mathematical Element) requires a written calculation or graph on squared paper, with a sentence explaining what it demonstrates about the project. Self-evaluation writing: the 3-item evaluation uses precise evaluative language — 'strength' must cite test log evidence, 'bug fixed' must name the bug type (logic or syntax) and the fix applied, 'improvement' must be technically specific and honest. Rehearsal: 3-minute timed presentation is done with a partner using the design brief as a script — a direct preparation for Demo Day.
Mathematics
Mandatory mathematical element — the most rigorous mathematics required in Stage 3. The learner chooses one of: (a) a threshold value calculation derived from real sensor data collected in T3 Week 3 (accelerometer) or T1 Week 5 (temperature) — explaining why that value was chosen and what the margin of error is; (b) a loop counter calculation demonstrating multiplication (loop runs N times × change per iteration = final value); (c) a classifier accuracy calculation from T3 Week 4 data (accuracy% = correct predictions ÷ total tests × 100) used as the basis for a threshold decision in the project; or (d) a timing sequence where 3 or more function durations are summed, fractions calculated, and the total presented as a timeline diagram. All calculations shown in full working on squared paper. Connects to DDD Part 8.5 rubric Criterion 4: 'Math: data, graph, or logical structure demonstrated.'
LESSON STRUCTURE
Step
Activity
HOOK – From Improvement Goal to Design Intention (8 min)
1
Return improvement goal cards from Week 22. Learners read their own card silently for 60 seconds. Ask: 'Is this goal still the right one? Or has something changed since last week?' Allow 30 seconds of reflection — learners may revise the goal on the back of the card if needed.
2
Each learner writes their one-sentence design intention at the top of the Final Design Brief: 'This project will address my improvement goal for ILO ___ by ___ .' Facilitator checks: is the design intention specific and connected to the improvement goal? If it is too vague, prompt: 'What specifically will you build to show ILO ___?'
3
Introduce the two constraints for today: ① The project must include at least one Term Three skill (function, systematic debugging evidence, accelerometer, AI classification, or Bluetooth). ② The project must be presentable in exactly 3 minutes using the Demo Day structure card. 'These are not suggestions — they are the conditions for your graduation project.'
DESIGN – Complete the Full 6-Section Brief (15 min)
4
Sections 1–3 completed independently — 5 minutes: Title, Problem Statement, Who It Is For. Facilitator circulates: 'Is the problem real and specific? Can you name one person who has this problem?'
5
Sections 4–5 completed as a pair — 6 minutes: How It Works (pseudocode including one named function call) and What I Used (inputs, outputs, variable names, conditions, Term Three skill explicitly named). Navigator holds the improvement goal card while Driver writes the pseudocode — every line must be traceable to a MakeCode block.
6
Section 6 completed independently — 4 minutes: Mathematical Element. Learner selects from the 4 options, writes the calculation or draws the graph on squared paper, and writes one sentence explaining what it shows. Facilitator must sign off Section 6 before coding begins.
7
Facilitator approval gate: sign the design brief. Pre-write the 3 test cases in the test log header before laptops open. Facilitator checks: test cases span the condition's boundary (at least one above threshold, one below, one edge case).
DELIVER – Build, Test, and Iterate (27 min)
8
Distribute Micro:bits and laptops. Assign Driver and Navigator. Driver codes strictly from the pseudocode in Section 4 — not from memory or improvisation.
9
Build Phase 1 (12 min): establish the core mechanic — variable, sensor input, condition. Include the function definition and at least one call point. Download and run Test Case 1. Record Actual Output. Pass or Fail? If Fail — write the bug type and fix on the test log immediately, do not defer.
10
Build Phase 2 (10 min): add the Term Three skill element — the feature that makes this project distinct from a Term One or Term Two project. Add sound or narrative if time allows. SWAP Driver and Navigator. New Driver runs Test Case 2, records result, and makes at least one refinement identified by the Navigator.
11
Test Case 3 and final fixes (5 min): run Test Case 3. Record. Address any remaining fails. Check: does the programme currently meet ≥2/4 on EVERY DDD Part 8.5 criterion? If any criterion is still at 1 — fix it now. Update the pseudocode in Section 4 if the code changed during build.
DISCOVER – Rehearse and Self-Evaluate (8 min)
12
Each learner completes the self-evaluation frame independently: Strength (citing test log evidence), Bug Fixed (naming type and fix), Improvement With More Time (technically specific). Facilitator circulates: 'If your strength just says "it worked", that is not specific enough. Cite your test log — which test case passed, and what did it prove about your programme?'
13
Timed rehearsal: pairs take turns presenting to each other for exactly 3 minutes using the Demo Day structure card. Partner times with a phone or watch. After each rehearsal, partner says: 'You used ___ seconds too many / too few. The section that needs more time is ___.' Learner adjusts timing notes on the structure card.
14
Facilitator previews Demo Day: 'Next week, you present this project to the group. Your design brief is your script. Your test log is your evidence. Your self-evaluation is your reflection. Bring all three. Practice your 3 minutes at home this week.'
WRAP-UP – Save and Collect (2 min)
15
Rename MakeCode project 'T3W7_[Name]_Graduation'. Disconnect Micro:bit. Learners may photograph their test log with facilitator permission to guide home practice.
16
Collect 6-section design briefs, test logs, and self-evaluation frames — all three are formally assessed artifacts and are returned on Demo Day as the presentation reference pack. Confirm all 6 sections complete and signed, 3 test cases recorded, self-evaluation written.
Assessment
Formative (During)
Facilitator approval gate: all 6 brief sections and 3 test cases completed before coding — facilitator signed? (design gate check)
Prototype uses a named variable, an if/else condition, a sensor input, a self-created function, AND one Term Three skill? (5-point ILO + T3 skill check)
All 3 test cases run, recorded with pass/fail, and failing cases fixed before saving? (test log integrity check)
3-minute rehearsal completed and timing feedback noted on presentation card? (Demo Day preparation check)
Exit Assessment
Facilitator asks each learner: ① 'Which Term Three skill does your graduation project use — and where in the code is it?' ② 'Which test case was the hardest to pass — what was the bug and how did you fix it?' ③ 'What is your mathematical element and what does it prove about your project?' 3 points per learner. Flag any learner with a failing test case still unresolved — they must be offered targeted support before Demo Day. Record all scores on the cumulative assessment record per DDD Part 10.3.
Differentiation
Support: Reduce to 4 brief sections (skip Section 3 and Section 6). Reduce to 2 test cases. Allow learner to build upon and extend an existing project from a prior term rather than starting from scratch — the Term Three skill must be added as a new feature. Provide a partially built MakeCode template with the function structure already in place. Extension: Build two distinct projects — one that uses the accelerometer for data collection (ILO 2.3) and one that uses AI classification logic (ILO 2.2). Write a one-paragraph comparison of both projects explaining which better demonstrates Stage 3 mastery and why — evaluative writing at Bloom's L5.
Key Vocabulary
design intention · pseudocode · function call · test case · pass/fail · iterate · graduation project · Term Three skill · mathematical element · threshold · rehearsal · script
Safeguarding Note: Graduation project content must be appropriate for a public group presentation — the facilitator must review all design briefs at the approval gate and redirect any content that is personal, offensive, or exclusionary. Test log data is private between learner and facilitator until Demo Day. Remind learners that the project they present next week will be seen by all classmates — it must be something they are proud to share and that will not cause discomfort to anyone in the group.
Facilitator Name:
_________________________________
Date Delivered:
_________________________________
Signature:
_________________________________
```
