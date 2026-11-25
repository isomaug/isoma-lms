# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Collect a labelled dataset of 30 dual-sensor readings (LDR + TMP36), each manually labelled as one of 3 environment classes: COMFORTABLE, WARM, DIM — recording both raw values and class labels in a data table
- Engineer two derived features from the raw sensor data: (1) a normalised light score = ldrValue ÷ 1023.0 (range 0.0 to 1.0) and (2) a heat index approximation using the TMP36 value, stored as floats
- Write classification rules based on the training dataset — inspecting the data to find the threshold values that most accurately separate the 3 classes — and implement them as a nested if/else Arduino classifier
- Evaluate yourselfifier on a held-out test set of 10 new readings using a confusion matrix: rows = true class, columns = predicted class
- Calculate precision, recall, and accuracy from the confusion matrix: accuracy = correct predictions ÷ total predictions; precision for class C = true positives for C ÷ all predictions of C; recall for class C = true positives for C ÷ all actual instances of C
- Write a 150-word AI Evaluation Report: what yourselfifier does, how it was trained, its accuracy, one source of bias in the training data, and one specific improvement that would increase accuracy

## Continue

### INDEPENDENT WORK — Testing, Confusion Matrix, and Evaluation Report  (50 min)
1. Precision and recall calculation (10 min): for each class, calculate precision and recall using the confusion matrix. Show all working. Identify: which class has the lowest recall? What does this mean in practice — which type of environment is yourselfifier worst at detecting? Is the training data class distribution the cause?
2. AI Evaluation Report writing (15 min): write the 150-word report on the evaluation template. Must include: (1) what yourselfifier does and the dataset size, (2) the training methodology (how thresholds were chosen), (3) accuracy, precision, and recall with actual numbers, (4) one specific identified source of bias or error with the training data reference, (5) one specific improvement with a predicted effect on the metric it would improve.
3. Check your work carefully. Ask: "If you retrained your classifier with 10 more DIM readings, which metric would improve first — precision or recall for the DIM class? Why?"
4. 2–3 you share their confusion matrices on the projected screen. Class compares: "Which pair had the highest accuracy? Which class caused the most errors across all groups? Was there a common misclassification pattern?" Discuss why this pattern appeared.
5. One pair presents their AI Evaluation Report. Reads the full report aloud. Class evaluates: "Are the numbers correct? Is the bias source specific? Is the proposed improvement realistic and specific?"
6. Connect to the real-world AI pipeline: "What you did today is called supervised learning. You labelled training data, learned rules from it, and tested on unseen data. Professional machine learning engineers do the same thing — but with millions of data points and automated rule learning. The concepts — precision, recall, confusion matrix, training bias — are identical. You now understand the core vocabulary of machine learning at the same level as a university first-year computing student."

### SHOWCASE & DEBRIEF  (30 min)
7. Draw the link to the capstone project (T3 Weeks 7–8): "Your final project must include a data component — at least one sensor, at least one derived feature, at least one classification rule, and at least one accuracy metric calculated during testing. The AI pipeline you completed today is the template for that component."
8. Remember English link: "The AI Evaluation Report has the same structure as an abstract in a scientific paper: what was done, how it was done, what was found, what went wrong, what should be done next. That structure appears in every research paper ever published. You wrote it today."
9. Remember Math link: "Precision and recall are fractions calculated from a confusion matrix. They measure different aspects of classifier quality — one measures what you claimed, the other measures what you caught. Understanding both is necessary because optimising for one often degrades the other. That trade-off is a mathematical concept called the precision-recall trade-off, and it is fundamental to AI system design."
10. Exit question: "In one sentence each: define precision, define recall, and explain which matters more for a smoke detector and why." Collect.
11. Submit training data table, rule writing worksheet, confusion matrix with calculations, and AI Evaluation Report via USB flash drive.

## All Lesson 2 steps (complete list)

