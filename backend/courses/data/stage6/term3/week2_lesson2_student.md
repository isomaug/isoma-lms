# Week 2 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Explain what EEPROM is, how it differs from RAM, and why a byte can only store values 0–255 - using both binary representation and the powers-of-2 formula (2⁸ = 256)
- Write EEPROM.write(address, value) to save a state value and EEPROM.read(address) to retrieve it on startup, integrated into the Week 1 state machine
- Verify persistence: power the Arduino off (disconnect USB), reconnect, and confirm the system restores to the last saved state without any user input
- Create an Engineering Change Log with a minimum of 4 entries - one for each deliberate modification made during the session - using the required 5-column format
- Calculate the maximum number of distinct states that can be stored in a single EEPROM byte, and the maximum number of EEPROM addresses available on an Arduino Uno
- Evaluate the limitations of EEPROM storage: finite write cycles (approximately 100,000 writes per address), wear levelling as a solution, and the implications for a system that writes every second

## Continue

### 3. INDEPENDENT / PAIR WORK Wear Analysis, Binary & Documentation
1. Task 1 (15 min): Complete the EEPROM Wear Calculation Sheet. Scenario: the system saves state every time a button is pressed. If buttons are pressed 10 times per day on average, how many days until address 0 wears out? Show full calculation. Then: propose a wear-levelling strategy using 10 EEPROM addresses - how does this extend the lifespan?
2. Task 2 (10 min): Complete 10 remaining binary conversions on the worksheet. Final challenge: EEPROM has 1024 addresses. How many total bytes of storage? How many bits? Express as a power of 2.
3. Task 3 (20 min): Complete the Engineering Change Log - minimum 4 entries covering every deliberate change made in Phases 1 and 2. Each entry must have all 5 columns completed. The Outcome column is completed AFTER testing the change.
4. Task 4 (Extension, 5 min): Save TWO values to EEPROM: the state (address 0) AND a counter (address 1) that increments each time a state transition occurs and persists across power cycles. Print both on startup: "State: OPEN | Total transitions: 7."
5. Rotate Driver/Navigator between Tasks 1 and 3.
### 4. SHOWCASE & DEBRIEF
6. Live demonstration of persistence: you selects one pair, puts their system in LOCKED state, disconnects USB in front of yourself, reconnects - system must restore to LOCKED. Success is celebrated; failure is diagnosed together ("Which line is missing? Where should saveState() be called?").
7. Engineering Change Log share: one pair reads their best entry aloud. Class evaluates: Is the Reason a justification or a description? Is the Expected Outcome specific and testable? You models the difference: "Reason: 'I changed it' is a description. Reason: 'address 0 was returning 255 on fresh Arduino, indicating uninitialised memory - I added a check to default to CLOSED when the read value is not a valid state' is a justification."
8. Wear analysis: two you share their calculations. Which pair got the same answer? If different, trace through the calculation together on the board.
9. Binary close: write 8-bit binary 10110011 on the board. You calculate the decimal value (179). "How many EEPROM addresses could we use to store this one number?" (Just 1 - it fits in a byte.) "What about a number above 255?" (Need 2 bytes - introduces multi-byte storage preview.)
10. Collect Binary Worksheet, EEPROM Wear Calculation Sheet, and Engineering Change Log as this week's artifact.

## All Lesson 2 steps (complete list)

1. Task 1 (15 min): Complete the EEPROM Wear Calculation Sheet. Scenario: the system saves state every time a button is pressed. If buttons are pressed 10 times per day on average, how many days until address 0 wears out? Show full calculation. Then: propose a wear-levelling strategy using 10 EEPROM addresses - how does this extend the lifespan?
2. Task 2 (10 min): Complete 10 remaining binary conversions on the worksheet. Final challenge: EEPROM has 1024 addresses. How many total bytes of storage? How many bits? Express as a power of 2.
3. Task 3 (20 min): Complete the Engineering Change Log - minimum 4 entries covering every deliberate change made in Phases 1 and 2. Each entry must have all 5 columns completed. The Outcome column is completed AFTER testing the change.
4. Task 4 (Extension, 5 min): Save TWO values to EEPROM: the state (address 0) AND a counter (address 1) that increments each time a state transition occurs and persists across power cycles. Print both on startup: "State: OPEN | Total transitions: 7."
5. Rotate Driver/Navigator between Tasks 1 and 3.
6. Live demonstration of persistence: you selects one pair, puts their system in LOCKED state, disconnects USB in front of yourself, reconnects - system must restore to LOCKED. Success is celebrated; failure is diagnosed together ("Which line is missing? Where should saveState() be called?").
7. Engineering Change Log share: one pair reads their best entry aloud. Class evaluates: Is the Reason a justification or a description? Is the Expected Outcome specific and testable? You models the difference: "Reason: 'I changed it' is a description. Reason: 'address 0 was returning 255 on fresh Arduino, indicating uninitialised memory - I added a check to default to CLOSED when the read value is not a valid state' is a justification."
8. Wear analysis: two you share their calculations. Which pair got the same answer? If different, trace through the calculation together on the board.
9. Binary close: write 8-bit binary 10110011 on the board. You calculate the decimal value (179). "How many EEPROM addresses could we use to store this one number?" (Just 1 - it fits in a byte.) "What about a number above 255?" (Need 2 bytes - introduces multi-byte storage preview.)
10. Collect Binary Worksheet, EEPROM Wear Calculation Sheet, and Engineering Change Log as this week's artifact.

## Check your understanding
- Evidence Required
- Formative (During)
- EEPROM persistence demonstrated live: system restores correct state after USB disconnect/reconnect. EEPROM.update() used (not write()). saveState() is called at every transition, not in loop().
- Your own check log. Live persistence demo in front of class - pass/fail recorded for you.
- Term 3 Week 2 Artifact
- Binary Conversion Worksheet (15 conversions correct) + EEPROM Wear Calculation Sheet (calculation shown, wear-levelling strategy proposed) + Engineering Change Log (minimum 4 entries, all 5 columns, Outcome column completed after testing). Scored on 5-point DDD rubric (Part 8.3).
- All three physical documents collected and stapled.
- Differentiation
- Support: provide the EEPROM integration code pre-written - you add the Engineering Change Log entries and complete the binary worksheet only. Extension: dual EEPROM value (state + transition counter) with persistence demonstrated and logged.
- Extension: startup Serial Monitor prints both saved values correctly after power cycle.

## Key words to remember
EEPROM · persistent memory · RAM · byte · bit · binary · address · EEPROM.write() · EEPROM.read() · EEPROM.update() · wear levelling · write cycle · power cycle · Engineering Change Log · justification · 2⁸ · cast · enum Date Delivered: Signature:

## Stay safe
EEPROM has a finite lifespan (approximately 100,000 write cycles per address). You must use EEPROM.update() not EEPROM.write() to avoid unnecessary wear during the session - you demonstrates this explicitly and explains why. Engineering Change Log: all entries are about the system, not about other you. If a pair makes a mistake, it is logged as a technical event ("incorrect address used; corrected to address 1") - not attributed to a person. This models professional engineering culture: systems are improved, people are not blamed.

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
