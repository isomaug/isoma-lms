# Week 3 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Wire a common-cathode RGB LED with three separate 220Ω resistors on PWM pins 9 (red), 10 (green), 11 (blue)
- Use analogWrite(pin, 0–255) to control the brightness of each RGB channel independently and produce at least 6 distinct named colours
- Write a function void setColour(int r, int g, int b) that accepts three channel values and applies them — call it from the state machine
- Design a colour-coding scheme that encodes both temperature state AND light state as a combined RGB colour — documented in a Colour Encoding Table before implementation
- Produce a System Architecture Diagram showing: TMP36 (A0) -> temperature function -> colour calculation -> RGB LED; LDR (A1) -> light function -> colour calculation -> RGB LED; Serial Monitor text output channel
- Evaluate the colour-coding scheme against 3 usability criteria: distinguishability (can a person reliably tell the 4 colours apart?), intuitiveness (does the colour match the real-world concept?), and accessibility (would the system work for someone who is colour-blind?)

## Continue

### 3. INDEPENDENT / PAIR WORK
1. Evaluate Usability & Refine
2. Task 1 (20 min): Complete the Usability Evaluation Framework — all 3 criteria (Distinguishability, Intuitiveness, Accessibility), 4-point scale each, written justification for every score. For Accessibility: pair asks themselves "If I could not distinguish red from green, would this system still communicate the correct state?" If not, propose a modified colour scheme that is colour-blind safe.
3. Task 2 (15 min): Refine the colour scheme based on the usability evaluation — make at least one documented improvement. Record the change in the Engineering Change Log from Week 2 (you should now be maintaining this log across sessions as a running document). Re-test and record the new usability score.
4. Task 3 (10 min): Complete the System Architecture Diagram — add the Key and verify that all arrows are bidirectional or directional as appropriate. Write one sentence describing each data flow: "The TMP36 on A0 outputs an analogue voltage that is read by analogRead() and converted to °C by the readTemperature() function."
5. Task 4 (Extension, 5 min): Implement smooth colour interpolation — instead of jumping instantly to the target colour, use a for loop to gradually step from the current RGB values to the target values over 500ms. This requires storing the current R, G, B values as global variables.
6. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
7. 2 you demonstrate their colour-output systems. Class observes: "What state is this? How do you know?" Audience must identify the state from the colour alone — no verbal hint from the pair.
8. Usability Evaluation share: one pair reads their Accessibility score and justification. Class evaluates: "Is the proposed colour-blind safe alternative actually distinguishable without colour? Does it use other cues — brightness, flashing rate?"
9. System Architecture Diagram: post two diagrams under the projector. Class compares — which one can be followed without any verbal explanation? What elements does the clearer diagram have that the other lacks?
10. Remember: "Your System Architecture Diagram is a professional document. If you handed it to an engineer who had never seen your system, could they build it from the diagram alone? That is the standard."
11. Math close: write on board — map(temperature, 25, 40, 0, 255). "If temperature = 32°C, what is the red channel value?" Answer: map(32, 25, 40, 0, 255) = (32-25)/(40-25) × 255 = 7/15 × 255 ≈ 119. "What is the duty cycle percentage?" 119/255 × 100% ≈ 46.7%.
12. Collect Colour Encoding Table, System Architecture Diagram, and Usability Evaluation Framework as this week's artifact.

## All Lesson 2 steps (complete list)

1. Evaluate Usability & Refine
2. Task 1 (20 min): Complete the Usability Evaluation Framework — all 3 criteria (Distinguishability, Intuitiveness, Accessibility), 4-point scale each, written justification for every score. For Accessibility: pair asks themselves "If I could not distinguish red from green, would this system still communicate the correct state?" If not, propose a modified colour scheme that is colour-blind safe.
3. Task 2 (15 min): Refine the colour scheme based on the usability evaluation — make at least one documented improvement. Record the change in the Engineering Change Log from Week 2 (you should now be maintaining this log across sessions as a running document). Re-test and record the new usability score.
4. Task 3 (10 min): Complete the System Architecture Diagram — add the Key and verify that all arrows are bidirectional or directional as appropriate. Write one sentence describing each data flow: "The TMP36 on A0 outputs an analogue voltage that is read by analogRead() and converted to °C by the readTemperature() function."
5. Task 4 (Extension, 5 min): Implement smooth colour interpolation — instead of jumping instantly to the target colour, use a for loop to gradually step from the current RGB values to the target values over 500ms. This requires storing the current R, G, B values as global variables.
6. Rotate Driver/Navigator between Tasks 1 and 2.
7. 2 you demonstrate their colour-output systems. Class observes: "What state is this? How do you know?" Audience must identify the state from the colour alone — no verbal hint from the pair.
8. Usability Evaluation share: one pair reads their Accessibility score and justification. Class evaluates: "Is the proposed colour-blind safe alternative actually distinguishable without colour? Does it use other cues — brightness, flashing rate?"
9. System Architecture Diagram: post two diagrams under the projector. Class compares — which one can be followed without any verbal explanation? What elements does the clearer diagram have that the other lacks?
10. Remember: "Your System Architecture Diagram is a professional document. If you handed it to an engineer who had never seen your system, could they build it from the diagram alone? That is the standard."
11. Math close: write on board — map(temperature, 25, 40, 0, 255). "If temperature = 32°C, what is the red channel value?" Answer: map(32, 25, 40, 0, 255) = (32-25)/(40-25) × 255 = 7/15 × 255 ≈ 119. "What is the duty cycle percentage?" 119/255 × 100% ≈ 46.7%.
12. Collect Colour Encoding Table, System Architecture Diagram, and Usability Evaluation Framework as this week's artifact.

## Check your understanding
- Evidence Required
- Formative
- (During)
- RGB LED produces at least 4 visually distinct colours corresponding to 4 system states. setColour() function is modular and called from the state machine. System Architecture Diagram completed before coding begins — you checks.
- Your own check log. Class observation test: audience identifies all 4 states from colour alone (pass/fail per state for you).
- Term 3 Week 3
- Artifact
- Colour Encoding Table (all 4 states, R/G/B values, rationale per colour) + System Architecture Diagram (all components, all data flows, Key written) + Usability Evaluation Framework (all 3 criteria scored, written justification, colour-blind assessment). Scored on 5-point DDD rubric (Part 8.3).
- All three physical documents collected. System Architecture Diagram must be a pre-coding document — dated and signed by you before code was written.
- Differentiation
- Support: provide Colour Encoding Table pre-completed with 4 colours — you implement the code only and complete the Usability Evaluation. Extension: smooth colour interpolation using for loop with global RGB state variables.
- Extension: smooth colour transition demonstrated live — no instantaneous jump between states.

## Key words to remember
RGB · PWM · analogWrite() · duty cycle · common cathode · colour mixing · additive · linear interpolation · map() · System Architecture Diagram · Key · usability · distinguishability · intuitiveness · accessibility · colour-blind · data flow · output channel ⚠  Safeguarding Note RGB LEDs with incorrect wiring (no resistors per channel, or common anode treated as common cathode) will burn out immediately. You checks all RGB LED wiring BEFORE upload — this is mandatory. Usability and accessibility discussion: when introducing colour-blindness, frame it factually and respectfully — approximately 8% of males have red-green colour vision deficiency. Do not ask you to self-identify. The goal is engineering inclusion: designing systems that work for the broadest possible range of users. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
