# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Read a problem specification and decompose it into named sub-problems, each of which maps to a function in the final implementation
- Write a complete pseudocode algorithm for a given problem specification — using standard pseudocode conventions: WHILE, FOR, IF/ELSE, SET, INPUT, OUTPUT, CALL — with enough detail that a partner could implement it without seeing the specification
- Draw a flowchart for the same algorithm using correct notation: oval (start/end), rectangle (process), diamond (decision), arrow (flow)
- Trace through the pseudocode with at least 2 distinct input scenarios and record the expected output for each — proving the algorithm is correct before any code is written
- Implement the algorithm in Arduino code, mapping each pseudocode line to one or more lines of code with a comment linking them: // Pseudocode line 7: IF temperature > threshold
- Evaluate the algorithm's efficiency: identify the best case (fewest decisions reached), the worst case (most decisions evaluated), and propose one optimisation with a justification

## Big idea
An algorithm is a precise plan written before you touch the keyboard. Every professional programme starts with an algorithm. Code without an algorithm is like building a house without a blueprint — it might stand, but it will not be what was intended.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables, LDR, TMP36, buzzer, 2 LEDs, resistors, breadboard, jumper wires
- Printed "Problem Specification Cards" (A5 for you) — 3 different problem specifications of increasing complexity, each 6–8 lines long, written in plain English
- Printed "Pseudocode Convention Reference Card" (A5 for you) — 8 pseudocode keywords with syntax examples: SET, INPUT, OUTPUT, IF/ELSE/ENDIF, WHILE/ENDWHILE, FOR/ENDFOR, CALL, RETURN
- Printed "Flowchart Template" (A4 for you) — pre-drawn oval start/end nodes and blank rectangle/diamond shapes to complete
- Printed "Algorithm Trace Table" (A4 for you) — columns: Step | Variable values | Output | Decision taken
- Printed "Algorithm Efficiency Evaluation" (A5 for you) — two rows: Best Case / Worst Case with decision count and justification space
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Pseudocode as a formal writing register: pseudocode uses a fixed vocabulary (SET, IF, WHILE, CALL, RETURN) that is more constrained than natural language but less constrained than code syntax. Writing correct pseudocode requires precision — every variable must be named before it is used, every decision must have both branches, every loop must have a clearly stated termination condition. Reading a problem specification and translating it into pseudocode is an act of analytical reading: "What inputs does the problem describe? What outputs are required? What decisions must be made? What repeats?" These are comprehension questions applied to a technical document. The flowchart is a visual representation of the same algorithm — you must produce both and confirm they agree. A pseudocode and flowchart that contradict each other indicate an ambiguity in the algorithm that must be resolved before coding.
- **Maths:** Algorithm efficiency analysis at an accessible level: the best case is the scenario where the algorithm terminates fastest (fewest decisions, fewest loop iterations). The worst case is where it terminates slowest. For a search algorithm: best case — target found at index 0 (1 comparison); worst case — target at last index or not found (n comparisons for an array of n elements). This introduces O(n) complexity informally. Threshold optimisation: yourselfification thresholds (e.g. temperature > 28°C for "hot") affect how often each branch is taken. A threshold set too low means the "hot" branch is taken almost always — making the "cool" branch effectively dead code. You calculate: if the temperature sensor returns values between 23°C and 35°C in a typical Kampala classroom, what threshold value divides the dataset most evenly? Answer: the median of the range = (23+35)÷2 = 29°C.

## Let's begin

### WARM-UP & REVIEW — Algorithms Before Code  (20 min)
1. Open with a question: "Imagine you want to bake a mandazi. Do you start by lighting the fire and then decide what ingredients to use? Or do you plan the recipe first?" Algorithms are recipes. Code is the cooking. "Every programme you have written this year was based on an algorithm — but in Terms One and Two, you wrote the algorithm informally, as numbered steps in a design brief. Today you write algorithms formally, using an internationally recognised notation."
2. Introduce the pseudocode convention reference card. You model translating one sentence of English into pseudocode on the board: "The programme reads the temperature and if it is above 28°C it turns the buzzer on." -> SET temperature TO INPUT(A1) / IF temperature > 28 THEN / OUTPUT(buzzer, ON) / ELSE / OUTPUT(buzzer, OFF) / ENDIF. You annotate the reference card with the example.
3. Introduce flowchart symbols (3 min): oval = start or end; rectangle = process (SET, OUTPUT, CALL); diamond = decision (IF, WHILE); arrow = direction of flow. Draw a 4-node example on the board. You copy.
4. Problem specification distribution: give each pair the Specification Cards. "Read all 3 specifications. Choose the one your pair will work on. Each specification describes a real-world sensing problem. You must design the algorithm — not code it — in the first half of this session."
5. Decomposition (10 min): you read their chosen specification and identify the sub-problems. Write these as function names on the pseudocode sheet: e.g. READ_SENSORS(), CLASSIFY_ENVIRONMENT(), TRIGGER_OUTPUT(), LOG_TO_SERIAL(). Check: "Does every sub-problem have a single, clear job? Could you explain each function's purpose in one sentence?"

