# Week 5 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Wire both an LDR (pin A0) and a TMP36 temperature sensor (pin A1) to the Arduino breadboard simultaneously and confirm both readings appear in Serial Monitor
- Write an Arduino sketch that reads both sensors every 3 seconds, converts the TMP36 raw value to Celsius using the formula: float tempC = (rawValue * 5.0 / 1024.0 - 0.5) * 100.0, and prints both values with labels
- Store 10 readings from each sensor in separate integer/float arrays and print all stored values in a formatted two-column table via Serial Monitor
- Calculate mean, range, and mode (most frequent value) for each sensor dataset by hand on the worksheet, then verify with code
- Plot two separate line graphs on squared paper (one per sensor), using the same x-axis scale (reading number 1–10) to enable direct visual comparison
- Write a full extended scientific report with 8 sections: Title, Aim, Hypothesis, Equipment, Method, Results (two graphs + two data tables), Comparative Analysis (minimum 120 words comparing trends across both sensors), Conclusion (minimum 80 words linking findings to a real-world application)

## Big idea
One sensor gives you data. Two sensors give you a relationship. Real AI systems — from weather stations to medical devices — combine multiple data streams because no single sensor tells the whole story.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 4 LDR sensors + 4 × 10kΩ resistors
- 4 TMP36 temperature sensors (TO-92 package — 3 pins: Vs, Vout, GND)
- 4 breadboards + jumper wire sets
- Squared paper (A4, 3 sheets for you — 2 for graphs, 1 for calculations)
- Printed "Dual Sensor Data Table" (A4 for you) — two side-by-side 10-row tables: Reading # | LDR value | Temp (raw) | Temp (°C)
- Printed "Extended Scientific Report Template" (A4, 2 pages for you) — 8 labelled sections with minimum word counts
- Printed "Statistics Calculation Worksheet" (A5 for you) — mean, range, mode calculations for both datasets
- Rulers, pencils, coloured pens (2 colours for graph lines)
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Extended scientific report with a new Comparative Analysis section: you must now compare the two datasets in prose — not just describe each one separately. The Comparative Analysis must use comparative language structures: "While the LDR values increased steadily as the session progressed, the temperature readings remained relatively stable, suggesting that…" "In contrast to the light data, the temperature sensor showed…" "Both sensors responded to changes in the environment, however…" These structures are explicitly taught before writing begins. The Conclusion must connect findings to a real-world application in Uganda — e.g. an automated classroom ventilation system that responds to both heat and light levels.
- **Maths:** Three statistical measures applied to two datasets: mean (sum ÷ 10), range (max − min), and mode (most frequent value — requires grouping readings into bands). You calculate all three for both the LDR and temperature datasets on the worksheet before coding. Voltage-to-Celsius conversion formula: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Breaking this down: the Arduino reads 0–1023, which represents 0–5V. The TMP36 outputs 10mV per °C with 500mV offset. This is a real algebraic substitution using P6-level formula evaluation. Graph comparison: both line graphs use the same x-axis scale (1–10 readings) and are drawn with different coloured lines — enabling direct visual comparison of trends.

## Let's begin

### WARM-UP & REVIEW — One Sensor vs Two Sensors  (20 min)
1. Recall Term One Week 5: "Last term you used one LDR sensor and recorded 10 readings. What did you discover? What were the limitations?" Discuss: one sensor only captures one dimension of the environment. A human judging room conditions uses multiple senses simultaneously — light level AND temperature AND noise.
2. Introduce the TMP36: hold it up. "This sensor measures temperature. It has 3 pins: power, signal, and ground. The signal pin outputs a voltage that increases by 10 millivolts per degree Celsius. We need a formula to convert that voltage reading into a temperature in degrees Celsius." Write the formula on the board: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Walk through the algebra step by step.
3. Formula verification (5 min): if the Arduino reads rawValue = 512, what is tempC? You calculate by hand: (512 × 5.0 / 1024.0 − 0.5) × 100.0 = (2.5 − 0.5) × 100.0 = 200.0... wait — that gives 200°C. Something is wrong. You reveals: TMP36 signal range is 0.1V to 1.75V, not 0 to 5V. The Arduino maps 0–5V to 0–1023. At room temperature (~25°C), output is ~0.75V -> rawValue ≈ 153. Recalculate: (153 × 5.0 / 1024.0 − 0.5) × 100.0 = (0.747 − 0.5) × 100.0 = 24.7°C. "This is why we never trust raw sensor values without understanding the formula." Write the corrected expectation: rawValue for room temperature ≈ 100–200.
4. Get ready to use the dual sensor data table and introduce the session goal: by the end, every learner will have two filled data tables, two graphs, and a full 8-section report.
5. Circuit build (15 min): you project the dual wiring diagram. LDR: one leg to 5V, other leg to A0 AND one end of 10kΩ resistor; other end of resistor to GND. TMP36: left pin (Vs) to 5V, middle pin (Vout) to A1, right pin (GND) to GND. You build both circuits on the same breadboard simultaneously. Check each circuit before powering on — wrong TMP36 orientation can damage the sensor.

