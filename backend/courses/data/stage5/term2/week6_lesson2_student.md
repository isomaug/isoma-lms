# Week 6 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Draw a decision tree on paper with at least 3 decision nodes and 4 leaf outcomes for a provided classification problem
- Translate the decision tree into a nested if/else Arduino sketch using dual sensor inputs (LDR and TMP36) that classifies the room environment into one of 4 named categories
- Define training data bias in plain English and give two original examples from everyday Ugandan life where a biased AI could cause harm
- Evaluate your own classifier: identify at least 2 threshold values they chose and explain why a different dataset might make those thresholds unfair
- Write a structured analytical argument of at least 180 words: "Should AI systems be used to make decisions about people?" The argument must include a position, two supporting points with evidence, one counterargument, and a conclusion
- Calculate: given a 20-card dataset where 12 cards satisfy classifier Rule A, what is the probability a randomly chosen card is correctly classified if yourselfifier always outputs "A"? Express as a fraction, decimal, and percentage

## Continue

### INDEPENDENT WORK — Bias Evaluation and Analytical Argument  (50 min)
1. Analytical argument writing (25 min): using the Analytical Argument Frame, you write their 180-word minimum argument: "Should AI systems be used to make decisions about people?" The argument must reference at least ONE of the bias scenarios from the cards and ONE example from your own classifier experience. Peer-review swap at the end: partner checks the 5-part structure is present and that the word count is approximately met.
2. Check your work carefully. Ask: "Is your argument persuasive? Could someone read it and understand both sides? What is the strongest point in your argument? What is the weakest?" Note participation contributions.
3. Extension: research question — "What is 'algorithmic fairness' in AI? Write 3 sentences in your own words." If the internet is available, you research one definition. If not, you provides a printed extract to read and paraphrase.
4. 2–3 you demonstrate their classifier live: vary the room conditions, watch the output, explain: "We chose a temperature threshold of ___ because ___. We chose a light threshold of ___ because ___. When we covered the LDR, the output changed to ___."
5. One pair presents their bias self-evaluation: "Our classifier was trained on readings collected on a hot afternoon in April. If used in January, the 'Too Extreme' category would rarely trigger because temperatures are lower. This means our classifier is biased towards hot-day conditions."
6. Two you read their analytical argument openings aloud (just the Position and Evidence 1 paragraph). Class discusses: "Is the evidence convincing? Is the counterargument fairly presented?"

### SHOWCASE & DEBRIEF  (30 min)
7. Connect the decision tree to AI history: "Decision trees were one of the first machine learning algorithms used in real AI systems in the 1980s. They are still used today — doctors use decision trees to diagnose illness, banks use them to approve loans, courts in some countries have used them to make sentencing recommendations. Understanding their limitations is not optional for anyone who will live in a world shaped by AI."
8. Remember English link: "You wrote a structured analytical argument today. That is a GCSE and A-level English skill. The five-part frame — position, evidence, evidence, counter, conclusion — works for any argument on any topic. Use it beyond this classroom."
9. Remember Math link: "Threshold values in a decision tree are boundaries. They divide a continuous number line into categories. Choosing those boundaries is a mathematical decision with consequences. A threshold set one unit too high or too low can change who gets classified into which category."
10. Exit question: "Name one way your classifier could be made fairer. Be specific — name the threshold value you would change and explain why." Collect.
11. Submit analytical argument, decision tree template, and classifier sketch via USB flash drive.

## All Lesson 2 steps (complete list)

