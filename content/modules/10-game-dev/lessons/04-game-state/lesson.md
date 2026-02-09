---
id: "04-game-state"
title: "Game State Management"
concepts:
  - game-states
  - state-machine
  - score-tracking
  - game-over
why: "Games have multiple screens: title, playing, paused, game over. Managing these states cleanly keeps your code organized and makes it easy to add new features like menus and level transitions."
prerequisites:
  - 03-game-physics
sources:
  - repo: "pygame/pygame"
    section: "Game Architecture"
    license: "LGPL"
  - repo: "Rabbid76/PyGameExamplesAndAnswers"
    section: "Event and Application State"
    license: "CC BY-SA 4.0"
---

# Game State Management

A game is more than the gameplay loop. It has a title screen, pause menu, game over screen, and potentially many levels. State management organizes these different modes of your game.

## What Are Game States?

A game state represents what the game is currently doing:

```python
MENU = "menu"
PLAYING = "playing"
PAUSED = "paused"
GAME_OVER = "game_over"
```

Only one state is active at a time.

## Simple State Machine

```python
state = MENU

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    if state == MENU:
        handle_menu()
    elif state == PLAYING:
        handle_playing()
    elif state == PAUSED:
        handle_paused()
    elif state == GAME_OVER:
        handle_game_over()

    pygame.display.flip()
    clock.tick(60)
```

## State Transitions

States change in response to events:

```python
def handle_menu():
    global state
    screen.fill((0, 0, 50))
    draw_text("Press ENTER to Start", 400, 300)

    keys = pygame.key.get_pressed()
    if keys[pygame.K_RETURN]:
        state = PLAYING
        reset_game()

def handle_playing():
    global state, score
    update_game()
    draw_game()

    if player.health <= 0:
        state = GAME_OVER

    keys = pygame.key.get_pressed()
    if keys[pygame.K_p]:
        state = PAUSED
```

## Using a Class-Based State Machine

For larger games, encapsulate states in classes:

```python
class GameState:
    def handle_events(self, events):
        pass

    def update(self):
        pass

    def draw(self, screen):
        pass

class MenuState(GameState):
    def handle_events(self, events):
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
                return PlayingState()
        return self

    def draw(self, screen):
        screen.fill((0, 0, 50))
        # Draw menu...

class PlayingState(GameState):
    def __init__(self):
        self.score = 0
        self.player = Player(400, 300)

    def update(self):
        self.player.update()
        # Check game over condition
        if self.player.health <= 0:
            return GameOverState(self.score)
        return self

    def draw(self, screen):
        screen.fill((0, 0, 0))
        # Draw game...
```

## Score Tracking

Keep score as a game variable and display it:

```python
class Game:
    def __init__(self):
        self.score = 0
        self.high_score = 0

    def add_score(self, points):
        self.score += points
        if self.score > self.high_score:
            self.high_score = self.score

    def draw_hud(self, screen):
        font = pygame.font.SysFont("Arial", 24)
        score_text = font.render(f"Score: {self.score}", True, (255, 255, 255))
        screen.blit(score_text, (10, 10))
```

## Lives and Health

```python
class Player:
    def __init__(self):
        self.max_health = 100
        self.health = self.max_health
        self.lives = 3

    def take_damage(self, amount):
        self.health -= amount
        if self.health <= 0:
            self.lives -= 1
            if self.lives > 0:
                self.health = self.max_health
                self.respawn()
            # If lives == 0, game over

    def draw_health_bar(self, screen, x, y, width, height):
        ratio = self.health / self.max_health
        fill = int(width * ratio)
        pygame.draw.rect(screen, (255, 0, 0), (x, y, width, height))
        pygame.draw.rect(screen, (0, 255, 0), (x, y, fill, height))
```

## Saving High Scores

```python
import json
from pathlib import Path

SCORES_FILE = Path("high_scores.json")

def load_scores():
    if SCORES_FILE.exists():
        return json.loads(SCORES_FILE.read_text())
    return []

def save_score(name, score):
    scores = load_scores()
    scores.append({"name": name, "score": score})
    scores.sort(key=lambda s: s["score"], reverse=True)
    scores = scores[:10]  # Keep top 10
    SCORES_FILE.write_text(json.dumps(scores, indent=2))
```

## Level Progression

```python
class Level:
    def __init__(self, number, enemy_count, enemy_speed):
        self.number = number
        self.enemy_count = enemy_count
        self.enemy_speed = enemy_speed

LEVELS = [
    Level(1, 5, 2),
    Level(2, 8, 3),
    Level(3, 12, 4),
]

class Game:
    def __init__(self):
        self.current_level = 0

    def next_level(self):
        self.current_level += 1
        if self.current_level >= len(LEVELS):
            return "victory"
        return "playing"
```

## The Game Reset Pattern

```python
def reset_game(game):
    game.score = 0
    game.player.health = game.player.max_health
    game.player.lives = 3
    game.player.rect.center = (400, 300)
    game.enemies.empty()
    game.current_level = 0
    spawn_enemies(LEVELS[0])
```

## Common Mistakes

**Using too many global variables:**
```python
# Bad — hard to track
score = 0
health = 100
level = 1

# Good — encapsulate in a class
class GameData:
    def __init__(self):
        self.score = 0
        self.health = 100
        self.level = 1
```

**Not resetting state on restart:**
```python
# Player clicks "Play Again" but enemies from last game remain!
# Always call a reset function when transitioning to PLAYING state.
```

## Key Takeaways

- Use constants for state names: `MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`
- A state machine uses if/elif to run the right logic for the current state
- Class-based states scale better for complex games
- Track score, health, and lives in a game data object
- Save high scores to a JSON file
- Always reset game state when starting a new game
