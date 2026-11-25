# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write if/else and if/else if/else chains in Arduino Python that make at least 3 distinct decisions based on a variable value
- Explain a 10-line conditional code block in plain English prose, describing all possible outcomes
- Perform the bubble sort algorithm on 8 number cards manually, counting the number of comparison steps
- Translate the bubble sort logic into pseudocode, then into an Arduino sketch that sorts a hardcoded array of 5 integers
- Print the sorted array to the Serial Monitor and verify the result
- Identify and fix logic errors (not syntax errors) in a provided buggy sorting sketch

## Big idea
A computer cannot think – but it can follow rules perfectly. If/else conditions are the rules we write. Sorting algorithms are those rules applied to data.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 8 number cards for you (large, printable – numbers 15, 42, 7, 31, 88, 3, 56, 19)
- Printed "Code Comprehension Exercise" (A4 for you) – 10-line if/else code block with comprehension questions
- Bubble sort trace table (A4 for you) – grid showing array state after each pass
- Pseudocode-to-code worksheet (A5 for you)
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Reading comprehension of complex code: you receive a 10-line if/else code block and answer comprehension questions: "What does this do? What is the input? What are all possible outputs? What happens if the condition is false?" Then they write a plain English paragraph explaining every code path. This is treated explicitly as a reading comprehension exercise using code as the text.
- **Maths:** Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort as an algorithm: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n−1 + n−2 + … + 1 = n(n−1)/2.) You calculate: for 5 numbers, worst case = 10 comparisons. Boolean logic: true/false outcomes of each comparison. Sorting numbers in ascending order – link to P5 maths ordering of integers.

## Let's begin

### HOOK – The Sorting Game (20 min)
1. Give each pair 8 number cards face-down. "Turn them over and sort them from smallest to largest. Ready? Go." Time them. "How did you decide which one to move first? What was your rule?"
2. Discuss: every learner used a rule (compare two numbers, swap if needed, repeat). "That rule you just followed is called the bubble sort algorithm. Today you will teach a computer to follow the same rule."
3. You introduces comparison operators on the board: <, >, <=, >=, ==, !=. Quick-fire round: "Is 7 < 15? Is 42 >= 42? Is 3 != 3?" You answer as a class.
4. Bridge: "Before we sort arrays, we practise making decisions with if/else. A decision is just: compare two things, choose what to do." Show a simple if/else on the board.
5. Get ready to use the Code Comprehension Exercise. You read silently for 2 minutes before any questions are asked.
6. Code Comprehension Exercise: on your own, answer the 5 questions on the printed sheet. "What is the input variable? How many possible outcomes are there? What output appears when the input is 15? When the input is 35? What is missing from this code?" You collects sheets at the end of this activity.

### GUIDED ACTIVITY – Conditionals and Comprehension (60 min)
7. Code the 3-decision sketch: you live-codes a menu system. int choice = 2; – if choice == 1, print "Red LED on" and set LED HIGH; else if choice == 2, print "Fast blink"; else print "LED off". Upload and test. Then change the value of choice and re-upload to test each branch.
8. You write your own 3-decision sketch: use a variable int score; – if score >= 80 print "Distinction"; else if score >= 55 print "Pass"; else print "Not yet". Test with 3 different score values.
9. Rotate your own pacing.
10. Unplugged bubble sort: you sort 8 number cards using the bubble sort algorithm step by step. After each comparison, fill in the trace table. Count the total number of swap operations. Record on the bubble sort trace table sheet.
11. Pseudocode bridge: you write the bubble sort in pseudocode on the pseudocode-to-code worksheet: "Compare the first and second item. If the first is larger, swap them. Move to the next pair. Repeat for each pass until no swaps are needed."
12. Translate pseudocode into an Arduino sketch. Hardcoded array: int numbers[5] = {42, 7, 31, 3, 19};. Use nested for loops to implement bubble sort. Print the sorted array to Serial Monitor.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Give each pair 8 number cards face-down. "Turn them over and sort them from smallest to largest. Ready? Go." Time them. "How did you decide which one to move first? What was your rule?"
2. Discuss: every learner used a rule (compare two numbers, swap if needed, repeat). "That rule you just followed is called the bubble sort algorithm. Today you will teach a computer to follow the same rule."
3. You introduces comparison operators on the board: <, >, <=, >=, ==, !=. Quick-fire round: "Is 7 < 15? Is 42 >= 42? Is 3 != 3?" You answer as a class.
4. Bridge: "Before we sort arrays, we practise making decisions with if/else. A decision is just: compare two things, choose what to do." Show a simple if/else on the board.
5. Get ready to use the Code Comprehension Exercise. You read silently for 2 minutes before any questions are asked.
6. Code Comprehension Exercise: on your own, answer the 5 questions on the printed sheet. "What is the input variable? How many possible outcomes are there? What output appears when the input is 15? When the input is 35? What is missing from this code?" You collects sheets at the end of this activity.
7. Code the 3-decision sketch: you live-codes a menu system. int choice = 2; – if choice == 1, print "Red LED on" and set LED HIGH; else if choice == 2, print "Fast blink"; else print "LED off". Upload and test. Then change the value of choice and re-upload to test each branch.
8. You write your own 3-decision sketch: use a variable int score; – if score >= 80 print "Distinction"; else if score >= 55 print "Pass"; else print "Not yet". Test with 3 different score values.
9. Rotate your own pacing.
10. Unplugged bubble sort: you sort 8 number cards using the bubble sort algorithm step by step. After each comparison, fill in the trace table. Count the total number of swap operations. Record on the bubble sort trace table sheet.
11. Pseudocode bridge: you write the bubble sort in pseudocode on the pseudocode-to-code worksheet: "Compare the first and second item. If the first is larger, swap them. Move to the next pair. Repeat for each pass until no swaps are needed."
12. Translate pseudocode into an Arduino sketch. Hardcoded array: int numbers[5] = {42, 7, 31, 3, 19};. Use nested for loops to implement bubble sort. Print the sorted array to Serial Monitor.
