# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write a nested for loop that generates and prints a full multiplication table grid (1–10 × 1–10) to Serial Monitor
- Trace a nested loop on paper, filling in a table showing the value of both loop variables (i and j) at each iteration
- Write a nested loop that generates the first 6 triangular numbers (1, 3, 6, 10, 15, 21) using summation
- Write a loop that generates a pattern of asterisks (e.g. a right-angled triangle of asterisks) printed row by row to Serial Monitor
- Evaluate the computational cost of a nested loop: given n outer iterations and m inner iterations, calculate total iterations as n × m and relate this to Bloom's Level 5 algorithmic thinking
- Write a user-defined function that encapsulates a nested loop and accepts row and column count as parameters

## Big idea
A loop inside a loop multiplies everything. One loop runs 10 times. A loop inside that loop runs 10 × 10 = 100 times. Understanding nested loops is understanding multiplication — and understanding why some programmes run slowly.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- Printed "Nested Loop Trace Table" (A4 for you) — grid with columns: outer loop i | inner loop j | action | iteration count
- Printed "Multiplication Grid" (A4 for you) — blank 10×10 grid for hand-filling the times table before coding
- Printed "Triangular Numbers Sequence" worksheet (A5 for you) — first 6 triangular numbers with space to show the summation calculation
- Printed "Asterisk Pattern Challenge Cards" (A5 for you) — 3 pattern targets to replicate in Serial Monitor output
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Sequenced technical explanation: you must explain nested loop execution aloud to yourself step by step before uploading any sketch. "The outer loop starts at i = 1. While i is less than or equal to 10, the inner loop runs. The inner loop starts at j = 1. While j is less than or equal to 10, it prints i × j and moves to the next j. When j reaches 11, the inner loop ends. Then i increases by 1 and the inner loop starts again from j = 1." This oral explanation precedes every coding task. Translating procedural logic into clear, ordered English is treated as an explicit literacy objective.
- **Maths:** Nested loops as multiplication: for(int i=1; i<=10; i++) { for(int j=1; j<=10; j++) { Serial.print(i*j); } } — this is the full multiplication table. Total iterations: 10 × 10 = 100. Triangular numbers: T(n) = 1 + 2 + 3 + ... + n = n(n+1)/2. The nested loop that generates them uses a running sum. Square numbers: for a square pattern of asterisks n×n, total characters printed = n². Computational cost analysis: if n = 100 and m = 100, the inner loop body runs 10,000 times — compared to a single loop that runs 100 times. This introduces the concept of O(n²) complexity, framed accessibly as "why some programmes feel slower."

## Let's begin

### WARM-UP & REVIEW — Loops Within Loops  (20 min)
1. Physical activity: stand in a circle. You says "outer loop starts — stand up and sit down 3 times while I count the inner loop." You sit and stand 3 times as the outer loop runs once. Total stands: 3 × 3 = 9 (for 3 outer iterations). Ask: "If the outer loop runs 5 times and the inner loop runs 4 times, how many total actions happen?" (20.) Connect: "That is a nested loop. Today you write them in code."
2. Get ready to use the blank multiplication grid. You have 3 minutes to hand-fill the 10×10 times table. They already know it — the task is to recognise it as a 2D pattern they can generate with code. "Every cell in this grid is i × j. Two nested loops will fill this entire table."
3. Trace table introduction (5 min): distribute the nested loop trace table. Follow the demonstration steps how to fill in one row: outer i=1, inner j=1, action = print 1×1=1, iteration count = 1. You continue for the next 5 iterations independently.
4. Bridge: "The trace table is how professional software engineers debug nested loops. Before you write the code, trace it on paper. Before you upload, you should already know exactly what the output will be."
5. Multiplication table sketch (15 min): you live-codes the nested for loop. for(int i=1; i<=10; i++) { for(int j=1; j<=10; j++) { Serial.print(i*j); Serial.print("\t"); } Serial.println(); }. Upload. Observe: does the Serial Monitor output match the hand-filled grid? Ask: "What does \t do? What does the outer Serial.println() do?" You annotate both loop declarations with a plain-English comment.
6. Computational cost discussion (5 min): "How many times does the inner print line execute?" (100.) "If the outer loop ran 100 times and the inner loop ran 100 times, how many executions?" (10,000.) "This is called a quadratic cost — O(n²). It grows very fast. A good programmer always asks: can I do this with fewer loops?"

