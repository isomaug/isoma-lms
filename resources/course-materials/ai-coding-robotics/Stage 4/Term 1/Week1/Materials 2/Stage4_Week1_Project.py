# ============================================================
#  ISOMA EDUTECH LIMITED
#  Stage 4 (P4) · Term 1 · Week 1
#  Lesson: Hello Micro:bit – Meet Your New Tool
#  MakeCode Python — paste into makecode.microbit.org
#  then toggle to Blocks view to see coloured blocks
# ============================================================

# ── ON START: scroll your name on the LED display ───────────
# Replace "YOUR NAME" with your own first name
def on_start():
    basic.show_string("YOUR NAME")

basic.on_start(on_start)


# ── BUTTON A: show a happy face ──────────────────────────────
def on_button_pressed_a():
    basic.show_icon(IconNames.HAPPY)

input.on_button_pressed(Button.A, on_button_pressed_a)


# ── BUTTON B: show a sad face ────────────────────────────────
def on_button_pressed_b():
    basic.show_icon(IconNames.SAD)

input.on_button_pressed(Button.B, on_button_pressed_b)


# ── EXTENSION: Button A+B — show a star icon ─────────────────
# (Challenge for learners who finish early)
def on_button_pressed_ab():
    basic.show_icon(IconNames.DIAMOND)

input.on_button_pressed(Button.AB, on_button_pressed_ab)


# ============================================================
#  HOW TO USE THIS FILE
#  1. Go to makecode.microbit.org and click "New Project"
#  2. Click the "Python" tab at the top of the editor
#  3. Select all existing code (Ctrl+A) and delete it
#  4. Paste this code in
#  5. Change "YOUR NAME" to your first name
#  6. Click "Download" and save to your Micro:bit drive
#  7. Press Button A → see a happy face
#     Press Button B → see a sad face
#     Press A+B together → see a star (extension)
#  8. Toggle to "Blocks" view to see the coloured block version
#
#  ICON NAMES YOU CAN USE:
#  IconNames.HAPPY     IconNames.SAD       IconNames.HEART
#  IconNames.DIAMOND   IconNames.SURPRISED IconNames.ANGRY
#  IconNames.ASLEEP    IconNames.YES       IconNames.NO
#  IconNames.ARROW_NORTH  IconNames.GHOST  IconNames.SKULL
# ============================================================
