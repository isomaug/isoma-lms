# Week 6 - Lesson 2

## Session length
**60 minutes**

## Finish the week
* Start coding the integrated system from the approved brief — one feature at a time
* Keep EEPROM persistence so the last safe state returns after reset

## Continue
1. Create empty functions for each requirement (stubs that only Serial.println their name).
2. Implement the easiest output first (e.g. RGB or digit), then wire it into the switch/case.
3. Re-add `EEPROM.read` / `EEPROM.write` from Week 2 for the current state.
4. Commit a working checkpoint: upload, reset the board, confirm the state returns.

## Check your understanding
* After a reset, does the system wake in the last saved state without crashing?

## Key words
* stub function
* checkpoint
* EEPROM persistence

## Function pattern

```cpp
void updateOutputs() {
  // call displayDigit / setColour / servo write here
}

void loop() {
  readSensors();
  updateState();
  updateOutputs();
}
```
