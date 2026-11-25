# Week 5 - Lesson 2

## Session length
**60 minutes**

## Finish the week
* Combine RGB colour (Week 3) with the buzzer alarm so the LED turns red while alarming
* Log ALARM enter/exit events to Serial with timestamps using `millis()`

## Continue
1. Call `setColour(255, 0, 0)` when entering ALARM; restore the normal colour when leaving.
2. Print `ALARM ON` / `ALARM OFF` plus `millis()` to the Serial Monitor.
3. Test three cases: below threshold, crossing up, crossing back down.
4. Peer check: does the servo, LED, and buzzer agree?

## Check your understanding
* Your partner triggers the threshold while you watch Serial — does the log match what you see?

## Key words
* millis()
* event log
* multi-output feedback
