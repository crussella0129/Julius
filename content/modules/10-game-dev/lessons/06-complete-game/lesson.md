---
id: "06-complete-game"
title: "Project: Complete Game"
concepts:
  - game-architecture
  - project-structure
  - gameplay-loop
  - polish
why: "Building a complete game from scratch ties together everything you have learned: sprites, physics, state management, sound, and graphics. This project gives you a finished game you can share and expand."
prerequisites:
  - 05-sound-graphics
sources:
  - repo: "pygame/pygame"
    section: "Examples"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Complete Examples"
    license: "CC BY-SA 4.0"
---

# Project: Complete Game

In this project, you will build a complete "Dodge the Falling Objects" game. The player moves left and right to dodge objects falling from the top of the screen. The longer you survive, the higher your score.

## Game Design

**Concept**: Objects fall from the top. The player dodges them. Score increases over time. Getting hit costs a life. Three lives, then game over.

**States**: Menu, Playing, Game Over

**Controls**: Left/Right arrows to move, Enter to start, Escape to quit

## Project Structure

```
dodge_game/
    main.py          # Entry point and game loop
    player.py        # Player class
    obstacle.py      # Falling obstacle class
    game.py          # Game state management
    constants.py     # Colors, dimensions, speeds
```

## Step 1: Constants

```python
# constants.py
WIDTH = 800
HEIGHT = 600
FPS = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLUE = (50, 100, 255)

PLAYER_SPEED = 6
PLAYER_WIDTH = 50
PLAYER_HEIGHT = 40

OBSTACLE_MIN_SPEED = 3
OBSTACLE_MAX_SPEED = 7
OBSTACLE_SIZE = 30
SPAWN_RATE = 30  # Frames between spawns
```

## Step 2: Player Class

```python
# player.py
import pygame
from constants import *

class Player:
    def __init__(self):
        self.width = PLAYER_WIDTH
        self.height = PLAYER_HEIGHT
        self.x = WIDTH // 2 - self.width // 2
        self.y = HEIGHT - self.height - 20
        self.speed = PLAYER_SPEED
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.lives = 3

    def update(self, keys):
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < WIDTH:
            self.rect.x += self.speed

    def draw(self, screen):
        pygame.draw.rect(screen, GREEN, self.rect)
        # Draw lives
        for i in range(self.lives):
            pygame.draw.circle(screen, RED, (20 + i * 25, 20), 8)

    def hit(self):
        self.lives -= 1
        return self.lives <= 0
```

## Step 3: Obstacle Class

```python
# obstacle.py
import random
import pygame
from constants import *

class Obstacle:
    def __init__(self):
        self.size = OBSTACLE_SIZE
        self.x = random.randint(0, WIDTH - self.size)
        self.y = -self.size
        self.speed = random.uniform(OBSTACLE_MIN_SPEED, OBSTACLE_MAX_SPEED)
        self.rect = pygame.Rect(self.x, self.y, self.size, self.size)
        self.color = (
            random.randint(150, 255),
            random.randint(50, 100),
            random.randint(50, 100),
        )

    def update(self):
        self.rect.y += self.speed

    def is_off_screen(self):
        return self.rect.top > HEIGHT

    def draw(self, screen):
        pygame.draw.rect(screen, self.color, self.rect)
```

## Step 4: Game State Manager

```python
# game.py
import pygame
from player import Player
from obstacle import Obstacle
from constants import *

class Game:
    def __init__(self):
        self.state = "menu"
        self.reset()

    def reset(self):
        self.player = Player()
        self.obstacles = []
        self.score = 0
        self.spawn_timer = 0
        self.difficulty = 1.0

    def update(self):
        if self.state != "playing":
            return

        keys = pygame.key.get_pressed()
        self.player.update(keys)

        # Spawn obstacles
        self.spawn_timer += 1
        spawn_rate = max(10, int(SPAWN_RATE / self.difficulty))
        if self.spawn_timer >= spawn_rate:
            self.obstacles.append(Obstacle())
            self.spawn_timer = 0

        # Update obstacles
        for obs in self.obstacles:
            obs.update()

        # Remove off-screen obstacles
        self.obstacles = [o for o in self.obstacles if not o.is_off_screen()]

        # Check collisions
        for obs in self.obstacles:
            if self.player.rect.colliderect(obs.rect):
                self.obstacles.remove(obs)
                if self.player.hit():
                    self.state = "game_over"
                break

        # Increase score and difficulty
        self.score += 1
        self.difficulty = 1.0 + self.score / 500
```

## Step 5: Main Loop

```python
# main.py
import pygame
from game import Game
from constants import *

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Dodge!")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("Arial", 36)
    small_font = pygame.font.SysFont("Arial", 24)

    game = Game()
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    if game.state in ("menu", "game_over"):
                        game.reset()
                        game.state = "playing"
                if event.key == pygame.K_ESCAPE:
                    running = False

        game.update()

        # Draw
        screen.fill(BLACK)

        if game.state == "menu":
            title = font.render("DODGE!", True, WHITE)
            prompt = small_font.render("Press ENTER to start", True, WHITE)
            screen.blit(title, (WIDTH//2 - title.get_width()//2, 200))
            screen.blit(prompt, (WIDTH//2 - prompt.get_width()//2, 300))

        elif game.state == "playing":
            game.player.draw(screen)
            for obs in game.obstacles:
                obs.draw(screen)
            score_text = small_font.render(
                f"Score: {game.score}", True, WHITE
            )
            screen.blit(score_text, (WIDTH - 150, 10))

        elif game.state == "game_over":
            over = font.render("GAME OVER", True, RED)
            score = small_font.render(
                f"Score: {game.score}", True, WHITE
            )
            retry = small_font.render(
                "Press ENTER to retry", True, WHITE
            )
            screen.blit(over, (WIDTH//2 - over.get_width()//2, 200))
            screen.blit(score, (WIDTH//2 - score.get_width()//2, 280))
            screen.blit(retry, (WIDTH//2 - retry.get_width()//2, 340))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()

if __name__ == "__main__":
    main()
```

## Adding Polish

Ideas to improve the game:
- **Screen shake** on hit
- **Particle explosion** when obstacles are destroyed
- **Power-ups** (shield, slow time, extra life)
- **Background scrolling** for visual depth
- **Sound effects** for hits, near misses, and score milestones
- **High score saving** to a JSON file
- **Increasing difficulty** with new obstacle types

## Common Mistakes

**All code in one file:**
```python
# Split into modules: player.py, obstacle.py, game.py, constants.py
# Each file has one clear responsibility
```

**Not separating update from draw:**
```python
# Bad — mixing logic and rendering
if player.rect.colliderect(obstacle.rect):
    pygame.draw.circle(screen, RED, explosion_pos, 20)  # Logic in draw!

# Good — update first, then draw the results
```

## Key Takeaways

- Separate constants, game logic, and rendering into different files
- Use a Game class to manage state, score, and entities
- The main loop: handle events, update game, draw, flip, tick
- Difficulty scaling keeps the game challenging over time
- Polish (particles, shake, sound) makes the game feel professional
- Start simple, then add features one at a time
