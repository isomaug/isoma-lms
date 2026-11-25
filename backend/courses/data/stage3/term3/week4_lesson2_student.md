# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Sort a set of 20 data cards into two classes using a single rule (unplugged activity), then evaluate: how many cards were easy to classify, how many were ambiguous, and why
- Explain in writing what a 'classifier' is and give one example of a classifier used in everyday technology (spam filter, face unlock, autocomplete)
- Programme a temperature-based Micro:bit classifier: Class A = 'Warm' (temperature > 25°C) -> show sun; Class B = 'Cool' (temperature ≤ 25°C) -> show snowflake — with a scrolling class label on LED
- Extend to a 3-class classifier using nested conditions: Class A = Warm (>28°C), Class B = Comfortable (20–28°C), Class C = Cool (<20°C) — each with a distinct icon and scrolling label
- Run 10 controlled test inputs and record predicted class vs. actual class in a classification accuracy table; calculate accuracy as a percentage
- Write a 5-sentence evaluation: classifier accuracy achieved, one case where it was wrong or ambiguous, the limitation of rule-based classification, and one way to improve accuracy

## Continue

### DELIVER – Build and Test the Classifier (30 min)
1. Task 1 – 2-class classifier (8 min): code 'on button A pressed': if temperature > 25 -> show icon sun -> scroll string 'WARM'; else -> show icon snowflake -> scroll string 'COOL'. Download and test. Record 3 button presses in the accuracy table. Are the results correct?
2. Task 2 – Extend to 3-class classifier (12 min): replace the simple if/else with nested conditions: if temp > 28 -> 'WARM'; else if temp ≥ 20 -> 'COMFY'; else -> 'COOL'. Download and test. Ask: 'What happens if temperature is exactly 28°C? Which class does it go into?' Test this edge case and record the result. Continue with the next steps yourself.
3. Task 3 – 10-test accuracy run (10 min): you run all 10 planned test inputs from the accuracy table. For each: record the actual class the Micro:bit displays. Mark Correct (Y) or Not Correct (N). After 10 tests, calculate accuracy percentage.
### DISCOVER – Evaluate the Classifier (8 min)
4. You independently writes the 5-sentence evaluation using the writing frame. You prompt: 'Sentence 3 asks about a limitation — what is one thing a rule-based classifier CANNOT do that a more advanced AI system might do? Think about what happens if the temperature changes very rapidly — does your classifier adapt?'
5. Two you share their accuracy tables. Ask yourself: 'Did any classifier achieve 100% accuracy? Why might a temperature-based classifier sometimes give an unexpected result?' Guide to: the Micro:bit temperature sensor reads the chip temperature, which is affected by nearby electronics — it may not perfectly reflect room temperature.
6. Bridge to AI literacy: 'A spam filter works exactly like your Micro:bit classifier — but instead of temperature, it uses word patterns. Instead of 3 classes, it might have 10. The rules were not written by hand — they were learned from thousands of examples. That is what makes it AI rather than just code. In Stage 4, you will go further.'
7. Maths close: 'If we lower the threshold from 28°C to 26°C, Class A gets ___°C larger. Class B gets ___°C smaller.' You calculate and share. 'What is the new temperature range for Class B?' Plot the new thresholds on the number line.
### WRAP-UP – Save and Collect (2 min)
8. Rename project 'T3W4_[Name]_Classifier'. Disconnect Micro:bit.
9. Collect classifier planning sheets, classification accuracy tables, and evaluation writing frames — all three are formally assessed artifacts this week. You checks: 3-class classifier planned with mutually exclusive conditions, 10 test results recorded, accuracy percentage calculated, and 5-sentence evaluation complete. Update participation log and assessment record sheet per DDD Part 10.3.

## All Lesson 2 steps (complete list)

