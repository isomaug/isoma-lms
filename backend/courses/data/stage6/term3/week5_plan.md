# Lesson: Buzzer Alarm State — tone(), thresholds & multi-output feedback

**Duration:** 60 minutes × 2 (split across Week 5 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 5
**Age Range:** 10–12 years
**Hardware:** Arduino Uno + Term 3 sensors/actuators (servo, RGB, 7-segment, buzzer, EEPROM)

**Source plan:** `curriculum progression fill (no DOCX for Term 3 Weeks 5–8)`

## Learning Objectives

- Wire a passive buzzer on a digital pin and play short tones with tone()/noTone()
- Add an ALARM state to the Week 1 servo state machine that triggers when a sensor threshold is crossed

- Combine RGB colour (Week 3) with the buzzer alarm so the LED turns red while alarming
- Log ALARM enter/exit events to Serial with timestamps using millis()

## Lesson Structure

### Lesson 1 (start)

# Week 5 - Lesson 1

## Session length
**60 minutes**

## Today you will
* Wire a passive buzzer on a digital pin and play short tones with `tone()` / `noTone()`
* Add an **ALARM** state to your Week 1 servo state machine that triggers when a sensor threshold is crossed

## Let's begin
1. Recap your CLOSED / OPEN / LOCKED states from Week 1 (5 min).
2. Wire the buzzer: signal pin → D8, other leg → GND (use a resistor if your kit sheet says so).
3. Test a short beep sketch with `tone(8, 1000, 200)`.
4. Agree a threshold with your partner (e.g. LDR dark, or temperature high from earlier weeks).
5. Add an `ALARM` case that sounds the buzzer and holds the servo in LOCKED.

## Check your understanding
* Can you explain when the system should enter ALARM vs leave ALARM?
* Does the buzzer stop cleanly with `noTone()`?

## Key words
* tone()
* noTone()
* threshold
* ALARM state

## Example alarm beep

```cpp
const int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void soundAlarm() {
  tone(buzzerPin, 1000, 200);
  delay(250);
  noTone(buzzerPin);
}
```

### Lesson 2 (finish)

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

## Full source extract (complete)

```
# Week 5 - Lesson 1

## Session length
**60 minutes**

## Today you will
* Wire a passive buzzer on a digital pin and play short tones with `tone()` / `noTone()`
* Add an **ALARM** state to your Week 1 servo state machine that triggers when a sensor threshold is crossed

## Let's begin
1. Recap your CLOSED / OPEN / LOCKED states from Week 1 (5 min).
2. Wire the buzzer: signal pin → D8, other leg → GND (use a resistor if your kit sheet says so).
3. Test a short beep sketch with `tone(8, 1000, 200)`.
4. Agree a threshold with your partner (e.g. LDR dark, or temperature high from earlier weeks).
5. Add an `ALARM` case that sounds the buzzer and holds the servo in LOCKED.

## Check your understanding
* Can you explain when the system should enter ALARM vs leave ALARM?
* Does the buzzer stop cleanly with `noTone()`?

## Key words
* tone()
* noTone()
* threshold
* ALARM state

## Example alarm beep

```cpp
const int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void soundAlarm() {
  tone(buzzerPin, 1000, 200);
  delay(250);
  noTone(buzzerPin);
}
```

---

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
```
