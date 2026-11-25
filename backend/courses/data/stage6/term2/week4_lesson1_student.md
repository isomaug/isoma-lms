# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Wire a dual-sensor system: TMP36 on A0 and LDR on A1, both read simultaneously in the loop() function
- Write a function float readTemperature() that returns a float and a function int readLight() that returns an int — called from loop()
- Implement compound threshold logic: if temperature > 30°C AND light < 400 -> trigger red alert (red LED + buzzer); if temperature > 30°C OR light < 400 -> amber warning (green LED flashes); else -> all clear (green LED steady)
- Store the last 5 temperature readings in a rolling array and compute a rolling mean — trigger the alert only if the rolling mean exceeds the threshold (to filter noise)
- Write a Technical Design Log: for each design decision made (threshold value, alert type, rolling mean window size), write: Decision, Reason, Alternative Considered, Why Alternative Was Rejected
- Evaluate the system against 4 defined requirements and write a paragraph for each: does it meet the requirement? If not, what would you change?

## Let's begin

### 1. HOOK
1. The Hospital Monitor
2. Show a photo of a hospital patient monitor (heart rate, blood pressure, temperature displayed). Ask: "What does this machine do? When does it beep? Why does it NOT beep all the time?"
3. Key insight: thresholds. The machine compares each reading to a defined safe range. If the reading crosses a threshold, it alerts. It does not alert for every reading — only boundary crossings.
4. Introduce today's challenge on projector: "You will build an environment monitor that watches temperature AND light. It has three states: ALL CLEAR, WARNING, and ALERT. Your job is to define the thresholds and build the logic."
5. Get ready to use System Requirements Card. Read all 4 requirements together. Ask: "Which requirement will be hardest to meet? Why?" Accept 3 responses.
6. Get ready to use Technical Design Log Template. Read through the columns. Explain: "Before you build anything, you will log your first 3 design decisions — starting with: what temperature threshold will trigger an alert, and why?"
7. You discuss and write their first log entry: threshold decision, reason, alternative considered, why rejected. Share with class — discuss differences.
### 2. GUIDED ACTIVITY
8. Dual-Sensor System Build
9. Step 1 (15 min): Wire the complete circuit. TMP36 on A0, LDR on A1 (with 10kΩ pull-down), red LED on pin 8, green LED on pin 9, buzzer on pin 10. You checks all wiring before any upload.
10. Step 2 (15 min): You live-codes the two sensor functions: float readTemperature() and int readLight() — both modular, both with return values. You type along. Verify both functions by printing to Serial Monitor.
11. Step 3 (15 min): Code the three-state alert logic: if(temp > threshold && light < lightThreshold) -> red alert; else if(temp > threshold || light < lightThreshold) -> green flash; else -> green steady. Define threshold constants at the top of the sketch using #define.
12. Step 4 (10 min): Add Serial Monitor output — labelled readings every 2 seconds: Temperature: 28.5 C | Light: 512 | State: ALL CLEAR. This satisfies System Requirement 4.

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. The Hospital Monitor
2. Show a photo of a hospital patient monitor (heart rate, blood pressure, temperature displayed). Ask: "What does this machine do? When does it beep? Why does it NOT beep all the time?"
3. Key insight: thresholds. The machine compares each reading to a defined safe range. If the reading crosses a threshold, it alerts. It does not alert for every reading — only boundary crossings.
4. Introduce today's challenge on projector: "You will build an environment monitor that watches temperature AND light. It has three states: ALL CLEAR, WARNING, and ALERT. Your job is to define the thresholds and build the logic."
5. Get ready to use System Requirements Card. Read all 4 requirements together. Ask: "Which requirement will be hardest to meet? Why?" Accept 3 responses.
6. Get ready to use Technical Design Log Template. Read through the columns. Explain: "Before you build anything, you will log your first 3 design decisions — starting with: what temperature threshold will trigger an alert, and why?"
7. You discuss and write their first log entry: threshold decision, reason, alternative considered, why rejected. Share with class — discuss differences.
8. Dual-Sensor System Build
9. Step 1 (15 min): Wire the complete circuit. TMP36 on A0, LDR on A1 (with 10kΩ pull-down), red LED on pin 8, green LED on pin 9, buzzer on pin 10. You checks all wiring before any upload.
10. Step 2 (15 min): You live-codes the two sensor functions: float readTemperature() and int readLight() — both modular, both with return values. You type along. Verify both functions by printing to Serial Monitor.
11. Step 3 (15 min): Code the three-state alert logic: if(temp > threshold && light < lightThreshold) -> red alert; else if(temp > threshold || light < lightThreshold) -> green flash; else -> green steady. Define threshold constants at the top of the sketch using #define.
12. Step 4 (10 min): Add Serial Monitor output — labelled readings every 2 seconds: Temperature: 28.5 C | Light: 512 | State: ALL CLEAR. This satisfies System Requirement 4.