1. Analytical argument writing (25 min): using the Analytical Argument Frame, you write their 180-word minimum argument: "Should AI systems be used to make decisions about people?" The argument must reference at least ONE of the bias scenarios from the cards and ONE example from your own classifier experience. Peer-review swap at the end: partner checks the 5-part structure is present and that the word count is approximately met.
2. Check your work carefully. Ask: "Is your argument persuasive? Could someone read it and understand both sides? What is the strongest point in your argument? What is the weakest?" Note participation contributions.
3. Extension: research question — "What is 'algorithmic fairness' in AI? Write 3 sentences in your own words." If the internet is available, you research one definition. If not, you provides a printed extract to read and paraphrase.
4. 2–3 you demonstrate their classifier live: vary the room conditions, watch the output, explain: "We chose a temperature threshold of ___ because ___. We chose a light threshold of ___ because ___. When we covered the LDR, the output changed to ___."
5. One pair presents their bias self-evaluation: "Our classifier was trained on readings collected on a hot afternoon in April. If used in January, the 'Too Extreme' category would rarely trigger because temperatures are lower. This means our classifier is biased towards hot-day conditions."
6. Two you read their analytical argument openings aloud (just the Position and Evidence 1 paragraph). Class discusses: "Is the evidence convincing? Is the counterargument fairly presented?"
7. Connect the decision tree to AI history: "Decision trees were one of the first machine learning algorithms used in real AI systems in the 1980s. They are still used today — doctors use decision trees to diagnose illness, banks use them to approve loans, courts in some countries have used them to make sentencing recommendations. Understanding their limitations is not optional for anyone who will live in a world shaped by AI."
8. Remember English link: "You wrote a structured analytical argument today. That is a GCSE and A-level English skill. The five-part frame — position, evidence, evidence, counter, conclusion — works for any argument on any topic. Use it beyond this classroom."
9. Remember Math link: "Threshold values in a decision tree are boundaries. They divide a continuous number line into categories. Choosing those boundaries is a mathematical decision with consequences. A threshold set one unit too high or too low can change who gets classified into which category."
10. Exit question: "Name one way your classifier could be made fairer. Be specific — name the threshold value you would change and explain why." Collect.
11. Submit analytical argument, decision tree template, and classifier sketch via USB flash drive.

## Check your understanding
- Formative | (During) | Decision tree template: completed on paper with threshold values, conditions at each node, and 4 named leaf outcomes (checked during guided phase) | Classifier threshold worksheet: thresholds justified and bias risk identified for each (collected) | Probability calculation: accuracy calculated correctly as a fraction, decimal, and percentage (checked during independent work) | Bias Investigation Cards: written analysis for all 3 scenarios identifying missing data, disadvantaged group, and potential harm (collected)
- Exit Assessment | Dual-sensor decision tree classifier sketch: correctly classifies environment into ≥4 categories using nested if/else with two sensor inputs — compiles, uploads, and produces sensible outputs (verified by you) | Analytical argument: minimum 180 words, 5-part structure present, references at least one bias scenario and the learner's own classifier — assessed on 5-point artifact rubric (submitted) | Classifier self-evaluation: threshold bias identified and a specific improvement proposed (submitted on worksheet) | All materials submitted via USB flash drive
- Differentiation | Support: Reduce the decision tree to 2 decision nodes and 3 outcomes. Provide the nested if/else structure pre-written with blanks for threshold values only: if(tempC > ___) { if(ldrValue > ___) { Serial.println("___"); } else { Serial.println("___"); } }. For the analytical argument, reduce to 100 words and accept a 3-part structure (position, evidence, conclusion). | Extension: Implement a confidence score for yourselfifier. For each category, define a confidence level based on how far the sensor values are from the threshold. For example, if tempC = 32 and the hot threshold is 27, confidence = (32 − 27) / 10 = 0.5 = 50%. Print both the category label and the confidence percentage to Serial Monitor. Write a paragraph explaining what confidence scores mean in real AI systems (e.g. why a face recognition system might say "85% match" rather than just "match").

## Key words to remember
decision tree · node · leaf · threshold · training data · bias · fairness · algorithmic decision-making · accuracy · confidence · analytical argument · counterargument · feature · classification

## Stay safe
Safeguarding Note: The bias investigation scenarios include facial recognition and loan approval — topics that connect to real discrimination against marginalised groups including in Uganda and across Africa. Facilitate discussion with sensitivity: validate that these are real, documented problems without assigning blame to individual companies or governments. Do not allow you to make generalising statements about specific ethnic, gender, or social groups. Frame the discussion around systems and data, not people. The argument writing task must remain analytical and evidence-based.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
