# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- ILO 3.1 & 3.2 - Apply logical if/else conditions; ILO 3.3 - Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making.

## Links to English and Maths
- **Maths:** Comprehension exercise: read a complex multi-condition code block (10 lines). Write a plain English paragraph explaining exactly what the code does, including ALL possible outcomes. "If the temperature is above 30, then the LED shows red. Otherwise, if the temperature is above 20, the LED shows yellow. Otherwise, the LED shows green." This develops precise technical writing - a core AI Engineer literacy skill. Comparison operators in context: <, >, <=, >=, ==, !=. Bubble sort: show the array state after each pass. How many comparisons are needed to sort 5 numbers in the worst case? (n-1 + n-2 + … + 1 = n(n-1)/2 = 10 comparisons). Connect to logical reasoning and systematic problem-solving.

## Let's begin

### 1. HOOK Unplugged Bubble Sort
1. Give each pair 8 number cards (values 1–8 shuffled). "Sort these from smallest to largest - but you can only compare two adjacent cards at a time."
2. You attempt. Observe strategies. Introduce: "You just did bubble sort!"
3. Demonstrate bubble sort formally: compare positions 1&2, swap if needed. Move to 2&3, etc. Repeat passes until sorted.
4. You record each pass on the Bubble Sort Tracking Sheet. Count total comparisons for 8 numbers.
5. Math connection: "For 5 numbers, worst case comparisons = 5(5-1)/2 = 10. Why is this called 'worst case'?"
### 2. GUIDED ACTIVITY If/Else Chains & Button Input
6. Step 1 (15 min): Get ready to use Code Comprehension Block. You read the 10-line if/else code snippet. Answer 5 comprehension questions on the reverse. You reviews answers together.
7. Step 2 (5 min): Wire button to Arduino: pin 2 with pull-down resistor (10kΩ). Two LEDs on pins 8 and 9. You demonstrates wiring on projector.
8. Step 3 (20 min): Live-code the button-triggered LED menu: Button press count 1 -> LED 1 ON. Count 2 -> LED 2 ON. Count 3 -> both LEDs OFF. (Use a counter variable that increments on each button press.)
9. Step 4 (10 min): Test and debug. Does each button press produce the correct output? What happens after count 3?
10. Debrief: "Where is the if/else in this code? Read it aloud to me in plain English."

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Give each pair 8 number cards (values 1–8 shuffled). "Sort these from smallest to largest - but you can only compare two adjacent cards at a time."
2. You attempt. Observe strategies. Introduce: "You just did bubble sort!"
3. Demonstrate bubble sort formally: compare positions 1&2, swap if needed. Move to 2&3, etc. Repeat passes until sorted.
4. You record each pass on the Bubble Sort Tracking Sheet. Count total comparisons for 8 numbers.
5. Math connection: "For 5 numbers, worst case comparisons = 5(5-1)/2 = 10. Why is this called 'worst case'?"
6. Step 1 (15 min): Get ready to use Code Comprehension Block. You read the 10-line if/else code snippet. Answer 5 comprehension questions on the reverse. You reviews answers together.
7. Step 2 (5 min): Wire button to Arduino: pin 2 with pull-down resistor (10kΩ). Two LEDs on pins 8 and 9. You demonstrates wiring on projector.
8. Step 3 (20 min): Live-code the button-triggered LED menu: Button press count 1 -> LED 1 ON. Count 2 -> LED 2 ON. Count 3 -> both LEDs OFF. (Use a counter variable that increments on each button press.)
9. Step 4 (10 min): Test and debug. Does each button press produce the correct output? What happens after count 3?
10. Debrief: "Where is the if/else in this code? Read it aloud to me in plain English."
