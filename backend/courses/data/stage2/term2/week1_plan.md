# Lesson 9  ·  Term 2 · Week 1

**Duration:** 60 minutes (split across Week 1 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 1
**Age Range:** 7–8 years
**Hardware:** Tablets with Stack KIDI App
**Bloom's:** L2 Understand · L3 Apply · L4 Analyse

**Big Idea:** A variable is like a box with a label. The label stays the same - but what is INSIDE the box can change. In a game, a "score" box starts at 0 and grows every time you do something right.

**Source plan:** `Stage2_Lesson9_Term2_Week1.docx`

## Learning Objectives

- Define a variable as "a named store for a value that can change over time" using an everyday analogy
- Use Stack KIDI's number display block to show an on-screen number that the learner can interact with
- Build a tap-triggered counter that increments a visible number each time the character is tapped
- Predict the final displayed number after a specific sequence of increment and decrement actions

## Materials and Preparation

- 4 tablets with Stack KIDI - fresh projects

## Cross-Curricular Links

**English:** The analogy of a variable as a named container: "My variable is called SCORE. It starts at 0. Every time I catch a ball, SCORE goes up by 1." Learners write their own analogy: "A variable is like a ___ because ___." Vocabulary: variable, value, increment, decrement, store, update, named, container, track.

**Maths:** Counting sequences: starting at 0, incrementing by 1 five times = 5. If the score is 7 and decrements by 2, score = 5. Learners complete 5 written increment/decrement problems before the prediction challenge card. Connection to addition and subtraction number lines.

## Lesson Structure

### HOOK - Term 2 Welcome + The Score Board (8 min)
1. Variable analogy cards (6 cards): a piggy bank with a changing amount, a scoreboard with changing scores, a thermometer with a changing temperature, a countdown timer, a lives counter in a game, a tally chart - each labelled with: Name = ___, Starting Value = ___, Changes when = ___
2. Variable design sheet (A4 per pair): Name of variable | Starting value | When does it go UP? | When does it go DOWN? | What happens when it reaches a target?
3. Counter programme plan strips (A5 per pair): blank horizontal strip with 4 squares - learners draw the blocks for the increment programme
4. Prediction challenge cards (4 cards, one per pair): shows a sequence of UP/DOWN taps and asks: "What number is displayed after this sequence?"
5. Welcome learners to Term 2. Ask: "What is the SCORE right now in this room? How many people are here? That is a variable - it changes every session."
6. Show variable analogy cards one at a time. For each: "What is the variable's name? What is its starting value? How does it change?" Class calls out answers.

### DESIGN - Variable Design Sheet (10 min)
7. Introduce the key concept: "A variable has a NAME that never changes. But the VALUE inside the box changes every time something happens."
8. Write on board: VARIABLE = NAME + VALUE. The name is fixed. The value is flexible.
9. Bridge: "In Stack KIDI today, we build a SCORE counter. Every tap on the character adds 1 to the score. The number on screen is the variable's current VALUE."
10. Distribute variable design sheets.
11. Each pair designs a counter for one of: a game score, a step counter, a spelling practice score, or an attendance tally.

### DELIVER - Build the Score Counter (28 min)
12. Fill in: Name of variable, starting value (0), when it goes up (+1 per tap), when it goes down (if applicable), target value (e.g. "when score reaches 5, the game is complete").
13. Write the counter programme plan on the strip: Green Flag (reset to 0) → On-Tap trigger → Increment Number block.
14. Facilitator approves each design. Check: is the starting value defined? Is the increment trigger clear? Does the name describe what is being counted?
15. Open Stack KIDI. New project. Add character.
16. Step 1 - Reset programme (5 min): Green Flag row → Add a Number Display block showing 0. This is the "reset to zero" programme. Run with Green Flag. Confirm number shows 0 on screen.

### DISCOVER - Variable Showcase and Maths Link (10 min)
17. Step 2 - Tap to increment (10 min): Add an On-Tap trigger row. After the trigger, add a Number Display + 1 block (or equivalent increment block). Tap the character 5 times. Observe: does the number increase by 1 each tap? Record the number after each tap in a tally.
18. Step 3 - Test the prediction challenge (8 min): Distribute prediction challenge cards. Without running the programme, learners predict the final number after the described sequence of taps. Write prediction. Then run the sequence and compare. Were they right?
19. Step 4 - Decrement (5 min): Add a second character or a second tap row that DECREMENTs (−1). Test: tap Character 1 three times (+3), then tap Character 2 once (−1). Predict: what is the final score? (Answer: 2.) Run and confirm.
20. Each pair demonstrates their counter to the adjacent pair: press Green Flag (resets to 0), then tap 5 times, then reset again.
21. Maths connection: "Tapping 5 times is like adding 1 five times: 0+1+1+1+1+1 = 5. What multiplication does that represent?" (5 × 1 = 5.)

### WRAP-UP (4 min)
22. Challenge: "Can you make the counter count by 2s instead of 1s?" One pair attempts by changing the increment value. Share the result.
23. Class reflection: "A variable stores a value that ___. Its name ___ but its value ___."
24. Each learner writes: "A variable is ___. My variable today was called ___ and started at ___."
25. Save counter projects. Collect design sheets.
26. Preview: "Next lesson - we add a WAIT block to create timed pauses and build programmes that coordinate between time and events."

## Assessment

- Formative (During)
- Variable design sheet approved (name, starting value, trigger, target defined)
- Tally of 5 taps recorded with number after each (evidence of incrementing)
- Prediction challenge card: predicted and actual values recorded and compared
- Decrement tested and final value calculated and confirmed
- Exit / Summative
- Learner completes: "A variable is ___. My variable today was called ___ and started at ___." Facilitator checks for: name + value + the idea that value changes. Full marks = all three concepts included.
- Differentiation
- Support: Facilitator pre-builds the Green Flag reset programme; learner builds only the On-Tap increment row. Extension: Build a programme where the character's SIZE changes in proportion to the score - as the score goes up, the character grows. This requires combining variables and appearance blocks.

## Key Vocabulary

_See source._

## Safeguarding

Safeguarding Note: Counting exercises in this lesson are abstract and fictional. Ensure counter themes do not reference competitive scoring between learners in a way that could cause distress.

## Full source extract (complete)

### Detail body

```
Define a variable as "a named store for a value that can change over time" using an everyday analogy
Use Stack KIDI's number display block to show an on-screen number that the learner can interact with
Build a tap-triggered counter that increments a visible number each time the character is tapped
Predict the final displayed number after a specific sequence of increment and decrement actions
4 tablets with Stack KIDI - fresh projects
Variable analogy cards (6 cards): a piggy bank with a changing amount, a scoreboard with changing scores, a thermometer with a changing temperature, a countdown timer, a lives counter in a game, a tally chart - each labelled with: Name = ___, Starting Value = ___, Changes when = ___
Variable design sheet (A4 per pair): Name of variable | Starting value | When does it go UP? | When does it go DOWN? | What happens when it reaches a target?
Counter programme plan strips (A5 per pair): blank horizontal strip with 4 squares - learners draw the blocks for the increment programme
Prediction challenge cards (4 cards, one per pair): shows a sequence of UP/DOWN taps and asks: "What number is displayed after this sequence?"
Welcome learners to Term 2. Ask: "What is the SCORE right now in this room? How many people are here? That is a variable - it changes every session."
Show variable analogy cards one at a time. For each: "What is the variable's name? What is its starting value? How does it change?" Class calls out answers.
Introduce the key concept: "A variable has a NAME that never changes. But the VALUE inside the box changes every time something happens."
Write on board: VARIABLE = NAME + VALUE. The name is fixed. The value is flexible.
Bridge: "In Stack KIDI today, we build a SCORE counter. Every tap on the character adds 1 to the score. The number on screen is the variable's current VALUE."
Distribute variable design sheets.
Each pair designs a counter for one of: a game score, a step counter, a spelling practice score, or an attendance tally.
Fill in: Name of variable, starting value (0), when it goes up (+1 per tap), when it goes down (if applicable), target value (e.g. "when score reaches 5, the game is complete").
Write the counter programme plan on the strip: Green Flag (reset to 0) → On-Tap trigger → Increment Number block.
Facilitator approves each design. Check: is the starting value defined? Is the increment trigger clear? Does the name describe what is being counted?
Open Stack KIDI. New project. Add character.
Step 1 - Reset programme (5 min): Green Flag row → Add a Number Display block showing 0. This is the "reset to zero" programme. Run with Green Flag. Confirm number shows 0 on screen.
Step 2 - Tap to increment (10 min): Add an On-Tap trigger row. After the trigger, add a Number Display + 1 block (or equivalent increment block). Tap the character 5 times. Observe: does the number increase by 1 each tap? Record the number after each tap in a tally.
Step 3 - Test the prediction challenge (8 min): Distribute prediction challenge cards. Without running the programme, learners predict the final number after the described sequence of taps. Write prediction. Then run the sequence and compare. Were they right?
Step 4 - Decrement (5 min): Add a second character or a second tap row that DECREMENTs (−1). Test: tap Character 1 three times (+3), then tap Character 2 once (−1). Predict: what is the final score? (Answer: 2.) Run and confirm.
Each pair demonstrates their counter to the adjacent pair: press Green Flag (resets to 0), then tap 5 times, then reset again.
Maths connection: "Tapping 5 times is like adding 1 five times: 0+1+1+1+1+1 = 5. What multiplication does that represent?" (5 × 1 = 5.)
Challenge: "Can you make the counter count by 2s instead of 1s?" One pair attempts by changing the increment value. Share the result.
Class reflection: "A variable stores a value that ___. Its name ___ but its value ___."
Each learner writes: "A variable is ___. My variable today was called ___ and started at ___."
Save counter projects. Collect design sheets.
Preview: "Next lesson - we add a WAIT block to create timed pauses and build programmes that coordinate between time and events."
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED
Stack KIDI Lesson Plan  ·  DDD Framework
Stage 2  (P2 · Cambridge Stage 2 / Year 2)
Lesson 9  ·  Term 2 · Week 1
Variables in Stack KIDI - Counting Scores and Tracking Progress
Duration
60 minutes
Term / Week
Term 2 · Week 1
Age Range
7–8 years
Group Size
8 learners  (pair programming - 4 pairs)
Hardware
Tablets with Stack KIDI App
Bloom's
L2 Understand · L3 Apply · L4 Analyse
NCDC
Uganda NCDC Thematic Curriculum P2 - Numeracy Strand: Introduction to unknowns; recording and updating changing values; Literacy: Understanding labels and categories that hold changing information
Cambridge
Cambridge Primary Computing 0845 - Stage 2: Introduction to data - storing a changing value; using on-screen number display to show a variable; updating a displayed value through programme interaction
DDD Phase
DESIGN + DELIVER - Learners design a score-counting or progress-tracking system using Stack KIDI's number display and tap interaction, then implement and test it
Big Idea
A variable is like a box with a label. The label stays the same - but what is INSIDE the box can change. In a game, a "score" box starts at 0 and grows every time you do something right.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
Facilitator Preparation Note:
NOTE: Stack KIDI's native variable support is limited. The "Number Display" block shows a number on screen that can be changed by increment/decrement blocks. Familiarise yourself with this feature before the lesson - it is in the Control (orange) category on some versions, or may require the learner to tap the number on screen to increment it depending on device OS version. Test on your specific tablets before the session.
CROSS-CURRICULAR LINKS
English
The analogy of a variable as a named container: "My variable is called SCORE. It starts at 0. Every time I catch a ball, SCORE goes up by 1." Learners write their own analogy: "A variable is like a ___ because ___." Vocabulary: variable, value, increment, decrement, store, update, named, container, track.
Maths
Counting sequences: starting at 0, incrementing by 1 five times = 5. If the score is 7 and decrements by 2, score = 5. Learners complete 5 written increment/decrement problems before the prediction challenge card. Connection to addition and subtraction number lines.
LESSON STRUCTURE
HOOK - Term 2 Welcome + The Score Board (8 min)
DESIGN - Variable Design Sheet (10 min)
DELIVER - Build the Score Counter (28 min)
DISCOVER - Variable Showcase and Maths Link (10 min)
WRAP-UP (4 min)
ASSESSMENT
Formative (During)
Variable design sheet approved (name, starting value, trigger, target defined)
Tally of 5 taps recorded with number after each (evidence of incrementing)
Prediction challenge card: predicted and actual values recorded and compared
Decrement tested and final value calculated and confirmed
Exit / Summative
Learner completes: "A variable is ___. My variable today was called ___ and started at ___." Facilitator checks for: name + value + the idea that value changes. Full marks = all three concepts included.
Differentiation
Support: Facilitator pre-builds the Green Flag reset programme; learner builds only the On-Tap increment row. Extension: Build a programme where the character's SIZE changes in proportion to the score - as the score goes up, the character grows. This requires combining variables and appearance blocks.
KEY VOCABULARY
variable   ·   value   ·   name   ·   increment   ·   decrement   ·   store   ·   counter   ·   display   ·   reset   ·   track
Safeguarding Note: Counting exercises in this lesson are abstract and fictional. Ensure counter themes do not reference competitive scoring between learners in a way that could cause distress.
Facilitator Name:   ________________________
Date Delivered:   ________________________
Signature:   ________________________
```
