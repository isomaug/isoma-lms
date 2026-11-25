# Lesson 4: Decide and Sort - Logic, Conditions & Sorting Algorithms

**Duration:** 3 hours (Term-time Saturday) (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 4
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, push button, LED × 2, 220Ω resistors × 2, 10kΩ resistor, breadboard, jumper wires
**Software:** Arduino IDE 2.x - Serial Monitor
**Bloom's:** L3–L4 Applying / Analysing
**DDD Phase:** APPLY & ANALYSE - Learners write if/else chains, implement bubble sort, and read+explain complex code in plain English
**NCDC:** Uganda NCDC Curriculum P5/P6 - Literacy Strand: Reading comprehension of complex multi-condition texts; Numeracy Strand: Comparison operators, logical reasoning, sorting

**Source plan:** `Stage6_Week4_LessonPlan.docx`

## Learning Objectives

- ILO 3.1 & 3.2 - Apply logical if/else conditions; ILO 3.3 - Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making.

## Materials and Preparation

_See source._

## Cross-Curricular Links

**Maths:** Comprehension exercise: read a complex multi-condition code block (10 lines). Write a plain English paragraph explaining exactly what the code does, including ALL possible outcomes. "If the temperature is above 30, then the LED shows red. Otherwise, if the temperature is above 20, the LED shows yellow. Otherwise, the LED shows green." This develops precise technical writing - a core AI Engineer literacy skill. Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n-1 + n-2 + … + 1 = n(n-1)/2 = 10 comparisons). Connect to logical reasoning and systematic problem-solving.

## Lesson Structure

### 1. HOOK Unplugged Bubble Sort
1. Give each pair 8 number cards (values 1–8 shuffled). "Sort these from smallest to largest - but you can only compare two adjacent cards at a time."
2. Pairs attempt. Observe strategies. Introduce: "You just did bubble sort!"
3. Demonstrate bubble sort formally: compare positions 1&2, swap if needed. Move to 2&3, etc. Repeat passes until sorted.
4. Pairs record each pass on the Bubble Sort Tracking Sheet. Count total comparisons for 8 numbers.
5. Math connection: "For 5 numbers, worst case comparisons = 5(5-1)/2 = 10. Why is this called 'worst case'?"
### 2. GUIDED ACTIVITY If/Else Chains & Button Input
6. Step 1 (15 min): Distribute Code Comprehension Block. Pairs read the 10-line if/else code snippet. Answer 5 comprehension questions on the reverse. Facilitator reviews answers together.
7. Step 2 (5 min): Wire button to Arduino: pin 2 with pull-down resistor (10kΩ). Two LEDs on pins 8 and 9. Facilitator demonstrates wiring on projector.
8. Step 3 (20 min): Live-code the button-triggered LED menu: Button press count 1 → LED 1 ON. Count 2 → LED 2 ON. Count 3 → both LEDs OFF. (Use a counter variable that increments on each button press.)
9. Step 4 (10 min): Test and debug. Does each button press produce the correct output? What happens after count 3?
10. Debrief: "Where is the if/else in this code? Read it aloud to me in plain English."
11. Step 5 (10 min): Translate bubble sort pseudocode (provided by facilitator) into Arduino code. Facilitator shows pseudocode on projector - pairs begin translation.
### 3. INDEPENDENT / PAIR WORK Bubble Sort Sketch & Comprehension
12. Task 1 (25 min): Complete the bubble sort Arduino sketch. Hardcode an array of 5 integers. Sort and print the original and sorted array to Serial Monitor.
13. Task 2 (15 min): Write the plain English comprehension paragraph - explain every outcome of the Code Comprehension Block. Must include: all conditions tested, all possible outputs. Minimum 5 sentences.
14. Task 3 (Debug, 10 min): Facilitator provides a bubble sort sketch with logic errors - pairs trace through line by line to find them. Record the errors and fixes on the Bubble Sort Tracking Sheet.
15. Extension: Modify the sort to handle 8 integers. Count and print the number of swaps made - does this match the theory?
16. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
17. 2 pairs display Serial Monitor output: original array and sorted array. Class verifies correctness.
18. Comprehension paragraph: one pair reads aloud. Class checks - did they describe ALL possible outcomes?
19. AI connection: "Bubble sort is a rule-based decision system. AI uses similar logic to classify data. This is called rule-based AI."
20. Facilitator writes on board: Today's English link - technical comprehension and explanation. Today's Math link - comparison operators and worst-case analysis.
21. Exit question: "What makes bubble sort slow for large data sets?" (Answer: many comparisons needed.) Collect Code Comprehension paragraphs as this week's artifact.

## Assessment

- Formative (During)
- Button sketch makes 3 distinct decisions based on input. Bubble sort sketch outputs correctly sorted array to Serial Monitor.
- Observation log. Bubble Sort Tracking Sheet and Comprehension paragraph collected (Week 4 artifact).
- Exit Assessment
- Learner explains one code path of the if/else chain in plain English. Facilitator records whether explanation covers all outcomes correctly.
- Facilitator records verbal explanation per learner.
- Differentiation
- Support: provide bubble sort pseudocode pre-written - learners only translate to code. Extension: implement selection sort and compare number of comparisons to bubble sort.
- Submitted sketch file. Comprehension paragraph submitted.

## Key Vocabulary

