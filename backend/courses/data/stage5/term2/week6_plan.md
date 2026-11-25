# Lesson T2–6: Decision Trees, Training Data Bias & Building a Rule-Based AI Classifier

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 6 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 6
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LDR (pin A0), TMP36 temperature sensor (pin A1) — dual sensor circuit carried forward from T2 Week 5
**Bloom's:** L4 Analysing → L5 Evaluating
**DDD ILO:** ILO 3.3 – Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making; extend to decision trees, training data bias, and the construction of a dual-sensor rule-based AI classifier in Arduino code
**NCDC:** Uganda NCDC P5–P6 – English Strand: Analytical reading, argument writing, evaluating sources for bias; Mathematics Strand: Decision trees, probability, classification rules, threshold values; ICT Strand: AI decision-making, training data, bias and fairness in algorithmic systems
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Artificial intelligence; algorithmic decision-making; data and bias; ethical considerations in computing

**Big Idea:** An AI system is only as fair and accurate as the data it was trained on. If the training data is biased, the AI will be biased. Understanding this is not just a computing skill — it is a critical thinking skill for life.

**Context:** Term Two Context: Term One Week 6 introduced AI vocabulary (pattern recognition, classification, training data, prediction), picture card sorting, and a simple single-condition rule-based classifier in Arduino. Term Two Week 6 goes substantially deeper: learners build a decision tree by hand, implement it as a nested if/else classifier using dual-sensor data from T2 Week 5, investigate what training data bias means and how to detect it, write a structured analytical argument about AI fairness, and evaluate whether their own classifier is biased based on the thresholds they chose.

## Learning Objectives

- Draw a decision tree on paper with at least 3 decision nodes and 4 leaf outcomes for a provided classification problem
- Translate the decision tree into a nested if/else Arduino sketch using dual sensor inputs (LDR and TMP36) that classifies the room environment into one of 4 named categories
- Define training data bias in plain English and give two original examples from everyday Ugandan life where a biased AI could cause harm
- Evaluate their own classifier: identify at least 2 threshold values they chose and explain why a different dataset might make those thresholds unfair
- Write a structured analytical argument of at least 180 words: "Should AI systems be used to make decisions about people?" The argument must include a position, two supporting points with evidence, one counterargument, and a conclusion
- Calculate: given a 20-card dataset where 12 cards satisfy classifier Rule A, what is the probability a randomly chosen card is correctly classified if the classifier always outputs "A"? Express as a fraction, decimal, and percentage

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards with dual sensor circuits from T2 Week 5 (LDR + TMP36)
- Printed "Decision Tree Template" (A4 per pair) — blank tree with 3 levels: root node, 2 decision nodes, 4 leaf nodes — labelled spaces for conditions and outcomes
- Printed "Bias Investigation Cards" (A4 per pair) — 3 short scenarios describing AI systems with potentially biased training data; questions on each card guide analysis
- Printed "Analytical Argument Frame" (A4 per learner) — structured template: Position | Evidence 1 | Evidence 2 | Counterargument | Conclusion
- Printed "Classifier Threshold Worksheet" (A5 per pair) — table for recording chosen thresholds, justification, and bias risk
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Structured analytical argument writing — the highest-order English writing task in the programme. The 5-part frame (Position, Evidence 1, Evidence 2, Counterargument, Conclusion) mirrors the argumentative essay structure required at secondary school and beyond. Learners must commit to a position ("AI should / should not be used to make decisions about people") and defend it with evidence drawn from the bias scenarios, the AI article from Term One, and their own classifier experience. The counterargument section requires them to steelman the opposing view before returning to their position. This is explicitly framed as a transferable writing skill: "This structure — claim, evidence, counter, conclusion — is the same structure used in debate, in law, and in scientific papers."

**Maths:** Decision trees as flowcharts of conditional probability: at each node, the dataset is split according to a rule. If 20 items enter a node and the rule classifies 14 as "A" and 6 as "B", the probability of a random item being classified as "A" is 14/20 = 0.7 = 70%. Accuracy calculation: if the classifier outputs "A" for all 20 items but only 14 are truly "A", accuracy = 14/20 = 70%. If it correctly classifies all 14 "A" items and all 6 "B" items, accuracy = 20/20 = 100%. Threshold analysis: the boundary between "cool" and "warm" in the classifier (e.g. tempC > 27) is a threshold value. Learners calculate: if all training data was collected on a hot day (average 31°C), what bias does this introduce into the threshold?

