# Lesson 4: Logic, Conditions & Sorting Algorithms – Making Decisions in Code

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 4
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13, push button on pin 2 (optional)
**Bloom's:** L3 Applying / L4 Analysing
**DDD ILO:** ILO 3.2 – Apply variables, for loops, and user-defined functions to solve a mathematical problem computationally, including sorting; ILO 3.3 – Analyse foundational AI concepts including rule-based decision-making by connecting these to examples in coded projects
**NCDC:** Uganda NCDC P5–P6 – Mathematics Strand: Comparison operators, logical reasoning, sorting; English Strand: Reading comprehension of complex text; ICT Strand: Conditionals and decision-making in programmes
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Selection (if/else); logical operators; algorithms (sorting); reading and tracing code

**Big Idea:** A computer cannot think – but it can follow rules perfectly. If/else conditions are the rules we write. Sorting algorithms are those rules applied to data.

## Learning Objectives

- Write if/else and if/else if/else chains in Arduino Python that make at least 3 distinct decisions based on a variable value
- Explain a 10-line conditional code block in plain English prose, describing all possible outcomes
- Perform the bubble sort algorithm on 8 number cards manually, counting the number of comparison steps
- Translate the bubble sort logic into pseudocode, then into an Arduino sketch that sorts a hardcoded array of 5 integers
- Print the sorted array to the Serial Monitor and verify the result
- Identify and fix logic errors (not syntax errors) in a provided buggy sorting sketch

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 8 number cards per pair (large, printable – numbers 15, 42, 7, 31, 88, 3, 56, 19)
- Printed "Code Comprehension Exercise" (A4 per pair) – 10-line if/else code block with comprehension questions
- Bubble sort trace table (A4 per pair) – grid showing array state after each pass
- Pseudocode-to-code worksheet (A5 per learner)
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Reading comprehension of complex code: learners receive a 10-line if/else code block and answer comprehension questions: "What does this do? What is the input? What are all possible outputs? What happens if the condition is false?" Then they write a plain English paragraph explaining every code path. This is treated explicitly as a reading comprehension exercise using code as the text.

**Maths:** Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort as an algorithm: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n−1 + n−2 + … + 1 = n(n−1)/2.) Learners calculate: for 5 numbers, worst case = 10 comparisons. Boolean logic: true/false outcomes of each comparison. Sorting numbers in ascending order – link to P5 maths ordering of integers.

## Lesson Structure

### HOOK – The Sorting Game (20 min)
1. Give each pair 8 number cards face-down. "Turn them over and sort them from smallest to largest. Ready? Go." Time them. "How did you decide which one to move first? What was your rule?"
2. Discuss: every learner used a rule (compare two numbers, swap if needed, repeat). "That rule you just followed is called the bubble sort algorithm. Today you will teach a computer to follow the same rule."
3. Facilitator introduces comparison operators on the board: <, >, <=, >=, ==, !=. Quick-fire round: "Is 7 < 15? Is 42 >= 42? Is 3 != 3?" Learners answer as a class.
4. Bridge: "Before we sort arrays, we practise making decisions with if/else. A decision is just: compare two things, choose what to do." Show a simple if/else on the board.
5. Distribute the Code Comprehension Exercise. Learners read silently for 2 minutes before any questions are asked.
6. Code Comprehension Exercise: in pairs, answer the 5 questions on the printed sheet. "What is the input variable? How many possible outcomes are there? What output appears when the input is 15? When the input is 35? What is missing from this code?" Facilitator collects sheets at the end of this activity.

