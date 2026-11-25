# Lesson 3: Loops & Arithmetic Sequences – Code That Counts

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 3 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 3
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13
**Bloom's:** L3 Applying
**DDD ILO:** ILO 3.2 – Apply variables, for loops, while loops, and user-defined functions to solve a mathematical problem computationally, demonstrating the connection between code structure and arithmetic sequence
**NCDC:** Uganda NCDC P5–P6 – Mathematics Strand: Number sequences, times tables, multiplication; English Strand: Sequenced writing and oral explanation; ICT Strand: Repetition in programming
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Repetition (for loops, while loops); functions; tracing programme execution

**Big Idea:** A loop is a shortcut for repetition. The times table you know is an arithmetic sequence – and a for loop is the machine that generates it.

## Learning Objectives

- Write a for loop in Arduino Python syntax that counts from 1 to 10 and prints each number to the Serial Monitor
- Write a for loop that generates and prints the 7× times table (or any chosen multiplier) to the Serial Monitor
- Write a while loop that runs until a counter variable reaches 100
- Print the arithmetic sequence 3, 6, 9, 12, …, 60 using a for loop with correct step value
- Write a user-defined void function and call it from loop()
- Explain the connection between a for loop and an arithmetic sequence verbally to a partner

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- Printed "Loop Tracing Sheet" (A4 per pair) – for loop with blank table: iteration number | variable value | output
- Printed numbered list worksheet (A5 per learner) – to write sequential English instructions paralleling the for loop
- Times table result sheet (for peer-checking Serial Monitor output)
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Narrative sequencing parallel with code order: learners write a numbered list of English instructions that mirrors their for loop step-by-step. "Step 1: Start with i = 1. Step 2: Multiply i by 7. Step 3: Print the result. Step 4: Add 1 to i. Step 5: If i is still less than or equal to 10, go back to Step 2." Learners explain code steps aloud to their partner before uploading – "talking through code" is practised as an oral literacy skill.

**Maths:** Arithmetic sequences: first term, common difference, nth term. The for loop for(int i=3; i<=60; i+=3) generates the sequence 3, 6, 9, 12, … 60. Questions: What is the first term? What is the common difference? How many terms are there? What is the sum of the first 5 terms? Times tables as multiplication sequences: 7×1, 7×2, … 7×10 is an arithmetic sequence with first term 7 and common difference 7.

## Lesson Structure

### HOOK – The Robot That Counts (20 min)
1. Physical activity: facilitator counts to 10, learners clap on each number. "What rule did I follow?" (Add 1 each time.) "What if I said: add 3 each time?" Learners clap on 3, 6, 9, 12, 15…
2. Bridge: "A for loop does exactly this – it follows a rule and repeats until it reaches a target. Today we write the code that does what you just did with your hands."
3. Recap: draw a for loop diagram on the board. Three parts: START (i = 1), CONDITION (i <= 10), STEP (i++). Label each part. Learners copy the diagram.
4. Show the numbered list worksheet. "Before we code, we write the loop as numbered steps in plain English." Facilitator models one example on the board.
5. Pair programming roles: remind learners – rotate Driver/Navigator at each new task.
6. Challenge 1 – Count 1 to 10: Learners write a for loop that prints 1, 2, 3, … 10 to the Serial Monitor. Before coding, fill in the loop tracing sheet (iteration number | variable value | output). Upload and verify output matches the tracing sheet.

### GUIDED ACTIVITY – Three Loop Challenges (60 min)
7. Challenge 2 – Times Table Generator: Code a for loop that prints the 7× times table (or a chosen multiplier). Format: "7 x 1 = 7", "7 x 2 = 14", … using Serial.print() and Serial.println(). Peer-check against the printed times table result sheet.
8. Rotate Driver/Navigator.
9. Challenge 3 – Arithmetic Sequence 3, 6, 9, …, 60: Write the for loop with correct start, condition, and step. Learners answer on the tracing sheet: first term? common difference? number of terms? sum of first 5 terms?
10. While loop: write a while loop that starts with int counter = 0; and runs while counter < 100;, adding 1 each time and printing the value. Upload. Observe: how many lines appear in the Serial Monitor?
11. Numbered list task: learners write the English version of their times table loop as a numbered instruction list (parallel structure activity). Swap with partner to follow their instructions manually.

### INDEPENDENT WORK – Functions and Blink Challenge (50 min)
12. User-defined function task: write void countDown() { for(int i=10; i>=1; i--) { Serial.println(i); delay(500); } }. Call it from loop(). Upload and verify countdown appears in Serial Monitor.
13. Blink challenge: write a for loop inside loop() that makes the LED blink faster with each iteration – delay starts at 500ms and reduces by 50ms each time. What happens when delay reaches 0? Predict, then test.
14. Extension – summation function: write void sumToN(int n) that uses a for loop to calculate and print the sum of 1 + 2 + 3 + … + n. Call it with sumToN(10) and sumToN(20). Verify answers with hand calculation.
15. Facilitator circulates, checks loop syntax, asks: "What is the common difference in your sequence? Show me on the tracing sheet."
16. 2–3 pairs demonstrate their times table generator on the projected Serial Monitor. Class checks against the printed times table sheet.