1. Precision and recall calculation (10 min): for each class, calculate precision and recall using the confusion matrix. Show all working. Identify: which class has the lowest recall? What does this mean in practice — which type of environment is yourselfifier worst at detecting? Is the training data class distribution the cause?
2. AI Evaluation Report writing (15 min): write the 150-word report on the evaluation template. Must include: (1) what yourselfifier does and the dataset size, (2) the training methodology (how thresholds were chosen), (3) accuracy, precision, and recall with actual numbers, (4) one specific identified source of bias or error with the training data reference, (5) one specific improvement with a predicted effect on the metric it would improve.
3. Check your work carefully. Ask: "If you retrained your classifier with 10 more DIM readings, which metric would improve first — precision or recall for the DIM class? Why?"
4. 2–3 you share their confusion matrices on the projected screen. Class compares: "Which pair had the highest accuracy? Which class caused the most errors across all groups? Was there a common misclassification pattern?" Discuss why this pattern appeared.
5. One pair presents their AI Evaluation Report. Reads the full report aloud. Class evaluates: "Are the numbers correct? Is the bias source specific? Is the proposed improvement realistic and specific?"
6. Connect to the real-world AI pipeline: "What you did today is called supervised learning. You labelled training data, learned rules from it, and tested on unseen data. Professional machine learning engineers do the same thing — but with millions of data points and automated rule learning. The concepts — precision, recall, confusion matrix, training bias — are identical. You now understand the core vocabulary of machine learning at the same level as a university first-year computing student."
7. Draw the link to the capstone project (T3 Weeks 7–8): "Your final project must include a data component — at least one sensor, at least one derived feature, at least one classification rule, and at least one accuracy metric calculated during testing. The AI pipeline you completed today is the template for that component."
8. Remember English link: "The AI Evaluation Report has the same structure as an abstract in a scientific paper: what was done, how it was done, what was found, what went wrong, what should be done next. That structure appears in every research paper ever published. You wrote it today."
9. Remember Math link: "Precision and recall are fractions calculated from a confusion matrix. They measure different aspects of classifier quality — one measures what you claimed, the other measures what you caught. Understanding both is necessary because optimising for one often degrades the other. That trade-off is a mathematical concept called the precision-recall trade-off, and it is fundamental to AI system design."
10. Exit question: "In one sentence each: define precision, define recall, and explain which matters more for a smoke detector and why." Collect.
11. Submit training data table, rule writing worksheet, confusion matrix with calculations, and AI Evaluation Report via USB flash drive.

## Check your understanding
- Formative | (During) | Training data: 30 readings collected with correct class labels and normalised light scores filled (checked during guided phase) | Rule writing worksheet: thresholds chosen with specific justification referencing the training data observations (checked during guided phase) | Confusion matrix: correctly filled from test results, diagonal summed, accuracy calculated (checked during independent work) | Exit question: precision and recall correctly defined; smoke detector example correctly reasoned (collected)
- Exit Assessment | Dual-sensor classifier sketch: reads both sensors, engineers normalised feature, classifies into 3 classes using rules derived from training data — compiles and classifies test inputs correctly (verified by you) | Confusion matrix: 3×3 matrix correctly filled with predicted vs true classes for all 10 test items; precision, recall, and accuracy calculated with working shown (submitted) | AI Evaluation Report: 150 words minimum, all 5 sections present, numbers cited with specific metric names, bias source and improvement specific (submitted, assessed on 5-point artifact rubric) | Training data table: 30 readings with all columns completed including class labels and normalised light scores (submitted) | All materials submitted via USB flash drive
- Differentiation | Support: Reduce the training set to 18 readings (6 per class — you pre-labels some to ensure class balance). Reduce to a 2-class classifier (COMFORTABLE vs NOT COMFORTABLE) with a 2×2 confusion matrix. Provide the precision formula pre-written with variable names to substitute: precision = (TP) ÷ (TP + FP). Reduce the AI Evaluation Report to 80 words. For the normalisation calculation, provide a worked example: ldrValue = 600 -> lightScore = 600 ÷ 1023.0 = 0.587. | Extension: Implement yourselfifier as a function float classifyEnvironment(float lightScore, float tempC) that returns a confidence score (0.0 to 1.0) rather than a categorical label. The confidence score is the distance from the nearest decision boundary — expressed as a proportion of the full threshold range. Print both yourself label and the confidence to Serial Monitor. Calculate: for a reading of lightScore = 0.42 with a boundary at 0.35, the confidence for the DIM vs COMFORTABLE decision = (0.42 − 0.35) ÷ (1.0 − 0.35) = 0.108 = 10.8%. Low confidence means the reading is close to a boundary — a real AI system would flag this for human review.

## Key words to remember
machine learning pipeline · supervised learning · training data · test data · held-out set · feature engineering · normalisation · confusion matrix · precision · recall · accuracy · true positive · false positive · class boundary · precision-recall trade-off

## Stay safe
Safeguarding Note: The training data collection exercise uses environmental data only — no biometric, personal, or identifying data is recorded. Remind you that the concepts of precision, recall, and confusion matrices are tools for evaluating any classification system — and that AI systems used on people (criminal justice, healthcare, hiring) require the highest standards of evaluation precisely because errors have human consequences. Facilitate any discussion of AI bias (from T2 Week 6) with the same sensitivity guidelines: focus on systems and data, not on specific groups of people.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