### GUIDED ACTIVITY – Conditionals and Comprehension (60 min)
7. Code the 3-decision sketch: facilitator live-codes a menu system. int choice = 2; – if choice == 1, print "Red LED on" and set LED HIGH; else if choice == 2, print "Fast blink"; else print "LED off". Upload and test. Then change the value of choice and re-upload to test each branch.
8. Learners write their own 3-decision sketch: use a variable int score; – if score >= 80 print "Distinction"; else if score >= 55 print "Pass"; else print "Not yet". Test with 3 different score values.
9. Rotate Driver/Navigator.
10. Unplugged bubble sort: pairs sort 8 number cards using the bubble sort algorithm step by step. After each comparison, fill in the trace table. Count the total number of swap operations. Record on the bubble sort trace table sheet.
11. Pseudocode bridge: learners write the bubble sort in pseudocode on the pseudocode-to-code worksheet: "Compare the first and second item. If the first is larger, swap them. Move to the next pair. Repeat for each pass until no swaps are needed."
12. Translate pseudocode into an Arduino sketch. Hardcoded array: int numbers[5] = {42, 7, 31, 3, 19};. Use nested for loops to implement bubble sort. Print the sorted array to Serial Monitor.

### INDEPENDENT WORK – Bubble Sort in Code (50 min)
13. Verify: does the Serial Monitor show 3, 7, 19, 31, 42? Compare with the manually sorted result from the card activity.
14. Debug challenge: facilitator provides a sketch with 2 logic errors (comparison operators reversed, loop bound off by one). Learners trace through line by line to find both errors without running the code first.
15. After finding errors on paper, type corrections and upload to confirm the fix.
16. Extension: modify the sort to descending order (largest first). How many lines of code change? Print both the unsorted and sorted arrays with labels.
17. Facilitator circulates, checks that all 3 if/else decisions work correctly, asks: "How many comparisons did your bubble sort make? Is that the worst case or best case for 5 numbers?"
18. 2–3 pairs present their bubble sort result: show the Serial Monitor output (unsorted then sorted). Explain: "Our array started as [42, 7, 31, 3, 19]. After bubble sort it became [3, 7, 19, 31, 42]. We made ___ comparisons in total."

### SHOWCASE & DEBRIEF (30 min)
19. One pair presents their Code Comprehension paragraph: read their plain English explanation of the if/else code block aloud. Class gives 1 Star + 1 Wish feedback.
20. Facilitator draws the connection to AI: "This lesson is the foundation of how AI makes decisions. An AI that says 'this email is spam' is doing a very long if/else chain trained on data. Today you built a rule-based decision system."
21. Facilitator restates English link: "You read code like a text and wrote a comprehension paragraph about it. That is exactly what we do with any complex document – understand it, then explain it."
22. Facilitator restates Math link: "Bubble sort uses comparison operators and counts steps. For 5 numbers, worst case is 10 comparisons. This is linked to the formula n(n–1)/2 – maths you will meet in secondary school."
23. Exit question (written): "In your own words, what is a sorting algorithm? Write two sentences." Collect as exit evidence.
24. Submit sketch via USB flash drive.

## Assessment

- Formative | (During) | Code Comprehension Exercise: 5 questions answered correctly (collected at end of guided phase) | Bubble sort trace table: correct array state after each pass (collected) | Pseudocode-to-code worksheet: each pseudocode line maps to a code line (checked by facilitator) | Exit written response: sorting algorithm explained in two clear sentences (collected)
- Exit Assessment | Arduino programme makes 3 distinct if/else decisions correctly based on variable input (verified by facilitator) | Bubble sort sketch outputs correctly sorted array to Serial Monitor (verified by facilitator) | Code comprehension paragraph explains all code paths in clear English prose (assessed on submission) | All materials submitted via USB flash drive
- Differentiation | Support: Provide the bubble sort outer loop and inner loop shell with blanks: for(int i=0; i<___; i++) { for(int j=0; j<___; j++) { if(numbers[j] > numbers[j+1]) { /* swap here */ } } }. For conditionals, provide the if/else structure with blanks for the condition only. | Extension: Write a function void bubbleSort(int arr[], int size) that sorts any integer array passed to it. Call it on two different arrays. Calculate and print the exact number of comparisons made using a counter variable. Compare to the worst-case formula n(n–1)/2.

## Key Vocabulary

if · else if · else · condition · comparison operator · Boolean · array · index · bubble sort · algorithm · swap · ascending · descending · logic error · trace

## Safeguarding

Safeguarding Note: Number cards and array values must be fictional numbers only. Do not use ages, phone numbers, or personal data as values in the sorting array. Ensure learners understand that sharing code files containing personal information (even in comments) can expose private data.