## Lesson Structure

### WARM-UP & REVIEW — From Rules to Trees  (20 min)
1. Recall T2 Week 5 sensor data: "Last week you collected temperature and light readings. You now have real environmental data. Today you will build an AI that uses those sensors to classify the room environment into one of four categories: Comfortable, Hot and Bright, Cool and Dark, or Too Extreme."
2. Decision tree introduction (10 min): draw a simple 2-level decision tree on the board for classifying fruit: root node — "Is it yellow?" → Yes branch → "Is it curved?" → Yes: Banana, No: Mango. No branch → "Is it round and red?" → Yes: Apple, No: Unknown. Walk through 3 example items. "Every question is an if/else. Every path from root to leaf is a chain of conditions. Today you build one for sensor data."
3. Distribute the decision tree template. "Your tree will have two sensor inputs: LDR (light level) and temperature (in °C). You choose the threshold values — the numbers at each decision node. These numbers determine who gets classified as what. Choose them carefully."
4. Connect to Term One: "In Term One Week 6, you wrote: if lightValue > 600, print Bright. That was one leaf of a decision tree. Today you build the whole tree." Pairs begin sketching their tree on the template — just pencil, no code yet.
5. Decision tree design (15 min): each pair completes their decision tree template. Root node condition must use ONE sensor (e.g. "Is tempC > 27?"). Second level uses the OTHER sensor (e.g. "Is ldrValue > 500?"). Four leaf outcomes: (1) Comfortable: cool and well-lit; (2) Hot and Bright: potential discomfort; (3) Cool and Dark: too dim; (4) Too Extreme: hot and dark — worst case. Pairs write the threshold values they chose and the justification for each in the classifier threshold worksheet.
6. Classifier translation to code (20 min): facilitator models the translation of one branch on the projected screen. "The root node — if tempC > 27 — becomes: if(tempC > 27.0) { // hot branch }. Inside, the second condition — if ldrValue > 500 — becomes: if(ldrValue > 500) { Serial.println("Hot and Bright"); } else { Serial.println("Too Extreme"); } }" Learners translate their full tree — all 4 branches — into a complete Arduino sketch with the dual sensor circuit from T2 Week 5.

### GUIDED ACTIVITY — Build the Decision Tree and Code the Classifier  (60 min)
7. Upload and live-test (10 min): pairs vary room conditions. Cover the LDR. Hold a warm hand near the TMP36. Open and close a window. Watch the Serial Monitor. "Is your classifier giving sensible outputs? Does covering the LDR produce Cool and Dark? Does your warm hand raise the temperature reading enough to cross your threshold?"
8. Bias investigation (15 min): distribute the Bias Investigation Cards. Each card describes an AI scenario: (1) A facial recognition system trained only on photographs of light-skinned faces; (2) A loan approval AI trained on data from urban borrowers only; (3) A health diagnosis AI trained only on male patient records. For each scenario, pairs discuss and write: "What training data is missing? Who is disadvantaged? What harm could result?"
9. Rotate Driver/Navigator. New driver leads the bias self-evaluation of the classifier.
10. Classifier self-evaluation (10 min): each learner completes the classifier threshold worksheet independently. For each threshold chosen (e.g. tempC > 27): "When did I collect the data that influenced this choice? Was it a hot day or a cool day? If I had collected data in January (cooler) instead of April (hotter), would I have chosen a different threshold? Who or what is disadvantaged if my threshold is wrong?"
11. Probability calculation (5 min): "If your classifier always outputs 'Comfortable' regardless of the sensor values, and in a typical school day 8 out of 20 readings would genuinely be 'Comfortable', what is the classifier accuracy?" (8/20 = 0.4 = 40%.) "A classifier that always says 'Comfortable' is correct 40% of the time. Is that good enough to automate decisions about turning on fans or air conditioning?" Learners calculate and write their answer on the worksheet.
12. Analytical argument writing (25 min): using the Analytical Argument Frame, learners write their 180-word minimum argument: "Should AI systems be used to make decisions about people?" The argument must reference at least ONE of the bias scenarios from the cards and ONE example from their own classifier experience. Peer-review swap at the end: partner checks the 5-part structure is present and that the word count is approximately met.

