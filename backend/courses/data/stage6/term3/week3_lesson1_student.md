# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Wire a common-cathode RGB LED with three separate 220Ω resistors on PWM pins 9 (red), 10 (green), 11 (blue)
- Use analogWrite(pin, 0–255) to control the brightness of each RGB channel independently and produce at least 6 distinct named colours
- Write a function void setColour(int r, int g, int b) that accepts three channel values and applies them — call it from the state machine
- Design a colour-coding scheme that encodes both temperature state AND light state as a combined RGB colour — documented in a Colour Encoding Table before implementation
- Produce a System Architecture Diagram showing: TMP36 (A0) -> temperature function -> colour calculation -> RGB LED; LDR (A1) -> light function -> colour calculation -> RGB LED; Serial Monitor text output channel
- Evaluate the colour-coding scheme against 3 usability criteria: distinguishability (can a person reliably tell the 4 colours apart?), intuitiveness (does the colour match the real-world concept?), and accessibility (would the system work for someone who is colour-blind?)

## Let's begin

### 1. HOOK
1. Colour as Data
2. Display 3 coloured circles on the projector: red, amber, green. Ask: "What does each colour mean?" (Traffic light: stop, caution, go.) "Without any words, you understood a message. How?" Connect: colour is a communication medium — humans process it pre-linguistically.
3. Introduce the engineering challenge: "You have a dual-sensor system — temperature and light. You have one RGB LED. You need to design a colour scheme that communicates BOTH values simultaneously. Four possible states: COOL+DIM, COOL+BRIGHT, WARM+DIM, WARM+BRIGHT. Four distinct colours."
4. Get ready to use Colour Encoding Table Template and RGB Mixing Reference. You have 8 minutes to design their colour scheme — choose 4 distinct colours, one per state. Write the rationale for each choice.
5. Get ready to use System Architecture Diagram Template. You begin drawing the architecture — all components, all connections, all data flows — before any hardware is touched. You reviews: "Can I trace the path from the TMP36 to the RGB LED just by following the arrows? If not, what is missing?"
6. PWM concept: write analogWrite(9, 0) and analogWrite(9, 255) on the board. Ask: "What is the duty cycle of each?" 0% and 100%. Then analogWrite(9, 128): "What duty cycle?" Approximately 50%. This is the mathematical foundation for colour control.
### 2. GUIDED ACTIVITY
7. Wire, Mix & Map
8. Step 1 (15 min): Wire the RGB LED. Common cathode -> GND. Red pin -> 220Ω -> pin 9. Green pin -> 220Ω -> pin 10. Blue pin -> 220Ω -> pin 11. Test each channel independently: analogWrite(9, 255); analogWrite(10, 0); analogWrite(11, 0); — should produce red. Repeat for green and blue.
9. Step 2 (10 min): Write the void setColour(int r, int g, int b) function. Call it: setColour(255, 128, 0) — should produce orange. You compare output to their Colour Encoding Table and Mixing Reference card.
10. Step 3 (20 min): Wire the dual sensors (TMP36 on A0, LDR on A1 with pull-down). Write the temperature and light reading functions from memory — this is now a recall task, not a guided step. You only assists if the recall fails after 5 minutes.
11. Step 4 (15 min): Implement the state-based colour output — integrate the colour scheme from the Colour Encoding Table into the state machine. Each state calls setColour() with the planned R, G, B values. Add Serial Monitor output: print the state name and the RGB values applied.
12. Upload and test. Cover/uncover LDR; warm TMP36. Does the colour change as designed?

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Colour as Data
2. Display 3 coloured circles on the projector: red, amber, green. Ask: "What does each colour mean?" (Traffic light: stop, caution, go.) "Without any words, you understood a message. How?" Connect: colour is a communication medium — humans process it pre-linguistically.
3. Introduce the engineering challenge: "You have a dual-sensor system — temperature and light. You have one RGB LED. You need to design a colour scheme that communicates BOTH values simultaneously. Four possible states: COOL+DIM, COOL+BRIGHT, WARM+DIM, WARM+BRIGHT. Four distinct colours."
4. Get ready to use Colour Encoding Table Template and RGB Mixing Reference. You have 8 minutes to design their colour scheme — choose 4 distinct colours, one per state. Write the rationale for each choice.
5. Get ready to use System Architecture Diagram Template. You begin drawing the architecture — all components, all connections, all data flows — before any hardware is touched. You reviews: "Can I trace the path from the TMP36 to the RGB LED just by following the arrows? If not, what is missing?"
6. PWM concept: write analogWrite(9, 0) and analogWrite(9, 255) on the board. Ask: "What is the duty cycle of each?" 0% and 100%. Then analogWrite(9, 128): "What duty cycle?" Approximately 50%. This is the mathematical foundation for colour control.
7. Wire, Mix & Map
8. Step 1 (15 min): Wire the RGB LED. Common cathode -> GND. Red pin -> 220Ω -> pin 9. Green pin -> 220Ω -> pin 10. Blue pin -> 220Ω -> pin 11. Test each channel independently: analogWrite(9, 255); analogWrite(10, 0); analogWrite(11, 0); — should produce red. Repeat for green and blue.
9. Step 2 (10 min): Write the void setColour(int r, int g, int b) function. Call it: setColour(255, 128, 0) — should produce orange. You compare output to their Colour Encoding Table and Mixing Reference card.
10. Step 3 (20 min): Wire the dual sensors (TMP36 on A0, LDR on A1 with pull-down). Write the temperature and light reading functions from memory — this is now a recall task, not a guided step. You only assists if the recall fails after 5 minutes.
11. Step 4 (15 min): Implement the state-based colour output — integrate the colour scheme from the Colour Encoding Table into the state machine. Each state calls setColour() with the planned R, G, B values. Add Serial Monitor output: print the state name and the RGB values applied.
12. Upload and test. Cover/uncover LDR; warm TMP36. Does the colour change as designed?
