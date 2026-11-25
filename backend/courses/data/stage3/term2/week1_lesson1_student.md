# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Define 'variable' in their own words and give one example of where variables are used in everyday life
- Create and set a numeric variable in MakeCode ('score', 'count', or a name they choose) and display its value on the LED matrix
- Modify the variable's value using Button A (increment by 1) and Button B (decrement by 1), displaying the updated value each time
- Set the radio group to a shared number and use 'radio send number' to transmit the variable's current value to a partner's Micro:bit
- Use 'on radio received' on the partner Micro:bit to display the received value on the LED matrix
- Explain in plain English: 'What is a variable?', 'What does radio send do?', and 'What does radio receive do?' — one sentence each

## Big idea
A variable is like a labelled box that holds a value. The Micro:bit radio lets two devices share that value wirelessly — like sending a note across the room without getting up.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables (all 4 Micro:bits needed — 2 for you for radio activity)
- 4 shared laptops with MakeCode open
- Variable concept card (A5 for you) – diagram: labelled box -> name / value
- Radio programme planning sheet (A4 for you) – 2 columns: Sender programme | Receiver programme
- Vocabulary cards: 'variable', 'value', 'radio', 'send', 'receive', 'radio group', 'increment', 'decrement'
- A computer or screen to follow along
- 'One Star, One Wish' feedback cards
- Sticky notes for exit ticket (one for you)

## Links to English and Maths
- **English:** Vocabulary in context: 'variable', 'value', 'increment', 'decrement', 'send', 'receive'. You write one sentence for each word using the session as the context. Sentence frame: 'A variable is like a ___ because ___.' Oral explanation task: learner must explain the radio programme to a partner who 'has never seen a Micro:bit' — practising clear, audience-aware communication as in the DDD's oral presentation strand.
- **Maths:** Integers and change: variable starts at 0; Button A adds 1 (increment); Button B subtracts 1 (decrement). Track the value after 5 button presses on a number line drawn on paper. Introduction to signed integers: what happens when the variable goes below 0? Is −3 greater or less than 0? Comparison: if Pair A's Micro:bit sends 7 and Pair B's sends 12, what is the difference? Which is greater?

## Let's begin

### HOOK – What Is a Variable? (10 min)
1. Hold up a labelled box (or draw one on the board). Label it 'score'. Write '0' inside. Ask: 'If I press Button A, the score goes up by 1. What is score now?' Change to 1. Repeat twice. 'What am I doing each time? What is the BOX called?' Guide to: a variable.
2. Show the variable concept card. You read the two fields aloud: name (what the box is called) and value (what is inside it right now). Ask: 'Where do you see variables in real life?' (score in a game, temperature on a thermometer, money in a wallet).
3. Show on the projected MakeCode screen: a 'set score to 0' block and a 'change score by 1' block inside an 'on button A pressed' event. Ask: 'Which block creates the variable? Which block changes it?'
4. Bridge: 'Today we will make a variable that TWO Micro:bits can share — wirelessly. One Micro:bit sends the number; the other one catches it and shows it.'
### DESIGN – Plan the Programme (10 min)
5. Get ready to use the radio programme planning sheet. You plan BOTH sides before coding: Sender side — what variable? What events change it? What block sends it? Receiver side — what block catches the incoming number? What does the LED show?
6. You write the plan in plain English in each column. You checks: 'Do both sides have a radio group number? Is it the SAME number for both?' Confirm all you have the same group (e.g. group 1) before laptops are distributed.
7. Vocabulary check: each pair holds up their vocabulary cards for 'radio group', 'send', 'receive'. You confirms understanding before coding begins.
### DELIVER – Code Both Sides (30 min)
8. Get ready to use 2 Micro:bits and 1 laptop for you. Assign Driver (codes) and Navigator (holds the planning sheet and checks each block).
9. Part 1 – Variable programme (10 min): on start -> set score to 0. On button A pressed -> change score by 1 -> show number score. On button B pressed -> change score by −1 -> show number score. Download to Micro:bit 1. Test: does button A increase and button B decrease the displayed number?

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Hold up a labelled box (or draw one on the board). Label it 'score'. Write '0' inside. Ask: 'If I press Button A, the score goes up by 1. What is score now?' Change to 1. Repeat twice. 'What am I doing each time? What is the BOX called?' Guide to: a variable.
2. Show the variable concept card. You read the two fields aloud: name (what the box is called) and value (what is inside it right now). Ask: 'Where do you see variables in real life?' (score in a game, temperature on a thermometer, money in a wallet).
3. Show on the projected MakeCode screen: a 'set score to 0' block and a 'change score by 1' block inside an 'on button A pressed' event. Ask: 'Which block creates the variable? Which block changes it?'
4. Bridge: 'Today we will make a variable that TWO Micro:bits can share — wirelessly. One Micro:bit sends the number; the other one catches it and shows it.'
5. Get ready to use the radio programme planning sheet. You plan BOTH sides before coding: Sender side — what variable? What events change it? What block sends it? Receiver side — what block catches the incoming number? What does the LED show?
6. You write the plan in plain English in each column. You checks: 'Do both sides have a radio group number? Is it the SAME number for both?' Confirm all you have the same group (e.g. group 1) before laptops are distributed.
7. Vocabulary check: each pair holds up their vocabulary cards for 'radio group', 'send', 'receive'. You confirms understanding before coding begins.
8. Get ready to use 2 Micro:bits and 1 laptop for you. Assign Driver (codes) and Navigator (holds the planning sheet and checks each block).
9. Part 1 – Variable programme (10 min): on start -> set score to 0. On button A pressed -> change score by 1 -> show number score. On button B pressed -> change score by −1 -> show number score. Download to Micro:bit 1. Test: does button A increase and button B decrease the displayed number?
