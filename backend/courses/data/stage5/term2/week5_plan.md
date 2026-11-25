# Lesson T2–5: Dual Sensors, Comparative Data Analysis & Extended Scientific Reporting

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 5 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 5
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LDR (light-dependent resistor) on pin A0, TMP36 temperature sensor on pin A1, 10kΩ resistor, breadboard, jumper wires
**Bloom's:** L4 Analysing → L5 Evaluating
**DDD ILO:** ILO 3.1 – Write Arduino sketches using analogue I/O and Serial.println(); extend to reading two sensors simultaneously and storing readings in arrays. ILO 3.3 – Analyse foundational AI concepts including pattern recognition; connect dual-sensor data to how AI systems use multiple inputs to make more reliable decisions.
**NCDC:** Uganda NCDC P5–P6 – Mathematics Strand: Data handling, mean, range, mode, comparative analysis, dual-axis graphs; English Strand: Extended scientific report writing, comparative prose, hypothesis revision; ICT Strand: Multi-sensor data acquisition, analogRead(), voltage conversion
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Data collection with multiple inputs; representing and interpreting data; drawing conclusions from evidence

**Big Idea:** One sensor gives you data. Two sensors give you a relationship. Real AI systems — from weather stations to medical devices — combine multiple data streams because no single sensor tells the whole story.

**Context:** Term Two Context: Term One Week 5 introduced a single LDR sensor, 10 readings, and a 7-section scientific report. Term Two Week 5 scales every dimension: two sensors run simultaneously, readings are stored in arrays (from T2 Week 2), comparative statistics are calculated across both datasets, two separate line graphs are drawn and compared, and the scientific report is extended with a comparative analysis section. The TMP36 temperature sensor introduces voltage-to-Celsius conversion — the first instance of a mathematical formula embedded directly in Arduino code.

## Learning Objectives

- Wire both an LDR (pin A0) and a TMP36 temperature sensor (pin A1) to the Arduino breadboard simultaneously and confirm both readings appear in Serial Monitor
- Write an Arduino sketch that reads both sensors every 3 seconds, converts the TMP36 raw value to Celsius using the formula: float tempC = (rawValue * 5.0 / 1024.0 - 0.5) * 100.0, and prints both values with labels
- Store 10 readings from each sensor in separate integer/float arrays and print all stored values in a formatted two-column table via Serial Monitor
- Calculate mean, range, and mode (most frequent value) for each sensor dataset by hand on the worksheet, then verify with code
- Plot two separate line graphs on squared paper (one per sensor), using the same x-axis scale (reading number 1–10) to enable direct visual comparison
- Write a full extended scientific report with 8 sections: Title, Aim, Hypothesis, Equipment, Method, Results (two graphs + two data tables), Comparative Analysis (minimum 120 words comparing trends across both sensors), Conclusion (minimum 80 words linking findings to a real-world application)

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 4 LDR sensors + 4 × 10kΩ resistors
- 4 TMP36 temperature sensors (TO-92 package — 3 pins: Vs, Vout, GND)
- 4 breadboards + jumper wire sets
- Squared paper (A4, 3 sheets per learner — 2 for graphs, 1 for calculations)
- Printed "Dual Sensor Data Table" (A4 per learner) — two side-by-side 10-row tables: Reading # | LDR value | Temp (raw) | Temp (°C)
- Printed "Extended Scientific Report Template" (A4, 2 pages per learner) — 8 labelled sections with minimum word counts
- Printed "Statistics Calculation Worksheet" (A5 per learner) — mean, range, mode calculations for both datasets
- Rulers, pencils, coloured pens (2 colours for graph lines)
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Extended scientific report with a new Comparative Analysis section: learners must now compare the two datasets in prose — not just describe each one separately. The Comparative Analysis must use comparative language structures: "While the LDR values increased steadily as the session progressed, the temperature readings remained relatively stable, suggesting that…" "In contrast to the light data, the temperature sensor showed…" "Both sensors responded to changes in the environment, however…" These structures are explicitly taught before writing begins. The Conclusion must connect findings to a real-world application in Uganda — e.g. an automated classroom ventilation system that responds to both heat and light levels.

**Maths:** Three statistical measures applied to two datasets: mean (sum ÷ 10), range (max − min), and mode (most frequent value — requires grouping readings into bands). Learners calculate all three for both the LDR and temperature datasets on the worksheet before coding. Voltage-to-Celsius conversion formula: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Breaking this down: the Arduino reads 0–1023, which represents 0–5V. The TMP36 outputs 10mV per °C with 500mV offset. This is a real algebraic substitution using P6-level formula evaluation. Graph comparison: both line graphs use the same x-axis scale (1–10 readings) and are drawn with different coloured lines — enabling direct visual comparison of trends.

