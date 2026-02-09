---
id: "05-sound-graphics"
title: "Sound and Graphics"
concepts:
  - sound-effects
  - background-music
  - sprite-animation
  - particle-effects
why: "Sound and polished graphics transform a functional game into an engaging experience. Sound effects provide feedback, music sets the mood, and animations bring your game world to life."
prerequisites:
  - 04-game-state
sources:
  - repo: "pygame/pygame"
    section: "Mixer Module"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Surface and Image"
    license: "CC BY-SA 4.0"
---

# Sound and Graphics

Games communicate through sight and sound. Pygame provides modules for loading images, playing sound effects, streaming background music, and creating visual effects.

## Loading and Displaying Images

```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))

# Load an image
player_img = pygame.image.load("player.png").convert_alpha()

# Draw it on screen
screen.blit(player_img, (100, 200))

# Scale an image
small = pygame.transform.scale(player_img, (32, 32))

# Rotate an image (degrees, counterclockwise)
rotated = pygame.transform.rotate(player_img, 45)
```

## Sprite Sheets and Animation

A sprite sheet contains multiple animation frames in one image:

```python
class AnimatedSprite:
    def __init__(self, sheet_path, frame_width, frame_height, num_frames):
        self.sheet = pygame.image.load(sheet_path).convert_alpha()
        self.frames = []
        for i in range(num_frames):
            frame = self.sheet.subsurface(
                (i * frame_width, 0, frame_width, frame_height)
            )
            self.frames.append(frame)
        self.current_frame = 0
        self.animation_speed = 0.15
        self.frame_timer = 0

    def update(self, dt):
        self.frame_timer += dt
        if self.frame_timer >= self.animation_speed:
            self.frame_timer = 0
            self.current_frame = (self.current_frame + 1) % len(self.frames)

    def draw(self, screen, x, y):
        screen.blit(self.frames[self.current_frame], (x, y))
```

## Simple Frame Animation Without Sprite Sheets

If you do not have images, animate with colored shapes:

```python
class PulsingCircle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.base_radius = 20
        self.radius = 20
        self.growing = True

    def update(self):
        if self.growing:
            self.radius += 0.5
            if self.radius >= self.base_radius + 10:
                self.growing = False
        else:
            self.radius -= 0.5
            if self.radius <= self.base_radius - 10:
                self.growing = True

    def draw(self, screen):
        pygame.draw.circle(screen, (255, 100, 100),
                         (self.x, self.y), int(self.radius))
```

## Sound Effects

```python
import pygame

pygame.mixer.init()

# Load a sound effect
jump_sound = pygame.mixer.Sound("jump.wav")
coin_sound = pygame.mixer.Sound("coin.wav")

# Play it
jump_sound.play()

# Set volume (0.0 to 1.0)
jump_sound.set_volume(0.5)
```

## Background Music

```python
# Load and play background music (streams from file)
pygame.mixer.music.load("background.mp3")
pygame.mixer.music.set_volume(0.3)
pygame.mixer.music.play(-1)  # -1 means loop forever

# Pause and unpause
pygame.mixer.music.pause()
pygame.mixer.music.unpause()

# Stop music
pygame.mixer.music.stop()
```

## Creating a Sound Manager

```python
class SoundManager:
    def __init__(self):
        pygame.mixer.init()
        self.sounds = {}
        self.music_volume = 0.3
        self.sfx_volume = 0.5

    def load_sound(self, name, path):
        self.sounds[name] = pygame.mixer.Sound(path)
        self.sounds[name].set_volume(self.sfx_volume)

    def play(self, name):
        if name in self.sounds:
            self.sounds[name].play()

    def play_music(self, path, loops=-1):
        pygame.mixer.music.load(path)
        pygame.mixer.music.set_volume(self.music_volume)
        pygame.mixer.music.play(loops)
```

## Particle Effects

Particles are small visual elements that create effects like explosions, trails, or sparks:

```python
import random

class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.vel_x = random.uniform(-3, 3)
        self.vel_y = random.uniform(-5, -1)
        self.color = color
        self.lifetime = 30
        self.age = 0

    def update(self):
        self.x += self.vel_x
        self.y += self.vel_y
        self.vel_y += 0.1  # Gravity
        self.age += 1

    def is_alive(self):
        return self.age < self.lifetime

    def draw(self, screen):
        alpha = 1 - (self.age / self.lifetime)
        radius = max(1, int(3 * alpha))
        pygame.draw.circle(screen, self.color,
                         (int(self.x), int(self.y)), radius)
```

## Particle Emitter

```python
class ParticleEmitter:
    def __init__(self):
        self.particles = []

    def emit(self, x, y, color, count=20):
        for _ in range(count):
            self.particles.append(Particle(x, y, color))

    def update(self):
        self.particles = [p for p in self.particles if p.is_alive()]
        for p in self.particles:
            p.update()

    def draw(self, screen):
        for p in self.particles:
            p.draw(screen)
```

## Screen Shake Effect

```python
import random

class Camera:
    def __init__(self):
        self.offset_x = 0
        self.offset_y = 0
        self.shake_amount = 0

    def shake(self, intensity):
        self.shake_amount = intensity

    def update(self):
        if self.shake_amount > 0:
            self.offset_x = random.randint(-self.shake_amount, self.shake_amount)
            self.offset_y = random.randint(-self.shake_amount, self.shake_amount)
            self.shake_amount -= 1
        else:
            self.offset_x = 0
            self.offset_y = 0
```

## Common Mistakes

**Loading assets inside the game loop:**
```python
# Bad — loads the file 60 times per second!
while running:
    img = pygame.image.load("player.png")

# Good — load once before the loop
img = pygame.image.load("player.png").convert_alpha()
while running:
    screen.blit(img, (x, y))
```

**Forgetting `.convert()` or `.convert_alpha()`:**
```python
# Slow — raw image format
img = pygame.image.load("bg.png")

# Fast — converted to display format
img = pygame.image.load("bg.png").convert()        # No transparency
img = pygame.image.load("bg.png").convert_alpha()   # With transparency
```

## Key Takeaways

- Load images with `pygame.image.load()` and convert them for performance
- Use `pygame.mixer.Sound` for short sound effects, `pygame.mixer.music` for background music
- Animate sprites by cycling through a list of frames
- Particle systems create explosions, trails, and visual flair
- Always load assets once before the game loop, not inside it
- Use `.convert_alpha()` for images with transparency
