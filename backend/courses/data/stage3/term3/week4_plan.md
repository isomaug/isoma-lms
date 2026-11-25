# Lesson 20: Pattern Recognition & AI Thinking – The Micro:bit as a Classifier

**Duration:** 60 minutes (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 4
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L4–L5 Analysing / Evaluating
**DDD Phase:** DELIVER → DISCOVER – Learners explore the DDD's 'AI: patterns, classification' cross-curricular concept through unplugged sorting, rule-based classification programmes, and evaluation of what makes a classifier accurate
**NCDC:** Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3/4: Understanding how computers can be programmed to make decisions; Exploring how patterns in data can be used to classify information; Evaluating the reliability and limitations of rule-based systems

**Big Idea:** AI is not magic — it is patterns and rules. The simplest AI is a rule-based classifier: if the input matches a rule, it belongs to one class; if not, it belongs to another. Your Micro:bit can be a classifier today. The big question is not just 'does it work?' but 'how accurately does it work — and why does it sometimes get it wrong?'

**Source plan:** `Stage3_Term3_Week4_Microbit_LessonPlan.docx`

## Learning Objectives

- Sort a set of 20 data cards into two classes using a single rule (unplugged activity), then evaluate: how many cards were easy to classify, how many were ambiguous, and why
- Explain in writing what a 'classifier' is and give one example of a classifier used in everyday technology (spam filter, face unlock, autocomplete)
- Programme a temperature-based Micro:bit classifier: Class A = 'Warm' (temperature > 25°C) → show sun; Class B = 'Cool' (temperature ≤ 25°C) → show snowflake — with a scrolling class label on LED
- Extend to a 3-class classifier using nested conditions: Class A = Warm (>28°C), Class B = Comfortable (20–28°C), Class C = Cool (<20°C) — each with a distinct icon and scrolling label
- Run 10 controlled test inputs and record predicted class vs. actual class in a classification accuracy table; calculate accuracy as a percentage
- Write a 5-sentence evaluation: classifier accuracy achieved, one case where it was wrong or ambiguous, the limitation of rule-based classification, and one way to improve accuracy

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Data card set (20 printed cards per pair) — each card shows one number (ranging from 1 to 50); for sorting by rules
- Classifier planning sheet (A4 per learner) — 3-column table: Class Name | Condition (in plain English) | LED icon / scrolling label
- Classification accuracy table (A4 per learner) — 10-row test log: Test # | Input condition | Predicted class | Actual class | Correct (Y/N)
- Evaluation writing frame (A5 per learner) — 5 sentence starters
- Vocabulary cards: 'classifier', 'class', 'rule', 'pattern', 'accuracy', 'ambiguous', 'threshold', 'label', 'AI', 'rule-based', 'training data', 'prediction'
- Facilitator device + projected screen
- Sticky notes for ambiguous card identification in the unplugged activity

## Cross-Curricular Links

**English:** Explanatory and evaluative writing — the DDD's Stage 3–4 English literacy thread (Part 3.2). Learners write a 2-sentence definition of 'classifier' with a real-world example. Evaluation writing frame: ① 'My classifier achieved an accuracy of ___% because…' ② 'The case where it was wrong or ambiguous was when… because…' ③ 'A limitation of a rule-based classifier is… which means…' ④ 'A real AI system would improve this by…' ⑤ 'This tells me that AI decision-making is similar to/different from human decision-making because…'. Oral explanation: each learner explains what their 3-class classifier does in 2 sentences to their partner, using the vocabulary 'class', 'condition', and 'threshold'.

**Maths:** Accuracy and percentage: learners record 10 test results (predicted vs. actual class) and calculate accuracy = correct predictions ÷ 10 × 100. If the classifier is correct 8 times out of 10, accuracy = 80%. Compare pairs: whose classifier achieved higher accuracy? What was the difference in percentage points? Threshold mathematics: the 3-class classifier has two thresholds (28°C and 20°C). Plot these on a number line, dividing the temperature scale into 3 regions. If the temperature is exactly 28°C, which class does it belong to? (Edge case: test the code and report.) If the temperature threshold is lowered from 28°C to 26°C, which class grows larger — A or B? By how many degrees? Connects directly to DDD Part 2.4: 'Logic, sorting and problem solving; pattern recognition and classification.'

## Lesson Structure

### HOOK – You Are Already a Classifier (10 min)
1. Distribute data card sets — 20 number cards per pair, values 1–50. Instruction: 'Sort these cards into two groups using this rule: numbers greater than 25 go to Group A; numbers 25 or less go to Group B. You have 90 seconds.' Pairs sort.
2. Debrief: 'How long did that take? Was every card easy to classify?' Ask: 'What do you call a system that takes an input, applies a rule, and assigns it to a class?' Introduce 'classifier'. 'What you just did with your hands — a computer does millions of times per second. That is the foundation of AI.'
3. Now change the rule: 'Re-sort the same cards — but now Group A = even numbers, Group B = odd numbers.' Pairs re-sort. Ask: 'Was the second rule harder or easier? Which cards were ambiguous?' (None — every number is either even or odd. The first rule had no ambiguity either, but real-world classifiers often do.)
4. Show vocabulary card: 'AI — rule-based decision-making'. Explain: 'The most basic AI is just a very fast classifier — it follows rules, like you did. Today we build one on the Micro:bit. The interesting question is: how ACCURATE is it?'
### DESIGN – Plan the Classifier (10 min)
5. Distribute classifier planning sheets. Learners design their 3-class temperature classifier in the table: Class A name | Condition (plain English) | Icon | Scrolling label. Example: Class A = Warm | temp > 28°C | sun icon | 'WARM'. Do the same for Classes B and C. Facilitator checks: are the three conditions mutually exclusive and exhaustive? Do they cover ALL possible temperature values?
6. Pairs write the 2-sentence classifier definition at the top of the planning sheet. Facilitator prompt: 'What is a classifier? Give one real example from technology.' Example: 'A classifier is a system that sorts inputs into labelled groups using rules. A spam filter is a classifier — it sorts emails into Spam or Not Spam based on patterns in the text.'
7. Pre-test planning: pairs write 10 planned test inputs in the accuracy table BEFORE building the programme — 3 inputs that should give Class A, 4 for Class B, 3 for Class C. (They will check these against actual outcomes after coding.) Facilitator checks: do the planned inputs span both sides of each threshold?
### DELIVER – Build and Test the Classifier (30 min)
8. Distribute Micro:bits and laptops. Assign Driver and Navigator.
9. Task 1 – 2-class classifier (8 min): code 'on button A pressed': if temperature > 25 → show icon sun → scroll string 'WARM'; else → show icon snowflake → scroll string 'COOL'. Download and test. Record 3 button presses in the accuracy table. Are the results correct?
10. Task 2 – Extend to 3-class classifier (12 min): replace the simple if/else with nested conditions: if temp > 28 → 'WARM'; else if temp ≥ 20 → 'COMFY'; else → 'COOL'. Download and test. Ask: 'What happens if temperature is exactly 28°C? Which class does it go into?' Test this edge case and record the result. SWAP Driver and Navigator.
11. Task 3 – 10-test accuracy run (10 min): pairs run all 10 planned test inputs from the accuracy table. For each: record the actual class the Micro:bit displays. Mark Correct (Y) or Not Correct (N). After 10 tests, calculate accuracy percentage.
### DISCOVER – Evaluate the Classifier (8 min)
12. Each learner independently writes the 5-sentence evaluation using the writing frame. Facilitator prompt: 'Sentence 3 asks about a limitation — what is one thing a rule-based classifier CANNOT do that a more advanced AI system might do? Think about what happens if the temperature changes very rapidly — does your classifier adapt?'
13. Two pairs share their accuracy tables. Facilitator asks: 'Did any classifier achieve 100% accuracy? Why might a temperature-based classifier sometimes give an unexpected result?' Guide to: the Micro:bit temperature sensor reads the chip temperature, which is affected by nearby electronics — it may not perfectly reflect room temperature.
14. Bridge to AI literacy: 'A spam filter works exactly like your Micro:bit classifier — but instead of temperature, it uses word patterns. Instead of 3 classes, it might have 10. The rules were not written by hand — they were learned from thousands of examples. That is what makes it AI rather than just code. In Stage 4, you will go further.'
15. Maths close: 'If we lower the threshold from 28°C to 26°C, Class A gets ___°C larger. Class B gets ___°C smaller.' Pairs calculate and share. 'What is the new temperature range for Class B?' Plot the new thresholds on the number line.
### WRAP-UP – Save and Collect (2 min)
16. Rename project 'T3W4_[Name]_Classifier'. Disconnect Micro:bit.
17. Collect classifier planning sheets, classification accuracy tables, and evaluation writing frames — all three are formally assessed artifacts this week. Facilitator checks: 3-class classifier planned with mutually exclusive conditions, 10 test results recorded, accuracy percentage calculated, and 5-sentence evaluation complete. Update participation log and assessment record sheet per DDD Part 10.3.

## Assessment

- Formative (During)
- Observation: Does the 2-class classifier correctly show the sun icon and 'WARM' label for temperatures above 25°C? (2-class functionality check)
- Does the 3-class classifier show three distinct, correctly labelled outputs across the temperature ranges? (3-class functionality check)
- Are all 10 planned test inputs run and recorded in the accuracy table with a calculated accuracy percentage? (test accuracy check)
- Evaluation writing frame: are all 5 sentences complete with accurate vocabulary and a genuine limitation identified? (evaluation quality check)
- Exit Assessment
- Facilitator poses a scenario: 'A new test input of exactly 20°C is entered. Which class does your classifier assign it to, and why?' Learner answers from the planning sheet condition and verifies on the Micro:bit if needed. Then: 'What is your classifier accuracy percentage? Is 80% a good classifier — justify your answer.' 3 points per learner — recorded on assessment log alongside the artifact grade.
- Differentiation
- Support: Use a pre-built 2-class classifier — learner only adds the scrolling label and icon, then runs the 10-test accuracy check and completes the evaluation. Reduce evaluation to 3 sentences. Extension: Design a 4-class classifier that adds a fourth class for very high temperatures (>35°C = 'HOT'). Research: how would an AI spam filter decide what 'looks like spam'? Write a paragraph comparing rule-based classification (what the Micro:bit does) to learning-based classification (what a real spam filter does) — what is the key difference?

## Key Vocabulary

classifier · class · rule · pattern · accuracy · ambiguous · threshold · label · AI · rule-based · training data · prediction · edge case · mutually exclusive · exhaustive Date Delivered: Signature:

## Safeguarding

Safeguarding Note: The concept of AI classification must be introduced in a balanced and age-appropriate way — emphasise that AI systems can make mistakes, can be biased if their rules are biased, and require human oversight. Do not present AI as infallible or as a replacement for human judgement. Any discussion of AI examples (face unlock, spam filter) must not reference specific commercial products or imply endorsement. Ensure the data card activity does not inadvertently sort or classify learners themselves by any personal characteristic.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)  |  Term Three
Lesson 20: Pattern Recognition & AI Thinking – The Micro:bit as a Classifier
T3 · W4
(Week 20)
Duration
60 minutes
Term / Week
Term 3 · Week 4
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L4–L5 Analysing / Evaluating
DDD Phase
DELIVER → DISCOVER – Learners explore the DDD's 'AI: patterns, classification' cross-curricular concept through unplugged sorting, rule-based classification programmes, and evaluation of what makes a classifier accurate
NCDC Ref
Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic, Data & Problem Solving
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3/4: Understanding how computers can be programmed to make decisions; Exploring how patterns in data can be used to classify information; Evaluating the reliability and limitations of rule-based systems
Term Three Focus
The DDD Part 2.4 cross-curricular framework explicitly names 'AI: patterns, classification' as a coding concept at Stage 3–4 level. Stage 5–6 ILO 3.3 covers AI pattern recognition formally. Term Three Week 4 plants this concept at Stage 3: an unplugged classification activity, a rule-based Micro:bit classifier programme, and written evaluation of what makes a classifier reliable — bridging toward Stage 4 readiness.
Key ILO(s)
ILO 2.2 (bridged to AI literacy) – Design and code a rule-based classification programme on the Micro:bit that categorises sensor inputs into labelled classes; evaluate the classifier's accuracy across at least 10 test inputs; write a 5-sentence evaluation of the classifier's performance and limitations.
Big Idea
AI is not magic — it is patterns and rules. The simplest AI is a rule-based classifier: if the input matches a rule, it belongs to one class; if not, it belongs to another. Your Micro:bit can be a classifier today. The big question is not just 'does it work?' but 'how accurately does it work — and why does it sometimes get it wrong?'
Prior Learning Link
ILO 2.2 established if/else conditions in T1 Week 4; T2 Week 2 extended to Boolean AND/OR and nested logic. Term Three Week 4 frames these same logical structures as the foundation of AI classification — the DDD's own conceptual bridge between Stage 3 coding skills and Stage 5–6 AI literacy (ILO 3.3).
LEARNING OBJECTIVES
#
Objective
1
Sort a set of 20 data cards into two classes using a single rule (unplugged activity), then evaluate: how many cards were easy to classify, how many were ambiguous, and why
2
Explain in writing what a 'classifier' is and give one example of a classifier used in everyday technology (spam filter, face unlock, autocomplete)
3
Programme a temperature-based Micro:bit classifier: Class A = 'Warm' (temperature > 25°C) → show sun; Class B = 'Cool' (temperature ≤ 25°C) → show snowflake — with a scrolling class label on LED
4
Extend to a 3-class classifier using nested conditions: Class A = Warm (>28°C), Class B = Comfortable (20–28°C), Class C = Cool (<20°C) — each with a distinct icon and scrolling label
5
Run 10 controlled test inputs and record predicted class vs. actual class in a classification accuracy table; calculate accuracy as a percentage
6
Write a 5-sentence evaluation: classifier accuracy achieved, one case where it was wrong or ambiguous, the limitation of rule-based classification, and one way to improve accuracy
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open
Data card set (20 printed cards per pair) — each card shows one number (ranging from 1 to 50); for sorting by rules
Classifier planning sheet (A4 per learner) — 3-column table: Class Name | Condition (in plain English) | LED icon / scrolling label
Classification accuracy table (A4 per learner) — 10-row test log: Test # | Input condition | Predicted class | Actual class | Correct (Y/N)
Evaluation writing frame (A5 per learner) — 5 sentence starters
Vocabulary cards: 'classifier', 'class', 'rule', 'pattern', 'accuracy', 'ambiguous', 'threshold', 'label', 'AI', 'rule-based', 'training data', 'prediction'
Facilitator device + projected screen
Sticky notes for ambiguous card identification in the unplugged activity
Cross-Curricular Links
English Literacy
Explanatory and evaluative writing — the DDD's Stage 3–4 English literacy thread (Part 3.2). Learners write a 2-sentence definition of 'classifier' with a real-world example. Evaluation writing frame: ① 'My classifier achieved an accuracy of ___% because…' ② 'The case where it was wrong or ambiguous was when… because…' ③ 'A limitation of a rule-based classifier is… which means…' ④ 'A real AI system would improve this by…' ⑤ 'This tells me that AI decision-making is similar to/different from human decision-making because…'. Oral explanation: each learner explains what their 3-class classifier does in 2 sentences to their partner, using the vocabulary 'class', 'condition', and 'threshold'.
Mathematics
Accuracy and percentage: learners record 10 test results (predicted vs. actual class) and calculate accuracy = correct predictions ÷ 10 × 100. If the classifier is correct 8 times out of 10, accuracy = 80%. Compare pairs: whose classifier achieved higher accuracy? What was the difference in percentage points? Threshold mathematics: the 3-class classifier has two thresholds (28°C and 20°C). Plot these on a number line, dividing the temperature scale into 3 regions. If the temperature is exactly 28°C, which class does it belong to? (Edge case: test the code and report.) If the temperature threshold is lowered from 28°C to 26°C, which class grows larger — A or B? By how many degrees? Connects directly to DDD Part 2.4: 'Logic, sorting and problem solving; pattern recognition and classification.'
LESSON STRUCTURE
Step
Activity
HOOK – You Are Already a Classifier (10 min)
1
Distribute data card sets — 20 number cards per pair, values 1–50. Instruction: 'Sort these cards into two groups using this rule: numbers greater than 25 go to Group A; numbers 25 or less go to Group B. You have 90 seconds.' Pairs sort.
2
Debrief: 'How long did that take? Was every card easy to classify?' Ask: 'What do you call a system that takes an input, applies a rule, and assigns it to a class?' Introduce 'classifier'. 'What you just did with your hands — a computer does millions of times per second. That is the foundation of AI.'
3
Now change the rule: 'Re-sort the same cards — but now Group A = even numbers, Group B = odd numbers.' Pairs re-sort. Ask: 'Was the second rule harder or easier? Which cards were ambiguous?' (None — every number is either even or odd. The first rule had no ambiguity either, but real-world classifiers often do.)
4
Show vocabulary card: 'AI — rule-based decision-making'. Explain: 'The most basic AI is just a very fast classifier — it follows rules, like you did. Today we build one on the Micro:bit. The interesting question is: how ACCURATE is it?'
DESIGN – Plan the Classifier (10 min)
5
Distribute classifier planning sheets. Learners design their 3-class temperature classifier in the table: Class A name | Condition (plain English) | Icon | Scrolling label. Example: Class A = Warm | temp > 28°C | sun icon | 'WARM'. Do the same for Classes B and C. Facilitator checks: are the three conditions mutually exclusive and exhaustive? Do they cover ALL possible temperature values?
6
Pairs write the 2-sentence classifier definition at the top of the planning sheet. Facilitator prompt: 'What is a classifier? Give one real example from technology.' Example: 'A classifier is a system that sorts inputs into labelled groups using rules. A spam filter is a classifier — it sorts emails into Spam or Not Spam based on patterns in the text.'
7
Pre-test planning: pairs write 10 planned test inputs in the accuracy table BEFORE building the programme — 3 inputs that should give Class A, 4 for Class B, 3 for Class C. (They will check these against actual outcomes after coding.) Facilitator checks: do the planned inputs span both sides of each threshold?
DELIVER – Build and Test the Classifier (30 min)
8
Distribute Micro:bits and laptops. Assign Driver and Navigator.
9
Task 1 – 2-class classifier (8 min): code 'on button A pressed': if temperature > 25 → show icon sun → scroll string 'WARM'; else → show icon snowflake → scroll string 'COOL'. Download and test. Record 3 button presses in the accuracy table. Are the results correct?
10
Task 2 – Extend to 3-class classifier (12 min): replace the simple if/else with nested conditions: if temp > 28 → 'WARM'; else if temp ≥ 20 → 'COMFY'; else → 'COOL'. Download and test. Ask: 'What happens if temperature is exactly 28°C? Which class does it go into?' Test this edge case and record the result. SWAP Driver and Navigator.
11
Task 3 – 10-test accuracy run (10 min): pairs run all 10 planned test inputs from the accuracy table. For each: record the actual class the Micro:bit displays. Mark Correct (Y) or Not Correct (N). After 10 tests, calculate accuracy percentage.
DISCOVER – Evaluate the Classifier (8 min)
12
Each learner independently writes the 5-sentence evaluation using the writing frame. Facilitator prompt: 'Sentence 3 asks about a limitation — what is one thing a rule-based classifier CANNOT do that a more advanced AI system might do? Think about what happens if the temperature changes very rapidly — does your classifier adapt?'
13
Two pairs share their accuracy tables. Facilitator asks: 'Did any classifier achieve 100% accuracy? Why might a temperature-based classifier sometimes give an unexpected result?' Guide to: the Micro:bit temperature sensor reads the chip temperature, which is affected by nearby electronics — it may not perfectly reflect room temperature.
14
Bridge to AI literacy: 'A spam filter works exactly like your Micro:bit classifier — but instead of temperature, it uses word patterns. Instead of 3 classes, it might have 10. The rules were not written by hand — they were learned from thousands of examples. That is what makes it AI rather than just code. In Stage 4, you will go further.'
15
Maths close: 'If we lower the threshold from 28°C to 26°C, Class A gets ___°C larger. Class B gets ___°C smaller.' Pairs calculate and share. 'What is the new temperature range for Class B?' Plot the new thresholds on the number line.
WRAP-UP – Save and Collect (2 min)
16
Rename project 'T3W4_[Name]_Classifier'. Disconnect Micro:bit.
17
Collect classifier planning sheets, classification accuracy tables, and evaluation writing frames — all three are formally assessed artifacts this week. Facilitator checks: 3-class classifier planned with mutually exclusive conditions, 10 test results recorded, accuracy percentage calculated, and 5-sentence evaluation complete. Update participation log and assessment record sheet per DDD Part 10.3.
Assessment
Formative (During)
Observation: Does the 2-class classifier correctly show the sun icon and 'WARM' label for temperatures above 25°C? (2-class functionality check)
Does the 3-class classifier show three distinct, correctly labelled outputs across the temperature ranges? (3-class functionality check)
Are all 10 planned test inputs run and recorded in the accuracy table with a calculated accuracy percentage? (test accuracy check)
Evaluation writing frame: are all 5 sentences complete with accurate vocabulary and a genuine limitation identified? (evaluation quality check)
Exit Assessment
Facilitator poses a scenario: 'A new test input of exactly 20°C is entered. Which class does your classifier assign it to, and why?' Learner answers from the planning sheet condition and verifies on the Micro:bit if needed. Then: 'What is your classifier accuracy percentage? Is 80% a good classifier — justify your answer.' 3 points per learner — recorded on assessment log alongside the artifact grade.
Differentiation
Support: Use a pre-built 2-class classifier — learner only adds the scrolling label and icon, then runs the 10-test accuracy check and completes the evaluation. Reduce evaluation to 3 sentences. Extension: Design a 4-class classifier that adds a fourth class for very high temperatures (>35°C = 'HOT'). Research: how would an AI spam filter decide what 'looks like spam'? Write a paragraph comparing rule-based classification (what the Micro:bit does) to learning-based classification (what a real spam filter does) — what is the key difference?
Key Vocabulary
classifier · class · rule · pattern · accuracy · ambiguous · threshold · label · AI · rule-based · training data · prediction · edge case · mutually exclusive · exhaustive
Safeguarding Note: The concept of AI classification must be introduced in a balanced and age-appropriate way — emphasise that AI systems can make mistakes, can be biased if their rules are biased, and require human oversight. Do not present AI as infallible or as a replacement for human judgement. Any discussion of AI examples (face unlock, spam filter) must not reference specific commercial products or imply endorsement. Ensure the data card activity does not inadvertently sort or classify learners themselves by any personal characteristic.
Facilitator Name:
_________________________________
Date Delivered:
_________________________________
Signature:
_________________________________
```