## Lesson Structure

### WARM-UP & REVIEW — One Sensor vs Two Sensors  (20 min)
1. Recall Term One Week 5: "Last term you used one LDR sensor and recorded 10 readings. What did you discover? What were the limitations?" Discuss: one sensor only captures one dimension of the environment. A human judging room conditions uses multiple senses simultaneously — light level AND temperature AND noise.
2. Introduce the TMP36: hold it up. "This sensor measures temperature. It has 3 pins: power, signal, and ground. The signal pin outputs a voltage that increases by 10 millivolts per degree Celsius. We need a formula to convert that voltage reading into a temperature in degrees Celsius." Write the formula on the board: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Walk through the algebra step by step.
3. Formula verification (5 min): if the Arduino reads rawValue = 512, what is tempC? Learners calculate by hand: (512 × 5.0 / 1024.0 − 0.5) × 100.0 = (2.5 − 0.5) × 100.0 = 200.0... wait — that gives 200°C. Something is wrong. Facilitator reveals: TMP36 signal range is 0.1V to 1.75V, not 0 to 5V. The Arduino maps 0–5V to 0–1023. At room temperature (~25°C), output is ~0.75V → rawValue ≈ 153. Recalculate: (153 × 5.0 / 1024.0 − 0.5) × 100.0 = (0.747 − 0.5) × 100.0 = 24.7°C. "This is why we never trust raw sensor values without understanding the formula." Write the corrected expectation: rawValue for room temperature ≈ 100–200.
4. Distribute the dual sensor data table and introduce the session goal: by the end, every learner will have two filled data tables, two graphs, and a full 8-section report.
5. Circuit build (15 min): facilitator projects the dual wiring diagram. LDR: one leg to 5V, other leg to A0 AND one end of 10kΩ resistor; other end of resistor to GND. TMP36: left pin (Vs) to 5V, middle pin (Vout) to A1, right pin (GND) to GND. Pairs build both circuits on the same breadboard simultaneously. Facilitator checks each circuit before powering on — wrong TMP36 orientation can damage the sensor.
6. Sketch writing (15 min): learners write from scratch (not copy-paste). In setup(): Serial.begin(9600). In loop(): int ldrValue = analogRead(A0); int tempRaw = analogRead(A1); float tempC = (tempRaw * 5.0 / 1024.0 - 0.5) * 100.0; Serial.print("LDR: "); Serial.print(ldrValue); Serial.print(" | Temp(C): "); Serial.println(tempC); delay(3000);. Upload and verify both values appear. Ask: "Is your temperature reading reasonable for a room in Kampala?"

### GUIDED ACTIVITY — Dual Sensor Circuit and Data Collection  (60 min)
7. Array upgrade (10 min): modify the sketch to store readings. Declare: int ldrReadings[10]; float tempReadings[10]; int readCount = 0; In loop(), add an if(readCount < 10) block that stores each reading to the array. After 10 readings, print the full arrays in a formatted two-column table using a for loop.
8. Data collection (15 min): pairs collect 10 readings. Vary conditions: cover the LDR, hold a warm hand near the TMP36, open a door. Record each reading manually in the dual sensor data table worksheet at the same time as the Serial Monitor displays it. Ask: "Do the two sensors respond to the same events? Do any conditions affect one but not the other?"
9. Rotate Driver/Navigator. New driver leads the statistics calculations.
10. Statistics worksheet (10 min): hand-calculate mean, range, and mode for both datasets. Mode requires grouping: round all LDR readings to nearest 50 and identify the most frequent band; round all temperature readings to nearest 1°C and identify the most frequent value. Write all calculations with working shown.
11. Graph plotting (15 min): draw two separate line graphs on squared paper using two different coloured pens. Graph 1: LDR values (y-axis 0–1023, or scale to fit data) vs Reading Number (x-axis 1–10). Graph 2: Temperature in °C (y-axis scaled to data range) vs Reading Number (x-axis 1–10). Each graph must have: a title, labelled axes with units, a scale marked, all 10 points plotted, points connected with a ruled line.