### GUIDED ACTIVITY — Dual Sensor Circuit and Data Collection  (60 min)
6. Sketch writing (15 min): you write from scratch (not copy-paste). In setup(): Serial.begin(9600). In loop(): int ldrValue = analogRead(A0); int tempRaw = analogRead(A1); float tempC = (tempRaw * 5.0 / 1024.0 - 0.5) * 100.0; Serial.print("LDR: "); Serial.print(ldrValue); Serial.print(" | Temp(C): "); Serial.println(tempC); delay(3000);. Upload and verify both values appear. Ask: "Is your temperature reading reasonable for a room in Kampala?"
7. Array upgrade (10 min): modify the sketch to store readings. Declare: int ldrReadings[10]; float tempReadings[10]; int readCount = 0; In loop(), add an if(readCount < 10) block that stores each reading to the array. After 10 readings, print the full arrays in a formatted two-column table using a for loop.
8. Data collection (15 min): you collect 10 readings. Vary conditions: cover the LDR, hold a warm hand near the TMP36, open a door. Record each reading manually in the dual sensor data table worksheet at the same time as the Serial Monitor displays it. Ask: "Do the two sensors respond to the same events? Do any conditions affect one but not the other?"
9. Rotate your own pacing. New driver leads the statistics calculations.
10. Statistics worksheet (10 min): hand-calculate mean, range, and mode for both datasets. Mode requires grouping: round all LDR readings to nearest 50 and identify the most frequent band; round all temperature readings to nearest 1°C and identify the most frequent value. Write all calculations with working shown.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Recall Term One Week 5: "Last term you used one LDR sensor and recorded 10 readings. What did you discover? What were the limitations?" Discuss: one sensor only captures one dimension of the environment. A human judging room conditions uses multiple senses simultaneously — light level AND temperature AND noise.
2. Introduce the TMP36: hold it up. "This sensor measures temperature. It has 3 pins: power, signal, and ground. The signal pin outputs a voltage that increases by 10 millivolts per degree Celsius. We need a formula to convert that voltage reading into a temperature in degrees Celsius." Write the formula on the board: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Walk through the algebra step by step.
3. Formula verification (5 min): if the Arduino reads rawValue = 512, what is tempC? You calculate by hand: (512 × 5.0 / 1024.0 − 0.5) × 100.0 = (2.5 − 0.5) × 100.0 = 200.0... wait — that gives 200°C. Something is wrong. You reveals: TMP36 signal range is 0.1V to 1.75V, not 0 to 5V. The Arduino maps 0–5V to 0–1023. At room temperature (~25°C), output is ~0.75V -> rawValue ≈ 153. Recalculate: (153 × 5.0 / 1024.0 − 0.5) × 100.0 = (0.747 − 0.5) × 100.0 = 24.7°C. "This is why we never trust raw sensor values without understanding the formula." Write the corrected expectation: rawValue for room temperature ≈ 100–200.
4. Get ready to use the dual sensor data table and introduce the session goal: by the end, every learner will have two filled data tables, two graphs, and a full 8-section report.
5. Circuit build (15 min): you project the dual wiring diagram. LDR: one leg to 5V, other leg to A0 AND one end of 10kΩ resistor; other end of resistor to GND. TMP36: left pin (Vs) to 5V, middle pin (Vout) to A1, right pin (GND) to GND. You build both circuits on the same breadboard simultaneously. Check each circuit before powering on — wrong TMP36 orientation can damage the sensor.
6. Sketch writing (15 min): you write from scratch (not copy-paste). In setup(): Serial.begin(9600). In loop(): int ldrValue = analogRead(A0); int tempRaw = analogRead(A1); float tempC = (tempRaw * 5.0 / 1024.0 - 0.5) * 100.0; Serial.print("LDR: "); Serial.print(ldrValue); Serial.print(" | Temp(C): "); Serial.println(tempC); delay(3000);. Upload and verify both values appear. Ask: "Is your temperature reading reasonable for a room in Kampala?"
7. Array upgrade (10 min): modify the sketch to store readings. Declare: int ldrReadings[10]; float tempReadings[10]; int readCount = 0; In loop(), add an if(readCount < 10) block that stores each reading to the array. After 10 readings, print the full arrays in a formatted two-column table using a for loop.
8. Data collection (15 min): you collect 10 readings. Vary conditions: cover the LDR, hold a warm hand near the TMP36, open a door. Record each reading manually in the dual sensor data table worksheet at the same time as the Serial Monitor displays it. Ask: "Do the two sensors respond to the same events? Do any conditions affect one but not the other?"
9. Rotate your own pacing. New driver leads the statistics calculations.
10. Statistics worksheet (10 min): hand-calculate mean, range, and mode for both datasets. Mode requires grouping: round all LDR readings to nearest 50 and identify the most frequent band; round all temperature readings to nearest 1°C and identify the most frequent value. Write all calculations with working shown.