1. Task 1 – 2-class classifier (8 min): code 'on button A pressed': if temperature > 25 -> show icon sun -> scroll string 'WARM'; else -> show icon snowflake -> scroll string 'COOL'. Download and test. Record 3 button presses in the accuracy table. Are the results correct?
2. Task 2 – Extend to 3-class classifier (12 min): replace the simple if/else with nested conditions: if temp > 28 -> 'WARM'; else if temp ≥ 20 -> 'COMFY'; else -> 'COOL'. Download and test. Ask: 'What happens if temperature is exactly 28°C? Which class does it go into?' Test this edge case and record the result. Continue with the next steps yourself.
3. Task 3 – 10-test accuracy run (10 min): you run all 10 planned test inputs from the accuracy table. For each: record the actual class the Micro:bit displays. Mark Correct (Y) or Not Correct (N). After 10 tests, calculate accuracy percentage.
4. You independently writes the 5-sentence evaluation using the writing frame. You prompt: 'Sentence 3 asks about a limitation — what is one thing a rule-based classifier CANNOT do that a more advanced AI system might do? Think about what happens if the temperature changes very rapidly — does your classifier adapt?'
5. Two you share their accuracy tables. Ask yourself: 'Did any classifier achieve 100% accuracy? Why might a temperature-based classifier sometimes give an unexpected result?' Guide to: the Micro:bit temperature sensor reads the chip temperature, which is affected by nearby electronics — it may not perfectly reflect room temperature.
6. Bridge to AI literacy: 'A spam filter works exactly like your Micro:bit classifier — but instead of temperature, it uses word patterns. Instead of 3 classes, it might have 10. The rules were not written by hand — they were learned from thousands of examples. That is what makes it AI rather than just code. In Stage 4, you will go further.'
7. Maths close: 'If we lower the threshold from 28°C to 26°C, Class A gets ___°C larger. Class B gets ___°C smaller.' You calculate and share. 'What is the new temperature range for Class B?' Plot the new thresholds on the number line.
8. Rename project 'T3W4_[Name]_Classifier'. Disconnect Micro:bit.
9. Collect classifier planning sheets, classification accuracy tables, and evaluation writing frames — all three are formally assessed artifacts this week. You checks: 3-class classifier planned with mutually exclusive conditions, 10 test results recorded, accuracy percentage calculated, and 5-sentence evaluation complete. Update participation log and assessment record sheet per DDD Part 10.3.

## Check your understanding
- Formative (During)
- Observation: Does the 2-class classifier correctly show the sun icon and 'WARM' label for temperatures above 25°C? (2-class functionality check)
- Does the 3-class classifier show three distinct, correctly labelled outputs across the temperature ranges? (3-class functionality check)
- Are all 10 planned test inputs run and recorded in the accuracy table with a calculated accuracy percentage? (test accuracy check)
- Evaluation writing frame: are all 5 sentences complete with accurate vocabulary and a genuine limitation identified? (evaluation quality check)
- Exit Assessment
- You poses a scenario: 'A new test input of exactly 20°C is entered. Which class does your classifier assign it to, and why?' Learner answers from the planning sheet condition and verifies on the Micro:bit if needed. Then: 'What is your classifier accuracy percentage? Is 80% a good classifier — justify your answer.' 3 points for you — recorded on assessment log alongside the artifact grade.
- Differentiation
- Support: Use a pre-built 2-class classifier — learner only adds the scrolling label and icon, then runs the 10-test accuracy check and completes the evaluation. Reduce evaluation to 3 sentences. Extension: Design a 4-class classifier that adds a fourth class for very high temperatures (>35°C = 'HOT'). Research: how would an AI spam filter decide what 'looks like spam'? Write a paragraph comparing rule-based classification (what the Micro:bit does) to learning-based classification (what a real spam filter does) — what is the key difference?

## Key words to remember
classifier · class · rule · pattern · accuracy · ambiguous · threshold · label · AI · rule-based · training data · prediction · edge case · mutually exclusive · exhaustive Date Delivered: Signature:

## Stay safe
Safeguarding Note: The concept of AI classification must be introduced in a balanced and age-appropriate way — emphasise that AI systems can make mistakes, can be biased if their rules are biased, and require human oversight. Do not present AI as infallible or as a replacement for human judgement. Any discussion of AI examples (face unlock, spam filter) must not reference specific commercial products or imply endorsement. Ensure the data card activity does not inadvertently sort or classify you themselves by any personal characteristic.

## Wrap-up
1. Rename and save your MakeCode project for this week.
2. Disconnect the Micro:bit carefully and return it to the kit.
3. Close the laptop and pack up safely.