### SHOWCASE & DEBRIEF (30 min)
17. Verbal explanation task: one learner from each presenting pair must say: "This is like the [X] times table because each time the loop runs, it adds [X]. That makes it an arithmetic sequence with a common difference of [X]."
18. Facilitator restates English link: "You wrote a numbered instruction list that was identical to your for loop – that is how professional programmers write pseudocode and documentation."
19. Facilitator restates Math link: "A for loop with a step of 7 generates the 7 times table. Code and maths use the same rule: start + (common difference × how many times)."
20. Exit question (oral): "Explain to your partner: why is a for loop like an arithmetic sequence?" Facilitator listens to 3 pairs and notes responses.
21. Submit sketches via USB flash drive.

## Assessment

- Formative (During) | Loop tracing sheet: correct values for iteration, variable, and output before uploading (collected) | Serial Monitor output matches expected times table (checked during guided phase) | Numbered English instruction list mirrors for loop structure (checked by facilitator) | Verbal explanation: learner connects for loop to arithmetic sequence correctly (facilitator observation note)
- Exit Assessment | Sketch outputs a correctly formatted times table to Serial Monitor (verified by facilitator) | Arithmetic sequence 3, 6, 9, …, 60 printed correctly with correct loop syntax | Learner explains verbally: "This is like the [X] times table because…" (observed and noted) | Sketch submitted via USB flash drive
- Differentiation | Support: Provide the for loop template with blanks: for(int i = ___; i <= ___; i += ___). Fill in for the 2× and 5× tables first, then choose their own. Give a partially filled loop tracing sheet. | Extension: Write a void multiplicationTable(int n) function that takes any multiplier and prints the full table. Call it three times with different values. Calculate and print the sum of each table using a running total variable.

## Key Vocabulary

for loop · while loop · iteration · counter · increment · step · arithmetic sequence · common difference · function · void · Serial Monitor · Serial.println()

## Safeguarding

Safeguarding Note: Ensure learners do not use personal data (names, ages, school details) in loop output strings. Use generic labels ("Student", "Value") or fictional data only. Remind learners: code written today may be seen by peers during the showcase.

## Full source extract (complete)

### Detail body