if/else · condition · comparison operator · boolean · algorithm · bubble sort · array · iteration · swap · pass · worst case · rule-based ⚠  Safeguarding Note Hardware note: resistors are essential - do not connect an LED directly between 5V and GND without a resistor. Facilitator checks all wiring before learners upload. Date Delivered: Signature:

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino
Lesson 4: Decide and Sort - Logic, Conditions & Sorting Algorithms
Duration
3 hours (Term-time Saturday)
Term / Week
Term 1 · Week 4
Age Range
10–12 years
Group Size
8 learners (4 pairs)
Hardware
Arduino Uno, USB cable, push button, LED × 2, 220Ω resistors × 2, 10kΩ resistor, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x - Serial Monitor
Bloom's Level
L3–L4 Applying / Analysing
DDD Phase
APPLY & ANALYSE - Learners write if/else chains, implement bubble sort, and read+explain complex code in plain English
NCDC Ref
Uganda NCDC Curriculum P5/P6 - Literacy Strand: Reading comprehension of complex multi-condition texts; Numeracy Strand: Comparison operators, logical reasoning, sorting
Cambridge
Cambridge Primary Computing 0845 - Stage 6: Conditions and logic; Introduction to sorting algorithms
🎯  Intended Learning Outcome (ILO)
💡  Big Idea
• ILO 3.1 & 3.2 - Apply logical if/else conditions; ILO 3.3 - Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making.
• Computers make decisions using conditions - just like we do. And when data is messy, we need an algorithm to sort it. Bubble sort is one such algorithm, and it follows simple if/else logic.
📖  English Literacy Thread
🔢  Mathematics Thread
• Comprehension exercise: read a complex multi-condition code block (10 lines). Write a plain English paragraph explaining exactly what the code does, including ALL possible outcomes. "If the temperature is above 30, then the LED shows red. Otherwise, if the temperature is above 20, the LED shows yellow. Otherwise, the LED shows green." This develops precise technical writing - a core AI Engineer literacy skill.
• Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n-1 + n-2 + … + 1 = n(n-1)/2 = 10 comparisons). Connect to logical reasoning and systematic problem-solving.
Phase
Time
Activities & Facilitator Actions
1. HOOK Unplugged Bubble Sort
20 min
• Give each pair 8 number cards (values 1–8 shuffled). "Sort these from smallest to largest - but you can only compare two adjacent cards at a time."
• Pairs attempt. Observe strategies. Introduce: "You just did bubble sort!"
• Demonstrate bubble sort formally: compare positions 1&2, swap if needed. Move to 2&3, etc. Repeat passes until sorted.
• Pairs record each pass on the Bubble Sort Tracking Sheet. Count total comparisons for 8 numbers.
• Math connection: "For 5 numbers, worst case comparisons = 5(5-1)/2 = 10. Why is this called 'worst case'?"
2. GUIDED ACTIVITY If/Else Chains & Button Input
60 min
• Step 1 (15 min): Distribute Code Comprehension Block. Pairs read the 10-line if/else code snippet. Answer 5 comprehension questions on the reverse. Facilitator reviews answers together.
• Step 2 (5 min): Wire button to Arduino: pin 2 with pull-down resistor (10kΩ). Two LEDs on pins 8 and 9. Facilitator demonstrates wiring on projector.
• Step 3 (20 min): Live-code the button-triggered LED menu: Button press count 1 → LED 1 ON. Count 2 → LED 2 ON. Count 3 → both LEDs OFF. (Use a counter variable that increments on each button press.)
• Step 4 (10 min): Test and debug. Does each button press produce the correct output? What happens after count 3?
• Debrief: "Where is the if/else in this code? Read it aloud to me in plain English."
• Step 5 (10 min): Translate bubble sort pseudocode (provided by facilitator) into Arduino code. Facilitator shows pseudocode on projector - pairs begin translation.
3. INDEPENDENT / PAIR WORK Bubble Sort Sketch & Comprehension
50 min
• Task 1 (25 min): Complete the bubble sort Arduino sketch. Hardcode an array of 5 integers. Sort and print the original and sorted array to Serial Monitor.
• Task 2 (15 min): Write the plain English comprehension paragraph - explain every outcome of the Code Comprehension Block. Must include: all conditions tested, all possible outputs. Minimum 5 sentences.
• Task 3 (Debug, 10 min): Facilitator provides a bubble sort sketch with logic errors - pairs trace through line by line to find them. Record the errors and fixes on the Bubble Sort Tracking Sheet.
• Extension: Modify the sort to handle 8 integers. Count and print the number of swaps made - does this match the theory?
• Rotate Driver/Navigator between Tasks 1 and 2.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs display Serial Monitor output: original array and sorted array. Class verifies correctness.
• Comprehension paragraph: one pair reads aloud. Class checks - did they describe ALL possible outcomes?
• AI connection: "Bubble sort is a rule-based decision system. AI uses similar logic to classify data. This is called rule-based AI."
• Facilitator writes on board: Today's English link - technical comprehension and explanation. Today's Math link - comparison operators and worst-case analysis.
• Exit question: "What makes bubble sort slow for large data sets?" (Answer: many comparisons needed.) Collect Code Comprehension paragraphs as this week's artifact.
Component
Description
Evidence
Formative (During)
Button sketch makes 3 distinct decisions based on input. Bubble sort sketch outputs correctly sorted array to Serial Monitor.
Observation log. Bubble Sort Tracking Sheet and Comprehension paragraph collected (Week 4 artifact).
Exit Assessment
Learner explains one code path of the if/else chain in plain English. Facilitator records whether explanation covers all outcomes correctly.
Facilitator records verbal explanation per learner.
Differentiation
Support: provide bubble sort pseudocode pre-written - learners only translate to code. Extension: implement selection sort and compare number of comparisons to bubble sort.
Submitted sketch file. Comprehension paragraph submitted.
KEY VOCABULARY
if/else · condition · comparison operator · boolean · algorithm · bubble sort · array · iteration · swap · pass · worst case · rule-based
⚠  Safeguarding Note
Hardware note: resistors are essential - do not connect an LED directly between 5V and GND without a resistor. Facilitator checks all wiring before learners upload.
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
