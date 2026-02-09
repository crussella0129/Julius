---
id: "06-design-patterns"
title: "Design Patterns in Python"
concepts:
  - singleton-pattern
  - factory-pattern
  - observer-pattern
  - strategy-pattern
why: "Design patterns are proven solutions to recurring problems, giving you a shared vocabulary and reliable blueprints for structuring code that other developers will instantly understand."
prerequisites:
  - 05-context-managers
sources:
  - repo: "faif/python-patterns"
    section: "Creational and Behavioral Patterns"
    license: "MIT"
---

# Design Patterns in Python

**Design patterns** are reusable solutions to common software design problems. They are not code you copy and paste -- they are templates for how to structure your classes and objects. Python's dynamic nature often makes these patterns simpler than in other languages.

## Singleton Pattern

A **Singleton** ensures only one instance of a class ever exists. Useful for shared resources like configuration objects or connection pools.

```python
class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection = "connected"
        return cls._instance

db1 = Database()
db2 = Database()
print(db1 is db2)          # True -- same object
print(db1.connection)       # connected
```

`__new__` is called before `__init__` and controls object creation. By storing the instance in a class variable, subsequent calls return the same object.

A simpler Pythonic approach uses a module-level instance:

```python
# config.py
class _Config:
    def __init__(self):
        self.debug = False
        self.db_url = "sqlite:///app.db"

config = _Config()  # Module-level singleton

# Other files just import it:
# from config import config
```

## Factory Pattern

A **Factory** creates objects without exposing the creation logic. The caller specifies what it wants, and the factory decides which class to instantiate:

```python
class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

class Fish:
    def speak(self):
        return "..."

def animal_factory(animal_type):
    animals = {
        "dog": Dog,
        "cat": Cat,
        "fish": Fish,
    }
    cls = animals.get(animal_type.lower())
    if cls is None:
        raise ValueError(f"Unknown animal: {animal_type}")
    return cls()

pet = animal_factory("dog")
print(pet.speak())  # Woof!

pet = animal_factory("cat")
print(pet.speak())  # Meow!
```

This is powerful when the exact class depends on runtime data (user input, config files, etc.).

## Observer Pattern

The **Observer** pattern lets objects subscribe to events and be notified when something happens. Think of it as a newsletter -- subscribers get updates automatically:

```python
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event, callback):
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)

    def emit(self, event, *args):
        for callback in self._listeners.get(event, []):
            callback(*args)

# Usage
emitter = EventEmitter()

def on_login(username):
    print(f"Welcome back, {username}!")

def log_login(username):
    print(f"[LOG] {username} logged in")

emitter.on("login", on_login)
emitter.on("login", log_login)

emitter.emit("login", "Alice")
# Welcome back, Alice!
# [LOG] Alice logged in
```

Multiple callbacks can respond to the same event, and the emitter does not need to know what they do.

## Strategy Pattern

The **Strategy** pattern lets you swap algorithms at runtime. In Python, this is often as simple as passing a function:

```python
def sort_by_name(items):
    return sorted(items, key=lambda x: x["name"])

def sort_by_price(items):
    return sorted(items, key=lambda x: x["price"])

def sort_by_rating(items):
    return sorted(items, key=lambda x: x["rating"], reverse=True)

def display_products(products, strategy):
    for p in strategy(products):
        print(f"  {p['name']}: ${p['price']} ({p['rating']}*)")

products = [
    {"name": "Widget", "price": 25, "rating": 4},
    {"name": "Gadget", "price": 15, "rating": 5},
    {"name": "Doohickey", "price": 35, "rating": 3},
]

print("By price:")
display_products(products, sort_by_price)
print("By rating:")
display_products(products, sort_by_rating)
```

The `display_products` function does not know or care how sorting works -- it just calls the strategy.

A class-based version works well when strategies need state:

```python
class DiscountStrategy:
    def __init__(self, percent):
        self.percent = percent

    def apply(self, price):
        return price * (1 - self.percent / 100)

half_off = DiscountStrategy(50)
print(half_off.apply(100))  # 50.0
```

## When to Use Patterns

- **Singleton**: shared config, connection pools, caches
- **Factory**: object creation depends on runtime data
- **Observer**: decoupled event handling (GUIs, pub/sub systems)
- **Strategy**: swappable algorithms (sorting, pricing, validation)

## Common Mistakes

**Over-engineering with patterns:**
```python
# Don't create a factory for one class
# Just instantiate it directly!
obj = MyClass()  # Good enough
```

**Singleton with mutable state can cause hidden bugs:**
```python
# If one part of your code modifies the singleton,
# every other part sees the change. Use carefully.
```

## Key Takeaways

- Design patterns are templates, not rigid rules -- adapt them to Python's strengths
- Singleton ensures one instance; in Python, a module-level variable often suffices
- Factory decouples object creation from usage
- Observer enables publish/subscribe event handling
- Strategy lets you swap algorithms by passing functions or objects
- Do not force patterns where simple code works -- "simple is better than complex"
