# Week 3 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write a nested for loop that generates and prints a full multiplication table grid (1–10 × 1–10) to Serial Monitor
- Trace a nested loop on paper, filling in a table showing the value of both loop variables (i and j) at each iteration
- Write a nested loop that generates the first 6 triangular numbers (1, 3, 6, 10, 15, 21) using summation
- Write a loop that generates a pattern of asterisks (e.g. a right-angled triangle of asterisks) printed row by row to Serial Monitor
- Evaluate the computational cost of a nested loop: given n outer iterations and m inner iterations, calculate total iterations as n × m and relate this to Bloom's Level 5 algorithmic thinking
- Write a user-defined function that encapsulates a nested loop and accepts row and column count as parameters

## Continue

### INDEPENDENT WORK — Functions, Patterns, and Efficiency  (50 min)
1. Square numbers challenge: write a sketch that prints the first 10 square numbers (1, 4, 9, 16, 25, 36, 49, 64, 81, 100) using a for loop with the formula i*i. Then verify with a nested loop that generates n×n grids and counts asterisks. Do both methods give the same result?
2. LED blink pattern using nested loops: outer loop controls the number of blink groups; inner loop controls blinks per group. blinkGroup(3, 5) means 3 groups of 5 fast blinks each, with a 1-second pause between groups. Write this using nested loops.
3. Check your work carefully. Ask: "How many total blinks does your programme produce? Calculate it before uploading." Observe participation, note on participation log.
4. Extension: write a function void printPascalRow(int row) that prints the nth row of Pascal's triangle using the combination formula. Print the first 6 rows. Identify where triangular numbers appear in Pascal's triangle.
5. 2–3 you project their Serial Monitor output for the multiplication table. Class verifies 3 random cells: "What is in row 7, column 8? Does the output show 56 there?" Map back to the hand-filled grid.
6. You present their asterisk pattern of choice. Class evaluates: "Did the pattern match the challenge card? How many iterations did the nested loop perform to produce this output?"

### SHOWCASE & DEBRIEF  (30 min)
7. Efficiency discussion: you poses the problem — "I want to print the 12 times table. I could use 12 Serial.print() statements. Or I could use one for loop with 12 iterations. Or I could use a nested loop that generates all tables at once. Which approach is best and why?" You debate on your own and share.
8. Remember English link: "Every time you explained a loop step-by-step in plain English before uploading, you were writing pseudocode. Pseudocode is one of the most important skills in professional software development. Today you used it for complex nested loops."
9. Remember Math link: "Triangular numbers, square numbers, multiplication tables — all of these are mathematical sequences that nested loops can generate. The code structure mirrors the mathematical structure. The outer loop is the row; the inner loop is the column; the cell value is the mathematical relationship."
10. Exit question (on trace table reverse): "A nested loop has outer range 1–6 and inner range 1–6. How many total iterations? Show your calculation." Collect as formative evidence.
11. Submit all sketches and worksheets via USB flash drive.

## All Lesson 2 steps (complete list)

1. Square numbers challenge: write a sketch that prints the first 10 square numbers (1, 4, 9, 16, 25, 36, 49, 64, 81, 100) using a for loop with the formula i*i. Then verify with a nested loop that generates n×n grids and counts asterisks. Do both methods give the same result?
2. LED blink pattern using nested loops: outer loop controls the number of blink groups; inner loop controls blinks per group. blinkGroup(3, 5) means 3 groups of 5 fast blinks each, with a 1-second pause between groups. Write this using nested loops.
3. Check your work carefully. Ask: "How many total blinks does your programme produce? Calculate it before uploading." Observe participation, note on participation log.
4. Extension: write a function void printPascalRow(int row) that prints the nth row of Pascal's triangle using the combination formula. Print the first 6 rows. Identify where triangular numbers appear in Pascal's triangle.
5. 2–3 you project their Serial Monitor output for the multiplication table. Class verifies 3 random cells: "What is in row 7, column 8? Does the output show 56 there?" Map back to the hand-filled grid.
6. You present their asterisk pattern of choice. Class evaluates: "Did the pattern match the challenge card? How many iterations did the nested loop perform to produce this output?"
7. Efficiency discussion: you poses the problem — "I want to print the 12 times table. I could use 12 Serial.print() statements. Or I could use one for loop with 12 iterations. Or I could use a nested loop that generates all tables at once. Which approach is best and why?" You debate on your own and share.
8. Remember English link: "Every time you explained a loop step-by-step in plain English before uploading, you were writing pseudocode. Pseudocode is one of the most important skills in professional software development. Today you used it for complex nested loops."
9. Remember Math link: "Triangular numbers, square numbers, multiplication tables — all of these are mathematical sequences that nested loops can generate. The code structure mirrors the mathematical structure. The outer loop is the row; the inner loop is the column; the cell value is the mathematical relationship."
10. Exit question (on trace table reverse): "A nested loop has outer range 1–6 and inner range 1–6. How many total iterations? Show your calculation." Collect as formative evidence.
11. Submit all sketches and worksheets via USB flash drive.

## Check your understanding
- Formative | (During) | Nested loop trace table: correctly filled for at least 10 iterations before any coding (collected) | Multiplication grid: hand-filled 10×10 grid compared against Serial Monitor output (checked during guided phase) | Triangular numbers worksheet: T(1)–T(6) hand-calculated before code is written (collected) | Exit calculation: n × m total iterations calculated correctly with working shown (collected)
- Exit Assessment | Multiplication table nested loop: correct 10×10 output to Serial Monitor (verified by you) | Triangular numbers sketch: first 6 triangular numbers correct and matching worksheet calculations (verified) | printGrid(rows, cols) function: works with at least 2 different row/column inputs (verified) | All materials submitted via USB flash drive
- Differentiation | Support: Provide the outer loop code complete and ask you to write only the inner loop. For the trace table, pre-fill the first 5 rows and ask you to complete the next 5. Reduce the multiplication table to 5×5 before attempting 10×10. | Extension: Research and implement the Sieve of Eratosthenes using a boolean array and nested loops to find all prime numbers up to 100. Print the primes to Serial Monitor. Count how many there are. Verify with a known prime table. Calculate the ratio of primes to total numbers up to 100 as a percentage.

## Key words to remember
nested loop · outer loop · inner loop · iteration count · triangular number · square number · computational cost · O(n²) · summation · trace table · pattern · grid

## Stay safe
Safeguarding Note: The asterisk pattern and Serial Monitor output tasks are abstract and do not involve personal data. Remind you that complex nested loops can make a programme run slowly or freeze the Arduino — if the Arduino stops responding, disconnect USB and reconnect. Do not hold the USB cable for extended periods while the board is running.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
