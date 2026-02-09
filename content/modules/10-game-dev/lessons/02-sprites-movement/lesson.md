---
id: "02-sprites-movement"
title: "Sprites and Movement"
concepts:
  - sprite-class
  - keyboard-input
  - velocity
  - screen-bounds
why: "Sprites are the visual objects in your game: the player, enemies, bullets, and items. Learning to create sprites and move them with keyboard input is the core of interactive game development."
prerequisites:
  - 01-pygame-setup
sources:
  - repo: "pygame/pygame"
    section: "Sprite Module"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Move and Rotate"
    license: "CC BY-SA 4.0"
---

# Sprites and Movement

A **sprite** is any visual object in a game. Pygame provides a `Sprite` class that helps manage game objects with position, image, and behavior.

## What Is a Sprite?

In Pygame, a sprite has two essential attributes:
- `self.image`: A Surface (what it looks like)
- `self.rect`: A Rect (where it is and how big it is)

```python
import pygame

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((40, 40))
        self.image.fill((0, 200, 0))  # Green square
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)
```

## The `Rect` Object

A `Rect` stores position and size. It has many useful attributes:

```python
r = pygame.Rect(100, 200, 50, 30)  # x, y, width, height

print(r.x, r.y)           # 100, 200
print(r.width, r.height)  # 50, 30
print(r.center)           # (125, 215)
print(r.top, r.bottom)    # 200, 230
print(r.left, r.right)    # 100, 150
```

You can set these attributes to move the rect:
```python
r.center = (400, 300)     # Move center to (400, 300)
r.x += 10                 # Move right by 10 pixels
r.bottom = 600            # Snap bottom edge to y=600
```

## Moving with Keyboard Input

### Method 1: Event-Based (Single Press)

```python
for event in pygame.event.get():
    if event.type == pygame.KEYDOWN:
        if event.key == pygame.K_SPACE:
            player.jump()  # Fires once per press
```

### Method 2: Continuous Input (Held Keys)

```python
keys = pygame.key.get_pressed()
if keys[pygame.K_LEFT]:
    player.rect.x -= 5
if keys[pygame.K_RIGHT]:
    player.rect.x += 5
if keys[pygame.K_UP]:
    player.rect.y -= 5
if keys[pygame.K_DOWN]:
    player.rect.y += 5
```

Use `get_pressed()` for smooth, continuous movement.

## Velocity-Based Movement

Instead of directly changing position, use velocity variables:

```python
class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((40, 40))
        self.image.fill((0, 200, 0))
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = 5
        self.vel_x = 0
        self.vel_y = 0

    def update(self):
        keys = pygame.key.get_pressed()
        self.vel_x = 0
        self.vel_y = 0

        if keys[pygame.K_LEFT]:
            self.vel_x = -self.speed
        if keys[pygame.K_RIGHT]:
            self.vel_x = self.speed
        if keys[pygame.K_UP]:
            self.vel_y = -self.speed
        if keys[pygame.K_DOWN]:
            self.vel_y = self.speed

        self.rect.x += self.vel_x
        self.rect.y += self.vel_y
```

## Keeping Sprites on Screen

Prevent the player from moving off the edges:

```python
def update(self):
    # ... movement code ...

    # Clamp to screen bounds
    if self.rect.left < 0:
        self.rect.left = 0
    if self.rect.right > 800:
        self.rect.right = 800
    if self.rect.top < 0:
        self.rect.top = 0
    if self.rect.bottom > 600:
        self.rect.bottom = 600
```

Or use the built-in `clamp_ip`:
```python
self.rect.clamp_ip(screen.get_rect())
```

## Sprite Groups

Pygame groups manage multiple sprites together:

```python
all_sprites = pygame.sprite.Group()
player = Player(400, 300)
all_sprites.add(player)

# In the game loop:
all_sprites.update()             # Calls update() on every sprite
all_sprites.draw(screen)         # Draws every sprite to screen
```

## Loading Images

Replace colored rectangles with actual images:

```python
class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.image.load("player.png").convert_alpha()
        self.rect = self.image.get_rect(center=(x, y))
```

`convert_alpha()` optimizes the image and preserves transparency.

## Diagonal Movement Fix

Moving diagonally (two keys at once) is faster than moving in one direction. Normalize the velocity:

```python
import math

if self.vel_x != 0 and self.vel_y != 0:
    # Divide by sqrt(2) to keep consistent speed
    self.vel_x *= 0.7071
    self.vel_y *= 0.7071
```

## Common Mistakes

**Forgetting `super().__init__()`:**
```python
class Player(pygame.sprite.Sprite):
    def __init__(self):
        # super().__init__()  # Without this, Group operations break!
        self.image = pygame.Surface((40, 40))
```

**Drawing before filling the screen:**
```python
# Bad — old frames show through
pygame.draw.circle(screen, RED, (100, 100), 20)
screen.fill(BLACK)  # This covers the circle!

# Good — fill first, then draw
screen.fill(BLACK)
pygame.draw.circle(screen, RED, (100, 100), 20)
```

## Key Takeaways

- Sprites need `self.image` (appearance) and `self.rect` (position/size)
- Use `pygame.key.get_pressed()` for smooth continuous movement
- Velocity variables separate movement logic from input handling
- Use `clamp_ip()` or manual checks to keep sprites on screen
- Sprite Groups manage `update()` and `draw()` for multiple sprites
- Always `fill()` the screen before drawing to prevent ghosting