### INDEPENDENT WORK — Statistics, Graphs, and Report Writing  (50 min)
12. Report writing (20 min): write the 8-section extended scientific report. Sections 1–5 (Title, Aim, Hypothesis, Equipment, Method) should take 10 minutes. Section 6 (Results): paste or draw the two data tables and reference the two graphs. Section 7 (Comparative Analysis, minimum 120 words): compare the two datasets directly — which sensor showed greater variation? Did any readings change in the same direction at the same time? What does that suggest about the environment? Section 8 (Conclusion, minimum 80 words): link findings to a real-world application.
13. Peer-review swap: swap reports with the partner pair. Check: are both graphs present? Is the Comparative Analysis section clearly comparing (not just describing) the two datasets? Is the temperature formula explained in the Method?
14. Facilitator circulates. Ask: "Which sensor showed greater range? What does a larger range tell you about that sensor's environment?" Note participation.
15. 2–3 pairs share their two graphs side by side (hold up to the class or project via document camera). Explain: "Our LDR mean was ___. Our temperature mean was ___°C. The LDR showed a range of ___, which was [larger/smaller] than the temperature range of ___. We observed that when we covered the LDR, the temperature [did / did not] change — this tells us the two sensors respond to different environmental variables independently."
16. Facilitator connects to AI: "Phones that adjust screen brightness use light sensors. Air conditioning systems use temperature sensors. A smart classroom that automatically adjusts both lighting and ventilation uses BOTH sensors together — exactly the data combination you collected today. The AI behind that system was trained on dual-sensor data like yours."

### SHOWCASE & DEBRIEF  (30 min)
17. Formula discussion: "We used a formula to convert a raw number into a meaningful temperature. In AI and data science, this is called feature engineering — transforming raw data into something the model can interpret. You just engineered a feature."
18. Facilitator restates English link: "The Comparative Analysis section required you to write about two things at the same time — comparing, contrasting, and drawing conclusions. That is the highest level of analytical writing at primary school. It is also what scientists publish in research journals."
19. Facilitator restates Math link: "Three statistical measures — mean, range, mode — applied to two datasets gives you six numbers that summarise 20 readings. Statistics is the tool that turns raw data into knowledge."
20. Exit question (written): "In one sentence each: what did the LDR measure, what did the TMP36 measure, and what would a third sensor measure if you were building a complete room monitoring system?" Collect.
21. Submit sketch and full report via USB flash drive.

## Assessment

- Formative (During) | Dual sensor circuit: both sensors wired correctly and confirmed by facilitator before powering on (physical check) | Serial Monitor: both LDR and temperature values printing correctly every 3 seconds (observed during guided phase) | Statistics worksheet: mean, range, and mode calculated by hand for both datasets before coding (collected) | Peer-review check of partner report: comparative analysis confirmed as comparing (not just describing) both datasets (noted by facilitator)
- Exit Assessment | Dual sensor sketch: reads both sensors, converts temperature using the formula, stores in arrays, prints formatted two-column table — compiles and runs (verified by facilitator) | Two correctly plotted and labelled line graphs on squared paper (submitted) | Full 8-section extended scientific report: Comparative Analysis ≥120 words, Conclusion ≥80 words (submitted, assessed on 5-point artifact rubric) | Statistics worksheet with correct mean, range, and mode for both datasets (submitted) | All materials submitted via USB flash drive
- Differentiation | Support: Pre-build the LDR circuit (covered in Term One) and provide the TMP36 wiring as a guided step-by-step. Provide the conversion formula pre-written in the sketch template and ask learners to annotate it rather than derive it. Reduce the Comparative Analysis to 60 words and provide sentence starters: "Both sensors showed…", "Unlike the LDR, the temperature sensor…", "This suggests that…" | Extension: Add a third calculated variable — a comfort index — defined as: int comfortIndex = (tempC < 27 && ldrValue > 400) ? 1 : 0; — prints 1 if the room is comfortably lit and cool, 0 otherwise. Store the comfort index for all 10 readings in a third array and calculate what percentage of readings showed a comfortable environment. Write a 50-word paragraph explaining what this index means and how it could be used in a smart building system.

## Key Vocabulary

analogRead() · TMP36 · voltage · formula · feature engineering · Comparative Analysis · mean · range · mode · dual-sensor · raw value · conversion · trend

## Safeguarding

Safeguarding Note: TMP36 sensors must be inserted with correct orientation — reversed connection causes the sensor to heat rapidly and can cause burns. Facilitator must verify orientation for all pairs before USB connection. Do not allow learners to hold the TMP36 between fingers to raise the temperature — use a warm hand held near (not touching) the sensor. All data collected is environmental data only; no personal biometric data is recorded.

