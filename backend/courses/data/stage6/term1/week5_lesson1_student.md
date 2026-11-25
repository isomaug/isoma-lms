# Week 5 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Wire an LDR to Arduino analogue pin A0 using a voltage divider circuit with a 10kΩ resistor
- Write an Arduino sketch that reads and prints LDR values to the Serial Monitor every 2 seconds using Serial.println()
- Record 10 sensor readings in a structured data table under varying light conditions (covered/uncovered LDR)
- Plot the 10 readings as a correctly labelled line graph on paper (title, x-axis: reading number, y-axis: sensor value)
- Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, no trend)
- Write a full structured scientific report: Title, Aim, Hypothesis, Equipment, Method, Results (table + graph), Conclusion (min. 100 words)

## Big idea
ILO 3.1 — Write Arduino sketches using analogRead() and Serial.println(). ILO 3.3 — Analyse data patterns; connect sensor data to statistical analysis and real-world applications.

## Let's begin

### 1. HOOK The Robot's Eyes
1. Hold up an LDR. Ask: "What do you think this does? How does it work?"
2. Demonstrate: connect LDR to Serial Plotter on projected screen. Cover and uncover with hand — class watches values change in real time.
3. Ask: "Where do we use this in everyday life?" (streetlights, phone screen brightness, camera exposure)
4. Introduce today's goal: "We will collect real sensor data, plot it as a graph, calculate mean and range, and write a scientific report."
5. Get ready to use Scientific Report Template. Read through each section together. You write their Hypothesis FIRST — before touching the hardware.
6. You cold-calls 2 you to share their hypothesis. Correct format if needed: full sentence + "because…"
### 2. GUIDED ACTIVITY Wire, Code & Log
7. Step 1 (15 min): Get ready to use Sensor Circuit Diagram. You demonstrates LDR wiring on projector: LDR between 5V and A0; 10kΩ resistor between A0 and GND. You wire their own circuit.
8. Step 2 (10 min): Open Arduino IDE. You live-codes the sketch: Serial.begin(9600) in setup(); int sensorValue = analogRead(A0); Serial.println(sensorValue); delay(2000); in loop(). You type simultaneously.
9. Step 3 (5 min): Upload and open Serial Monitor. Verify readings appear every 2 seconds. Typical range: 0–1023.
10. Step 4 (20 min): Data collection. You record 10 readings under 5 different light conditions — normal room light, covered with hand, torch shone directly, covered with book, partial cover. Record in data table on worksheet.
11. Step 5 (10 min): Open Serial Plotter (Tools -> Serial Plotter). Observe the live line graph. Ask: "What does the shape tell us? Where is this the same as what you plotted by hand?"

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Hold up an LDR. Ask: "What do you think this does? How does it work?"
2. Demonstrate: connect LDR to Serial Plotter on projected screen. Cover and uncover with hand — class watches values change in real time.
3. Ask: "Where do we use this in everyday life?" (streetlights, phone screen brightness, camera exposure)
4. Introduce today's goal: "We will collect real sensor data, plot it as a graph, calculate mean and range, and write a scientific report."
5. Get ready to use Scientific Report Template. Read through each section together. You write their Hypothesis FIRST — before touching the hardware.
6. You cold-calls 2 you to share their hypothesis. Correct format if needed: full sentence + "because…"
7. Step 1 (15 min): Get ready to use Sensor Circuit Diagram. You demonstrates LDR wiring on projector: LDR between 5V and A0; 10kΩ resistor between A0 and GND. You wire their own circuit.
8. Step 2 (10 min): Open Arduino IDE. You live-codes the sketch: Serial.begin(9600) in setup(); int sensorValue = analogRead(A0); Serial.println(sensorValue); delay(2000); in loop(). You type simultaneously.
9. Step 3 (5 min): Upload and open Serial Monitor. Verify readings appear every 2 seconds. Typical range: 0–1023.
10. Step 4 (20 min): Data collection. You record 10 readings under 5 different light conditions — normal room light, covered with hand, torch shone directly, covered with book, partial cover. Record in data table on worksheet.
11. Step 5 (10 min): Open Serial Plotter (Tools -> Serial Plotter). Observe the live line graph. Ask: "What does the shape tell us? Where is this the same as what you plotted by hand?"
