# Lesson 5: Reading the World - Sensors, Data & Statistical Analysis

**Duration:** 3 hours (Term-time Saturday) (split across Week 5 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 5
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, LDR (light-dependent resistor), 10kΩ resistor, breadboard, jumper wires
**Software:** Arduino IDE 2.x — Serial Monitor & Serial Plotter
**Bloom's:** L4 Analysing
**DDD Phase:** ANALYSE — Learners wire an LDR sensor, log real analogue data, plot a line graph on paper, calculate mean and range, and write a full structured scientific report
**NCDC:** Uganda NCDC Curriculum P5/P6 — Literacy Strand: Scientific report writing (hypothesis, method, results, conclusion); Numeracy Strand: Data tables, line graphs, mean, range, trend analysis

**Big Idea:** ILO 3.1 — Write Arduino sketches using analogRead() and Serial.println(). ILO 3.3 — Analyse data patterns; connect sensor data to statistical analysis and real-world applications.

**Source plan:** `Stage6_Week5_Sensors_Data_Analysis.docx`

## Learning Objectives

- Wire an LDR to Arduino analogue pin A0 using a voltage divider circuit with a 10kΩ resistor
- Write an Arduino sketch that reads and prints LDR values to the Serial Monitor every 2 seconds using Serial.println()
- Record 10 sensor readings in a structured data table under varying light conditions (covered/uncovered LDR)
- Plot the 10 readings as a correctly labelled line graph on paper (title, x-axis: reading number, y-axis: sensor value)
- Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, no trend)
- Write a full structured scientific report: Title, Aim, Hypothesis, Equipment, Method, Results (table + graph), Conclusion (min. 100 words)

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK The Robot's Eyes
1. Hold up an LDR. Ask: "What do you think this does? How does it work?"
2. Demonstrate: connect LDR to Serial Plotter on projected screen. Cover and uncover with hand — class watches values change in real time.
3. Ask: "Where do we use this in everyday life?" (streetlights, phone screen brightness, camera exposure)
4. Introduce today's goal: "We will collect real sensor data, plot it as a graph, calculate mean and range, and write a scientific report."
5. Distribute Scientific Report Template. Read through each section together. Learners write their Hypothesis FIRST — before touching the hardware.
6. Facilitator cold-calls 2 pairs to share their hypothesis. Correct format if needed: full sentence + "because…"
### 2. GUIDED ACTIVITY Wire, Code & Log
7. Step 1 (15 min): Distribute Sensor Circuit Diagram. Facilitator demonstrates LDR wiring on projector: LDR between 5V and A0; 10kΩ resistor between A0 and GND. Pairs wire their own circuit.
8. Step 2 (10 min): Open Arduino IDE. Facilitator live-codes the sketch: Serial.begin(9600) in setup(); int sensorValue = analogRead(A0); Serial.println(sensorValue); delay(2000); in loop(). Learners type simultaneously.
9. Step 3 (5 min): Upload and open Serial Monitor. Verify readings appear every 2 seconds. Typical range: 0–1023.
10. Step 4 (20 min): Data collection. Pairs record 10 readings under 5 different light conditions — normal room light, covered with hand, torch shone directly, covered with book, partial cover. Record in data table on worksheet.
11. Step 5 (10 min): Open Serial Plotter (Tools → Serial Plotter). Observe the live line graph. Ask: "What does the shape tell us? Where is this the same as what you plotted by hand?"
### 3. INDEPENDENT / PAIR WORK Graph, Calculate & Write
12. Task 1 (20 min): Plot the 10 readings as a line graph on squared paper. Choose scale carefully — y-axis must start at 0. Label: title, x-axis (Reading Number), y-axis (Sensor Value). Connect plotted points with a smooth line.
13. Task 2 (10 min): Calculate mean (sum ÷ 10) and range (max − min). Write both values on the Data Table Sheet and annotate on the graph.
14. Task 3 (20 min): Write the Conclusion section of the Scientific Report — minimum 100 words. Must include: what the data showed, whether the hypothesis was supported, the mean and range values, the trend observed, and one real-world connection.
15. Extension: Modify the sketch to only print a reading when the light level drops below a threshold value (e.g. sensorValue < 300). This is how an automatic streetlight switch works.
16. Rotate Driver/Navigator between Tasks 1 and 3.
### 4. SHOWCASE & DEBRIEF
17. 2 pairs hold up their graphs. Class evaluates: Does the graph have a title? Are axes labelled? Is the scale appropriate?
18. One pair reads their Conclusion aloud. Class checks: mean mentioned? Trend identified? Real-world connection made?
19. Facilitator asks: "If a sensor value of 300 means 'dark', write the if/else condition that would turn on a light." (Preview of future thinking — link to Week 4 logic.)
20. Math close: write on board — Mean formula and Range formula. One learner explains in plain English: "The mean tells us the average sensor value across all our readings."
21. English close: "Your Conclusion is the most important paragraph. A scientist who didn't watch your experiment should understand exactly what happened just from reading it."
22. Collect completed Data Table & Graph Sheets + Scientific Report as this week's artifact.

