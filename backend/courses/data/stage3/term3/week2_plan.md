# Lesson 18: Systematic Debugging – Finding and Fixing Errors Like an Engineer

**Duration:** 60 minutes (split across Week 2 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 2
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L4 Analysing
**DDD Phase:** DELIVER – Learners apply a structured 5-step debugging protocol to increasingly complex multi-ILO programmes, developing the persistence and analytical precision the DDD identifies as a Stage 3–4 key disposition
**NCDC:** Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3/4: Detecting and correcting errors in programmes; Testing and evaluating programmes; Explaining and justifying debugging decisions

**Big Idea:** Bugs are not mistakes — they are information. Every bug tells you something about your programme that you did not understand yet. Professional engineers do not guess their way through bugs. They follow a protocol: Read → Predict → Run → Compare → Fix. Today that protocol becomes yours.

**Source plan:** `Stage3_Term3_Week2_Microbit_LessonPlan.docx`

## Learning Objectives

- State and explain the 5-step debugging protocol: Read → Predict → Run → Compare → Fix — one sentence per step
- Apply the protocol to Bug Set A: a provided programme with 2 logic errors — locate and fix both without running the code first (trace debugging)
- Apply the protocol to Bug Set B: a provided programme with 2 syntax/structural errors — locate and fix both by reading the code and running it once to confirm
- Apply the protocol to Bug Set C: a complex programme with 3 errors spanning ILO 2.1 (wrong event block) and ILO 2.2 (inverted condition) — locate and fix all 3
- Document every bug found across all three bug sets in a structured debugging log: Bug number / Location / Type / What it caused / Fix applied
- Write a 3-sentence reflection: what strategy helped most, what was hardest to find, and one rule they will follow in their own coding to prevent that type of bug

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Bug Set A worksheet (A4 per pair) — printed MakeCode screenshot, 2 logic errors marked with ? symbols
- Bug Set B worksheet (A4 per pair) — printed MakeCode screenshot, 2 structural/event errors marked with ? symbols
- Bug Set C worksheet (A4 per pair) — printed MakeCode screenshot, 3 errors across ILO 2.1 and 2.2, no markers — learners must find them independently
- Debugging Log template (A4 per learner) — 7 rows: Bug # / Location / Error Type / Effect / Fix / Verified (Y/N) / Prevention Rule
- Debugging protocol reference card (A5 per learner): Read → Predict → Run → Compare → Fix with one-sentence description of each step
- Vocabulary cards: 'bug', 'logic error', 'syntax error', 'trace', 'predict', 'verify', 'protocol', 'debugging log', 'root cause'
- Red and green pens — red to mark bugs on worksheets, green to mark fixes

## Cross-Curricular Links

**English:** Technical reading and analytical writing: learners read each bug set programme as a text — the DDD's Stage 3–4 English thread (Part 3.2: 'Reading comprehension of code as text'). For each bug, they write in the debugging log using precise technical language: not 'it was wrong' but 'the condition checked temperature > 20 instead of temperature < 20, causing the programme to display the incorrect icon when the temperature was below the threshold.' Reflection writing: the 3-sentence reflection must use evaluative language — 'The most effective strategy was… The hardest error to find was… because… The prevention rule I will follow is…' — directly applying the DDD's evaluative writing strand.

**Maths:** Logic and truth tables applied to debugging: for each logic error in Bug Sets A and C, learners write the incorrect condition and the correct condition as a Boolean statement. Example: incorrect — if temp > 20 (true when temp is 25°C → bug causes wrong icon); correct — if temp < 20 (true when temp is 15°C → correct behaviour). Learners complete a 2-column truth table for the incorrect vs. correct condition, showing which inputs reveal the bug and which do not. This connects to the DDD Part 2.4 mathematics thread: 'Boolean logic.' Learners calculate: if a programme runs 10 times and fails 3 times due to the bug, what is the error rate as a percentage? (30%.)

## Lesson Structure

### HOOK – What Is a Bug, Really? (8 min)
1. Distribute the debugging protocol reference card. Learners read it silently for 60 seconds. Facilitator asks: 'What is the difference between PREDICTING what code will do and RUNNING it to see?' Take 2 answers. Guide to: predicting requires you to understand the code — running just shows you the result. Understanding is what fixes bugs.
2. Show a real example on screen: a programme where the condition is inverted (shows 'cold' when temperature is high and 'hot' when it is low). Ask: 'Is this a logic error or a syntax error? How do you know?' Guide to: logic error — the programme runs without crashing but produces the wrong result.
3. Introduce error types: Syntax error = the code is broken (like a spelling mistake in English — the sentence makes no grammatical sense). Logic error = the code runs but the logic is wrong (like a sentence that is grammatically correct but means the opposite of what you intended). Ask learners to give one example of each from daily life.
4. Frame the session: 'Today you will find and fix 7 bugs across 3 bug sets. For every bug, you will follow the protocol and write it in your debugging log. This is exactly what software engineers do.'
### DESIGN – Set Up the Debugging Log (5 min)
5. Distribute debugging logs. Learners write their name, date, and the session focus ('Systematic Debugging') at the top. Number the Bug rows 1–7. Facilitator explains: 'Every time you find a bug — any bug, in any of the three sets — you fill in one row. Do not leave rows blank. If you find more than 7, use the back.'
6. Pairs agree on roles: one learner is primary reader of the code (Navigator role), the other is primary writer of the log (Driver role). They will swap after Bug Set B.
### Bug Set B — Run and Compare (10 min): distribute Bug Set B worksheet. Pairs recreate the programme in MakeCode exactly as shown (including the errors). Run it once. Observe the incorrect behaviour. Apply steps 3 and 4 (Run and Compare): what did it do? What should it do? Locate both structural errors. Fix them. Re-run to verify. Fill in Bug Set B rows in the debugging log.
7. SWAP Driver and Navigator roles before Bug Set C.
### DISCOVER – Reflect and Prevent (10 min)
8. Each learner independently writes the 3-sentence reflection at the bottom of the debugging log. Facilitator circulates: 'Your prevention rule must be specific — not just "check my code" but "always test the condition with a value above AND below the threshold to check both outcomes."'
9. Two pairs share their Bug Set C findings: 'We found the first bug at ___ because ___. The fix was ___. The prevention rule is ___.' Class checks: did they find the same bugs? If different — examine each solution to determine which is correct.
10. Vocabulary consolidation: facilitator holds up each vocabulary card. Learners give a one-word or one-phrase definition without looking at the card. Specific focus: 'root cause' — 'the root cause is not WHAT went wrong but WHY it went wrong in the first place.'
11. Maths check: 'If a programme ran 20 times and failed 6 times due to the inverted condition bug in Bug Set C, what is the error rate?' (6 ÷ 20 × 100 = 30%.) 'If you fix the bug and the new failure rate is 0%, what is the improvement?' (30 percentage points — or 100% reduction in failures.)
### WRAP-UP – Collect and Record (2 min)
12. Save any MakeCode projects used during the session (Bug Set B and C) as 'T3W2_[Name]_DebugB' and 'T3W2_[Name]_DebugC'. Disconnect Micro:bit.
13. Collect all debugging logs (formally assessed artifact this week) and all three bug set worksheets. Facilitator checks: minimum 7 bug rows completed, 3-sentence reflection written, prevention rules specific and actionable. Flag any learner whose Bug Set C rows show fewer than 3 bugs found — they may need support in Week 3.

## Assessment

- Formative (During)
- Bug Set A: both errors identified by trace (without running the code first) and fixes verified on Micro:bit? (trace debugging check)
- Bug Set B: both structural errors located after a single run and fixes verified? (run-and-compare debugging check)
- Bug Set C: all 3 errors found independently without facilitator hints, fixes verified, and all rows in debugging log complete? (independent debugging check — hardest gate)
- Debugging log: all 7 rows completed with specific error type, effect, fix, and verified Y/N? (artifact quality check)
- Exit Assessment
- Facilitator reads one line of JavaScript from Bug Set C aloud and asks each learner: ① 'What error type is this — logic or syntax?' ② 'What is the root cause of this error?' ③ 'What is your prevention rule for this type of error?' 3 points per learner. Facilitator records on assessment log. Also note whether the learner's debugging log shows the full 5-step protocol was followed for Bug Set C (evidenced by the Predict and Compare entries).
- Differentiation
- Support: Reduce to Bug Sets A and B only — skip Bug Set C. Provide Bug Set A with errors pre-highlighted in yellow (learners still need to identify what is wrong and fix it). Allow 2 runs of Bug Set B before requiring the fix to be written. Extension: Write a fourth bug set of their own — create a MakeCode programme that contains exactly 2 logic errors and 1 syntax error, without telling a partner where the bugs are. Swap with a partner and time how long it takes each person to find all 3 bugs. Compare strategies.

## Key Vocabulary

bug · logic error · syntax error · trace · predict · verify · protocol · debugging log · root cause · error rate · fix · prevention rule · reproduce · isolate Date Delivered: Signature:

## Safeguarding

Safeguarding Note: The bug set programmes used in this lesson were created by the facilitator and must be reviewed for appropriate content before the session — no offensive strings, no personal data in variables. If learners create their own bug sets in the extension task, the facilitator must review the programme content before it is passed to a partner.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)  |  Term Three
Lesson 18: Systematic Debugging – Finding and Fixing Errors Like an Engineer
T3 · W2
(Week 18)
Duration
60 minutes
Term / Week
Term 3 · Week 2
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L4 Analysing
DDD Phase
DELIVER – Learners apply a structured 5-step debugging protocol to increasingly complex multi-ILO programmes, developing the persistence and analytical precision the DDD identifies as a Stage 3–4 key disposition
NCDC Ref
Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3/4: Detecting and correcting errors in programmes; Testing and evaluating programmes; Explaining and justifying debugging decisions
Term Three Focus
The DDD Part 3.2 explicitly identifies 'persistence through debugging' as a key Stage 3–4 disposition. Term Three Week 2 elevates debugging from an incidental classroom activity into a taught, structured engineering skill with its own protocol, vocabulary, and assessment artifact — a debugging log.
Key ILO(s)
ILO 2.1 + 2.2 (integrated at L4) – Apply a systematic 5-step debugging protocol to analyse, locate, and fix logic and syntax errors in multi-ILO Micro:bit programmes; document each bug and fix in a written debugging log.
Big Idea
Bugs are not mistakes — they are information. Every bug tells you something about your programme that you did not understand yet. Professional engineers do not guess their way through bugs. They follow a protocol: Read → Predict → Run → Compare → Fix. Today that protocol becomes yours.
Prior Learning Link
Debugging was introduced informally in T1 Week 2, practised in T1 Week 4, and revisited in T2 Week 2 and T2 Week 5. Term Three makes it systematic and documented — moving from reactive debugging (finding a bug when something goes wrong) to proactive debugging (reading code to find bugs before running it).
LEARNING OBJECTIVES
#
Objective
1
State and explain the 5-step debugging protocol: Read → Predict → Run → Compare → Fix — one sentence per step
2
Apply the protocol to Bug Set A: a provided programme with 2 logic errors — locate and fix both without running the code first (trace debugging)
3
Apply the protocol to Bug Set B: a provided programme with 2 syntax/structural errors — locate and fix both by reading the code and running it once to confirm
4
Apply the protocol to Bug Set C: a complex programme with 3 errors spanning ILO 2.1 (wrong event block) and ILO 2.2 (inverted condition) — locate and fix all 3
5
Document every bug found across all three bug sets in a structured debugging log: Bug number / Location / Type / What it caused / Fix applied
6
Write a 3-sentence reflection: what strategy helped most, what was hardest to find, and one rule they will follow in their own coding to prevent that type of bug
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open
Bug Set A worksheet (A4 per pair) — printed MakeCode screenshot, 2 logic errors marked with ? symbols
Bug Set B worksheet (A4 per pair) — printed MakeCode screenshot, 2 structural/event errors marked with ? symbols
Bug Set C worksheet (A4 per pair) — printed MakeCode screenshot, 3 errors across ILO 2.1 and 2.2, no markers — learners must find them independently
Debugging Log template (A4 per learner) — 7 rows: Bug # / Location / Error Type / Effect / Fix / Verified (Y/N) / Prevention Rule
Debugging protocol reference card (A5 per learner): Read → Predict → Run → Compare → Fix with one-sentence description of each step
Vocabulary cards: 'bug', 'logic error', 'syntax error', 'trace', 'predict', 'verify', 'protocol', 'debugging log', 'root cause'
Red and green pens — red to mark bugs on worksheets, green to mark fixes
Cross-Curricular Links
English Literacy
Technical reading and analytical writing: learners read each bug set programme as a text — the DDD's Stage 3–4 English thread (Part 3.2: 'Reading comprehension of code as text'). For each bug, they write in the debugging log using precise technical language: not 'it was wrong' but 'the condition checked temperature > 20 instead of temperature < 20, causing the programme to display the incorrect icon when the temperature was below the threshold.' Reflection writing: the 3-sentence reflection must use evaluative language — 'The most effective strategy was… The hardest error to find was… because… The prevention rule I will follow is…' — directly applying the DDD's evaluative writing strand.
Mathematics
Logic and truth tables applied to debugging: for each logic error in Bug Sets A and C, learners write the incorrect condition and the correct condition as a Boolean statement. Example: incorrect — if temp > 20 (true when temp is 25°C → bug causes wrong icon); correct — if temp < 20 (true when temp is 15°C → correct behaviour). Learners complete a 2-column truth table for the incorrect vs. correct condition, showing which inputs reveal the bug and which do not. This connects to the DDD Part 2.4 mathematics thread: 'Boolean logic.' Learners calculate: if a programme runs 10 times and fails 3 times due to the bug, what is the error rate as a percentage? (30%.)
LESSON STRUCTURE
Step
Activity
HOOK – What Is a Bug, Really? (8 min)
1
Distribute the debugging protocol reference card. Learners read it silently for 60 seconds. Facilitator asks: 'What is the difference between PREDICTING what code will do and RUNNING it to see?' Take 2 answers. Guide to: predicting requires you to understand the code — running just shows you the result. Understanding is what fixes bugs.
2
Show a real example on screen: a programme where the condition is inverted (shows 'cold' when temperature is high and 'hot' when it is low). Ask: 'Is this a logic error or a syntax error? How do you know?' Guide to: logic error — the programme runs without crashing but produces the wrong result.
3
Introduce error types: Syntax error = the code is broken (like a spelling mistake in English — the sentence makes no grammatical sense). Logic error = the code runs but the logic is wrong (like a sentence that is grammatically correct but means the opposite of what you intended). Ask learners to give one example of each from daily life.
4
Frame the session: 'Today you will find and fix 7 bugs across 3 bug sets. For every bug, you will follow the protocol and write it in your debugging log. This is exactly what software engineers do.'
DESIGN – Set Up the Debugging Log (5 min)
5
Distribute debugging logs. Learners write their name, date, and the session focus ('Systematic Debugging') at the top. Number the Bug rows 1–7. Facilitator explains: 'Every time you find a bug — any bug, in any of the three sets — you fill in one row. Do not leave rows blank. If you find more than 7, use the back.'
6
Pairs agree on roles: one learner is primary reader of the code (Navigator role), the other is primary writer of the log (Driver role). They will swap after Bug Set B.
DELIVER – Three Bug Sets (35 min)
7
Bug Set A — Trace Debugging (10 min): distribute Bug Set A worksheet. Pairs read the code WITHOUT opening MakeCode. Apply steps 1 and 2 (Read and Predict): write a prediction for what the programme currently does (incorrectly). Identify both errors in red pen. Write the fix in green pen on the worksheet. ONLY THEN open MakeCode, recreate the programme, and run it to verify. Fill in Bug Set A rows in the debugging log.
8
Bug Set B — Run and Compare (10 min): distribute Bug Set B worksheet. Pairs recreate the programme in MakeCode exactly as shown (including the errors). Run it once. Observe the incorrect behaviour. Apply steps 3 and 4 (Run and Compare): what did it do? What should it do? Locate both structural errors. Fix them. Re-run to verify. Fill in Bug Set B rows in the debugging log.
9
SWAP Driver and Navigator roles before Bug Set C.
10
Bug Set C — Independent Debugging (15 min): distribute Bug Set C worksheet. No markers — pairs must find all 3 errors independently. Apply the full 5-step protocol. Facilitator does NOT indicate where errors are. If a pair is stuck: 'What have you tried? Read Step 1 again — have you READ every line?' Fill in Bug Set C rows. Verify all fixes work.
DISCOVER – Reflect and Prevent (10 min)
11
Each learner independently writes the 3-sentence reflection at the bottom of the debugging log. Facilitator circulates: 'Your prevention rule must be specific — not just "check my code" but "always test the condition with a value above AND below the threshold to check both outcomes."'
12
Two pairs share their Bug Set C findings: 'We found the first bug at ___ because ___. The fix was ___. The prevention rule is ___.' Class checks: did they find the same bugs? If different — examine each solution to determine which is correct.
13
Vocabulary consolidation: facilitator holds up each vocabulary card. Learners give a one-word or one-phrase definition without looking at the card. Specific focus: 'root cause' — 'the root cause is not WHAT went wrong but WHY it went wrong in the first place.'
14
Maths check: 'If a programme ran 20 times and failed 6 times due to the inverted condition bug in Bug Set C, what is the error rate?' (6 ÷ 20 × 100 = 30%.) 'If you fix the bug and the new failure rate is 0%, what is the improvement?' (30 percentage points — or 100% reduction in failures.)
WRAP-UP – Collect and Record (2 min)
15
Save any MakeCode projects used during the session (Bug Set B and C) as 'T3W2_[Name]_DebugB' and 'T3W2_[Name]_DebugC'. Disconnect Micro:bit.
16
Collect all debugging logs (formally assessed artifact this week) and all three bug set worksheets. Facilitator checks: minimum 7 bug rows completed, 3-sentence reflection written, prevention rules specific and actionable. Flag any learner whose Bug Set C rows show fewer than 3 bugs found — they may need support in Week 3.
Assessment
Formative (During)
Bug Set A: both errors identified by trace (without running the code first) and fixes verified on Micro:bit? (trace debugging check)
Bug Set B: both structural errors located after a single run and fixes verified? (run-and-compare debugging check)
Bug Set C: all 3 errors found independently without facilitator hints, fixes verified, and all rows in debugging log complete? (independent debugging check — hardest gate)
Debugging log: all 7 rows completed with specific error type, effect, fix, and verified Y/N? (artifact quality check)
Exit Assessment
Facilitator reads one line of JavaScript from Bug Set C aloud and asks each learner: ① 'What error type is this — logic or syntax?' ② 'What is the root cause of this error?' ③ 'What is your prevention rule for this type of error?' 3 points per learner. Facilitator records on assessment log. Also note whether the learner's debugging log shows the full 5-step protocol was followed for Bug Set C (evidenced by the Predict and Compare entries).
Differentiation
Support: Reduce to Bug Sets A and B only — skip Bug Set C. Provide Bug Set A with errors pre-highlighted in yellow (learners still need to identify what is wrong and fix it). Allow 2 runs of Bug Set B before requiring the fix to be written. Extension: Write a fourth bug set of their own — create a MakeCode programme that contains exactly 2 logic errors and 1 syntax error, without telling a partner where the bugs are. Swap with a partner and time how long it takes each person to find all 3 bugs. Compare strategies.
Key Vocabulary
bug · logic error · syntax error · trace · predict · verify · protocol · debugging log · root cause · error rate · fix · prevention rule · reproduce · isolate
Safeguarding Note: The bug set programmes used in this lesson were created by the facilitator and must be reviewed for appropriate content before the session — no offensive strings, no personal data in variables. If learners create their own bug sets in the extension task, the facilitator must review the programme content before it is passed to a partner.
Facilitator Name:
_________________________________
Date Delivered:
_________________________________
Signature:
_________________________________
```
