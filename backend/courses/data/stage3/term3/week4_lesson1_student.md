# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Sort a set of 20 data cards into two classes using a single rule (unplugged activity), then evaluate: how many cards were easy to classify, how many were ambiguous, and why
- Explain in writing what a 'classifier' is and give one example of a classifier used in everyday technology (spam filter, face unlock, autocomplete)
- Programme a temperature-based Micro:bit classifier: Class A = 'Warm' (temperature > 25°C) -> show sun; Class B = 'Cool' (temperature ≤ 25°C) -> show snowflake — with a scrolling class label on LED
- Extend to a 3-class classifier using nested conditions: Class A = Warm (>28°C), Class B = Comfortable (20–28°C), Class C = Cool (<20°C) — each with a distinct icon and scrolling label
- Run 10 controlled test inputs and record predicted class vs. actual class in a classification accuracy table; calculate accuracy as a percentage
- Write a 5-sentence evaluation: classifier accuracy achieved, one case where it was wrong or ambiguous, the limitation of rule-based classification, and one way to improve accuracy

## Big idea
AI is not magic — it is patterns and rules. The simplest AI is a rule-based classifier: if the input matches a rule, it belongs to one class; if not, it belongs to another. Your Micro:bit can be a classifier today. The big question is not just 'does it work?' but 'how accurately does it work — and why does it sometimes get it wrong?'

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Data card set (20 printed cards for you) — each card shows one number (ranging from 1 to 50); for sorting by rules
- Classifier planning sheet (A4 for you) — 3-column table: Class Name | Condition (in plain English) | LED icon / scrolling label
- Classification accuracy table (A4 for you) — 10-row test log: Test # | Input condition | Predicted class | Actual class | Correct (Y/N)
- Evaluation writing frame (A5 for you) — 5 sentence starters
- Vocabulary cards: 'classifier', 'class', 'rule', 'pattern', 'accuracy', 'ambiguous', 'threshold', 'label', 'AI', 'rule-based', 'training data', 'prediction'
- A computer or screen to follow along
- Sticky notes for ambiguous card identification in the unplugged activity

## Links to English and Maths
- **English:** Explanatory and evaluative writing — the DDD's Stage 3–4 English literacy thread (Part 3.2). You write a 2-sentence definition of 'classifier' with a real-world example. Evaluation writing frame: ① 'My classifier achieved an accuracy of ___% because…' ② 'The case where it was wrong or ambiguous was when… because…' ③ 'A limitation of a rule-based classifier is… which means…' ④ 'A real AI system would improve this by…' ⑤ 'This tells me that AI decision-making is similar to/different from human decision-making because…'. Oral explanation: you explains what their 3-class classifier does in 2 sentences to their partner, using the vocabulary 'class', 'condition', and 'threshold'.
- **Maths:** Accuracy and percentage: you record 10 test results (predicted vs. actual class) and calculate accuracy = correct predictions ÷ 10 × 100. If yourselfifier is correct 8 times out of 10, accuracy = 80%. Compare you: whose classifier achieved higher accuracy? What was the difference in percentage points? Threshold mathematics: the 3-class classifier has two thresholds (28°C and 20°C). Plot these on a number line, dividing the temperature scale into 3 regions. If the temperature is exactly 28°C, which class does it belong to? (Edge case: test the code and report.) If the temperature threshold is lowered from 28°C to 26°C, which class grows larger — A or B? By how many degrees? Connects directly to DDD Part 2.4: 'Logic, sorting and problem solving; pattern recognition and classification.'

## Let's begin

### HOOK – You Are Already a Classifier (10 min)
1. Get ready to use data card sets — 20 number cards for you, values 1–50. Instruction: 'Sort these cards into two groups using this rule: numbers greater than 25 go to Group A; numbers 25 or less go to Group B. You have 90 seconds.' You sort.
2. Debrief: 'How long did that take? Was every card easy to classify?' Ask: 'What do you call a system that takes an input, applies a rule, and assigns it to a class?' Introduce 'classifier'. 'What you just did with your hands — a computer does millions of times per second. That is the foundation of AI.'
3. Now change the rule: 'Re-sort the same cards — but now Group A = even numbers, Group B = odd numbers.' You re-sort. Ask: 'Was the second rule harder or easier? Which cards were ambiguous?' (None — every number is either even or odd. The first rule had no ambiguity either, but real-world classifiers often do.)
4. Show vocabulary card: 'AI — rule-based decision-making'. Explain: 'The most basic AI is just a very fast classifier — it follows rules, like you did. Today we build one on the Micro:bit. The interesting question is: how ACCURATE is it?'
### DESIGN – Plan the Classifier (10 min)
5. Get ready to use classifier planning sheets. You design their 3-class temperature classifier in the table: Class A name | Condition (plain English) | Icon | Scrolling label. Example: Class A = Warm | temp > 28°C | sun icon | 'WARM'. Do the same for Classes B and C. You checks: are the three conditions mutually exclusive and exhaustive? Do they cover ALL possible temperature values?
6. You write the 2-sentence classifier definition at the top of the planning sheet. You prompt: 'What is a classifier? Give one real example from technology.' Example: 'A classifier is a system that sorts inputs into labelled groups using rules. A spam filter is a classifier — it sorts emails into Spam or Not Spam based on patterns in the text.'
7. Pre-test planning: you write 10 planned test inputs in the accuracy table BEFORE building the programme — 3 inputs that should give Class A, 4 for Class B, 3 for Class C. (They will check these against actual outcomes after coding.) You checks: do the planned inputs span both sides of each threshold?
### DELIVER – Build and Test the Classifier (30 min)
8. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Get ready to use data card sets — 20 number cards for you, values 1–50. Instruction: 'Sort these cards into two groups using this rule: numbers greater than 25 go to Group A; numbers 25 or less go to Group B. You have 90 seconds.' You sort.
2. Debrief: 'How long did that take? Was every card easy to classify?' Ask: 'What do you call a system that takes an input, applies a rule, and assigns it to a class?' Introduce 'classifier'. 'What you just did with your hands — a computer does millions of times per second. That is the foundation of AI.'
3. Now change the rule: 'Re-sort the same cards — but now Group A = even numbers, Group B = odd numbers.' You re-sort. Ask: 'Was the second rule harder or easier? Which cards were ambiguous?' (None — every number is either even or odd. The first rule had no ambiguity either, but real-world classifiers often do.)
4. Show vocabulary card: 'AI — rule-based decision-making'. Explain: 'The most basic AI is just a very fast classifier — it follows rules, like you did. Today we build one on the Micro:bit. The interesting question is: how ACCURATE is it?'
5. Get ready to use classifier planning sheets. You design their 3-class temperature classifier in the table: Class A name | Condition (plain English) | Icon | Scrolling label. Example: Class A = Warm | temp > 28°C | sun icon | 'WARM'. Do the same for Classes B and C. You checks: are the three conditions mutually exclusive and exhaustive? Do they cover ALL possible temperature values?
6. You write the 2-sentence classifier definition at the top of the planning sheet. You prompt: 'What is a classifier? Give one real example from technology.' Example: 'A classifier is a system that sorts inputs into labelled groups using rules. A spam filter is a classifier — it sorts emails into Spam or Not Spam based on patterns in the text.'
7. Pre-test planning: you write 10 planned test inputs in the accuracy table BEFORE building the programme — 3 inputs that should give Class A, 4 for Class B, 3 for Class C. (They will check these against actual outcomes after coding.) You checks: do the planned inputs span both sides of each threshold?
8. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