### INDEPENDENT WORK — Bias Evaluation and Analytical Argument  (50 min)
13. Facilitator circulates. Ask: "Is your argument persuasive? Could someone read it and understand both sides? What is the strongest point in your argument? What is the weakest?" Note participation contributions.
14. Extension: research question — "What is 'algorithmic fairness' in AI? Write 3 sentences in your own words." If the internet is available, learners research one definition. If not, facilitator provides a printed extract to read and paraphrase.
15. 2–3 pairs demonstrate their classifier live: vary the room conditions, watch the output, explain: "We chose a temperature threshold of ___ because ___. We chose a light threshold of ___ because ___. When we covered the LDR, the output changed to ___."
16. One pair presents their bias self-evaluation: "Our classifier was trained on readings collected on a hot afternoon in April. If used in January, the 'Too Extreme' category would rarely trigger because temperatures are lower. This means our classifier is biased towards hot-day conditions."
17. Two learners read their analytical argument openings aloud (just the Position and Evidence 1 paragraph). Class discusses: "Is the evidence convincing? Is the counterargument fairly presented?"

### SHOWCASE & DEBRIEF  (30 min)
18. Facilitator connects the decision tree to AI history: "Decision trees were one of the first machine learning algorithms used in real AI systems in the 1980s. They are still used today — doctors use decision trees to diagnose illness, banks use them to approve loans, courts in some countries have used them to make sentencing recommendations. Understanding their limitations is not optional for anyone who will live in a world shaped by AI."
19. Facilitator restates English link: "You wrote a structured analytical argument today. That is a GCSE and A-level English skill. The five-part frame — position, evidence, evidence, counter, conclusion — works for any argument on any topic. Use it beyond this classroom."
20. Facilitator restates Math link: "Threshold values in a decision tree are boundaries. They divide a continuous number line into categories. Choosing those boundaries is a mathematical decision with consequences. A threshold set one unit too high or too low can change who gets classified into which category."
21. Exit question: "Name one way your classifier could be made fairer. Be specific — name the threshold value you would change and explain why." Collect.
22. Submit analytical argument, decision tree template, and classifier sketch via USB flash drive.

## Assessment

- Formative | (During) | Decision tree template: completed on paper with threshold values, conditions at each node, and 4 named leaf outcomes (checked during guided phase) | Classifier threshold worksheet: thresholds justified and bias risk identified for each (collected) | Probability calculation: accuracy calculated correctly as a fraction, decimal, and percentage (checked during independent work) | Bias Investigation Cards: written analysis for all 3 scenarios identifying missing data, disadvantaged group, and potential harm (collected)
- Exit Assessment | Dual-sensor decision tree classifier sketch: correctly classifies environment into ≥4 categories using nested if/else with two sensor inputs — compiles, uploads, and produces sensible outputs (verified by facilitator) | Analytical argument: minimum 180 words, 5-part structure present, references at least one bias scenario and the learner's own classifier — assessed on 5-point artifact rubric (submitted) | Classifier self-evaluation: threshold bias identified and a specific improvement proposed (submitted on worksheet) | All materials submitted via USB flash drive
- Differentiation | Support: Reduce the decision tree to 2 decision nodes and 3 outcomes. Provide the nested if/else structure pre-written with blanks for threshold values only: if(tempC > ___) { if(ldrValue > ___) { Serial.println("___"); } else { Serial.println("___"); } }. For the analytical argument, reduce to 100 words and accept a 3-part structure (position, evidence, conclusion). | Extension: Implement a confidence score for the classifier. For each category, define a confidence level based on how far the sensor values are from the threshold. For example, if tempC = 32 and the hot threshold is 27, confidence = (32 − 27) / 10 = 0.5 = 50%. Print both the category label and the confidence percentage to Serial Monitor. Write a paragraph explaining what confidence scores mean in real AI systems (e.g. why a face recognition system might say "85% match" rather than just "match").

## Key Vocabulary

decision tree · node · leaf · threshold · training data · bias · fairness · algorithmic decision-making · accuracy · confidence · analytical argument · counterargument · feature · classification

## Safeguarding

Safeguarding Note: The bias investigation scenarios include facial recognition and loan approval — topics that connect to real discrimination against marginalised groups including in Uganda and across Africa. Facilitate discussion with sensitivity: validate that these are real, documented problems without assigning blame to individual companies or governments. Do not allow learners to make generalising statements about specific ethnic, gender, or social groups. Frame the discussion around systems and data, not people. The argument writing task must remain analytical and evidence-based.

