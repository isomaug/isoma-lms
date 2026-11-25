# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Declare and initialise an integer array of size 10 in an Arduino sketch and populate it with LDR sensor readings using a for loop
- Iterate through an array using a for loop to: (a) print all values, (b) calculate the sum, (c) compute the mean, (d) find the maximum and minimum value
- Wire a TMP36 temperature sensor to analogue pin A1 alongside the existing LDR on A0 and read both simultaneously
- Store 10 readings from each sensor in separate arrays and print a formatted two-column data table to the Serial Monitor
- Write an analytical paragraph (minimum 80 words) comparing the two sensor datasets: trend, mean, range, and one inference about what the data suggests about the environment
- Access a specific array element by index and explain in plain English why arrays are indexed from 0, not 1

## Let's begin

### 1. HOOK
1. The Library Analogy
2. Draw 10 labelled boxes on the board (0 through 9). Ask: "What is this?" Accept answers — guide to: "This is an array — a row of named storage positions."
3. Fill the boxes with today's temperature readings from last week's LDR activity (made-up plausible values). Ask: "How would I find the 3rd reading?" Answer: box number 2 (index 2). Why not 3? Discuss: computers count from 0.
4. Get ready to use the Array Structure Diagram. You fill in: if int readings[10] = {450, 480, 510, 490, 460, 500, 520, 470, 495, 505}, what is readings[0]? readings[9]? readings[4]?
5. Show on projector: how the same exercise looks in Arduino code. Connect each box to its declaration.
6. Introduce the TMP36 sensor — different from the LDR. Show the pinout diagram. Ask: "What is the output of a TMP36?" (Voltage proportional to temperature.) "How do we convert that to degrees Celsius?" (Formula: (voltage − 0.5) × 100. Preview of guided activity.)
### 2. GUIDED ACTIVITY
7. Wire, Declare & Populate
8. Step 1 (15 min): Wire TMP36 to A1 (alongside LDR already on A0). You demonstrates TMP36 pinout on projector: +Vs (5V), Vout (A1), GND. You wire simultaneously.
9. Step 2 (15 min): Declare arrays. You live-codes: int ldrReadings[10]; float tempReadings[10]; int i; — then a for loop to populate both arrays with 10 readings, one every 2 seconds. You type along.
10. Step 3 (10 min): Add temperature conversion: float voltage = tempReadings[i] * (5.0/1023.0); float tempC = (voltage - 0.5) * 100; — explain each step. You annotate each line with a comment.
11. Step 4 (10 min): Add a second for loop to print both arrays as a formatted two-column table to Serial Monitor: Serial.print(ldrReadings[i]); Serial.print("\t"); Serial.println(tempC);
12. Step 5 (10 min): Add a third for loop to compute: sum, mean, maximum and minimum for both arrays. Print results with labels: Serial.println("LDR Mean: "); Serial.println(ldrMean);

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. The Library Analogy
2. Draw 10 labelled boxes on the board (0 through 9). Ask: "What is this?" Accept answers — guide to: "This is an array — a row of named storage positions."
3. Fill the boxes with today's temperature readings from last week's LDR activity (made-up plausible values). Ask: "How would I find the 3rd reading?" Answer: box number 2 (index 2). Why not 3? Discuss: computers count from 0.
4. Get ready to use the Array Structure Diagram. You fill in: if int readings[10] = {450, 480, 510, 490, 460, 500, 520, 470, 495, 505}, what is readings[0]? readings[9]? readings[4]?
5. Show on projector: how the same exercise looks in Arduino code. Connect each box to its declaration.
6. Introduce the TMP36 sensor — different from the LDR. Show the pinout diagram. Ask: "What is the output of a TMP36?" (Voltage proportional to temperature.) "How do we convert that to degrees Celsius?" (Formula: (voltage − 0.5) × 100. Preview of guided activity.)
7. Wire, Declare & Populate
8. Step 1 (15 min): Wire TMP36 to A1 (alongside LDR already on A0). You demonstrates TMP36 pinout on projector: +Vs (5V), Vout (A1), GND. You wire simultaneously.
9. Step 2 (15 min): Declare arrays. You live-codes: int ldrReadings[10]; float tempReadings[10]; int i; — then a for loop to populate both arrays with 10 readings, one every 2 seconds. You type along.
10. Step 3 (10 min): Add temperature conversion: float voltage = tempReadings[i] * (5.0/1023.0); float tempC = (voltage - 0.5) * 100; — explain each step. You annotate each line with a comment.
11. Step 4 (10 min): Add a second for loop to print both arrays as a formatted two-column table to Serial Monitor: Serial.print(ldrReadings[i]); Serial.print("\t"); Serial.println(tempC);
12. Step 5 (10 min): Add a third for loop to compute: sum, mean, maximum and minimum for both arrays. Print results with labels: Serial.println("LDR Mean: "); Serial.println(ldrMean);
