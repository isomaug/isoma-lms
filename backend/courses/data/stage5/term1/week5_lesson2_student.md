# Week 5 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Wire an LDR sensor to Arduino analogue pin A0 using a breadboard and 10kΩ resistor voltage divider circuit
- Write an Arduino sketch that reads and prints the LDR analogue value every 2 seconds using Serial.println()
- Record 10 sensor readings in a data table under varying light conditions (covered / normal / bright)
- Plot all 10 readings as a correctly labelled line graph on squared paper (x-axis: reading number; y-axis: sensor value)
- Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, or no trend)
- Write a full scientific report with all 7 required sections: Title, Aim, Hypothesis, Equipment, Method, Results (data table + graph), Conclusion (minimum 100 words)

## Continue

### INDEPENDENT WORK – Graph, Calculate, and Write  (50 min)
1. Calculate and label on the graph: draw a horizontal dashed line at the mean value. Label it "Mean = ___".
2. Scientific report: you write all 7 sections on the report template. The Method section must be written as numbered steps. The Conclusion must be at least 100 words and include: what the data showed, whether the hypothesis was supported, one source of error, and one real-world application of this sensor.
3. Check your work carefully. Ask: "What trend did you find? How does this connect to how your phone screen adjusts its brightness?"
4. Pair self-check: swap report templates. Partner checks: Are all 7 sections present? Is the graph correctly labelled? Is the mean calculated correctly? Write one comment on the margin.
5. 2–3 you share their line graphs on the projected screen (hold up to camera or place on document camera). Explain: "Our mean was ___, our range was ___, and the trend was ___."
6. Think about: "Did all groups get the same trend? Why might two groups in the same room get different values?" (Different positions relative to windows, different light conditions.)

### SHOWCASE & DEBRIEF  (30 min)
7. Connect to AI: "An AI that adjusts a phone screen brightness is doing what you did – collecting sensor data, finding a pattern, and applying a rule. You just built the data collection layer of that system."
8. Remember English link: "Your scientific report follows a professional structure used by scientists worldwide. The same format will appear in your secondary school science classes."
9. Remember Math link: "Mean gives us a representative value. Range tells us how spread out the data is. Both are tools for understanding what the data is really saying."
10. Exit question (written): "Write one sentence: what did the data show about how the LDR responds to light?" Collect as formative evidence.
11. Submit sketch and completed report template via USB flash drive.

## All Lesson 2 steps (complete list)

1. Calculate and label on the graph: draw a horizontal dashed line at the mean value. Label it "Mean = ___".
2. Scientific report: you write all 7 sections on the report template. The Method section must be written as numbered steps. The Conclusion must be at least 100 words and include: what the data showed, whether the hypothesis was supported, one source of error, and one real-world application of this sensor.
3. Check your work carefully. Ask: "What trend did you find? How does this connect to how your phone screen adjusts its brightness?"
4. Pair self-check: swap report templates. Partner checks: Are all 7 sections present? Is the graph correctly labelled? Is the mean calculated correctly? Write one comment on the margin.
5. 2–3 you share their line graphs on the projected screen (hold up to camera or place on document camera). Explain: "Our mean was ___, our range was ___, and the trend was ___."
6. Think about: "Did all groups get the same trend? Why might two groups in the same room get different values?" (Different positions relative to windows, different light conditions.)
7. Connect to AI: "An AI that adjusts a phone screen brightness is doing what you did – collecting sensor data, finding a pattern, and applying a rule. You just built the data collection layer of that system."
8. Remember English link: "Your scientific report follows a professional structure used by scientists worldwide. The same format will appear in your secondary school science classes."
9. Remember Math link: "Mean gives us a representative value. Range tells us how spread out the data is. Both are tools for understanding what the data is really saying."
10. Exit question (written): "Write one sentence: what did the data show about how the LDR responds to light?" Collect as formative evidence.
11. Submit sketch and completed report template via USB flash drive.

## Check your understanding
- Formative | (During) | Circuit wired correctly before powering on (you physical check) | Serial Monitor shows sensor readings updating every 2 seconds (observed during guided phase) | Data table: 10 readings recorded with light condition noted (collected) | Mean and range calculated correctly by hand (checked during circulation)
- Exit Assessment | Working LDR sensor sketch reads and prints values to Serial Monitor (verified by you) | Completed data table with 10 readings, mean, and range (submitted) | Correctly plotted and labelled line graph on squared paper (submitted) | Full scientific report with all 7 sections, minimum 100-word conclusion (submitted)
- Differentiation | Support: Pre-build the circuit and have the sketch uploaded. Learner focuses on data collection, graphing, and report writing only. Provide sentence starters for the Conclusion: "Our data showed that… This happened because… One thing that might have affected our results was…" | Extension: Modify the sketch to add an if/else condition: if lightValue < 300, digitalWrite(13, HIGH) (LED on as alarm), else digitalWrite(13, LOW). This creates an automatic light-activated alarm. Add a second column to the data table calculating the percentage change from the first reading.

## Key words to remember
sensor · analogue · LDR · analogRead() · Serial Monitor · mean · range · trend · line graph · hypothesis · conclusion · voltage divider

## Stay safe
Safeguarding Note: Ensure you handle electronic components carefully. LDRs and resistors are not harmful but breadboard pins should not be touched while the board is powered. Supervise all circuit builds before USB power is connected. No personal data should appear in any part of the scientific report.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