### GUIDED ACTIVITY — Pseudocode, Flowchart, and Trace  (60 min)
6. Pseudocode writing (20 min): using the convention reference card, you write the full pseudocode for their chosen specification. Every variable must be named before use. Every IF must have an ELSE. Every WHILE must have a condition that can become false. Every sub-problem function must appear as a CALL statement in the main algorithm. Check your work carefully: "Can I understand what this algorithm does without reading the specification? Is every decision explicit?"
7. Flowchart drawing (10 min): translate the pseudocode into a flowchart on the printed template. Every diamond must have two labelled arrows (YES/NO or TRUE/FALSE). The flow must start at the start oval and end at the end oval with no dangling arrows.
8. Algorithm trace (20 min): using the trace table, you trace through the pseudocode for TWO distinct input scenarios. Scenario 1: LDR reads 750 (bright), temperature reads 31°C. Scenario 2: LDR reads 200 (dark), temperature reads 24°C. For each scenario, fill in every row of the trace table: Step number, variable values at that step, any output triggered, decision taken at each diamond. Confirm: does the algorithm produce the correct output for both scenarios? If not, identify the error and correct the pseudocode before proceeding.
9. Arduino implementation (25 min): translate the verified pseudocode into an Arduino sketch. Every pseudocode line must have a corresponding comment in the code: // PSEUDOCODE LINE 5: IF temperature > threshold. Every function named in the pseudocode becomes a named void function in the sketch. Upload and test with the physical circuit. Verify: does the hardware behave as predicted by the trace table for both scenarios?
10. If the hardware behaviour differs from the trace prediction: do not change the code first — revisit the pseudocode. Find which pseudocode line produced the discrepancy and correct it there first. Then update the code. "The algorithm is the source of truth — not the code."

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Open with a question: "Imagine you want to bake a mandazi. Do you start by lighting the fire and then decide what ingredients to use? Or do you plan the recipe first?" Algorithms are recipes. Code is the cooking. "Every programme you have written this year was based on an algorithm — but in Terms One and Two, you wrote the algorithm informally, as numbered steps in a design brief. Today you write algorithms formally, using an internationally recognised notation."
2. Introduce the pseudocode convention reference card. You model translating one sentence of English into pseudocode on the board: "The programme reads the temperature and if it is above 28°C it turns the buzzer on." -> SET temperature TO INPUT(A1) / IF temperature > 28 THEN / OUTPUT(buzzer, ON) / ELSE / OUTPUT(buzzer, OFF) / ENDIF. You annotate the reference card with the example.
3. Introduce flowchart symbols (3 min): oval = start or end; rectangle = process (SET, OUTPUT, CALL); diamond = decision (IF, WHILE); arrow = direction of flow. Draw a 4-node example on the board. You copy.
4. Problem specification distribution: give each pair the Specification Cards. "Read all 3 specifications. Choose the one your pair will work on. Each specification describes a real-world sensing problem. You must design the algorithm — not code it — in the first half of this session."
5. Decomposition (10 min): you read their chosen specification and identify the sub-problems. Write these as function names on the pseudocode sheet: e.g. READ_SENSORS(), CLASSIFY_ENVIRONMENT(), TRIGGER_OUTPUT(), LOG_TO_SERIAL(). Check: "Does every sub-problem have a single, clear job? Could you explain each function's purpose in one sentence?"
6. Pseudocode writing (20 min): using the convention reference card, you write the full pseudocode for their chosen specification. Every variable must be named before use. Every IF must have an ELSE. Every WHILE must have a condition that can become false. Every sub-problem function must appear as a CALL statement in the main algorithm. Check your work carefully: "Can I understand what this algorithm does without reading the specification? Is every decision explicit?"
7. Flowchart drawing (10 min): translate the pseudocode into a flowchart on the printed template. Every diamond must have two labelled arrows (YES/NO or TRUE/FALSE). The flow must start at the start oval and end at the end oval with no dangling arrows.
8. Algorithm trace (20 min): using the trace table, you trace through the pseudocode for TWO distinct input scenarios. Scenario 1: LDR reads 750 (bright), temperature reads 31°C. Scenario 2: LDR reads 200 (dark), temperature reads 24°C. For each scenario, fill in every row of the trace table: Step number, variable values at that step, any output triggered, decision taken at each diamond. Confirm: does the algorithm produce the correct output for both scenarios? If not, identify the error and correct the pseudocode before proceeding.
9. Arduino implementation (25 min): translate the verified pseudocode into an Arduino sketch. Every pseudocode line must have a corresponding comment in the code: // PSEUDOCODE LINE 5: IF temperature > threshold. Every function named in the pseudocode becomes a named void function in the sketch. Upload and test with the physical circuit. Verify: does the hardware behave as predicted by the trace table for both scenarios?
10. If the hardware behaviour differs from the trace prediction: do not change the code first — revisit the pseudocode. Find which pseudocode line produced the discrepancy and correct it there first. Then update the code. "The algorithm is the source of truth — not the code."
