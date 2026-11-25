# Week 3 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write a for loop in Arduino Python syntax that counts from 1 to 10 and prints each number to the Serial Monitor
- Write a for loop that generates and prints the 7× times table (or any chosen multiplier) to the Serial Monitor
- Write a while loop that runs until a counter variable reaches 100
- Print the arithmetic sequence 3, 6, 9, 12, …, 60 using a for loop with correct step value
- Write a user-defined void function and call it from loop()
- Explain the connection between a for loop and an arithmetic sequence verbally to a partner

## Continue

### INDEPENDENT WORK – Functions and Blink Challenge (50 min)
1. Numbered list task: you write the English version of their times table loop as a numbered instruction list (parallel structure activity). Swap with partner to follow their instructions manually.
2. User-defined function task: write void countDown() { for(int i=10; i>=1; i--) { Serial.println(i); delay(500); } }. Call it from loop(). Upload and verify countdown appears in Serial Monitor.
3. Blink challenge: write a for loop inside loop() that makes the LED blink faster with each iteration – delay starts at 500ms and reduces by 50ms each time. What happens when delay reaches 0? Predict, then test.
4. Extension – summation function: write void sumToN(int n) that uses a for loop to calculate and print the sum of 1 + 2 + 3 + … + n. Call it with sumToN(10) and sumToN(20). Verify answers with hand calculation.
5. Check your work carefully, checks loop syntax, asks: "What is the common difference in your sequence? Show me on the tracing sheet."
6. 2–3 you demonstrate their times table generator on the projected Serial Monitor. Class checks against the printed times table sheet.

### SHOWCASE & DEBRIEF (30 min)
7. Verbal explanation task: one learner from each presenting pair must say: "This is like the [X] times table because each time the loop runs, it adds [X]. That makes it an arithmetic sequence with a common difference of [X]."
8. Remember English link: "You wrote a numbered instruction list that was identical to your for loop – that is how professional programmers write pseudocode and documentation."
9. Remember Math link: "A for loop with a step of 7 generates the 7 times table. Code and maths use the same rule: start + (common difference × how many times)."
10. Exit question (oral): "Explain to your partner: why is a for loop like an arithmetic sequence?" You listens to 3 you and notes responses.
11. Submit sketches via USB flash drive.

## All Lesson 2 steps (complete list)

1. Numbered list task: you write the English version of their times table loop as a numbered instruction list (parallel structure activity). Swap with partner to follow their instructions manually.
2. User-defined function task: write void countDown() { for(int i=10; i>=1; i--) { Serial.println(i); delay(500); } }. Call it from loop(). Upload and verify countdown appears in Serial Monitor.
3. Blink challenge: write a for loop inside loop() that makes the LED blink faster with each iteration – delay starts at 500ms and reduces by 50ms each time. What happens when delay reaches 0? Predict, then test.
4. Extension – summation function: write void sumToN(int n) that uses a for loop to calculate and print the sum of 1 + 2 + 3 + … + n. Call it with sumToN(10) and sumToN(20). Verify answers with hand calculation.
5. Check your work carefully, checks loop syntax, asks: "What is the common difference in your sequence? Show me on the tracing sheet."
6. 2–3 you demonstrate their times table generator on the projected Serial Monitor. Class checks against the printed times table sheet.
7. Verbal explanation task: one learner from each presenting pair must say: "This is like the [X] times table because each time the loop runs, it adds [X]. That makes it an arithmetic sequence with a common difference of [X]."
8. Remember English link: "You wrote a numbered instruction list that was identical to your for loop – that is how professional programmers write pseudocode and documentation."
9. Remember Math link: "A for loop with a step of 7 generates the 7 times table. Code and maths use the same rule: start + (common difference × how many times)."
10. Exit question (oral): "Explain to your partner: why is a for loop like an arithmetic sequence?" You listens to 3 you and notes responses.
11. Submit sketches via USB flash drive.

## Check your understanding
- Formative (During) | Loop tracing sheet: correct values for iteration, variable, and output before uploading (collected) | Serial Monitor output matches expected times table (checked during guided phase) | Numbered English instruction list mirrors for loop structure (checked by you) | Verbal explanation: learner connects for loop to arithmetic sequence correctly (you observation note)
- Exit Assessment | Sketch outputs a correctly formatted times table to Serial Monitor (verified by you) | Arithmetic sequence 3, 6, 9, …, 60 printed correctly with correct loop syntax | Learner explains verbally: "This is like the [X] times table because…" (observed and noted) | Sketch submitted via USB flash drive
- Differentiation | Support: Provide the for loop template with blanks: for(int i = ___; i <= ___; i += ___). Fill in for the 2× and 5× tables first, then choose your own. Give a partially filled loop tracing sheet. | Extension: Write a void multiplicationTable(int n) function that takes any multiplier and prints the full table. Call it three times with different values. Calculate and print the sum of each table using a running total variable.

## Key words to remember
for loop · while loop · iteration · counter · increment · step · arithmetic sequence · common difference · function · void · Serial Monitor · Serial.println()

## Stay safe
Safeguarding Note: Ensure you do not use personal data (names, ages, school details) in loop output strings. Use generic labels ("Student", "Value") or fictional data only. Remind you: code written today may be seen by peers during the showcase.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
