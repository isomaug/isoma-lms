# Lesson 17: Functions & Reusable Code – Building with Named Blocks

**Duration:** 60 minutes (split across Week 1 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 1
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L3–L4 Applying / Analysing
**DDD Phase:** DELIVER – Learners create and call user-defined functions in MakeCode, reducing code repetition and building programme architecture skills that bridge toward Stage 4
**NCDC:** Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3/4: Designing programmes with reusable components; Understanding decomposition; Using named procedures to organise code

**Big Idea:** A function is a named recipe. Instead of writing the same instructions every time you need them, you write them once, give them a name, and call that name whenever you need them. Functions make programmes shorter, cleaner, and easier to fix.

**Source plan:** `Stage3_Term3_Week1_Microbit_LessonPlan.docx`

## Learning Objectives

- Explain in one sentence what a function is and give one real-life analogy (a recipe, a set of instructions saved with a name)
- Identify repeated code blocks in an existing programme and explain why repetition is a problem (harder to fix, longer to read)
- Use MakeCode's 'Make a Function' feature to create a named function called 'showAlert' that displays a flashing LED pattern and a scrolling message
- Call the 'showAlert' function from at least three different event blocks (on start, on button A pressed, on shake) and confirm the same behaviour occurs each time
- Create a second function - 'resetDisplay' - that clears the screen and pauses 500ms; call it after each alert
- Refactor an existing multi-scene programme from Term Two by replacing repeated LED animation blocks with a function call, reducing total block count by at least 30%

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open - T2 Week 5 Integration Sprint projects pre-loaded
- Function concept card (A5 per learner): labelled diagram - Function Name / Instructions inside / Call point
- Repetition identification worksheet (A4 per pair): printed screenshot of a programme with 3 repeated code sections; learners circle and label each repetition
- Function planning sheet (A4 per learner): 2 rows - Function Name | What it does | Where it is called
- Vocabulary cards: 'function', 'call', 'define', 'reuse', 'refactor', 'decomposition', 'repetition', 'parameter'
- Sticky notes for block-count tracking (before refactor vs. after refactor)
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Vocabulary and analogy writing: learners write a 2-sentence definition of 'function' using their own words and a real-life analogy of their choosing. Example: 'A function is like a saved recipe. Instead of writing all the steps every time I cook, I just say: make the recipe.' Structured explanation: after refactoring, each learner writes 3 sentences explaining what they changed, why, and what effect it had. Sentence frame: 'Before refactoring, my programme had ___ repeated blocks. I created a function called ___ to replace them. Now my programme is easier to ___ because ___.'

**Maths:** Efficiency and ratio: before refactoring, learners count and record the total number of blocks in the programme (write on a sticky note). After refactoring, count again. Calculate: how many blocks were saved? What is the reduction as a percentage? (Blocks saved ÷ Original total × 100.) If a programme has 24 blocks and refactoring reduces it to 16, the reduction is 8 ÷ 24 × 100 = 33.3%. Decomposition as division: if a programme has 3 functions each containing 5 blocks, how many unique blocks define all the programme's behaviour? (15.) If the same programme called each function 4 times, how many total block executions would that be? (60.)

## Lesson Structure

### HOOK – The Repetition Problem (10 min)
1. Distribute the repetition identification worksheet face-down. Set a 90-second silent reading timer, then flip. Pairs identify all 3 repeated sections and circle them in pen. Ask: 'How many times does this same group of blocks appear?' (Answer varies - 3 times minimum.) 'If you needed to change the delay in this group, how many places would you have to change it?'
2. Introduce the problem: 'Repetition in code is dangerous. If you change something, you have to change it everywhere. If you miss one, you have a bug. Professional programmers have a rule: Don't Repeat Yourself - DRY. Today we learn the tool that solves this problem: functions.'
3. Show the function concept card. Read aloud: name, instructions inside, call point. Give the real-life analogy: 'I teach my younger sibling how to make a sandwich ONCE. I write it down with the title: Make Sandwich. Now whenever I say Make Sandwich, they know exactly what to do - I don't have to explain every step again.'
4. Ask: 'What would you call a function that makes the Micro:bit flash a warning?' Take 3 creative answers. Bridge: 'Let's build it.'
### DESIGN – Plan Two Functions (10 min)
5. Distribute function planning sheets. Learners complete both rows INDEPENDENTLY before touching MakeCode: Row 1 - name 'showAlert', describe what it does, list the 3 events that will call it. Row 2 - name 'resetDisplay', describe what it does, list when it will be called.
6. Pairs share plans. Partner checks: 'Does the function name describe what it does? Is showAlert called from at least 3 different events?' Refine if needed.
7. Facilitator models 'Make a Function' in MakeCode on the projected screen: Advanced → Functions → Make a Function → type name → add blocks inside. Show how the function block appears in the workspace and how to drag a 'call' block to use it. Learners observe - laptops closed during the demo.
8. Block-count pre-task: each learner opens T2 Week 5 project and counts the total blocks. Record on a sticky note labelled 'BEFORE'. Place on the corner of the desk.
### DELIVER – Build, Call, and Refactor (30 min)
9. Distribute Micro:bits and laptops. Assign Driver and Navigator.
10. Task 1 – Create showAlert (10 min): Driver creates the 'showAlert' function in MakeCode. Inside: show LED pattern (heart or exclamation) → pause 500ms → clear screen → show string 'ALERT!' → pause 500ms. Test the function by calling it from on start. Download and confirm it works.
11. Task 2 – Call from 3 events (8 min): drag 'call showAlert' into on button A pressed, on button B pressed, and on shake. Download and test each trigger. Navigator checks against the planning sheet: 'Does each trigger produce the same animation?' If not - only the function definition needs fixing.
12. Task 3 – Create resetDisplay (6 min): SWAP Driver and Navigator. New Driver creates 'resetDisplay': clear screen → pause 500ms. Calls it at the end of each event block after showAlert. Download and confirm the display clears cleanly after every alert.
13. Task 4 – Refactor (6 min): open T2 Week 5 Integration Sprint project. Identify one group of repeated blocks. Replace them with a new function. Count blocks again - record on a second sticky note labelled 'AFTER'. Calculate the saving.
### DISCOVER – Evaluate the Refactor (8 min)
14. Each learner writes the 3-sentence refactoring explanation on their function planning sheet: what changed, why, and what effect it had. Facilitator circulates: 'Is your explanation specific? Does it mention the function name and the block count?'
15. Pairs share sticky notes: BEFORE count vs. AFTER count. Calculate percentage reduction together. Who saved the most? 'Our programme went from ___ blocks to ___ blocks - a reduction of ___%. This is called refactoring.'
16. Two pairs share their refactored project on screen. Class identifies: 'Where is the function defined? Where is it called? What would happen if we changed one thing inside the function?'
17. Maths close: Facilitator poses: 'If a programme has 3 functions of 6 blocks each, called 5 times each in total, how many total block executions happen?' (3 × 6 × 5 = 90.) 'How many unique blocks define all that behaviour?' (18.) Pairs calculate on function planning sheet.
### WRAP-UP – Save and Collect (2 min)
18. Rename showAlert project 'T3W1_[Name]_Functions'. Rename refactored project 'T3W1_[Name]_Refactor'. Disconnect Micro:bit.
19. Collect function planning sheets (both sides completed), repetition worksheets, and both sticky notes (BEFORE/AFTER). These are the week's formally assessed artifact. Facilitator checks: planning sheet complete, 3-sentence explanation written, block-count calculation recorded.

## Assessment

- Formative (During)
- Observation: Does showAlert function display correctly when called from all 3 different event blocks? (consistency check - same function, multiple call points)
- Does resetDisplay clear the screen correctly after each alert? (second function functionality check)
- Was at least one repeated section in the T2 Week 5 project replaced with a function call? (refactoring check)
- Block-count recorded before and after refactoring? Percentage reduction calculated? (maths check on sticky notes)
- Exit Assessment
- Facilitator asks each learner:
- ① 'Point to the function definition in your code - what is inside it?'
- ② 'How many places call this function?'
- ③ 'What was your block-count reduction percentage?' 3 points per learner - recorded on assessment log. This week counts as a formally weighted artifact per DDD Part 8.2 (Weekly Evidence Artifacts).
- Differentiation
- Support: Provide a half-built MakeCode project with the function structure already created and named; learner only adds blocks inside the function and adds call blocks to 2 events (reduced from 3). Skip the refactoring task - focus on building and calling the two new functions correctly. Extension: Add a parameter to the showAlert function - a number that controls how many times the LED flashes before clearing. Call the function with different parameter values from different events and observe the difference. Write a sentence explaining what a parameter is.

## Key Vocabulary

function · define · call · reuse · refactor · decomposition · repetition · DRY · parameter · block count · efficiency · architecture Date Delivered: Signature:

## Safeguarding

Safeguarding Note: Function names and any strings displayed via showAlert must be neutral and inclusive. Facilitator reviews all function content during the DELIVER phase - redirect any function that displays offensive, exclusionary, or personally identifying text. Remind learners that anything displayed on the Micro:bit LED during a class session is visible to all and must be appropriate for a shared learning environment.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)  |  Term Three
Lesson 17: Functions & Reusable Code – Building with Named Blocks
T3 · W1
(Week 17)
Duration
60 minutes
Term / Week
Term 3 · Week 1
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L3–L4 Applying / Analysing
DDD Phase
DELIVER – Learners create and call user-defined functions in MakeCode, reducing code repetition and building programme architecture skills that bridge toward Stage 4
NCDC Ref
Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3/4: Designing programmes with reusable components; Understanding decomposition; Using named procedures to organise code
Term Three Focus
Term Three consolidates Stage 3 skills and bridges toward Stage 4 readiness. Week 1 introduces functions - named, reusable blocks of code - which are the core architectural concept of Stage 4 and Stage 5–6 (DDD Part 5.3: user-defined functions). Learners apply this concept using MakeCode's 'Make a Function' feature without any text syntax.
Key ILO(s)
ILO 2.1 (at ceiling) – Write block-based Micro:bit programmes that use at least two self-created functions to organise and reuse code; explain what a function does and why reusable code is better than repeated code.
Big Idea
A function is a named recipe. Instead of writing the same instructions every time you need them, you write them once, give them a name, and call that name whenever you need them. Functions make programmes shorter, cleaner, and easier to fix.
Prior Learning Link
T1 Weeks 1–8 and T2 Weeks 1–8 built all programmes using event blocks and if/else structures. Every time learners duplicated code blocks across scenes or events, they were solving the same problem functions solve - they just did it the long way. This week names that pattern.
LEARNING OBJECTIVES
#
Objective
1
Explain in one sentence what a function is and give one real-life analogy (a recipe, a set of instructions saved with a name)
2
Identify repeated code blocks in an existing programme and explain why repetition is a problem (harder to fix, longer to read)
3
Use MakeCode's 'Make a Function' feature to create a named function called 'showAlert' that displays a flashing LED pattern and a scrolling message
4
Call the 'showAlert' function from at least three different event blocks (on start, on button A pressed, on shake) and confirm the same behaviour occurs each time
5
Create a second function - 'resetDisplay' - that clears the screen and pauses 500ms; call it after each alert
6
Refactor an existing multi-scene programme from Term Two by replacing repeated LED animation blocks with a function call, reducing total block count by at least 30%
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open - T2 Week 5 Integration Sprint projects pre-loaded
Function concept card (A5 per learner): labelled diagram - Function Name / Instructions inside / Call point
Repetition identification worksheet (A4 per pair): printed screenshot of a programme with 3 repeated code sections; learners circle and label each repetition
Function planning sheet (A4 per learner): 2 rows - Function Name | What it does | Where it is called
Vocabulary cards: 'function', 'call', 'define', 'reuse', 'refactor', 'decomposition', 'repetition', 'parameter'
Sticky notes for block-count tracking (before refactor vs. after refactor)
Facilitator device + projected screen
Cross-Curricular Links
English Literacy
Vocabulary and analogy writing: learners write a 2-sentence definition of 'function' using their own words and a real-life analogy of their choosing. Example: 'A function is like a saved recipe. Instead of writing all the steps every time I cook, I just say: make the recipe.' Structured explanation: after refactoring, each learner writes 3 sentences explaining what they changed, why, and what effect it had. Sentence frame: 'Before refactoring, my programme had ___ repeated blocks. I created a function called ___ to replace them. Now my programme is easier to ___ because ___.'
Mathematics
Efficiency and ratio: before refactoring, learners count and record the total number of blocks in the programme (write on a sticky note). After refactoring, count again. Calculate: how many blocks were saved? What is the reduction as a percentage? (Blocks saved ÷ Original total × 100.) If a programme has 24 blocks and refactoring reduces it to 16, the reduction is 8 ÷ 24 × 100 = 33.3%. Decomposition as division: if a programme has 3 functions each containing 5 blocks, how many unique blocks define all the programme's behaviour? (15.) If the same programme called each function 4 times, how many total block executions would that be? (60.)
LESSON STRUCTURE
Step
Activity
HOOK – The Repetition Problem (10 min)
1
Distribute the repetition identification worksheet face-down. Set a 90-second silent reading timer, then flip. Pairs identify all 3 repeated sections and circle them in pen. Ask: 'How many times does this same group of blocks appear?' (Answer varies - 3 times minimum.) 'If you needed to change the delay in this group, how many places would you have to change it?'
2
Introduce the problem: 'Repetition in code is dangerous. If you change something, you have to change it everywhere. If you miss one, you have a bug. Professional programmers have a rule: Don't Repeat Yourself - DRY. Today we learn the tool that solves this problem: functions.'
3
Show the function concept card. Read aloud: name, instructions inside, call point. Give the real-life analogy: 'I teach my younger sibling how to make a sandwich ONCE. I write it down with the title: Make Sandwich. Now whenever I say Make Sandwich, they know exactly what to do - I don't have to explain every step again.'
4
Ask: 'What would you call a function that makes the Micro:bit flash a warning?' Take 3 creative answers. Bridge: 'Let's build it.'
DESIGN – Plan Two Functions (10 min)
5
Distribute function planning sheets. Learners complete both rows INDEPENDENTLY before touching MakeCode: Row 1 - name 'showAlert', describe what it does, list the 3 events that will call it. Row 2 - name 'resetDisplay', describe what it does, list when it will be called.
6
Pairs share plans. Partner checks: 'Does the function name describe what it does? Is showAlert called from at least 3 different events?' Refine if needed.
7
Facilitator models 'Make a Function' in MakeCode on the projected screen: Advanced → Functions → Make a Function → type name → add blocks inside. Show how the function block appears in the workspace and how to drag a 'call' block to use it. Learners observe - laptops closed during the demo.
8
Block-count pre-task: each learner opens T2 Week 5 project and counts the total blocks. Record on a sticky note labelled 'BEFORE'. Place on the corner of the desk.
DELIVER – Build, Call, and Refactor (30 min)
9
Distribute Micro:bits and laptops. Assign Driver and Navigator.
10
Task 1 – Create showAlert (10 min): Driver creates the 'showAlert' function in MakeCode. Inside: show LED pattern (heart or exclamation) → pause 500ms → clear screen → show string 'ALERT!' → pause 500ms. Test the function by calling it from on start. Download and confirm it works.
11
Task 2 – Call from 3 events (8 min): drag 'call showAlert' into on button A pressed, on button B pressed, and on shake. Download and test each trigger. Navigator checks against the planning sheet: 'Does each trigger produce the same animation?' If not - only the function definition needs fixing.
12
Task 3 – Create resetDisplay (6 min): SWAP Driver and Navigator. New Driver creates 'resetDisplay': clear screen → pause 500ms. Calls it at the end of each event block after showAlert. Download and confirm the display clears cleanly after every alert.
13
Task 4 – Refactor (6 min): open T2 Week 5 Integration Sprint project. Identify one group of repeated blocks. Replace them with a new function. Count blocks again - record on a second sticky note labelled 'AFTER'. Calculate the saving.
DISCOVER – Evaluate the Refactor (8 min)
14
Each learner writes the 3-sentence refactoring explanation on their function planning sheet: what changed, why, and what effect it had. Facilitator circulates: 'Is your explanation specific? Does it mention the function name and the block count?'
15
Pairs share sticky notes: BEFORE count vs. AFTER count. Calculate percentage reduction together. Who saved the most? 'Our programme went from ___ blocks to ___ blocks - a reduction of ___%. This is called refactoring.'
16
Two pairs share their refactored project on screen. Class identifies: 'Where is the function defined? Where is it called? What would happen if we changed one thing inside the function?'
17
Maths close: Facilitator poses: 'If a programme has 3 functions of 6 blocks each, called 5 times each in total, how many total block executions happen?' (3 × 6 × 5 = 90.) 'How many unique blocks define all that behaviour?' (18.) Pairs calculate on function planning sheet.
WRAP-UP – Save and Collect (2 min)
18
Rename showAlert project 'T3W1_[Name]_Functions'. Rename refactored project 'T3W1_[Name]_Refactor'. Disconnect Micro:bit.
19
Collect function planning sheets (both sides completed), repetition worksheets, and both sticky notes (BEFORE/AFTER). These are the week's formally assessed artifact. Facilitator checks: planning sheet complete, 3-sentence explanation written, block-count calculation recorded.
Assessment
Formative (During)
Observation: Does showAlert function display correctly when called from all 3 different event blocks? (consistency check - same function, multiple call points)
Does resetDisplay clear the screen correctly after each alert? (second function functionality check)
Was at least one repeated section in the T2 Week 5 project replaced with a function call? (refactoring check)
Block-count recorded before and after refactoring? Percentage reduction calculated? (maths check on sticky notes)
Exit Assessment
Facilitator asks each learner:
① 'Point to the function definition in your code - what is inside it?'
② 'How many places call this function?'
③ 'What was your block-count reduction percentage?' 3 points per learner - recorded on assessment log. This week counts as a formally weighted artifact per DDD Part 8.2 (Weekly Evidence Artifacts).
Differentiation
Support: Provide a half-built MakeCode project with the function structure already created and named; learner only adds blocks inside the function and adds call blocks to 2 events (reduced from 3). Skip the refactoring task - focus on building and calling the two new functions correctly. Extension: Add a parameter to the showAlert function - a number that controls how many times the LED flashes before clearing. Call the function with different parameter values from different events and observe the difference. Write a sentence explaining what a parameter is.
Key Vocabulary
function · define · call · reuse · refactor · decomposition · repetition · DRY · parameter · block count · efficiency · architecture
Safeguarding Note: Function names and any strings displayed via showAlert must be neutral and inclusive. Facilitator reviews all function content during the DELIVER phase - redirect any function that displays offensive, exclusionary, or personally identifying text. Remind learners that anything displayed on the Micro:bit LED during a class session is visible to all and must be appropriate for a shared learning environment.
Facilitator Name:
___________________________
Date Delivered:
___________________________
Signature:
___________________________
```
