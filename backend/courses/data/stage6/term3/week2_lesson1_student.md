# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Explain what EEPROM is, how it differs from RAM, and why a byte can only store values 0–255 - using both binary representation and the powers-of-2 formula (2⁸ = 256)
- Write EEPROM.write(address, value) to save a state value and EEPROM.read(address) to retrieve it on startup, integrated into the Week 1 state machine
- Verify persistence: power the Arduino off (disconnect USB), reconnect, and confirm the system restores to the last saved state without any user input
- Create an Engineering Change Log with a minimum of 4 entries - one for each deliberate modification made during the session - using the required 5-column format
- Calculate the maximum number of distinct states that can be stored in a single EEPROM byte, and the maximum number of EEPROM addresses available on an Arduino Uno
- Evaluate the limitations of EEPROM storage: finite write cycles (approximately 100,000 writes per address), wear levelling as a solution, and the implications for a system that writes every second

## Big idea
ILO 3.1 (mastery level) - Write Arduino sketches using the EEPROM.h library to read, write, and verify persistent data across power cycles, integrated with a state machine architecture. ILO 3.4 (deepened) - Produce formal engineering documentation (Engineering Change Log) for every modification made to a system during a design session.

## Let's begin

### 1. HOOK The Power Cycle Problem
1. Load the state machine from Week 1 on the projector. Set it to the OPEN state. Ask a learner to disconnect the USB cable and reconnect it. Observe: the system restarts in CLOSED. Ask: "Why? What was lost?" (The currentState variable was stored in RAM - it resets on power-off.)
2. Ask: "Name a device in your home that must remember its setting after power-off." Collect answers: TV channel, alarm clock time, microwave clock, phone unlock pattern. "How does it remember?" Connect: persistent memory.
3. Introduce EEPROM using the Reference Card. Write on board: EEPROM.write(0, 42); EEPROM.read(0); - explain address (0) and value (42). Ask: "Why can the value only be 0–255?" Connect to binary.
4. Binary hook: hold up 8 fingers. Each finger is a bit. Fold all fingers down = 00000000 = 0. Raise all fingers = 11111111 = 255. "How many combinations of 8 fingers?" 2⁸ = 256.
5. Get ready to use Binary Conversion Worksheet. You complete 5 conversions (decimal to binary) before the guided activity. You cold-calls answers.
### 2. GUIDED ACTIVITY Integrate EEPROM with the State Machine
6. Step 1 (10 min): Open the Week 1 state machine sketch. Add #include <EEPROM.h> at the top. You explains: EEPROM.h is part of the Arduino standard library - no installation needed.
7. Step 2 (15 min): Add persistence to setup(): currentState = (GateState)EEPROM.read(0); - this reads the saved state on startup. Explain the cast: (GateState) converts the byte value back to the enum type.
8. Step 3 (15 min): Add a save function: void saveState() { EEPROM.update(0, (byte)currentState); } - use EEPROM.update() instead of write() to avoid unnecessary wear (update only writes if the value has changed). Call saveState() at every state transition.
9. Step 4 (10 min): Upload, set the state to OPEN. Open Serial Monitor - confirm "State saved: OPEN" is printed. Disconnect USB. Reconnect. Confirm "Restoring state: OPEN" prints on startup.
10. Step 5 (10 min): Get ready to use Engineering Change Log. You models the first entry live: "Change 1: Added #include <EEPROM.h>. Reason: The EEPROM library is required to access persistent storage on the Uno. Expected outcome: EEPROM functions are available in the sketch." You begin their own log.

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Load the state machine from Week 1 on the projector. Set it to the OPEN state. Ask a learner to disconnect the USB cable and reconnect it. Observe: the system restarts in CLOSED. Ask: "Why? What was lost?" (The currentState variable was stored in RAM - it resets on power-off.)
2. Ask: "Name a device in your home that must remember its setting after power-off." Collect answers: TV channel, alarm clock time, microwave clock, phone unlock pattern. "How does it remember?" Connect: persistent memory.
3. Introduce EEPROM using the Reference Card. Write on board: EEPROM.write(0, 42); EEPROM.read(0); - explain address (0) and value (42). Ask: "Why can the value only be 0–255?" Connect to binary.
4. Binary hook: hold up 8 fingers. Each finger is a bit. Fold all fingers down = 00000000 = 0. Raise all fingers = 11111111 = 255. "How many combinations of 8 fingers?" 2⁸ = 256.
5. Get ready to use Binary Conversion Worksheet. You complete 5 conversions (decimal to binary) before the guided activity. You cold-calls answers.
6. Step 1 (10 min): Open the Week 1 state machine sketch. Add #include <EEPROM.h> at the top. You explains: EEPROM.h is part of the Arduino standard library - no installation needed.
7. Step 2 (15 min): Add persistence to setup(): currentState = (GateState)EEPROM.read(0); - this reads the saved state on startup. Explain the cast: (GateState) converts the byte value back to the enum type.
8. Step 3 (15 min): Add a save function: void saveState() { EEPROM.update(0, (byte)currentState); } - use EEPROM.update() instead of write() to avoid unnecessary wear (update only writes if the value has changed). Call saveState() at every state transition.
9. Step 4 (10 min): Upload, set the state to OPEN. Open Serial Monitor - confirm "State saved: OPEN" is printed. Disconnect USB. Reconnect. Confirm "Restoring state: OPEN" prints on startup.
10. Step 5 (10 min): Get ready to use Engineering Change Log. You models the first entry live: "Change 1: Added #include <EEPROM.h>. Reason: The EEPROM library is required to access persistent storage on the Uno. Expected outcome: EEPROM functions are available in the sketch." You begin their own log.