## Full source extract (complete)

### Detail body

```
Wire both an LDR (pin A0) and a TMP36 temperature sensor (pin A1) to the Arduino breadboard simultaneously and confirm both readings appear in Serial Monitor
Write an Arduino sketch that reads both sensors every 3 seconds, converts the TMP36 raw value to Celsius using the formula: float tempC = (rawValue * 5.0 / 1024.0 - 0.5) * 100.0, and prints both values with labels
Store 10 readings from each sensor in separate integer/float arrays and print all stored values in a formatted two-column table via Serial Monitor
Calculate mean, range, and mode (most frequent value) for each sensor dataset by hand on the worksheet, then verify with code
Plot two separate line graphs on squared paper (one per sensor), using the same x-axis scale (reading number 1–10) to enable direct visual comparison
Write a full extended scientific report with 8 sections: Title, Aim, Hypothesis, Equipment, Method, Results (two graphs + two data tables), Comparative Analysis (minimum 120 words comparing trends across both sensors), Conclusion (minimum 80 words linking findings to a real-world application)
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards + USB cables
4 LDR sensors + 4 × 10kΩ resistors
4 TMP36 temperature sensors (TO-92 package — 3 pins: Vs, Vout, GND)
4 breadboards + jumper wire sets
Squared paper (A4, 3 sheets per learner — 2 for graphs, 1 for calculations)
Printed "Dual Sensor Data Table" (A4 per learner) — two side-by-side 10-row tables: Reading # | LDR value | Temp (raw) | Temp (°C)
Printed "Extended Scientific Report Template" (A4, 2 pages per learner) — 8 labelled sections with minimum word counts
Printed "Statistics Calculation Worksheet" (A5 per learner) — mean, range, mode calculations for both datasets
Rulers, pencils, coloured pens (2 colours for graph lines)
USB flash drives
Facilitator device + projected screen
Recall Term One Week 5: "Last term you used one LDR sensor and recorded 10 readings. What did you discover? What were the limitations?" Discuss: one sensor only captures one dimension of the environment. A human judging room conditions uses multiple senses simultaneously — light level AND temperature AND noise.
Introduce the TMP36: hold it up. "This sensor measures temperature. It has 3 pins: power, signal, and ground. The signal pin outputs a voltage that increases by 10 millivolts per degree Celsius. We need a formula to convert that voltage reading into a temperature in degrees Celsius." Write the formula on the board: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Walk through the algebra step by step.
Formula verification (5 min): if the Arduino reads rawValue = 512, what is tempC? Learners calculate by hand: (512 × 5.0 / 1024.0 − 0.5) × 100.0 = (2.5 − 0.5) × 100.0 = 200.0... wait — that gives 200°C. Something is wrong. Facilitator reveals: TMP36 signal range is 0.1V to 1.75V, not 0 to 5V. The Arduino maps 0–5V to 0–1023. At room temperature (~25°C), output is ~0.75V → rawValue ≈ 153. Recalculate: (153 × 5.0 / 1024.0 − 0.5) × 100.0 = (0.747 − 0.5) × 100.0 = 24.7°C. "This is why we never trust raw sensor values without understanding the formula." Write the corrected expectation: rawValue for room temperature ≈ 100–200.
Distribute the dual sensor data table and introduce the session goal: by the end, every learner will have two filled data tables, two graphs, and a full 8-section report.
Circuit build (15 min): facilitator projects the dual wiring diagram. LDR: one leg to 5V, other leg to A0 AND one end of 10kΩ resistor; other end of resistor to GND. TMP36: left pin (Vs) to 5V, middle pin (Vout) to A1, right pin (GND) to GND. Pairs build both circuits on the same breadboard simultaneously. Facilitator checks each circuit before powering on — wrong TMP36 orientation can damage the sensor.
Sketch writing (15 min): learners write from scratch (not copy-paste). In setup(): Serial.begin(9600). In loop(): int ldrValue = analogRead(A0); int tempRaw = analogRead(A1); float tempC = (tempRaw * 5.0 / 1024.0 - 0.5) * 100.0; Serial.print("LDR: "); Serial.print(ldrValue); Serial.print(" | Temp(C): "); Serial.println(tempC); delay(3000);. Upload and verify both values appear. Ask: "Is your temperature reading reasonable for a room in Kampala?"
Array upgrade (10 min): modify the sketch to store readings. Declare: int ldrReadings[10]; float tempReadings[10]; int readCount = 0; In loop(), add an if(readCount < 10) block that stores each reading to the array. After 10 readings, print the full arrays in a formatted two-column table using a for loop.
Data collection (15 min): pairs collect 10 readings. Vary conditions: cover the LDR, hold a warm hand near the TMP36, open a door. Record each reading manually in the dual sensor data table worksheet at the same time as the Serial Monitor displays it. Ask: "Do the two sensors respond to the same events? Do any conditions affect one but not the other?"
Rotate Driver/Navigator. New driver leads the statistics calculations.
Statistics worksheet (10 min): hand-calculate mean, range, and mode for both datasets. Mode requires grouping: round all LDR readings to nearest 50 and identify the most frequent band; round all temperature readings to nearest 1°C and identify the most frequent value. Write all calculations with working shown.
Graph plotting (15 min): draw two separate line graphs on squared paper using two different coloured pens. Graph 1: LDR values (y-axis 0–1023, or scale to fit data) vs Reading Number (x-axis 1–10). Graph 2: Temperature in °C (y-axis scaled to data range) vs Reading Number (x-axis 1–10). Each graph must have: a title, labelled axes with units, a scale marked, all 10 points plotted, points connected with a ruled line.
Report writing (20 min): write the 8-section extended scientific report. Sections 1–5 (Title, Aim, Hypothesis, Equipment, Method) should take 10 minutes. Section 6 (Results): paste or draw the two data tables and reference the two graphs. Section 7 (Comparative Analysis, minimum 120 words): compare the two datasets directly — which sensor showed greater variation? Did any readings change in the same direction at the same time? What does that suggest about the environment? Section 8 (Conclusion, minimum 80 words): link findings to a real-world application.
Peer-review swap: swap reports with the partner pair. Check: are both graphs present? Is the Comparative Analysis section clearly comparing (not just describing) the two datasets? Is the temperature formula explained in the Method?
Facilitator circulates. Ask: "Which sensor showed greater range? What does a larger range tell you about that sensor's environment?" Note participation.
2–3 pairs share their two graphs side by side (hold up to the class or project via document camera). Explain: "Our LDR mean was ___. Our temperature mean was ___°C. The LDR showed a range of ___, which was [larger/smaller] than the temperature range of ___. We observed that when we covered the LDR, the temperature [did / did not] change — this tells us the two sensors respond to different environmental variables independently."
Facilitator connects to AI: "Phones that adjust screen brightness use light sensors. Air conditioning systems use temperature sensors. A smart classroom that automatically adjusts both lighting and ventilation uses BOTH sensors together — exactly the data combination you collected today. The AI behind that system was trained on dual-sensor data like yours."
Formula discussion: "We used a formula to convert a raw number into a meaningful temperature. In AI and data science, this is called feature engineering — transforming raw data into something the model can interpret. You just engineered a feature."
Facilitator restates English link: "The Comparative Analysis section required you to write about two things at the same time — comparing, contrasting, and drawing conclusions. That is the highest level of analytical writing at primary school. It is also what scientists publish in research journals."
Facilitator restates Math link: "Three statistical measures — mean, range, mode — applied to two datasets gives you six numbers that summarise 20 readings. Statistics is the tool that turns raw data into knowledge."
Exit question (written): "In one sentence each: what did the LDR measure, what did the TMP36 measure, and what would a third sensor measure if you were building a complete room monitoring system?" Collect.
Submit sketch and full report via USB flash drive.
analogRead() · TMP36 · voltage · formula · feature engineering · Comparative Analysis · mean · range · mode · dual-sensor · raw value · conversion · trend
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5  (Ages 10–12 · AI Engineers) | Lesson T2–5: Dual Sensors, Comparative Data Analysis & Extended Scientific Reporting
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 2 · Week 5
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LDR (light-dependent resistor) on pin A0, TMP36 temperature sensor on pin A1, 10kΩ resistor, breadboard, jumper wires | Bloom's Level | L4 Analysing → L5 Evaluating
NCDC Ref | Uganda NCDC P5–P6 – Mathematics Strand: Data handling, mean, range, mode, comparative analysis, dual-axis graphs; English Strand: Extended scientific report writing, comparative prose, hypothesis revision; ICT Strand: Multi-sensor data acquisition, analogRead(), voltage conversion | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Data collection with multiple inputs; representing and interpreting data; drawing conclusions from evidence
DDD ILO | ILO 3.1 – Write Arduino sketches using analogue I/O and Serial.println(); extend to reading two sensors simultaneously and storing readings in arrays. ILO 3.3 – Analyse foundational AI concepts including pattern recognition; connect dual-sensor data to how AI systems use multiple inputs to make more reliable decisions. | Big Idea | One sensor gives you data. Two sensors give you a relationship. Real AI systems — from weather stations to medical devices — combine multiple data streams because no single sensor tells the whole story.
Term Two Context: Term One Week 5 introduced a single LDR sensor, 10 readings, and a 7-section scientific report. Term Two Week 5 scales every dimension: two sensors run simultaneously, readings are stored in arrays (from T2 Week 2), comparative statistics are calculated across both datasets, two separate line graphs are drawn and compared, and the scientific report is extended with a comparative analysis section. The TMP36 temperature sensor introduces voltage-to-Celsius conversion — the first instance of a mathematical formula embedded directly in Arduino code.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Extended scientific report with a new Comparative Analysis section: learners must now compare the two datasets in prose — not just describe each one separately. The Comparative Analysis must use comparative language structures: "While the LDR values increased steadily as the session progressed, the temperature readings remained relatively stable, suggesting that…" "In contrast to the light data, the temperature sensor showed…" "Both sensors responded to changes in the environment, however…" These structures are explicitly taught before writing begins. The Conclusion must connect findings to a real-world application in Uganda — e.g. an automated classroom ventilation system that responds to both heat and light levels.
Maths | Three statistical measures applied to two datasets: mean (sum ÷ 10), range (max − min), and mode (most frequent value — requires grouping readings into bands). Learners calculate all three for both the LDR and temperature datasets on the worksheet before coding. Voltage-to-Celsius conversion formula: tempC = (rawValue × 5.0 / 1024.0 − 0.5) × 100.0. Breaking this down: the Arduino reads 0–1023, which represents 0–5V. The TMP36 outputs 10mV per °C with 500mV offset. This is a real algebraic substitution using P6-level formula evaluation. Graph comparison: both line graphs use the same x-axis scale (1–10 readings) and are drawn with different coloured lines — enabling direct visual comparison of trends.
LESSON STRUCTURE
WARM-UP & REVIEW — One Sensor vs Two Sensors  (20 min)
GUIDED ACTIVITY — Dual Sensor Circuit and Data Collection  (60 min)
INDEPENDENT WORK — Statistics, Graphs, and Report Writing  (50 min)
SHOWCASE & DEBRIEF  (30 min)
ASSESSMENT
Formative (During) | Dual sensor circuit: both sensors wired correctly and confirmed by facilitator before powering on (physical check) | Serial Monitor: both LDR and temperature values printing correctly every 3 seconds (observed during guided phase) | Statistics worksheet: mean, range, and mode calculated by hand for both datasets before coding (collected) | Peer-review check of partner report: comparative analysis confirmed as comparing (not just describing) both datasets (noted by facilitator)
Exit Assessment | Dual sensor sketch: reads both sensors, converts temperature using the formula, stores in arrays, prints formatted two-column table — compiles and runs (verified by facilitator) | Two correctly plotted and labelled line graphs on squared paper (submitted) | Full 8-section extended scientific report: Comparative Analysis ≥120 words, Conclusion ≥80 words (submitted, assessed on 5-point artifact rubric) | Statistics worksheet with correct mean, range, and mode for both datasets (submitted) | All materials submitted via USB flash drive
Differentiation | Support: Pre-build the LDR circuit (covered in Term One) and provide the TMP36 wiring as a guided step-by-step. Provide the conversion formula pre-written in the sketch template and ask learners to annotate it rather than derive it. Reduce the Comparative Analysis to 60 words and provide sentence starters: "Both sensors showed…", "Unlike the LDR, the temperature sensor…", "This suggests that…" | Extension: Add a third calculated variable — a comfort index — defined as: int comfortIndex = (tempC < 27 && ldrValue > 400) ? 1 : 0; — prints 1 if the room is comfortably lit and cool, 0 otherwise. Store the comfort index for all 10 readings in a third array and calculate what percentage of readings showed a comfortable environment. Write a 50-word paragraph explaining what this index means and how it could be used in a smart building system.
KEY VOCABULARY
Safeguarding Note: TMP36 sensors must be inserted with correct orientation — reversed connection causes the sensor to heat rapidly and can cause burns. Facilitator must verify orientation for all pairs before USB connection. Do not allow learners to hold the TMP36 between fingers to raise the temperature — use a warm hand held near (not touching) the sensor. All data collected is environmental data only; no personal biometric data is recorded.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
