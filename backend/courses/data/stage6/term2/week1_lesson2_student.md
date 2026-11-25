# Week 1 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Define and call a user-defined void function with at least one parameter that controls LED behaviour
- Write a function with a return value (int or float) and use the returned value in a calculation printed to the Serial Monitor
- Decompose a 3-LED traffic light sequence into three separate named functions: redLight(), amberLight(), greenLight()
- Read a 20-line modular sketch and produce an annotated diagram showing: function names, parameters, return types, and call order
- Evaluate two versions of the same programme (monolithic vs modular) and write a paragraph explaining which is preferable and why
- Identify and fix a function that has a logic error caused by an incorrect return value

## Continue

### 2. GUIDED ACTIVITY
1. You verify: if r=3000, a=1000, g=2000, total = 6000ms = 6 seconds.
### 3. INDEPENDENT / PAIR WORK
2. Decompose, Evaluate & Debug
3. Task 1 (20 min): Complete the Code Decomposition Worksheet — draw a function diagram for each of the 3 traffic light functions and the totalCycleTime() function. Label: name, parameters, return type, what it does in one sentence.
4. Task 2 (15 min): Write the Evaluation Paragraph — using the writing frame, compare the monolithic and modular versions. Minimum 6 sentences. Must include: one concrete example of why modularity helps, one reference to the math/function notation parallel.
5. Task 3 (10 min): Debug challenge — provided sketch has a function that returns the wrong value because of an operator precedence error. You trace through the function manually on paper, identify the bug, fix it, upload and verify.
6. Task 4 (Extension, 5 min): Write a new function float minutesToSeconds(float minutes) — returns the number of seconds. Call it and use the result in a delay(). Write a comment on every line.
7. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
8. 2 you demonstrate their traffic light — you changes a parameter value live: "I need the green phase to be 4 seconds. Which line do I change?" Pair answers immediately — this is the power of modular code.
9. One pair reads their evaluation paragraph aloud. Class evaluates: did it use a concrete example? Did it reference function notation?
10. Math close: write on board — int totalCycleTime(int r, int a, int g). Ask: "If I call this function 100 times with different values, how many lines of code do I need to write the calculation?" Answer: still 1 line inside the function. Connect: that is why functions reduce errors.
11. English close: "Evaluative writing explains WHY, not just WHAT. 'The modular version is better' is an opinion. 'The modular version is better because editing one function does not affect the others' is an argument."
12. Collect Code Decomposition Worksheets and Evaluation Paragraphs as this week's artifact.

## All Lesson 2 steps (complete list)

1. You verify: if r=3000, a=1000, g=2000, total = 6000ms = 6 seconds.
2. Decompose, Evaluate & Debug
3. Task 1 (20 min): Complete the Code Decomposition Worksheet — draw a function diagram for each of the 3 traffic light functions and the totalCycleTime() function. Label: name, parameters, return type, what it does in one sentence.
4. Task 2 (15 min): Write the Evaluation Paragraph — using the writing frame, compare the monolithic and modular versions. Minimum 6 sentences. Must include: one concrete example of why modularity helps, one reference to the math/function notation parallel.
5. Task 3 (10 min): Debug challenge — provided sketch has a function that returns the wrong value because of an operator precedence error. You trace through the function manually on paper, identify the bug, fix it, upload and verify.
6. Task 4 (Extension, 5 min): Write a new function float minutesToSeconds(float minutes) — returns the number of seconds. Call it and use the result in a delay(). Write a comment on every line.
7. Rotate Driver/Navigator between Tasks 1 and 2.
8. 2 you demonstrate their traffic light — you changes a parameter value live: "I need the green phase to be 4 seconds. Which line do I change?" Pair answers immediately — this is the power of modular code.
9. One pair reads their evaluation paragraph aloud. Class evaluates: did it use a concrete example? Did it reference function notation?
10. Math close: write on board — int totalCycleTime(int r, int a, int g). Ask: "If I call this function 100 times with different values, how many lines of code do I need to write the calculation?" Answer: still 1 line inside the function. Connect: that is why functions reduce errors.
11. English close: "Evaluative writing explains WHY, not just WHAT. 'The modular version is better' is an opinion. 'The modular version is better because editing one function does not affect the others' is an argument."
12. Collect Code Decomposition Worksheets and Evaluation Paragraphs as this week's artifact.

## Check your understanding
- Evidence Required
- Formative
- (During)
- Traffic light sketch compiles, uploads, and cycles correctly using 3 separate named functions. totalCycleTime() returns the correct value printed to Serial Monitor.
- Your own check log. Sketch verified before pair moves to worksheet tasks.
- Term 2 Week 1
- Artifact
- Code Decomposition Worksheet (all 4 functions diagrammed) + Evaluation Paragraph (min. 6 sentences, concrete example, math connection). Scored on 5-point artifact rubric (DDD Part 8.3).
- Physical documents collected. Both components required for a complete artifact submission.
- Differentiation
- Support: provide function headers pre-written — you complete the body only. Extension: write a function that takes a string parameter and prints a formatted traffic light status report to Serial Monitor.
- Extension: function compiles and produces correctly formatted Serial Monitor output.

## Key words to remember
function · parameter · argument · return value · return type · void · modular · decomposition · monolithic · call · function notation · f(x) · operator precedence ⚠  Safeguarding Note Ensure all LED wiring uses resistors — red/yellow/green LEDs without resistors will burn out instantly and may startle you. You checks all wiring before upload. Pair programming: Navigator must not be passive — they should be annotating the Code Decomposition Worksheet while the Driver types. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
