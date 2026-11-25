# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Use Serial.available() and Serial.parseInt() to read an integer entered by the user in the Serial Monitor input field
- Design and code a text-based interactive menu: display options in Serial Monitor, read user selection, execute the corresponding function
- Write clear user-facing instructions (a "User Guide") for the interactive programme - minimum 5 numbered steps in plain English
- Use Serial input to control: (a) which LED lights (1=red, 2=yellow, 3=green), (b) whether the buzzer sounds, (c) how long the LED stays on (entered in seconds, converted to milliseconds)
- Evaluate a partner's User Guide using a 3-criterion rubric: clarity, completeness, and whether a person who had never seen the programme could follow it
- Refine the programme and User Guide based on peer evaluation feedback - document the change made

## Big idea
ILO 3.1 (deepened) - Write interactive Arduino sketches using Serial.available() and Serial.parseInt(). ILO 3.4 (preview) - Consider user experience in system design, connecting technical decisions to English communication clarity.

## Let's begin

### 1. HOOK The Two-Way Conversation
1. Open the Serial Monitor on the projector. Type a message in the input field and press Enter. Ask: "What happened? Did the Arduino respond?" (No - it hasn't been programmed to listen yet.)
2. Ask: "Think of a machine you use every day that takes your input and responds. What makes it easy to use? What makes it confusing?" Collect 4–5 responses. Write: Clear prompt -> User input -> Expected response.
3. Introduce Serial.available() and Serial.parseInt() using the Reference Card. You types a simple example on projector: if(Serial.available()) { int choice = Serial.parseInt(); Serial.println(choice); }. Upload and demo - the Arduino echoes what you type.
4. Class discussion: "If you typed 'hello' instead of a number, what would parseInt() return?" (0 - because it cannot parse text as an integer.) "How could we handle that?" Preview of input validation.
5. Get ready to use User Guide Template. You read through the 5 sections - this is what they will be completing by the end of the session.
### 2. GUIDED ACTIVITY Building the Interactive Menu
6. Step 1 (10 min): Wire LEDs on pins 8, 9, 10 (red, yellow, green) and buzzer on pin 11. Confirm all components work with a quick test sketch. You do this independently - no you wiring demo needed at this stage.
7. Step 2 (20 min): You live-codes the interactive menu structure: void displayMenu() prints options to Serial Monitor; loop() calls Serial.available() and reads the choice; a switch/case or if/else if chain routes to the appropriate function.
8. Step 3 (15 min): Add the duration input: after the user selects which LED to light, the programme asks: "How many seconds? Enter a number:" - reads a second integer, multiplies by 1000, uses as delay. Add input validation: if duration <= 0, print an error.
9. Step 4 (10 min): Add the buzzer as option 4. tone(11, 440, 500) plays an A4 note for 500ms. Test all 4 options.
10. Step 5 (5 min): Discuss as a class: "What would happen if the user typed 99? Is that handled? Should it be? How?"

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Open the Serial Monitor on the projector. Type a message in the input field and press Enter. Ask: "What happened? Did the Arduino respond?" (No - it hasn't been programmed to listen yet.)
2. Ask: "Think of a machine you use every day that takes your input and responds. What makes it easy to use? What makes it confusing?" Collect 4–5 responses. Write: Clear prompt -> User input -> Expected response.
3. Introduce Serial.available() and Serial.parseInt() using the Reference Card. You types a simple example on projector: if(Serial.available()) { int choice = Serial.parseInt(); Serial.println(choice); }. Upload and demo - the Arduino echoes what you type.
4. Class discussion: "If you typed 'hello' instead of a number, what would parseInt() return?" (0 - because it cannot parse text as an integer.) "How could we handle that?" Preview of input validation.
5. Get ready to use User Guide Template. You read through the 5 sections - this is what they will be completing by the end of the session.
6. Step 1 (10 min): Wire LEDs on pins 8, 9, 10 (red, yellow, green) and buzzer on pin 11. Confirm all components work with a quick test sketch. You do this independently - no you wiring demo needed at this stage.
7. Step 2 (20 min): You live-codes the interactive menu structure: void displayMenu() prints options to Serial Monitor; loop() calls Serial.available() and reads the choice; a switch/case or if/else if chain routes to the appropriate function.
8. Step 3 (15 min): Add the duration input: after the user selects which LED to light, the programme asks: "How many seconds? Enter a number:" - reads a second integer, multiplies by 1000, uses as delay. Add input validation: if duration <= 0, print an error.
9. Step 4 (10 min): Add the buzzer as option 4. tone(11, 440, 500) plays an A4 note for 500ms. Test all 4 options.
10. Step 5 (5 min): Discuss as a class: "What would happen if the user typed 99? Is that handled? Should it be? How?"
