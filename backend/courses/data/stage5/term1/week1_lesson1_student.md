# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Install Arduino IDE 2.x, select the correct board (Uno) and COM port, and upload the example Blink sketch successfully
- Identify and explain the purpose of setup(), loop(), pinMode(), digitalWrite(), and delay() in a provided sketch
- Add a plain-English comment to every line of the Blink sketch using the // syntax
- Modify the delay() values and predict, then observe, how the LED behaviour changes
- Convert millisecond values to seconds and explain the relationship aloud to a partner

## Big idea
Code is structured text with a purpose. Every line you can read, you can also write.

## What you need
- 4 laptops with Arduino IDE 2.x pre-installed (or installation package ready)
- 4 Arduino Uno boards + USB cables
- LEDs already wired on pin 13 (or built-in LED used)
- Printed "Blink Code Reading Sheet" (A4 for you) – Blink code with blank comment column
- Milliseconds-to-seconds conversion worksheet (A5 for you)
- USB flash drives for sketch submission
- A computer screen or TV to follow along
- "One Star, One Wish" feedback cards (pre-printed)

## Links to English and Maths
- **English:** Reading code as structured text: you carefully model how to read each line aloud as a sentence. You write plain-English comments (full sentences) for every line. "// This line makes the LED turn on for 1 second." Code annotation is treated as technical writing.
- **Maths:** Unit conversion: delay(1000) = 1 second; delay(500) = 0.5 seconds. You complete a conversion worksheet: 2500ms = ? seconds; 750ms = ? seconds. You plot the LED ON/OFF state over a 5-second timeline on a number line.

## Let's begin

### HOOK – What Does Code Look Like? (20 min)
1. Display the Blink sketch on the projected screen with no explanation. Ask: "What do you notice? What do you think this does? Have you seen text like this before?"
2. You discuss on your own for 2 minutes. Take 3 responses. Write key words (setup, loop, delay) on the board.
3. Read the code aloud line-by-line using a full English sentence for each line. "This line tells the Arduino to set pin 13 as an output." You follow on your printed reading sheet.
4. Bridge: "Today you will upload this code, read every line, and add your own explanation to it. You are going to be code translators."
5. Introduce the DDD Big Idea: "Code is structured text. Every line you can read, you can also write."
6. Get ready to use laptops and Arduino kits. You connect Arduino via USB. Follow these steps: Open Arduino IDE -> Tools -> Board -> Arduino Uno -> Tools -> Port -> select correct COM port.

### GUIDED ACTIVITY – IDE Setup and First Upload (60 min)
7. You follow step-by-step. Check your work carefully. Common issue checkpoint: "Can you see your Arduino board name in the bottom bar?"
8. Open File -> Examples -> 01.Basics -> Blink. Look at and note: setup() block, loop() block, each function call.
9. Upload the sketch (-> arrow button). Observe: LED blinks on pin 13. You confirm: "My LED is blinking." If not, debug together: check port, check board.
10. Annotation task: Using the printed reading sheet, you write a plain-English comment for each of the 10 lines of the Blink sketch. Must be full sentences. Check your comments during this time.
11. Challenge – Modify and Predict: Change delay(1000) to delay(200). Before uploading, you write your prediction on the sheet: "I think the LED will ___." Upload. Was the prediction correct?
12. Change delay(1000) to delay(3000). Repeat predict-then-test cycle. You write: "When I increased the delay, ___."

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Display the Blink sketch on the projected screen with no explanation. Ask: "What do you notice? What do you think this does? Have you seen text like this before?"
2. You discuss on your own for 2 minutes. Take 3 responses. Write key words (setup, loop, delay) on the board.
3. Read the code aloud line-by-line using a full English sentence for each line. "This line tells the Arduino to set pin 13 as an output." You follow on your printed reading sheet.
4. Bridge: "Today you will upload this code, read every line, and add your own explanation to it. You are going to be code translators."
5. Introduce the DDD Big Idea: "Code is structured text. Every line you can read, you can also write."
6. Get ready to use laptops and Arduino kits. You connect Arduino via USB. Follow these steps: Open Arduino IDE -> Tools -> Board -> Arduino Uno -> Tools -> Port -> select correct COM port.
7. You follow step-by-step. Check your work carefully. Common issue checkpoint: "Can you see your Arduino board name in the bottom bar?"
8. Open File -> Examples -> 01.Basics -> Blink. Look at and note: setup() block, loop() block, each function call.
9. Upload the sketch (-> arrow button). Observe: LED blinks on pin 13. You confirm: "My LED is blinking." If not, debug together: check port, check board.
10. Annotation task: Using the printed reading sheet, you write a plain-English comment for each of the 10 lines of the Blink sketch. Must be full sentences. Check your comments during this time.
11. Challenge – Modify and Predict: Change delay(1000) to delay(200). Before uploading, you write your prediction on the sheet: "I think the LED will ___." Upload. Was the prediction correct?
12. Change delay(1000) to delay(3000). Repeat predict-then-test cycle. You write: "When I increased the delay, ___."