## Full source extract (complete)

### Detail body

```
Write if/else and if/else if/else chains in Arduino Python that make at least 3 distinct decisions based on a variable value
Explain a 10-line conditional code block in plain English prose, describing all possible outcomes
Perform the bubble sort algorithm on 8 number cards manually, counting the number of comparison steps
Translate the bubble sort logic into pseudocode, then into an Arduino sketch that sorts a hardcoded array of 5 integers
Print the sorted array to the Serial Monitor and verify the result
Identify and fix logic errors (not syntax errors) in a provided buggy sorting sketch
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards + USB cables
8 number cards per pair (large, printable – numbers 15, 42, 7, 31, 88, 3, 56, 19)
Printed "Code Comprehension Exercise" (A4 per pair) – 10-line if/else code block with comprehension questions
Bubble sort trace table (A4 per pair) – grid showing array state after each pass
Pseudocode-to-code worksheet (A5 per learner)
USB flash drives
Facilitator device + projected screen
Give each pair 8 number cards face-down. "Turn them over and sort them from smallest to largest. Ready? Go." Time them. "How did you decide which one to move first? What was your rule?"
Discuss: every learner used a rule (compare two numbers, swap if needed, repeat). "That rule you just followed is called the bubble sort algorithm. Today you will teach a computer to follow the same rule."
Facilitator introduces comparison operators on the board: <, >, <=, >=, ==, !=. Quick-fire round: "Is 7 < 15? Is 42 >= 42? Is 3 != 3?" Learners answer as a class.
Bridge: "Before we sort arrays, we practise making decisions with if/else. A decision is just: compare two things, choose what to do." Show a simple if/else on the board.
Distribute the Code Comprehension Exercise. Learners read silently for 2 minutes before any questions are asked.
Code Comprehension Exercise: in pairs, answer the 5 questions on the printed sheet. "What is the input variable? How many possible outcomes are there? What output appears when the input is 15? When the input is 35? What is missing from this code?" Facilitator collects sheets at the end of this activity.
Code the 3-decision sketch: facilitator live-codes a menu system. int choice = 2; – if choice == 1, print "Red LED on" and set LED HIGH; else if choice == 2, print "Fast blink"; else print "LED off". Upload and test. Then change the value of choice and re-upload to test each branch.
Learners write their own 3-decision sketch: use a variable int score; – if score >= 80 print "Distinction"; else if score >= 55 print "Pass"; else print "Not yet". Test with 3 different score values.
Rotate Driver/Navigator.
Unplugged bubble sort: pairs sort 8 number cards using the bubble sort algorithm step by step. After each comparison, fill in the trace table. Count the total number of swap operations. Record on the bubble sort trace table sheet.
Pseudocode bridge: learners write the bubble sort in pseudocode on the pseudocode-to-code worksheet: "Compare the first and second item. If the first is larger, swap them. Move to the next pair. Repeat for each pass until no swaps are needed."
Translate pseudocode into an Arduino sketch. Hardcoded array: int numbers[5] = {42, 7, 31, 3, 19};. Use nested for loops to implement bubble sort. Print the sorted array to Serial Monitor.
Verify: does the Serial Monitor show 3, 7, 19, 31, 42? Compare with the manually sorted result from the card activity.
Debug challenge: facilitator provides a sketch with 2 logic errors (comparison operators reversed, loop bound off by one). Learners trace through line by line to find both errors without running the code first.
After finding errors on paper, type corrections and upload to confirm the fix.
Extension: modify the sort to descending order (largest first). How many lines of code change? Print both the unsorted and sorted arrays with labels.
Facilitator circulates, checks that all 3 if/else decisions work correctly, asks: "How many comparisons did your bubble sort make? Is that the worst case or best case for 5 numbers?"
2–3 pairs present their bubble sort result: show the Serial Monitor output (unsorted then sorted). Explain: "Our array started as [42, 7, 31, 3, 19]. After bubble sort it became [3, 7, 19, 31, 42]. We made ___ comparisons in total."
One pair presents their Code Comprehension paragraph: read their plain English explanation of the if/else code block aloud. Class gives 1 Star + 1 Wish feedback.
Facilitator draws the connection to AI: "This lesson is the foundation of how AI makes decisions. An AI that says 'this email is spam' is doing a very long if/else chain trained on data. Today you built a rule-based decision system."
Facilitator restates English link: "You read code like a text and wrote a comprehension paragraph about it. That is exactly what we do with any complex document – understand it, then explain it."
Facilitator restates Math link: "Bubble sort uses comparison operators and counts steps. For 5 numbers, worst case is 10 comparisons. This is linked to the formula n(n–1)/2 – maths you will meet in secondary school."
Exit question (written): "In your own words, what is a sorting algorithm? Write two sentences." Collect as exit evidence.
Submit sketch via USB flash drive.
if · else if · else · condition · comparison operator · Boolean · array · index · bubble sort · algorithm · swap · ascending · descending · logic error · trace
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5 (Ages 10–12 · AI Engineers) | Lesson 4: Logic, Conditions & Sorting Algorithms – Making Decisions in Code
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 1 · Week 4
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13, push button on pin 2 (optional) | Bloom's Level | L3 Applying / L4 Analysing
NCDC Ref | Uganda NCDC P5–P6 – Mathematics Strand: Comparison operators, logical reasoning, sorting; English Strand: Reading comprehension of complex text; ICT Strand: Conditionals and decision-making in programmes | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Selection (if/else); logical operators; algorithms (sorting); reading and tracing code
DDD ILO | ILO 3.2 – Apply variables, for loops, and user-defined functions to solve a mathematical problem computationally, including sorting; ILO 3.3 – Analyse foundational AI concepts including rule-based decision-making by connecting these to examples in coded projects | Big Idea | A computer cannot think – but it can follow rules perfectly. If/else conditions are the rules we write. Sorting algorithms are those rules applied to data.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Reading comprehension of complex code: learners receive a 10-line if/else code block and answer comprehension questions: "What does this do? What is the input? What are all possible outputs? What happens if the condition is false?" Then they write a plain English paragraph explaining every code path. This is treated explicitly as a reading comprehension exercise using code as the text.
Maths | Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort as an algorithm: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n−1 + n−2 + … + 1 = n(n−1)/2.) Learners calculate: for 5 numbers, worst case = 10 comparisons. Boolean logic: true/false outcomes of each comparison. Sorting numbers in ascending order – link to P5 maths ordering of integers.
LESSON STRUCTURE
HOOK – The Sorting Game (20 min)
GUIDED ACTIVITY – Conditionals and Comprehension (60 min)
INDEPENDENT WORK – Bubble Sort in Code (50 min)
SHOWCASE & DEBRIEF (30 min)
ASSESSMENT
Formative | (During) | Code Comprehension Exercise: 5 questions answered correctly (collected at end of guided phase) | Bubble sort trace table: correct array state after each pass (collected) | Pseudocode-to-code worksheet: each pseudocode line maps to a code line (checked by facilitator) | Exit written response: sorting algorithm explained in two clear sentences (collected)
Exit Assessment | Arduino programme makes 3 distinct if/else decisions correctly based on variable input (verified by facilitator) | Bubble sort sketch outputs correctly sorted array to Serial Monitor (verified by facilitator) | Code comprehension paragraph explains all code paths in clear English prose (assessed on submission) | All materials submitted via USB flash drive
Differentiation | Support: Provide the bubble sort outer loop and inner loop shell with blanks: for(int i=0; i<___; i++) { for(int j=0; j<___; j++) { if(numbers[j] > numbers[j+1]) { /* swap here */ } } }. For conditionals, provide the if/else structure with blanks for the condition only. | Extension: Write a function void bubbleSort(int arr[], int size) that sorts any integer array passed to it. Call it on two different arrays. Calculate and print the exact number of comparisons made using a counter variable. Compare to the worst-case formula n(n–1)/2.
KEY VOCABULARY
Safeguarding Note: Number cards and array values must be fictional numbers only. Do not use ages, phone numbers, or personal data as values in the sorting array. Ensure learners understand that sharing code files containing personal information (even in comments) can expose private data.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
