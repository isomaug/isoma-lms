# Week 5 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Define the terms: rule-based system, classifier, decision tree, training rule, input feature, output class - and give a concrete hardware example of each
- Map a dual-input classification problem (temperature + light) onto a hand-drawn decision tree with at least 4 leaf nodes (output classes)
- Translate the decision tree directly into a modular Arduino sketch using nested if/else and named classification functions
- Test yourselfifier against a minimum of 6 deliberately constructed test cases and record predicted vs actual output in a test results table
- Calculate the accuracy of yourselfifier: (correct classifications ÷ total tests) × 100%
- Write a structured critique (minimum 100 words) evaluating two limitations of the rule-based approach and proposing one improvement that would move it closer to a true machine learning model

## Continue

### 3. INDEPENDENT / PAIR WORK Test, Measure & Critique
1. Task 1 (20 min): Structured testing - complete all 6 rows of the Classifier Test Results Table. For each test: (a) set the physical conditions deliberately (warm the sensor with a finger, cover the LDR with a hand, etc.), (b) record the input values from Serial Monitor, (c) record the expected and actual class, (d) mark Pass/Fail.
2. Task 2 (5 min): Calculate classifier accuracy: (passed tests ÷ 6) × 100%. Write on the test table. If accuracy < 67%, yourselfifier has a design fault - identify which test case fails and which branch is incorrect.
3. Task 3 (20 min): Write the Structured Critique - minimum 100 words using the AI Critique Writing Frame. Must address: (1) one structural limitation of rule-based classification (e.g. thresholds are manually set, not learned from data), (2) why this matters in a real application, (3) one proposed improvement (e.g. using machine learning to learn thresholds from training data), (4) one limitation of that improvement.
4. Task 4 (Extension, 5 min): Add a third input - the button (pressed = person present; not pressed = no person). Extend yourselfifier to 3 inputs and redraw the decision tree. How many possible classes now?
5. Rotate Driver/Navigator between Tasks 1 and 3.
### 4. SHOWCASE & DEBRIEF
6. 2 you demonstrate their classifier live - class watches and calls out the expected class before it triggers. "Warm sensor, bright light - what class should this be?" Then observe if the output matches.
7. Accuracy comparison: which pair achieved the highest accuracy? What design decision led to that? What threshold values did they use?
8. One pair reads their Structured Critique aloud. Class evaluates: Is the limitation structural (not just a bug)? Is the proposed improvement realistic? Is the counter-limitation fair?
9. AI connection (escalated from T1 W6): "In Term 1 you described AI. Today you BUILT a rule-based AI system and EVALUATED its limitations. That is the difference between understanding AI and doing AI engineering."
10. Math close: draw a 3-input tree on the board. How many leaf nodes? 2³ = 8. "If each classification takes 0.5 seconds to compute, how long to classify all possible input combinations?" (4 seconds.) "What about 10 inputs?" (2¹⁰ = 1024 combinations × 0.5s = 512 seconds.) This is why machine learning replaces rule-based systems for complex problems.
11. Collect Decision Tree, Test Results Table, and Structured Critique as this week's artifact.

## All Lesson 2 steps (complete list)

1. Task 1 (20 min): Structured testing - complete all 6 rows of the Classifier Test Results Table. For each test: (a) set the physical conditions deliberately (warm the sensor with a finger, cover the LDR with a hand, etc.), (b) record the input values from Serial Monitor, (c) record the expected and actual class, (d) mark Pass/Fail.
2. Task 2 (5 min): Calculate classifier accuracy: (passed tests ÷ 6) × 100%. Write on the test table. If accuracy < 67%, yourselfifier has a design fault - identify which test case fails and which branch is incorrect.
3. Task 3 (20 min): Write the Structured Critique - minimum 100 words using the AI Critique Writing Frame. Must address: (1) one structural limitation of rule-based classification (e.g. thresholds are manually set, not learned from data), (2) why this matters in a real application, (3) one proposed improvement (e.g. using machine learning to learn thresholds from training data), (4) one limitation of that improvement.
4. Task 4 (Extension, 5 min): Add a third input - the button (pressed = person present; not pressed = no person). Extend yourselfifier to 3 inputs and redraw the decision tree. How many possible classes now?
5. Rotate Driver/Navigator between Tasks 1 and 3.
6. 2 you demonstrate their classifier live - class watches and calls out the expected class before it triggers. "Warm sensor, bright light - what class should this be?" Then observe if the output matches.
7. Accuracy comparison: which pair achieved the highest accuracy? What design decision led to that? What threshold values did they use?
8. One pair reads their Structured Critique aloud. Class evaluates: Is the limitation structural (not just a bug)? Is the proposed improvement realistic? Is the counter-limitation fair?
9. AI connection (escalated from T1 W6): "In Term 1 you described AI. Today you BUILT a rule-based AI system and EVALUATED its limitations. That is the difference between understanding AI and doing AI engineering."
10. Math close: draw a 3-input tree on the board. How many leaf nodes? 2³ = 8. "If each classification takes 0.5 seconds to compute, how long to classify all possible input combinations?" (4 seconds.) "What about 10 inputs?" (2¹⁰ = 1024 combinations × 0.5s = 512 seconds.) This is why machine learning replaces rule-based systems for complex problems.
11. Collect Decision Tree, Test Results Table, and Structured Critique as this week's artifact.

## Check your understanding
- Evidence Required
- Formative (During)
- Classifier sketch compiles and correctly outputs distinct LED/buzzer signals for each class. All 6 test cases recorded. Decision tree on paper matches the code structure.
- Your own check log. Test table and decision tree verified as matching before critique is written.
- Term 2 Week 5 Artifact
- Decision Tree diagram (hand-drawn, all nodes labelled) + Classifier Test Results Table (6 rows, accuracy calculated) + Structured Critique (min. 100 words, 4-part structure). Scored on 5-point rubric (DDD Part 8.3).
- All three physical documents collected and stapled together.
- Differentiation
- Support: provide a pre-written decision tree diagram - you translate to code and complete testing only. Extension: 3-input classifier with button; Venn diagram of sensor condition sets; accuracy recalculated.
- Extension: 3-input decision tree redrawn and attached to artifact submission.

## Key words to remember
rule-based system · classifier · decision tree · input feature · output class · leaf node · accuracy · threshold · compound inequality · AND · OR · training data · machine learning · limitation · critique Date Delivered: Signature:

## Stay safe
When discussing AI in real-world applications (facial recognition, medical diagnosis, social scoring), ensure the discussion remains conceptual and does not reference specific you. The critique activity requires intellectual honesty - you should evaluate limitations of their own system, not a classmate's. Facilitate with care if a learner becomes frustrated when their classifier fails a test case - reframe: "A failing test is information, not a failure of effort."

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
