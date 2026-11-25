# Week 2 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Declare and initialise an integer array of size 10 in an Arduino sketch and populate it with LDR sensor readings using a for loop
- Iterate through an array using a for loop to: (a) print all values, (b) calculate the sum, (c) compute the mean, (d) find the maximum and minimum value
- Wire a TMP36 temperature sensor to analogue pin A1 alongside the existing LDR on A0 and read both simultaneously
- Store 10 readings from each sensor in separate arrays and print a formatted two-column data table to the Serial Monitor
- Write an analytical paragraph (minimum 80 words) comparing the two sensor datasets: trend, mean, range, and one inference about what the data suggests about the environment
- Access a specific array element by index and explain in plain English why arrays are indexed from 0, not 1

## Continue

### 3. INDEPENDENT / PAIR WORK
1. Analyse & Write
2. Task 1 (10 min): Record all 10 readings from each sensor in the Two-Sensor Data Table. Calculate mean and range for both — by hand first, then verify against Serial Monitor output.
3. Task 2 (25 min): Write the Analytical Paragraph — minimum 80 words comparing both datasets using the writing frame. Must include: both means, both ranges, one trend observation, one inference about what the data tells us about the environment.
4. Task 3 (10 min): Array index challenge — you calls out 5 questions: "What is in position 7 of your LDR array? What is the index of the maximum value? What would happen if you tried to access index 10 in a 10-element array?" You write answers on paper.
5. Task 4 (Extension, 5 min): Write a function float arrayMean(int arr[], int size) { } that takes any integer array and its size and returns the mean. Call it for both arrays and print the results. This is a generic reusable function — connect to Term 2 Week 1.
6. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
7. One pair projects their Serial Monitor output. Class reads: "What was the LDR mean? What was the temperature range?" Verify calculations together.
8. Analytical paragraph: one learner reads aloud. Class checks: are both means stated? Is there a genuine inference — not just description?
9. Ask yourself: "Imagine your array has 1,000 readings instead of 10. Which parts of your code need to change?" Answer: only the array size declaration and loop limit. Everything else scales automatically. This is the power of arrays.
10. AI connection: "A machine learning training dataset is an array — or a collection of arrays. The more data in the array, the better the model. Your 10-reading array is a tiny training dataset."
11. Math close: percentage difference calculation on the board — which pair has the largest difference between LDR mean and temperature mean?
12. Collect Two-Sensor Data Table + Analytical Paragraph as this week's artifact.

## All Lesson 2 steps (complete list)

1. Analyse & Write
2. Task 1 (10 min): Record all 10 readings from each sensor in the Two-Sensor Data Table. Calculate mean and range for both — by hand first, then verify against Serial Monitor output.
3. Task 2 (25 min): Write the Analytical Paragraph — minimum 80 words comparing both datasets using the writing frame. Must include: both means, both ranges, one trend observation, one inference about what the data tells us about the environment.
4. Task 3 (10 min): Array index challenge — you calls out 5 questions: "What is in position 7 of your LDR array? What is the index of the maximum value? What would happen if you tried to access index 10 in a 10-element array?" You write answers on paper.
5. Task 4 (Extension, 5 min): Write a function float arrayMean(int arr[], int size) { } that takes any integer array and its size and returns the mean. Call it for both arrays and print the results. This is a generic reusable function — connect to Term 2 Week 1.
6. Rotate Driver/Navigator between Tasks 1 and 2.
7. One pair projects their Serial Monitor output. Class reads: "What was the LDR mean? What was the temperature range?" Verify calculations together.
8. Analytical paragraph: one learner reads aloud. Class checks: are both means stated? Is there a genuine inference — not just description?
9. Ask yourself: "Imagine your array has 1,000 readings instead of 10. Which parts of your code need to change?" Answer: only the array size declaration and loop limit. Everything else scales automatically. This is the power of arrays.
10. AI connection: "A machine learning training dataset is an array — or a collection of arrays. The more data in the array, the better the model. Your 10-reading array is a tiny training dataset."
11. Math close: percentage difference calculation on the board — which pair has the largest difference between LDR mean and temperature mean?
12. Collect Two-Sensor Data Table + Analytical Paragraph as this week's artifact.

## Check your understanding
- Evidence Required
- Formative
- (During)
- Sketch compiles, both arrays populate with 10 readings, two-column Serial Monitor table displays correctly, mean and range computed and printed for both sensors.
- Your own check log. Serial Monitor output verified before pair moves to writing task.
- Term 2 Week 2
- Artifact
- Completed Two-Sensor Data Table (all 10 readings, mean and range for both) + Analytical Paragraph (min. 80 words, both datasets compared, genuine inference). Scored on 5-point rubric (DDD Part 8.3).
- Physical documents collected. Both components required.
- Differentiation
- Support: pre-populate the array declaration and first for loop — you write the analysis loops only. Extension: generic arrayMean() function that works with any array size.
- Extension: function compiles and returns correct mean for both arrays when called.

## Key words to remember
array · index · element · declare · initialise · iterate · analogRead() · TMP36 · voltage · temperature conversion · mean · range · maximum · minimum · two-column table · percentage difference ⚠  Safeguarding Note TMP36 sensor must be connected with correct polarity — reverse polarity will damage the sensor and may cause it to heat rapidly. You checks TMP36 wiring BEFORE allowing you to power the circuit. Never connect TMP36 directly to a 9V battery — Arduino 5V pin only. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
