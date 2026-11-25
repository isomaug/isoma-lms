# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Explain how a 74HC595 shift register converts serial input (3 wires: data, clock, latch) to 8 parallel outputs, and why this is more efficient than connecting 8 individual wires to the Arduino
- Wire the 74HC595 to the Arduino (data pin 2, clock pin 3, latch pin 4) and a single-digit 7-segment display with 8 resistors
- Use shiftOut(dataPin, clockPin, MSBFIRST, byte) to send the correct binary pattern to display the digits 0–9 on the 7-segment display
- Write a function void displayDigit(int n) that looks up the correct 7-segment pattern from an array and sends it via shiftOut()
- Integrate the 7-segment display with the dual-sensor system to show the rounded temperature value as a single digit in real time
- Write a System Integration Review (minimum 250 words) evaluating how all four Term 3 sub-systems work together: what integration problems were encountered, how each was resolved, and what the integrated system can do that no individual sub-system could do alone

## Let's begin

### 1. HOOK
1. The Wiring Problem
2. Ask: "A 7-segment display has 7 segments plus a decimal point = 8 connections. If we wired each directly to the Arduino, how many pins would we use?" (8.) "We have a servo on pin 9, RGB on pins 9/10/11, buttons on pins 2/4, sensors on A0/A1. Do we have 8 spare digital pins?" (No — the Arduino Uno has 14 digital pins, several already used.)
3. Introduce the shift register: "What if you could control 8 outputs using only 3 wires?" Show the 74HC595 chip. "This IC receives data serially — bit by bit — and outputs it in parallel — all 8 at once."
4. Serial-to-parallel analogy: "Imagine sending a letter one character at a time through a single pipe. At the other end, all characters appear simultaneously. That is what the shift register does with bits."
5. Get ready to use the 7-Segment Pattern Table. Ask: "What binary pattern lights up the digit 3?" You decode from the table. "What is that in decimal?" Calculate: 01001111 = 79.
6. Get ready to use the Integration Test Matrix. Explain: this is today's primary engineering document — it will track every integration attempt, expected result, and actual result. You write their first row: "7-segment display + Arduino via shift register. Expected: digit 0 displayed. Actual: [to be completed]."
### 2. GUIDED ACTIVITY
7. Wire the Shift Register & Display
8. Step 1 (15 min): Wire the 74HC595. Use the Wiring Reference card. Key connections: pin 14 (SER) -> Arduino pin 2; pin 11 (SRCLK) -> Arduino pin 3; pin 12 (RCLK) -> Arduino pin 4; pin 16 (VCC) -> 5V; pin 8 (GND) -> GND; pins 1–7, 15 (QA–QH) -> 7-segment segments A–G, DP via 220Ω resistors. You checks ALL wiring before upload.
9. Step 2 (15 min): Write the shiftOut test: const int DATA=2, CLK=3, LATCH=4; — then: digitalWrite(LATCH, LOW); shiftOut(DATA, CLK, MSBFIRST, 0b00111111); digitalWrite(LATCH, HIGH); — this should display "0". Upload. Observe.
10. Step 3 (15 min): Declare the digit pattern array: byte digits[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F}; — introduce hexadecimal as a shorthand for binary. Write the displayDigit(int n) function.
11. Step 4 (15 min): Loop through all digits 0–9 with a 1-second delay. Display counts 0 -> 9 -> 0 -> … Add Serial Monitor output alongside: "Displaying: 4. Binary: 01100110."

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. The Wiring Problem
2. Ask: "A 7-segment display has 7 segments plus a decimal point = 8 connections. If we wired each directly to the Arduino, how many pins would we use?" (8.) "We have a servo on pin 9, RGB on pins 9/10/11, buttons on pins 2/4, sensors on A0/A1. Do we have 8 spare digital pins?" (No — the Arduino Uno has 14 digital pins, several already used.)
3. Introduce the shift register: "What if you could control 8 outputs using only 3 wires?" Show the 74HC595 chip. "This IC receives data serially — bit by bit — and outputs it in parallel — all 8 at once."
4. Serial-to-parallel analogy: "Imagine sending a letter one character at a time through a single pipe. At the other end, all characters appear simultaneously. That is what the shift register does with bits."
5. Get ready to use the 7-Segment Pattern Table. Ask: "What binary pattern lights up the digit 3?" You decode from the table. "What is that in decimal?" Calculate: 01001111 = 79.
6. Get ready to use the Integration Test Matrix. Explain: this is today's primary engineering document — it will track every integration attempt, expected result, and actual result. You write their first row: "7-segment display + Arduino via shift register. Expected: digit 0 displayed. Actual: [to be completed]."
7. Wire the Shift Register & Display
8. Step 1 (15 min): Wire the 74HC595. Use the Wiring Reference card. Key connections: pin 14 (SER) -> Arduino pin 2; pin 11 (SRCLK) -> Arduino pin 3; pin 12 (RCLK) -> Arduino pin 4; pin 16 (VCC) -> 5V; pin 8 (GND) -> GND; pins 1–7, 15 (QA–QH) -> 7-segment segments A–G, DP via 220Ω resistors. You checks ALL wiring before upload.
9. Step 2 (15 min): Write the shiftOut test: const int DATA=2, CLK=3, LATCH=4; — then: digitalWrite(LATCH, LOW); shiftOut(DATA, CLK, MSBFIRST, 0b00111111); digitalWrite(LATCH, HIGH); — this should display "0". Upload. Observe.
10. Step 3 (15 min): Declare the digit pattern array: byte digits[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F}; — introduce hexadecimal as a shorthand for binary. Write the displayDigit(int n) function.
11. Step 4 (15 min): Loop through all digits 0–9 with a 1-second delay. Display counts 0 -> 9 -> 0 -> … Add Serial Monitor output alongside: "Displaying: 4. Binary: 01100110."
