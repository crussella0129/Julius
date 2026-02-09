---
id: "03-game-physics"
title: "Basic Game Physics"
concepts:
  - collision-detection
  - gravity
  - bouncing
  - aabb-collision
why: "Physics makes games feel real. Gravity pulls objects down, collisions stop them from passing through each other, and bouncing adds satisfying interactions. These simple rules create believable game worlds."
prerequisites:
  - 02-sprites-movement
sources:
  - repo: "pygame/pygame"
    section: "Collision Detection"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Collision and Intersection"
    license: "CC BY-SA 4.0"
---

# Basic Game Physics

Game physics does not need to be perfectly realistic. It needs to feel good. This lesson covers the fundamentals: gravity, collision detection, and bouncing.

## Gravity

Gravity is a constant downward acceleration. Each frame, add gravity to the vertical velocity:

```python
class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vel_y = 0
        self.gravity = 0.5
        self.on_ground = False

    def update(self):
        self.vel_y += self.gravity  # Accelerate downward
        self.y += self.vel_y        # Apply velocity

        # Hit the ground (y = 550)
        if self.y >= 550:
            self.y = 550
            self.vel_y = 0
            self.on_ground = True
```

## Jumping

A jump sets the vertical velocity to a negative value (upward):

```python
def jump(self):
    if self.on_ground:
        self.vel_y = -12  # Negative = upward
        self.on_ground = False
```

Gravity gradually slows the upward motion, stops it, then pulls the player back down. This creates a natural arc.

## AABB Collision Detection

**AABB** stands for Axis-Aligned Bounding Box. It is the simplest collision check: do two rectangles overlap?

```python
def rects_collide(r1, r2):
    """Check if two rectangles overlap.
    Each rect is (x, y, width, height).
    """
    x1, y1, w1, h1 = r1
    x2, y2, w2, h2 = r2

    return (x1 < x2 + w2 and
            x1 + w1 > x2 and
            y1 < y2 + h2 and
            y1 + h1 > y2)
```

In Pygame, use built-in collision detection:
```python
if player.rect.colliderect(enemy.rect):
    print("Collision!")
```

## Circle Collision Detection

For circular objects, check if the distance between centers is less than the sum of radii:

```python
import math

def circles_collide(x1, y1, r1, x2, y2, r2):
    distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    return distance < r1 + r2
```

## Bouncing

Reverse velocity on collision:

```python
class Ball:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vel_x = 4
        self.vel_y = 3
        self.radius = 10

    def update(self, width, height):
        self.x += self.vel_x
        self.y += self.vel_y

        # Bounce off walls
        if self.x - self.radius <= 0 or self.x + self.radius >= width:
            self.vel_x = -self.vel_x
        if self.y - self.radius <= 0 or self.y + self.radius >= height:
            self.vel_y = -self.vel_y
```

## Bouncing with Energy Loss

Real bounces lose energy. Multiply velocity by a factor less than 1:

```python
BOUNCE_FACTOR = 0.8

if self.y + self.radius >= height:
    self.y = height - self.radius
    self.vel_y = -self.vel_y * BOUNCE_FACTOR
```

Each bounce is a little lower until the object comes to rest.

## Pygame Collision Methods

```python
# Rect vs Rect
if sprite_a.rect.colliderect(sprite_b.rect):
    handle_collision()

# Sprite vs Group (returns list of collided sprites)
hits = pygame.sprite.spritecollide(player, enemies, False)
for enemy in hits:
    player.take_damage()

# Group vs Group
collisions = pygame.sprite.groupcollide(bullets, enemies, True, True)
# True = remove sprite on collision
```

## Platform Collision

Stop the player from falling through platforms:

```python
def check_platform_collision(player, platforms):
    for platform in platforms:
        if (player.rect.colliderect(platform.rect) and
                player.vel_y > 0 and
                player.rect.bottom <= platform.rect.top + 10):
            player.rect.bottom = platform.rect.top
            player.vel_y = 0
            player.on_ground = True
```

## Delta Time

Frame rate can vary. Use delta time for consistent physics:

```python
clock = pygame.time.Clock()

while running:
    dt = clock.tick(60) / 1000.0  # Delta time in seconds

    player.vel_y += gravity * dt
    player.y += player.vel_y * dt
```

This ensures the game runs at the same speed regardless of FPS.

## Common Mistakes

**Checking collision after drawing:**
```python
# Bad — visual doesn't match physics
draw_everything()
check_collisions()

# Good — update physics before drawing
check_collisions()
draw_everything()
```

**Tunneling (objects pass through each other at high speed):**
```python
# If velocity > object width, collision might be missed
# Solution: limit max velocity or use swept collision detection
```

## Key Takeaways

- Gravity is constant acceleration: `vel_y += gravity` each frame
- Jump by setting `vel_y` to a negative value (upward)
- AABB collision checks if two rectangles overlap
- Bounce by reversing velocity; multiply by < 1 for energy loss
- Use `colliderect()` for rect-vs-rect collision in Pygame
- Use delta time (`dt`) for frame-rate-independent physics