```
Write a for loop in Arduino Python syntax that counts from 1 to 10 and prints each number to the Serial Monitor
Write a for loop that generates and prints the 7× times table (or any chosen multiplier) to the Serial Monitor
Write a while loop that runs until a counter variable reaches 100
Print the arithmetic sequence 3, 6, 9, 12, …, 60 using a for loop with correct step value
Write a user-defined void function and call it from loop()
Explain the connection between a for loop and an arithmetic sequence verbally to a partner
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards + USB cables
Printed "Loop Tracing Sheet" (A4 per pair) – for loop with blank table: iteration number | variable value | output
Printed numbered list worksheet (A5 per learner) – to write sequential English instructions paralleling the for loop
Times table result sheet (for peer-checking Serial Monitor output)
USB flash drives
Facilitator device + projected screen
Physical activity: facilitator counts to 10, learners clap on each number. "What rule did I follow?" (Add 1 each time.) "What if I said: add 3 each time?" Learners clap on 3, 6, 9, 12, 15…
Bridge: "A for loop does exactly this – it follows a rule and repeats until it reaches a target. Today we write the code that does what you just did with your hands."
Recap: draw a for loop diagram on the board. Three parts: START (i = 1), CONDITION (i <= 10), STEP (i++). Label each part. Learners copy the diagram.
Show the numbered list worksheet. "Before we code, we write the loop as numbered steps in plain English." Facilitator models one example on the board.
Pair programming roles: remind learners – rotate Driver/Navigator at each new task.
Challenge 1 – Count 1 to 10: Learners write a for loop that prints 1, 2, 3, … 10 to the Serial Monitor. Before coding, fill in the loop tracing sheet (iteration number | variable value | output). Upload and verify output matches the tracing sheet.
Challenge 2 – Times Table Generator: Code a for loop that prints the 7× times table (or a chosen multiplier). Format: "7 x 1 = 7", "7 x 2 = 14", … using Serial.print() and Serial.println(). Peer-check against the printed times table result sheet.
Rotate Driver/Navigator.
Challenge 3 – Arithmetic Sequence 3, 6, 9, …, 60: Write the for loop with correct start, condition, and step. Learners answer on the tracing sheet: first term? common difference? number of terms? sum of first 5 terms?
While loop: write a while loop that starts with int counter = 0; and runs while counter < 100;, adding 1 each time and printing the value. Upload. Observe: how many lines appear in the Serial Monitor?
Numbered list task: learners write the English version of their times table loop as a numbered instruction list (parallel structure activity). Swap with partner to follow their instructions manually.
User-defined function task: write void countDown() { for(int i=10; i>=1; i--) { Serial.println(i); delay(500); } }. Call it from loop(). Upload and verify countdown appears in Serial Monitor.
Blink challenge: write a for loop inside loop() that makes the LED blink faster with each iteration – delay starts at 500ms and reduces by 50ms each time. What happens when delay reaches 0? Predict, then test.
Extension – summation function: write void sumToN(int n) that uses a for loop to calculate and print the sum of 1 + 2 + 3 + … + n. Call it with sumToN(10) and sumToN(20). Verify answers with hand calculation.
Facilitator circulates, checks loop syntax, asks: "What is the common difference in your sequence? Show me on the tracing sheet."
2–3 pairs demonstrate their times table generator on the projected Serial Monitor. Class checks against the printed times table sheet.
Verbal explanation task: one learner from each presenting pair must say: "This is like the [X] times table because each time the loop runs, it adds [X]. That makes it an arithmetic sequence with a common difference of [X]."
Facilitator restates English link: "You wrote a numbered instruction list that was identical to your for loop – that is how professional programmers write pseudocode and documentation."
Facilitator restates Math link: "A for loop with a step of 7 generates the 7 times table. Code and maths use the same rule: start + (common difference × how many times)."
Exit question (oral): "Explain to your partner: why is a for loop like an arithmetic sequence?" Facilitator listens to 3 pairs and notes responses.
Submit sketches via USB flash drive.
for loop · while loop · iteration · counter · increment · step · arithmetic sequence · common difference · function · void · Serial Monitor · Serial.println()
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5 (Ages 10–12 · AI Engineers) | Lesson 3: Loops & Arithmetic Sequences – Code That Counts
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 1 · Week 3
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13 | Bloom's Level | L3 Applying
NCDC Ref | Uganda NCDC P5–P6 – Mathematics Strand: Number sequences, times tables, multiplication; English Strand: Sequenced writing and oral explanation; ICT Strand: Repetition in programming | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Repetition (for loops, while loops); functions; tracing programme execution
DDD ILO | ILO 3.2 – Apply variables, for loops, while loops, and user-defined functions to solve a mathematical problem computationally, demonstrating the connection between code structure and arithmetic sequence | Big Idea | A loop is a shortcut for repetition. The times table you know is an arithmetic sequence – and a for loop is the machine that generates it.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Narrative sequencing parallel with code order: learners write a numbered list of English instructions that mirrors their for loop step-by-step. "Step 1: Start with i = 1. Step 2: Multiply i by 7. Step 3: Print the result. Step 4: Add 1 to i. Step 5: If i is still less than or equal to 10, go back to Step 2." Learners explain code steps aloud to their partner before uploading – "talking through code" is practised as an oral literacy skill.
Maths | Arithmetic sequences: first term, common difference, nth term. The for loop for(int i=3; i<=60; i+=3) generates the sequence 3, 6, 9, 12, … 60. Questions: What is the first term? What is the common difference? How many terms are there? What is the sum of the first 5 terms? Times tables as multiplication sequences: 7×1, 7×2, … 7×10 is an arithmetic sequence with first term 7 and common difference 7.
LESSON STRUCTURE
HOOK – The Robot That Counts (20 min)
GUIDED ACTIVITY – Three Loop Challenges (60 min)
INDEPENDENT WORK – Functions and Blink Challenge (50 min)
SHOWCASE & DEBRIEF (30 min)
ASSESSMENT
Formative (During) | Loop tracing sheet: correct values for iteration, variable, and output before uploading (collected) | Serial Monitor output matches expected times table (checked during guided phase) | Numbered English instruction list mirrors for loop structure (checked by facilitator) | Verbal explanation: learner connects for loop to arithmetic sequence correctly (facilitator observation note)
Exit Assessment | Sketch outputs a correctly formatted times table to Serial Monitor (verified by facilitator) | Arithmetic sequence 3, 6, 9, …, 60 printed correctly with correct loop syntax | Learner explains verbally: "This is like the [X] times table because…" (observed and noted) | Sketch submitted via USB flash drive
Differentiation | Support: Provide the for loop template with blanks: for(int i = ___; i <= ___; i += ___). Fill in for the 2× and 5× tables first, then choose their own. Give a partially filled loop tracing sheet. | Extension: Write a void multiplicationTable(int n) function that takes any multiplier and prints the full table. Call it three times with different values. Calculate and print the sum of each table using a running total variable.
KEY VOCABULARY
Safeguarding Note: Ensure learners do not use personal data (names, ages, school details) in loop output strings. Use generic labels ("Student", "Value") or fictional data only. Remind learners: code written today may be seen by peers during the showcase.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