### GUIDED ACTIVITY — Multiplication Table and Pattern Generation  (60 min)
7. Triangular numbers (15 min): distribute the triangular numbers worksheet. You hand-calculate T(1) through T(6) using the formula T(n) = n(n+1)/2. Then write a sketch that generates the same sequence using a nested loop with a running sum variable. Print each triangular number to Serial Monitor. Verify: does the output match the worksheet?
8. Asterisk pattern challenge (10 min): distribute the pattern challenge cards. Challenge 1 — right-angled triangle: row 1 has 1 asterisk, row 2 has 2, row 3 has 3, up to row 5. The outer loop controls the row; the inner loop prints the asterisks. Upload and verify.
9. Rotate your own pacing. New driver leads Challenge 2: rectangle of asterisks n × m where n and m are variables declared at the top of the sketch.
10. Function encapsulation task: write void printGrid(int rows, int cols) that uses a nested loop to print an asterisk grid of any dimensions. Call it three times with different row and column values. Calculate and print the total number of asterisks for each call using rows × cols.
11. Triangular pattern extension: modify the asterisk triangle so it prints an inverted triangle (row 1 has 5, row 2 has 4, down to row 5 with 1). Which variable changes — the inner loop start or the inner loop condition? Predict before coding.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Physical activity: stand in a circle. You says "outer loop starts — stand up and sit down 3 times while I count the inner loop." You sit and stand 3 times as the outer loop runs once. Total stands: 3 × 3 = 9 (for 3 outer iterations). Ask: "If the outer loop runs 5 times and the inner loop runs 4 times, how many total actions happen?" (20.) Connect: "That is a nested loop. Today you write them in code."
2. Get ready to use the blank multiplication grid. You have 3 minutes to hand-fill the 10×10 times table. They already know it — the task is to recognise it as a 2D pattern they can generate with code. "Every cell in this grid is i × j. Two nested loops will fill this entire table."
3. Trace table introduction (5 min): distribute the nested loop trace table. Follow the demonstration steps how to fill in one row: outer i=1, inner j=1, action = print 1×1=1, iteration count = 1. You continue for the next 5 iterations independently.
4. Bridge: "The trace table is how professional software engineers debug nested loops. Before you write the code, trace it on paper. Before you upload, you should already know exactly what the output will be."
5. Multiplication table sketch (15 min): you live-codes the nested for loop. for(int i=1; i<=10; i++) { for(int j=1; j<=10; j++) { Serial.print(i*j); Serial.print("\t"); } Serial.println(); }. Upload. Observe: does the Serial Monitor output match the hand-filled grid? Ask: "What does \t do? What does the outer Serial.println() do?" You annotate both loop declarations with a plain-English comment.
6. Computational cost discussion (5 min): "How many times does the inner print line execute?" (100.) "If the outer loop ran 100 times and the inner loop ran 100 times, how many executions?" (10,000.) "This is called a quadratic cost — O(n²). It grows very fast. A good programmer always asks: can I do this with fewer loops?"
7. Triangular numbers (15 min): distribute the triangular numbers worksheet. You hand-calculate T(1) through T(6) using the formula T(n) = n(n+1)/2. Then write a sketch that generates the same sequence using a nested loop with a running sum variable. Print each triangular number to Serial Monitor. Verify: does the output match the worksheet?
8. Asterisk pattern challenge (10 min): distribute the pattern challenge cards. Challenge 1 — right-angled triangle: row 1 has 1 asterisk, row 2 has 2, row 3 has 3, up to row 5. The outer loop controls the row; the inner loop prints the asterisks. Upload and verify.
9. Rotate your own pacing. New driver leads Challenge 2: rectangle of asterisks n × m where n and m are variables declared at the top of the sketch.
10. Function encapsulation task: write void printGrid(int rows, int cols) that uses a nested loop to print an asterisk grid of any dimensions. Call it three times with different row and column values. Calculate and print the total number of asterisks for each call using rows × cols.
11. Triangular pattern extension: modify the asterisk triangle so it prints an inverted triangle (row 1 has 5, row 2 has 4, down to row 5 with 1). Which variable changes — the inner loop start or the inner loop condition? Predict before coding.