## Full source extract (complete)

### Detail body

```
Draw a decision tree on paper with at least 3 decision nodes and 4 leaf outcomes for a provided classification problem
Translate the decision tree into a nested if/else Arduino sketch using dual sensor inputs (LDR and TMP36) that classifies the room environment into one of 4 named categories
Define training data bias in plain English and give two original examples from everyday Ugandan life where a biased AI could cause harm
Evaluate their own classifier: identify at least 2 threshold values they chose and explain why a different dataset might make those thresholds unfair
Write a structured analytical argument of at least 180 words: "Should AI systems be used to make decisions about people?" The argument must include a position, two supporting points with evidence, one counterargument, and a conclusion
Calculate: given a 20-card dataset where 12 cards satisfy classifier Rule A, what is the probability a randomly chosen card is correctly classified if the classifier always outputs "A"? Express as a fraction, decimal, and percentage
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards with dual sensor circuits from T2 Week 5 (LDR + TMP36)
Printed "Decision Tree Template" (A4 per pair) — blank tree with 3 levels: root node, 2 decision nodes, 4 leaf nodes — labelled spaces for conditions and outcomes
Printed "Bias Investigation Cards" (A4 per pair) — 3 short scenarios describing AI systems with potentially biased training data; questions on each card guide analysis
Printed "Analytical Argument Frame" (A4 per learner) — structured template: Position | Evidence 1 | Evidence 2 | Counterargument | Conclusion
Printed "Classifier Threshold Worksheet" (A5 per pair) — table for recording chosen thresholds, justification, and bias risk
USB flash drives
Facilitator device + projected screen
Recall T2 Week 5 sensor data: "Last week you collected temperature and light readings. You now have real environmental data. Today you will build an AI that uses those sensors to classify the room environment into one of four categories: Comfortable, Hot and Bright, Cool and Dark, or Too Extreme."
Decision tree introduction (10 min): draw a simple 2-level decision tree on the board for classifying fruit: root node — "Is it yellow?" → Yes branch → "Is it curved?" → Yes: Banana, No: Mango. No branch → "Is it round and red?" → Yes: Apple, No: Unknown. Walk through 3 example items. "Every question is an if/else. Every path from root to leaf is a chain of conditions. Today you build one for sensor data."
Distribute the decision tree template. "Your tree will have two sensor inputs: LDR (light level) and temperature (in °C). You choose the threshold values — the numbers at each decision node. These numbers determine who gets classified as what. Choose them carefully."
Connect to Term One: "In Term One Week 6, you wrote: if lightValue > 600, print Bright. That was one leaf of a decision tree. Today you build the whole tree." Pairs begin sketching their tree on the template — just pencil, no code yet.
Decision tree design (15 min): each pair completes their decision tree template. Root node condition must use ONE sensor (e.g. "Is tempC > 27?"). Second level uses the OTHER sensor (e.g. "Is ldrValue > 500?"). Four leaf outcomes: (1) Comfortable: cool and well-lit; (2) Hot and Bright: potential discomfort; (3) Cool and Dark: too dim; (4) Too Extreme: hot and dark — worst case. Pairs write the threshold values they chose and the justification for each in the classifier threshold worksheet.
Classifier translation to code (20 min): facilitator models the translation of one branch on the projected screen. "The root node — if tempC > 27 — becomes: if(tempC > 27.0) { // hot branch }. Inside, the second condition — if ldrValue > 500 — becomes: if(ldrValue > 500) { Serial.println("Hot and Bright"); } else { Serial.println("Too Extreme"); } }" Learners translate their full tree — all 4 branches — into a complete Arduino sketch with the dual sensor circuit from T2 Week 5.
Upload and live-test (10 min): pairs vary room conditions. Cover the LDR. Hold a warm hand near the TMP36. Open and close a window. Watch the Serial Monitor. "Is your classifier giving sensible outputs? Does covering the LDR produce Cool and Dark? Does your warm hand raise the temperature reading enough to cross your threshold?"
Bias investigation (15 min): distribute the Bias Investigation Cards. Each card describes an AI scenario: (1) A facial recognition system trained only on photographs of light-skinned faces; (2) A loan approval AI trained on data from urban borrowers only; (3) A health diagnosis AI trained only on male patient records. For each scenario, pairs discuss and write: "What training data is missing? Who is disadvantaged? What harm could result?"
Rotate Driver/Navigator. New driver leads the bias self-evaluation of the classifier.
Classifier self-evaluation (10 min): each learner completes the classifier threshold worksheet independently. For each threshold chosen (e.g. tempC > 27): "When did I collect the data that influenced this choice? Was it a hot day or a cool day? If I had collected data in January (cooler) instead of April (hotter), would I have chosen a different threshold? Who or what is disadvantaged if my threshold is wrong?"
Probability calculation (5 min): "If your classifier always outputs 'Comfortable' regardless of the sensor values, and in a typical school day 8 out of 20 readings would genuinely be 'Comfortable', what is the classifier accuracy?" (8/20 = 0.4 = 40%.) "A classifier that always says 'Comfortable' is correct 40% of the time. Is that good enough to automate decisions about turning on fans or air conditioning?" Learners calculate and write their answer on the worksheet.
Analytical argument writing (25 min): using the Analytical Argument Frame, learners write their 180-word minimum argument: "Should AI systems be used to make decisions about people?" The argument must reference at least ONE of the bias scenarios from the cards and ONE example from their own classifier experience. Peer-review swap at the end: partner checks the 5-part structure is present and that the word count is approximately met.
Facilitator circulates. Ask: "Is your argument persuasive? Could someone read it and understand both sides? What is the strongest point in your argument? What is the weakest?" Note participation contributions.
Extension: research question — "What is 'algorithmic fairness' in AI? Write 3 sentences in your own words." If the internet is available, learners research one definition. If not, facilitator provides a printed extract to read and paraphrase.
2–3 pairs demonstrate their classifier live: vary the room conditions, watch the output, explain: "We chose a temperature threshold of ___ because ___. We chose a light threshold of ___ because ___. When we covered the LDR, the output changed to ___."
One pair presents their bias self-evaluation: "Our classifier was trained on readings collected on a hot afternoon in April. If used in January, the 'Too Extreme' category would rarely trigger because temperatures are lower. This means our classifier is biased towards hot-day conditions."
Two learners read their analytical argument openings aloud (just the Position and Evidence 1 paragraph). Class discusses: "Is the evidence convincing? Is the counterargument fairly presented?"
Facilitator connects the decision tree to AI history: "Decision trees were one of the first machine learning algorithms used in real AI systems in the 1980s. They are still used today — doctors use decision trees to diagnose illness, banks use them to approve loans, courts in some countries have used them to make sentencing recommendations. Understanding their limitations is not optional for anyone who will live in a world shaped by AI."
Facilitator restates English link: "You wrote a structured analytical argument today. That is a GCSE and A-level English skill. The five-part frame — position, evidence, evidence, counter, conclusion — works for any argument on any topic. Use it beyond this classroom."
Facilitator restates Math link: "Threshold values in a decision tree are boundaries. They divide a continuous number line into categories. Choosing those boundaries is a mathematical decision with consequences. A threshold set one unit too high or too low can change who gets classified into which category."
Exit question: "Name one way your classifier could be made fairer. Be specific — name the threshold value you would change and explain why." Collect.
Submit analytical argument, decision tree template, and classifier sketch via USB flash drive.
decision tree · node · leaf · threshold · training data · bias · fairness · algorithmic decision-making · accuracy · confidence · analytical argument · counterargument · feature · classification
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5  (Ages 10–12 · AI Engineers) | Lesson T2–6: Decision Trees, Training Data Bias & Building a Rule-Based AI Classifier
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 2 · Week 6
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LDR (pin A0), TMP36 temperature sensor (pin A1) — dual sensor circuit carried forward from T2 Week 5 | Bloom's Level | L4 Analysing → L5 Evaluating
NCDC Ref | Uganda NCDC P5–P6 – English Strand: Analytical reading, argument writing, evaluating sources for bias; Mathematics Strand: Decision trees, probability, classification rules, threshold values; ICT Strand: AI decision-making, training data, bias and fairness in algorithmic systems | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Artificial intelligence; algorithmic decision-making; data and bias; ethical considerations in computing
DDD ILO | ILO 3.3 – Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making; extend to decision trees, training data bias, and the construction of a dual-sensor rule-based AI classifier in Arduino code | Big Idea | An AI system is only as fair and accurate as the data it was trained on. If the training data is biased, the AI will be biased. Understanding this is not just a computing skill — it is a critical thinking skill for life.
Term Two Context: Term One Week 6 introduced AI vocabulary (pattern recognition, classification, training data, prediction), picture card sorting, and a simple single-condition rule-based classifier in Arduino. Term Two Week 6 goes substantially deeper: learners build a decision tree by hand, implement it as a nested if/else classifier using dual-sensor data from T2 Week 5, investigate what training data bias means and how to detect it, write a structured analytical argument about AI fairness, and evaluate whether their own classifier is biased based on the thresholds they chose.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Structured analytical argument writing — the highest-order English writing task in the programme. The 5-part frame (Position, Evidence 1, Evidence 2, Counterargument, Conclusion) mirrors the argumentative essay structure required at secondary school and beyond. Learners must commit to a position ("AI should / should not be used to make decisions about people") and defend it with evidence drawn from the bias scenarios, the AI article from Term One, and their own classifier experience. The counterargument section requires them to steelman the opposing view before returning to their position. This is explicitly framed as a transferable writing skill: "This structure — claim, evidence, counter, conclusion — is the same structure used in debate, in law, and in scientific papers."
Maths | Decision trees as flowcharts of conditional probability: at each node, the dataset is split according to a rule. If 20 items enter a node and the rule classifies 14 as "A" and 6 as "B", the probability of a random item being classified as "A" is 14/20 = 0.7 = 70%. Accuracy calculation: if the classifier outputs "A" for all 20 items but only 14 are truly "A", accuracy = 14/20 = 70%. If it correctly classifies all 14 "A" items and all 6 "B" items, accuracy = 20/20 = 100%. Threshold analysis: the boundary between "cool" and "warm" in the classifier (e.g. tempC > 27) is a threshold value. Learners calculate: if all training data was collected on a hot day (average 31°C), what bias does this introduce into the threshold?
LESSON STRUCTURE
WARM-UP & REVIEW — From Rules to Trees  (20 min)
GUIDED ACTIVITY — Build the Decision Tree and Code the Classifier  (60 min)
INDEPENDENT WORK — Bias Evaluation and Analytical Argument  (50 min)
SHOWCASE & DEBRIEF  (30 min)
ASSESSMENT
Formative | (During) | Decision tree template: completed on paper with threshold values, conditions at each node, and 4 named leaf outcomes (checked during guided phase) | Classifier threshold worksheet: thresholds justified and bias risk identified for each (collected) | Probability calculation: accuracy calculated correctly as a fraction, decimal, and percentage (checked during independent work) | Bias Investigation Cards: written analysis for all 3 scenarios identifying missing data, disadvantaged group, and potential harm (collected)
Exit Assessment | Dual-sensor decision tree classifier sketch: correctly classifies environment into ≥4 categories using nested if/else with two sensor inputs — compiles, uploads, and produces sensible outputs (verified by facilitator) | Analytical argument: minimum 180 words, 5-part structure present, references at least one bias scenario and the learner's own classifier — assessed on 5-point artifact rubric (submitted) | Classifier self-evaluation: threshold bias identified and a specific improvement proposed (submitted on worksheet) | All materials submitted via USB flash drive
Differentiation | Support: Reduce the decision tree to 2 decision nodes and 3 outcomes. Provide the nested if/else structure pre-written with blanks for threshold values only: if(tempC > ___) { if(ldrValue > ___) { Serial.println("___"); } else { Serial.println("___"); } }. For the analytical argument, reduce to 100 words and accept a 3-part structure (position, evidence, conclusion). | Extension: Implement a confidence score for the classifier. For each category, define a confidence level based on how far the sensor values are from the threshold. For example, if tempC = 32 and the hot threshold is 27, confidence = (32 − 27) / 10 = 0.5 = 50%. Print both the category label and the confidence percentage to Serial Monitor. Write a paragraph explaining what confidence scores mean in real AI systems (e.g. why a face recognition system might say "85% match" rather than just "match").
KEY VOCABULARY
Safeguarding Note: The bias investigation scenarios include facial recognition and loan approval — topics that connect to real discrimination against marginalised groups including in Uganda and across Africa. Facilitate discussion with sensitivity: validate that these are real, documented problems without assigning blame to individual companies or governments. Do not allow learners to make generalising statements about specific ethnic, gender, or social groups. Frame the discussion around systems and data, not people. The argument writing task must remain analytical and evidence-based.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
