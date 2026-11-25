# Week 5 - Lesson 1

## Session length
**60 minutes**

## Today you will learn
* Wire a passive buzzer on a digital pin and play short tones with `tone()` / `noTone()`
* Add an **ALARM** state to your Week 1 servo state machine that triggers when a sensor threshold is crossed

## Let's begin
1. Recap your CLOSED / OPEN / LOCKED states from Week 1 (5 min).
2. Wire the buzzer: signal pin -> D8, other leg -> GND (use a resistor if your kit sheet says so).
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
