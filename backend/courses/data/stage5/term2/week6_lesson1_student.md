# Week 6 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Draw a decision tree on paper with at least 3 decision nodes and 4 leaf outcomes for a provided classification problem
- Translate the decision tree into a nested if/else Arduino sketch using dual sensor inputs (LDR and TMP36) that classifies the room environment into one of 4 named categories
- Define training data bias in plain English and give two original examples from everyday Ugandan life where a biased AI could cause harm
- Evaluate your own classifier: identify at least 2 threshold values they chose and explain why a different dataset might make those thresholds unfair
- Write a structured analytical argument of at least 180 words: "Should AI systems be used to make decisions about people?" The argument must include a position, two supporting points with evidence, one counterargument, and a conclusion
- Calculate: given a 20-card dataset where 12 cards satisfy classifier Rule A, what is the probability a randomly chosen card is correctly classified if yourselfifier always outputs "A"? Express as a fraction, decimal, and percentage

## Big idea
An AI system is only as fair and accurate as the data it was trained on. If the training data is biased, the AI will be biased. Understanding this is not just a computing skill — it is a critical thinking skill for life.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards with dual sensor circuits from T2 Week 5 (LDR + TMP36)
- Printed "Decision Tree Template" (A4 for you) — blank tree with 3 levels: root node, 2 decision nodes, 4 leaf nodes — labelled spaces for conditions and outcomes
- Printed "Bias Investigation Cards" (A4 for you) — 3 short scenarios describing AI systems with potentially biased training data; questions on each card guide analysis
- Printed "Analytical Argument Frame" (A4 for you) — structured template: Position | Evidence 1 | Evidence 2 | Counterargument | Conclusion
- Printed "Classifier Threshold Worksheet" (A5 for you) — table for recording chosen thresholds, justification, and bias risk
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Structured analytical argument writing — the highest-order English writing task in the programme. The 5-part frame (Position, Evidence 1, Evidence 2, Counterargument, Conclusion) mirrors the argumentative essay structure required at secondary school and beyond. You must commit to a position ("AI should / should not be used to make decisions about people") and defend it with evidence drawn from the bias scenarios, the AI article from Term One, and your own classifier experience. The counterargument section requires them to steelman the opposing view before returning to their position. This is explicitly framed as a transferable writing skill: "This structure — claim, evidence, counter, conclusion — is the same structure used in debate, in law, and in scientific papers."
- **Maths:** Decision trees as flowcharts of conditional probability: at each node, the dataset is split according to a rule. If 20 items enter a node and the rule classifies 14 as "A" and 6 as "B", the probability of a random item being classified as "A" is 14/20 = 0.7 = 70%. Accuracy calculation: if yourselfifier outputs "A" for all 20 items but only 14 are truly "A", accuracy = 14/20 = 70%. If it correctly classifies all 14 "A" items and all 6 "B" items, accuracy = 20/20 = 100%. Threshold analysis: the boundary between "cool" and "warm" in yourselfifier (e.g. tempC > 27) is a threshold value. You calculate: if all training data was collected on a hot day (average 31°C), what bias does this introduce into the threshold?

## Let's begin

### WARM-UP & REVIEW — From Rules to Trees  (20 min)
1. Recall T2 Week 5 sensor data: "Last week you collected temperature and light readings. You now have real environmental data. Today you will build an AI that uses those sensors to classify the room environment into one of four categories: Comfortable, Hot and Bright, Cool and Dark, or Too Extreme."
2. Decision tree introduction (10 min): draw a simple 2-level decision tree on the board for classifying fruit: root node — "Is it yellow?" -> Yes branch -> "Is it curved?" -> Yes: Banana, No: Mango. No branch -> "Is it round and red?" -> Yes: Apple, No: Unknown. Walk through 3 example items. "Every question is an if/else. Every path from root to leaf is a chain of conditions. Today you build one for sensor data."
3. Get ready to use the decision tree template. "Your tree will have two sensor inputs: LDR (light level) and temperature (in °C). You choose the threshold values — the numbers at each decision node. These numbers determine who gets classified as what. Choose them carefully."
4. Connect to Term One: "In Term One Week 6, you wrote: if lightValue > 600, print Bright. That was one leaf of a decision tree. Today you build the whole tree." You begin sketching their tree on the template — just pencil, no code yet.
5. Decision tree design (15 min): each pair completes their decision tree template. Root node condition must use ONE sensor (e.g. "Is tempC > 27?"). Second level uses the OTHER sensor (e.g. "Is ldrValue > 500?"). Four leaf outcomes: (1) Comfortable: cool and well-lit; (2) Hot and Bright: potential discomfort; (3) Cool and Dark: too dim; (4) Too Extreme: hot and dark — worst case. You write the threshold values they chose and the justification for each in yourselfifier threshold worksheet.
6. Classifier translation to code (20 min): you model the translation of one branch on the projected screen. "The root node — if tempC > 27 — becomes: if(tempC > 27.0) { // hot branch }. Inside, the second condition — if ldrValue > 500 — becomes: if(ldrValue > 500) { Serial.println("Hot and Bright"); } else { Serial.println("Too Extreme"); } }" You translate their full tree — all 4 branches — into a complete Arduino sketch with the dual sensor circuit from T2 Week 5.

