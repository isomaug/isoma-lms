# Week 5 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Wire an LDR to Arduino analogue pin A0 using a voltage divider circuit with a 10kΩ resistor
- Write an Arduino sketch that reads and prints LDR values to the Serial Monitor every 2 seconds using Serial.println()
- Record 10 sensor readings in a structured data table under varying light conditions (covered/uncovered LDR)
- Plot the 10 readings as a correctly labelled line graph on paper (title, x-axis: reading number, y-axis: sensor value)
- Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, no trend)
- Write a full structured scientific report: Title, Aim, Hypothesis, Equipment, Method, Results (table + graph), Conclusion (min. 100 words)

## Continue

### 3. INDEPENDENT / PAIR WORK Graph, Calculate & Write
1. Task 1 (20 min): Plot the 10 readings as a line graph on squared paper. Choose scale carefully — y-axis must start at 0. Label: title, x-axis (Reading Number), y-axis (Sensor Value). Connect plotted points with a smooth line.
2. Task 2 (10 min): Calculate mean (sum ÷ 10) and range (max − min). Write both values on the Data Table Sheet and annotate on the graph.
3. Task 3 (20 min): Write the Conclusion section of the Scientific Report — minimum 100 words. Must include: what the data showed, whether the hypothesis was supported, the mean and range values, the trend observed, and one real-world connection.
4. Extension: Modify the sketch to only print a reading when the light level drops below a threshold value (e.g. sensorValue < 300). This is how an automatic streetlight switch works.
5. Rotate Driver/Navigator between Tasks 1 and 3.
### 4. SHOWCASE & DEBRIEF
6. 2 you hold up their graphs. Class evaluates: Does the graph have a title? Are axes labelled? Is the scale appropriate?
7. One pair reads their Conclusion aloud. Class checks: mean mentioned? Trend identified? Real-world connection made?
8. Ask yourself: "If a sensor value of 300 means 'dark', write the if/else condition that would turn on a light." (Preview of future thinking — link to Week 4 logic.)
9. Math close: write on board — Mean formula and Range formula. One learner explains in plain English: "The mean tells us the average sensor value across all our readings."
10. English close: "Your Conclusion is the most important paragraph. A scientist who didn't watch your experiment should understand exactly what happened just from reading it."
11. Collect completed Data Table & Graph Sheets + Scientific Report as this week's artifact.

## All Lesson 2 steps (complete list)

1. Task 1 (20 min): Plot the 10 readings as a line graph on squared paper. Choose scale carefully — y-axis must start at 0. Label: title, x-axis (Reading Number), y-axis (Sensor Value). Connect plotted points with a smooth line.
2. Task 2 (10 min): Calculate mean (sum ÷ 10) and range (max − min). Write both values on the Data Table Sheet and annotate on the graph.
3. Task 3 (20 min): Write the Conclusion section of the Scientific Report — minimum 100 words. Must include: what the data showed, whether the hypothesis was supported, the mean and range values, the trend observed, and one real-world connection.
4. Extension: Modify the sketch to only print a reading when the light level drops below a threshold value (e.g. sensorValue < 300). This is how an automatic streetlight switch works.
5. Rotate Driver/Navigator between Tasks 1 and 3.
6. 2 you hold up their graphs. Class evaluates: Does the graph have a title? Are axes labelled? Is the scale appropriate?
7. One pair reads their Conclusion aloud. Class checks: mean mentioned? Trend identified? Real-world connection made?
8. Ask yourself: "If a sensor value of 300 means 'dark', write the if/else condition that would turn on a light." (Preview of future thinking — link to Week 4 logic.)
9. Math close: write on board — Mean formula and Range formula. One learner explains in plain English: "The mean tells us the average sensor value across all our readings."
10. English close: "Your Conclusion is the most important paragraph. A scientist who didn't watch your experiment should understand exactly what happened just from reading it."
11. Collect completed Data Table & Graph Sheets + Scientific Report as this week's artifact.

## Check your understanding
- Evidence Required
- Formative (During)
- Working LDR sketch prints values to Serial Monitor every 2 seconds. Data table has 10 complete readings. Graph is plotted and labelled correctly.
- Your own check log. Sketch verified on screen before you proceed to graph.
- Week 5 Artifact
- Completed Scientific Report (all 7 sections) + Data Table Sheet + labelled line graph. Conclusion minimum 100 words in full sentences.
- Physical documents collected. You scores against 5-point artifact rubric (DDD Part 8.3).
- Differentiation
- Support: pre-draw graph axes and scale. Provide sentence starters for Conclusion. Extension: threshold-triggered output + explanation of how this logic scales to AI sensor systems.
- Extension: modified sketch with threshold condition compiles and runs correctly.

## Key words to remember
LDR · analogue · analogRead() · sensor · Serial Plotter · voltage divider · data table · line graph · mean · range · trend · hypothesis · conclusion · threshold Date Delivered: Signature:

## Stay safe
Resistors are essential for the LDR circuit — direct connection between 5V and GND will short the circuit. You checks ALL wiring before you upload sketches.

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
