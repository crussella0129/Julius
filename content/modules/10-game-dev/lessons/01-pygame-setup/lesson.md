---
id: "01-pygame-setup"
title: "Pygame Setup and Game Loop"
concepts:
  - pygame-init
  - game-loop
  - event-handling
  - display-surface
why: "The game loop is the heartbeat of every game. Understanding how Pygame initializes, handles events, updates state, and draws frames is the foundation for everything else in game development."
prerequisites:
  - 06-ci-cd
sources:
  - repo: "pygame/pygame"
    section: "Getting Started"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Minimal Application"
    license: "CC BY-SA 4.0"
---

# Pygame Setup and Game Loop

Pygame is a Python library for making games. It handles graphics, sound, and input so you can focus on game logic. Every Pygame program follows the same pattern: initialize, loop, quit.

## Installing Pygame

```bash
pip install pygame
```

## The Minimal Pygame Program

```python
import pygame

# Initialize Pygame
pygame.init()

# Create a window
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("My First Game")

# Game loop
running = True
while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Fill the screen with a color
    screen.fill((0, 0, 0))  # Black background

    # Update the display
    pygame.display.flip()

# Clean up
pygame.quit()
```

## Understanding the Game Loop

Every game runs a loop that repeats 30-60 times per second:

```
while running:
    1. Handle events (keyboard, mouse, quit)
    2. Update game state (move objects, check collisions)
    3. Draw everything to the screen
    4. Control frame rate
```

This is called the **game loop** or **main loop**.

## Events

Events are things that happen: key presses, mouse clicks, window closing:

```python
for event in pygame.event.get():
    if event.type == pygame.QUIT:
        running = False
    elif event.type == pygame.KEYDOWN:
        if event.key == pygame.K_ESCAPE:
            running = False
        elif event.key == pygame.K_SPACE:
            print("Space pressed!")
    elif event.type == pygame.MOUSEBUTTONDOWN:
        print(f"Mouse clicked at {event.pos}")
```

## Colors in Pygame

Colors are RGB tuples (red, green, blue), each 0-255:

```python
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
```

## Drawing Shapes

```python
import pygame

# After creating the screen...

# Rectangle: (surface, color, (x, y, width, height))
pygame.draw.rect(screen, RED, (100, 100, 50, 30))

# Circle: (surface, color, (center_x, center_y), radius)
pygame.draw.circle(screen, BLUE, (400, 300), 40)

# Line: (surface, color, (start_x, start_y), (end_x, end_y), width)
pygame.draw.line(screen, WHITE, (0, 0), (800, 600), 2)

# Don't forget to update the display!
pygame.display.flip()
```

## Controlling Frame Rate

Use a Clock to limit frames per second:

```python
clock = pygame.time.Clock()

while running:
    # ... handle events, update, draw ...

    pygame.display.flip()
    clock.tick(60)  # Limit to 60 FPS
```

`clock.tick(60)` pauses just long enough to maintain 60 frames per second.

## The Display Surface

The screen is a **Surface** object. Everything you draw goes on surfaces:

```python
screen = pygame.display.set_mode((800, 600))

# Fill entire screen
screen.fill((30, 30, 30))

# Draw on the screen
pygame.draw.rect(screen, RED, (50, 50, 100, 100))

# flip() copies everything to the actual display
pygame.display.flip()
```

## Rendering Text

```python
pygame.font.init()
font = pygame.font.SysFont("Arial", 36)

# Render creates a new Surface with the text
text_surface = font.render("Score: 0", True, WHITE)
screen.blit(text_surface, (10, 10))  # Draw text at position (10, 10)
```

## A Complete Example

```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Color Squares")
clock = pygame.time.Clock()

x, y = 375, 275
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Move with arrow keys
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        x -= 5
    if keys[pygame.K_RIGHT]:
        x += 5

    screen.fill((0, 0, 0))
    pygame.draw.rect(screen, (0, 200, 100), (x, y, 50, 50))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
```

## Common Mistakes

**Forgetting `pygame.display.flip()`:**
```python
screen.fill(BLACK)
pygame.draw.circle(screen, RED, (400, 300), 50)
# Nothing appears! You need flip() to show changes
pygame.display.flip()
```

**Not handling the QUIT event:**
```python
# Without this, closing the window freezes the program
for event in pygame.event.get():
    if event.type == pygame.QUIT:
        running = False
```

## Key Takeaways

- Every Pygame program: `init()` -> game loop -> `quit()`
- The game loop handles events, updates state, and draws each frame
- Colors are RGB tuples: `(red, green, blue)` with values 0-255
- Use `pygame.time.Clock()` and `clock.tick(60)` to control FPS
- Always handle `pygame.QUIT` to allow closing the window
- Call `pygame.display.flip()` after drawing to show changes
