---
id: "02-oop-inheritance"
title: "Inheritance and Polymorphism"
concepts:
  - inheritance
  - super-function
  - method-overriding
  - polymorphism
  - isinstance-check
why: "Inheritance lets you build new classes on top of existing ones, reusing code instead of rewriting it and creating families of related types."
prerequisites:
  - 01-oop-classes
sources:
  - repo: "dabeaz-course/python-mastery"
    section: "Inheritance"
    license: "CC BY-SA 4.0"
---

# Inheritance and Polymorphism

**Inheritance** lets a new class (the child) automatically get all the methods and attributes of an existing class (the parent). The child can then add new behavior or override existing behavior.

## Basic Inheritance

A child class inherits from a parent by listing the parent in parentheses:

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

class Dog(Animal):
    def fetch(self):
        return f"{self.name} fetches the ball"

rex = Dog("Rex")
print(rex.speak())  # Rex makes a sound  (inherited)
print(rex.fetch())  # Rex fetches the ball  (new method)
```

`Dog` inherits `__init__` and `speak` from `Animal` and adds its own `fetch` method.

## Method Overriding

A child class can replace a parent's method by defining it again:

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

dog = Dog("Rex")
cat = Cat("Whiskers")
print(dog.speak())  # Rex says Woof!
print(cat.speak())  # Whiskers says Meow!
```

## Using `super()`

When you override `__init__`, use `super()` to call the parent's `__init__` so you don't have to repeat its setup code:

```python
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Canine")
        self.breed = breed

rex = Dog("Rex", "Labrador")
print(rex.name)     # Rex       (set by Animal.__init__)
print(rex.species)  # Canine    (set by Animal.__init__)
print(rex.breed)    # Labrador  (set by Dog.__init__)
```

`super()` returns a reference to the parent class, so `super().__init__(...)` calls `Animal.__init__`.

## Polymorphism

Polymorphism means different classes can be used through the same interface. If they share a method name, you can call it without knowing the exact type:

```python
class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

class Duck(Animal):
    def speak(self):
        return f"{self.name} says Quack!"

animals = [Dog("Rex"), Cat("Whiskers"), Duck("Donald")]

for animal in animals:
    print(animal.speak())
# Rex says Woof!
# Whiskers says Meow!
# Donald says Quack!
```

Each object responds to `speak()` in its own way. The calling code doesn't need to know the specific type.

## Checking Types with `isinstance()`

Use `isinstance()` to check if an object is an instance of a class (or its parent):

```python
rex = Dog("Rex")
print(isinstance(rex, Dog))     # True
print(isinstance(rex, Animal))  # True  (Dog inherits from Animal)
print(isinstance(rex, Cat))     # False
```

This is more flexible than `type(rex) == Dog` because it respects inheritance.

## Multi-Level Inheritance

Classes can inherit from classes that themselves inherit from other classes:

```python
class Animal:
    def breathe(self):
        return "Breathing"

class Dog(Animal):
    def bark(self):
        return "Woof!"

class Puppy(Dog):
    def play(self):
        return "Playing!"

p = Puppy()
print(p.breathe())  # Breathing  (from Animal)
print(p.bark())     # Woof!     (from Dog)
print(p.play())     # Playing!  (from Puppy)
```

## Common Mistakes

**Forgetting to call `super().__init__()`:**
```python
class Dog(Animal):
    def __init__(self, name, breed):
        # Forgot super().__init__(name, "Canine")
        self.breed = breed

rex = Dog("Rex", "Labrador")
# print(rex.name)  # AttributeError! name was never set
```

**Confusing `super()` syntax:**
```python
# Python 3 — just use super()
super().__init__(name)

# Don't use the old Python 2 style:
# super(Dog, self).__init__(name)
```

## Key Takeaways

- Child classes inherit all methods and attributes from their parent
- Override a method by redefining it in the child class
- Use `super()` to call the parent's version of a method
- Polymorphism lets different types respond to the same method call
- `isinstance()` checks type while respecting inheritance
- Prefer composition (has-a) over deep inheritance chains when possible