### GUIDED ACTIVITY — Build the Decision Tree and Code yourselfifier  (60 min)
7. Upload and live-test (10 min): you vary room conditions. Cover the LDR. Hold a warm hand near the TMP36. Open and close a window. Watch the Serial Monitor. "Is your classifier giving sensible outputs? Does covering the LDR produce Cool and Dark? Does your warm hand raise the temperature reading enough to cross your threshold?"
8. Bias investigation (15 min): distribute the Bias Investigation Cards. Each card describes an AI scenario: (1) A facial recognition system trained only on photographs of light-skinned faces; (2) A loan approval AI trained on data from urban borrowers only; (3) A health diagnosis AI trained only on male patient records. For each scenario, you discuss and write: "What training data is missing? Who is disadvantaged? What harm could result?"
9. Rotate your own pacing. New driver leads the bias self-evaluation of yourselfifier.
10. Classifier self-evaluation (10 min): you completes yourselfifier threshold worksheet independently. For each threshold chosen (e.g. tempC > 27): "When did I collect the data that influenced this choice? Was it a hot day or a cool day? If I had collected data in January (cooler) instead of April (hotter), would I have chosen a different threshold? Who or what is disadvantaged if my threshold is wrong?"
11. Probability calculation (5 min): "If your classifier always outputs 'Comfortable' regardless of the sensor values, and in a typical school day 8 out of 20 readings would genuinely be 'Comfortable', what is yourselfifier accuracy?" (8/20 = 0.4 = 40%.) "A classifier that always says 'Comfortable' is correct 40% of the time. Is that good enough to automate decisions about turning on fans or air conditioning?" You calculate and write their answer on the worksheet.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Recall T2 Week 5 sensor data: "Last week you collected temperature and light readings. You now have real environmental data. Today you will build an AI that uses those sensors to classify the room environment into one of four categories: Comfortable, Hot and Bright, Cool and Dark, or Too Extreme."
2. Decision tree introduction (10 min): draw a simple 2-level decision tree on the board for classifying fruit: root node — "Is it yellow?" -> Yes branch -> "Is it curved?" -> Yes: Banana, No: Mango. No branch -> "Is it round and red?" -> Yes: Apple, No: Unknown. Walk through 3 example items. "Every question is an if/else. Every path from root to leaf is a chain of conditions. Today you build one for sensor data."
3. Get ready to use the decision tree template. "Your tree will have two sensor inputs: LDR (light level) and temperature (in °C). You choose the threshold values — the numbers at each decision node. These numbers determine who gets classified as what. Choose them carefully."
4. Connect to Term One: "In Term One Week 6, you wrote: if lightValue > 600, print Bright. That was one leaf of a decision tree. Today you build the whole tree." You begin sketching their tree on the template — just pencil, no code yet.
5. Decision tree design (15 min): each pair completes their decision tree template. Root node condition must use ONE sensor (e.g. "Is tempC > 27?"). Second level uses the OTHER sensor (e.g. "Is ldrValue > 500?"). Four leaf outcomes: (1) Comfortable: cool and well-lit; (2) Hot and Bright: potential discomfort; (3) Cool and Dark: too dim; (4) Too Extreme: hot and dark — worst case. You write the threshold values they chose and the justification for each in yourselfifier threshold worksheet.
6. Classifier translation to code (20 min): you model the translation of one branch on the projected screen. "The root node — if tempC > 27 — becomes: if(tempC > 27.0) { // hot branch }. Inside, the second condition — if ldrValue > 500 — becomes: if(ldrValue > 500) { Serial.println("Hot and Bright"); } else { Serial.println("Too Extreme"); } }" You translate their full tree — all 4 branches — into a complete Arduino sketch with the dual sensor circuit from T2 Week 5.
7. Upload and live-test (10 min): you vary room conditions. Cover the LDR. Hold a warm hand near the TMP36. Open and close a window. Watch the Serial Monitor. "Is your classifier giving sensible outputs? Does covering the LDR produce Cool and Dark? Does your warm hand raise the temperature reading enough to cross your threshold?"
8. Bias investigation (15 min): distribute the Bias Investigation Cards. Each card describes an AI scenario: (1) A facial recognition system trained only on photographs of light-skinned faces; (2) A loan approval AI trained on data from urban borrowers only; (3) A health diagnosis AI trained only on male patient records. For each scenario, you discuss and write: "What training data is missing? Who is disadvantaged? What harm could result?"
9. Rotate your own pacing. New driver leads the bias self-evaluation of yourselfifier.
10. Classifier self-evaluation (10 min): you completes yourselfifier threshold worksheet independently. For each threshold chosen (e.g. tempC > 27): "When did I collect the data that influenced this choice? Was it a hot day or a cool day? If I had collected data in January (cooler) instead of April (hotter), would I have chosen a different threshold? Who or what is disadvantaged if my threshold is wrong?"
11. Probability calculation (5 min): "If your classifier always outputs 'Comfortable' regardless of the sensor values, and in a typical school day 8 out of 20 readings would genuinely be 'Comfortable', what is yourselfifier accuracy?" (8/20 = 0.4 = 40%.) "A classifier that always says 'Comfortable' is correct 40% of the time. Is that good enough to automate decisions about turning on fans or air conditioning?" You calculate and write their answer on the worksheet.
