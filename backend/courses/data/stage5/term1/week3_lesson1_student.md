# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write a for loop in Arduino Python syntax that counts from 1 to 10 and prints each number to the Serial Monitor
- Write a for loop that generates and prints the 7× times table (or any chosen multiplier) to the Serial Monitor
- Write a while loop that runs until a counter variable reaches 100
- Print the arithmetic sequence 3, 6, 9, 12, …, 60 using a for loop with correct step value
- Write a user-defined void function and call it from loop()
- Explain the connection between a for loop and an arithmetic sequence verbally to a partner

## Big idea
A loop is a shortcut for repetition. The times table you know is an arithmetic sequence – and a for loop is the machine that generates it.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- Printed "Loop Tracing Sheet" (A4 for you) – for loop with blank table: iteration number | variable value | output
- Printed numbered list worksheet (A5 for you) – to write sequential English instructions paralleling the for loop
- Times table result sheet (for peer-checking Serial Monitor output)
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Narrative sequencing parallel with code order: you write a numbered list of English instructions that mirrors their for loop step-by-step. "Step 1: Start with i = 1. Step 2: Multiply i by 7. Step 3: Print the result. Step 4: Add 1 to i. Step 5: If i is still less than or equal to 10, go back to Step 2." You explain code steps aloud to yourself before uploading – "talking through code" is practised as an oral literacy skill.
- **Maths:** Arithmetic sequences: first term, common difference, nth term. The for loop for(int i=3; i<=60; i+=3) generates the sequence 3, 6, 9, 12, … 60. Questions: What is the first term? What is the common difference? How many terms are there? What is the sum of the first 5 terms? Times tables as multiplication sequences: 7×1, 7×2, … 7×10 is an arithmetic sequence with first term 7 and common difference 7.

## Let's begin

### HOOK – The Robot That Counts (20 min)
1. Physical activity: you counts to 10, you clap on each number. "What rule did I follow?" (Add 1 each time.) "What if I said: add 3 each time?" You clap on 3, 6, 9, 12, 15…
2. Bridge: "A for loop does exactly this – it follows a rule and repeats until it reaches a target. Today we write the code that does what you just did with your hands."
3. Recap: draw a for loop diagram on the board. Three parts: START (i = 1), CONDITION (i <= 10), STEP (i++). Label each part. You copy the diagram.
4. Show the numbered list worksheet. "Before we code, we write the loop as numbered steps in plain English." You model one example on the board.
5. Pair programming roles: remind you – rotate your own pacing at each new task.

### GUIDED ACTIVITY – Three Loop Challenges (60 min)
6. Challenge 1 – Count 1 to 10: You write a for loop that prints 1, 2, 3, … 10 to the Serial Monitor. Before coding, fill in the loop tracing sheet (iteration number | variable value | output). Upload and verify output matches the tracing sheet.
7. Challenge 2 – Times Table Generator: Code a for loop that prints the 7× times table (or a chosen multiplier). Format: "7 x 1 = 7", "7 x 2 = 14", … using Serial.print() and Serial.println(). Peer-check against the printed times table result sheet.
8. Rotate your own pacing.
9. Challenge 3 – Arithmetic Sequence 3, 6, 9, …, 60: Write the for loop with correct start, condition, and step. You answer on the tracing sheet: first term? common difference? number of terms? sum of first 5 terms?
10. While loop: write a while loop that starts with int counter = 0; and runs while counter < 100;, adding 1 each time and printing the value. Upload. Observe: how many lines appear in the Serial Monitor?

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Physical activity: you counts to 10, you clap on each number. "What rule did I follow?" (Add 1 each time.) "What if I said: add 3 each time?" You clap on 3, 6, 9, 12, 15…
2. Bridge: "A for loop does exactly this – it follows a rule and repeats until it reaches a target. Today we write the code that does what you just did with your hands."
3. Recap: draw a for loop diagram on the board. Three parts: START (i = 1), CONDITION (i <= 10), STEP (i++). Label each part. You copy the diagram.
4. Show the numbered list worksheet. "Before we code, we write the loop as numbered steps in plain English." You model one example on the board.
5. Pair programming roles: remind you – rotate your own pacing at each new task.
6. Challenge 1 – Count 1 to 10: You write a for loop that prints 1, 2, 3, … 10 to the Serial Monitor. Before coding, fill in the loop tracing sheet (iteration number | variable value | output). Upload and verify output matches the tracing sheet.
7. Challenge 2 – Times Table Generator: Code a for loop that prints the 7× times table (or a chosen multiplier). Format: "7 x 1 = 7", "7 x 2 = 14", … using Serial.print() and Serial.println(). Peer-check against the printed times table result sheet.
8. Rotate your own pacing.
9. Challenge 3 – Arithmetic Sequence 3, 6, 9, …, 60: Write the for loop with correct start, condition, and step. You answer on the tracing sheet: first term? common difference? number of terms? sum of first 5 terms?
10. While loop: write a while loop that starts with int counter = 0; and runs while counter < 100;, adding 1 each time and printing the value. Upload. Observe: how many lines appear in the Serial Monitor?