## Assessment

- Evidence Required
- Formative (During)
- Working LDR sketch prints values to Serial Monitor every 2 seconds. Data table has 10 complete readings. Graph is plotted and labelled correctly.
- Facilitator observation log. Sketch verified on screen before learners proceed to graph.
- Week 5 Artifact
- Completed Scientific Report (all 7 sections) + Data Table Sheet + labelled line graph. Conclusion minimum 100 words in full sentences.
- Physical documents collected. Facilitator scores against 5-point artifact rubric (DDD Part 8.3).
- Differentiation
- Support: pre-draw graph axes and scale. Provide sentence starters for Conclusion. Extension: threshold-triggered output + explanation of how this logic scales to AI sensor systems.
- Extension: modified sketch with threshold condition compiles and runs correctly.

## Key Vocabulary

LDR · analogue · analogRead() · sensor · Serial Plotter · voltage divider · data table · line graph · mean · range · trend · hypothesis · conclusion · threshold Date Delivered: Signature:

## Safeguarding

Resistors are essential for the LDR circuit — direct connection between 5V and GND will short the circuit. Facilitator checks ALL wiring before learners upload sketches.

## Full source extract (complete)

```
Sensors, Data Logging & Statistical Analysis
LEARNING OBJECTIVES
• Wire an LDR to Arduino analogue pin A0 using a voltage divider circuit with a 10kΩ resistor
• Write an Arduino sketch that reads and prints LDR values to the Serial Monitor every 2 seconds using Serial.println()
• Record 10 sensor readings in a structured data table under varying light conditions (covered/uncovered LDR)
• Plot the 10 readings as a correctly labelled line graph on paper (title, x-axis: reading number, y-axis: sensor value)
• Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, no trend)
• Write a full structured scientific report: Title, Aim, Hypothesis, Equipment, Method, Results (table + graph), Conclusion (min. 100 words)
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4, LDR × 4, 10kΩ resistors × 4, breadboards × 4, jumper wires
• Printed "Data Table & Graph Sheet" — pre-ruled data table (10 rows) and squared graph paper (A4 per learner)
• Printed "Scientific Report Template" — 7 headed sections with minimum word counts (A4 per learner)
• Printed "Sensor Circuit Diagram" — wiring reference for LDR voltage divider (A5 per pair)
• Rulers, pencils, and coloured pens for graph plotting
• Facilitator projected screen — show Serial Plotter live during demo
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term-time Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino
Lesson 5: Reading the World - Sensors, Data & Statistical Analysis
Duration
3 hours (Term-time Saturday)
Term / Week
Term 1 · Week 5
Age Range
10–12 years
Group Size
8 learners (4 pairs — pair programming)
Hardware
Arduino Uno, USB cable, LDR (light-dependent resistor), 10kΩ resistor, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x — Serial Monitor & Serial Plotter
Bloom's Level
L4 Analysing
DDD Phase
ANALYSE — Learners wire an LDR sensor, log real analogue data, plot a line graph on paper, calculate mean and range, and write a full structured scientific report
NCDC Ref
Uganda NCDC Curriculum P5/P6 — Literacy Strand: Scientific report writing (hypothesis, method, results, conclusion); Numeracy Strand: Data tables, line graphs, mean, range, trend analysis
Cambridge Ref
Cambridge Primary Computing 0845 — Stage 6: Data collection and analysis; Using sensors; Representing data graphically
Intended Learning Outcome (ILO)
Big Idea
ILO 3.1 — Write Arduino sketches using analogRead() and Serial.println(). ILO 3.3 — Analyse data patterns; connect sensor data to statistical analysis and real-world applications.
Sensors give computers a way to feel the world. But raw data is just numbers until you organise, graph, and interpret it — that is what scientists and data analysts do.
English Literacy Thread
Mathematics Thread
Scientific report writing using a structured 7-section format: Title, Aim, Hypothesis, Equipment, Method (numbered steps), Results (data table + graph), Conclusion. The Conclusion must be a minimum of 100 words in full sentences. Explicit instruction: a hypothesis is a prediction written as a full sentence — "I predict that when the LDR is covered, the sensor value will decrease because less light reaches the component." Learners write the Hypothesis before conducting the experiment.
Data table: 10 readings with reading number (1–10) and sensor value columns. Line graph: correct scale chosen by learner, title, labelled axes, plotted points connected. Mean = sum of all readings ÷ 10. Range = maximum reading − minimum reading. Trend identification: is the data increasing, decreasing, or showing no clear trend? Connect to real-world: an automatic streetlight uses this trend to decide when to switch on.
Phase
Time
Activities & Facilitator Actions
1. HOOK The Robot's Eyes
20 min
• Hold up an LDR. Ask: "What do you think this does? How does it work?"
• Demonstrate: connect LDR to Serial Plotter on projected screen. Cover and uncover with hand — class watches values change in real time.
• Ask: "Where do we use this in everyday life?" (streetlights, phone screen brightness, camera exposure)
• Introduce today's goal: "We will collect real sensor data, plot it as a graph, calculate mean and range, and write a scientific report."
• Distribute Scientific Report Template. Read through each section together. Learners write their Hypothesis FIRST — before touching the hardware.
• Facilitator cold-calls 2 pairs to share their hypothesis. Correct format if needed: full sentence + "because…"
2. GUIDED ACTIVITY Wire, Code & Log
60 min
• Step 1 (15 min): Distribute Sensor Circuit Diagram. Facilitator demonstrates LDR wiring on projector: LDR between 5V and A0; 10kΩ resistor between A0 and GND. Pairs wire their own circuit.
• Step 2 (10 min): Open Arduino IDE. Facilitator live-codes the sketch: Serial.begin(9600) in setup(); int sensorValue = analogRead(A0); Serial.println(sensorValue); delay(2000); in loop(). Learners type simultaneously.
• Step 3 (5 min): Upload and open Serial Monitor. Verify readings appear every 2 seconds. Typical range: 0–1023.
• Step 4 (20 min): Data collection. Pairs record 10 readings under 5 different light conditions — normal room light, covered with hand, torch shone directly, covered with book, partial cover. Record in data table on worksheet.
• Step 5 (10 min): Open Serial Plotter (Tools → Serial Plotter). Observe the live line graph. Ask: "What does the shape tell us? Where is this the same as what you plotted by hand?"
3. INDEPENDENT / PAIR WORK Graph, Calculate & Write
50 min
• Task 1 (20 min): Plot the 10 readings as a line graph on squared paper. Choose scale carefully — y-axis must start at 0. Label: title, x-axis (Reading Number), y-axis (Sensor Value). Connect plotted points with a smooth line.
• Task 2 (10 min): Calculate mean (sum ÷ 10) and range (max − min). Write both values on the Data Table Sheet and annotate on the graph.
• Task 3 (20 min): Write the Conclusion section of the Scientific Report — minimum 100 words. Must include: what the data showed, whether the hypothesis was supported, the mean and range values, the trend observed, and one real-world connection.
• Extension: Modify the sketch to only print a reading when the light level drops below a threshold value (e.g. sensorValue < 300). This is how an automatic streetlight switch works.
• Rotate Driver/Navigator between Tasks 1 and 3.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs hold up their graphs. Class evaluates: Does the graph have a title? Are axes labelled? Is the scale appropriate?
• One pair reads their Conclusion aloud. Class checks: mean mentioned? Trend identified? Real-world connection made?
• Facilitator asks: "If a sensor value of 300 means 'dark', write the if/else condition that would turn on a light." (Preview of future thinking — link to Week 4 logic.)
• Math close: write on board — Mean formula and Range formula. One learner explains in plain English: "The mean tells us the average sensor value across all our readings."
• English close: "Your Conclusion is the most important paragraph. A scientist who didn't watch your experiment should understand exactly what happened just from reading it."
• Collect completed Data Table & Graph Sheets + Scientific Report as this week's artifact.
Component
Description
Evidence Required
Formative (During)
Working LDR sketch prints values to Serial Monitor every 2 seconds. Data table has 10 complete readings. Graph is plotted and labelled correctly.
Facilitator observation log. Sketch verified on screen before learners proceed to graph.
Week 5 Artifact
Completed Scientific Report (all 7 sections) + Data Table Sheet + labelled line graph. Conclusion minimum 100 words in full sentences.
Physical documents collected. Facilitator scores against 5-point artifact rubric (DDD Part 8.3).
Differentiation
Support: pre-draw graph axes and scale. Provide sentence starters for Conclusion. Extension: threshold-triggered output + explanation of how this logic scales to AI sensor systems.
Extension: modified sketch with threshold condition compiles and runs correctly.
KEY VOCABULARY
LDR · analogue · analogRead() · sensor · Serial Plotter · voltage divider · data table · line graph · mean · range · trend · hypothesis · conclusion · threshold
Safeguarding Note
Resistors are essential for the LDR circuit — direct connection between 5V and GND will short the circuit. Facilitator checks ALL wiring before learners upload sketches.
Facilitator Name:
_______________________
Date Delivered:
________________________
Signature:
________________________
```
