# Week 5 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Define the terms: rule-based system, classifier, decision tree, training rule, input feature, output class - and give a concrete hardware example of each
- Map a dual-input classification problem (temperature + light) onto a hand-drawn decision tree with at least 4 leaf nodes (output classes)
- Translate the decision tree directly into a modular Arduino sketch using nested if/else and named classification functions
- Test yourselfifier against a minimum of 6 deliberately constructed test cases and record predicted vs actual output in a test results table
- Calculate the accuracy of yourselfifier: (correct classifications ÷ total tests) × 100%
- Write a structured critique (minimum 100 words) evaluating two limitations of the rule-based approach and proposing one improvement that would move it closer to a true machine learning model

## Big idea
ILO 3.3 (summative depth) - Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making, connecting these to their own coded projects. ILO 3.1 (deepened) - Write modular Arduino sketches using compound sensor logic and Serial-formatted output.

## Let's begin

### 1. HOOK The Spam Filter
1. Ask: "How does your email know what is spam?" Collect 4–5 answers. Guide to: it checks features of the email against rules. Example rule: if sender is unknown AND subject contains "FREE MONEY" -> classify as SPAM.
2. Draw a simple 2-node decision tree on the board: one root node (Is temp > 30°C?), two branches (YES -> HOT class; NO -> second node: Is light < 300? -> YES: DARK class; NO: NORMAL class).
3. Ask: "How many classes can this tree produce?" (3). "What if we add one more level?" (up to 4). "What if we had 3 inputs?" (up to 8). Introduce: 2ⁿ = number of classes for n binary inputs.
4. Get ready to use Classification Truth Table. You complete the 4 cells for a 2-input binary classifier: HIGH TEMP + LOW LIGHT = ?, HIGH TEMP + HIGH LIGHT = ?, LOW TEMP + LOW LIGHT = ?, LOW TEMP + HIGH LIGHT = ?. They choose class names.
5. Get ready to use Decision Tree Template. You draw their full decision tree - root node -> branches -> leaf nodes - before touching any code.
### 2. GUIDED ACTIVITY Build the Classifier
6. Step 1 (10 min): Wire the complete dual-sensor circuit - TMP36 on A0, LDR on A1, 3 LEDs on pins 8/9/10, buzzer on pin 11. You complete wiring independently. You checks.
7. Step 2 (15 min): You live-codes the modular structure: String classifyEnvironment(float temp, int light) - a function that takes both sensor readings and returns a String class label. You type simultaneously.
8. Step 3 (20 min): You implement the nested if/else logic inside classifyEnvironment() based on their own decision tree - not the you's version. Each pair may produce a different classifier. You circulates: "Show me where this branch is in your decision tree."
9. Step 4 (10 min): Add the output function: void announceClass(String cls) - uses LEDs and buzzer to signal each class differently. HOT_DARK -> red LED + buzzer; HOT_BRIGHT -> red LED only; COOL_DARK -> yellow LED; COOL_BRIGHT -> green LED.
10. Step 5 (5 min): Upload and run. Cover/uncover LDR; warm TMP36 with finger. Does each class trigger the correct output? First informal test.

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Ask: "How does your email know what is spam?" Collect 4–5 answers. Guide to: it checks features of the email against rules. Example rule: if sender is unknown AND subject contains "FREE MONEY" -> classify as SPAM.
2. Draw a simple 2-node decision tree on the board: one root node (Is temp > 30°C?), two branches (YES -> HOT class; NO -> second node: Is light < 300? -> YES: DARK class; NO: NORMAL class).
3. Ask: "How many classes can this tree produce?" (3). "What if we add one more level?" (up to 4). "What if we had 3 inputs?" (up to 8). Introduce: 2ⁿ = number of classes for n binary inputs.
4. Get ready to use Classification Truth Table. You complete the 4 cells for a 2-input binary classifier: HIGH TEMP + LOW LIGHT = ?, HIGH TEMP + HIGH LIGHT = ?, LOW TEMP + LOW LIGHT = ?, LOW TEMP + HIGH LIGHT = ?. They choose class names.
5. Get ready to use Decision Tree Template. You draw their full decision tree - root node -> branches -> leaf nodes - before touching any code.
6. Step 1 (10 min): Wire the complete dual-sensor circuit - TMP36 on A0, LDR on A1, 3 LEDs on pins 8/9/10, buzzer on pin 11. You complete wiring independently. You checks.
7. Step 2 (15 min): You live-codes the modular structure: String classifyEnvironment(float temp, int light) - a function that takes both sensor readings and returns a String class label. You type simultaneously.
8. Step 3 (20 min): You implement the nested if/else logic inside classifyEnvironment() based on their own decision tree - not the you's version. Each pair may produce a different classifier. You circulates: "Show me where this branch is in your decision tree."
9. Step 4 (10 min): Add the output function: void announceClass(String cls) - uses LEDs and buzzer to signal each class differently. HOT_DARK -> red LED + buzzer; HOT_BRIGHT -> red LED only; COOL_DARK -> yellow LED; COOL_BRIGHT -> green LED.
10. Step 5 (5 min): Upload and run. Cover/uncover LDR; warm TMP36 with finger. Does each class trigger the correct output? First informal test.
