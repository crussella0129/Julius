---
id: "01-oop-classes"
title: "Classes and Objects"
concepts:
  - class-definition
  - init-method
  - self-parameter
  - instance-methods
  - instance-attributes
why: "Classes let you bundle data and behavior together into reusable blueprints, making it natural to model real-world things in code."
prerequisites:
  - 08-modules-packages
sources:
  - repo: "dabeaz-course/python-mastery"
    section: "Classes and Objects"
    license: "CC BY-SA 4.0"
---

# Classes and Objects

A **class** is a blueprint for creating objects. An **object** is an instance of a class that holds its own data (attributes) and has functions (methods) that operate on that data.

## Why Use Classes?

Without classes, you might represent a dog like this:

```python
dog1_name = "Rex"
dog1_breed = "Labrador"
dog1_age = 3

dog2_name = "Spot"
dog2_breed = "Dalmatian"
dog2_age = 5
```

This gets messy fast. Classes let you group related data together.

## Defining a Class

Use the `class` keyword:

```python
class Dog:
    pass

my_dog = Dog()
print(type(my_dog))  # <class '__main__.Dog'>
```

By convention, class names use **CamelCase** (capitalize each word, no underscores).

## The `__init__` Method

The `__init__` method is called automatically when you create a new object. It initializes the object's attributes:

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age

rex = Dog("Rex", "Labrador", 3)
print(rex.name)   # Rex
print(rex.breed)  # Labrador
print(rex.age)    # 3
```

## Understanding `self`

`self` refers to the specific instance being created or used. Every method in a class receives `self` as its first parameter:

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name    # self.name is the attribute
        self.breed = breed   # name is the parameter
        self.age = age

    def describe(self):
        return f"{self.name} is a {self.age}-year-old {self.breed}"

rex = Dog("Rex", "Labrador", 3)
spot = Dog("Spot", "Dalmatian", 5)

print(rex.describe())   # Rex is a 3-year-old Labrador
print(spot.describe())  # Spot is a 5-year-old Dalmatian
```

When you call `rex.describe()`, Python automatically passes `rex` as `self`.

## Instance Methods

Methods are functions defined inside a class. They can read and modify the object's attributes:

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds!")
            return self.balance
        self.balance -= amount
        return self.balance

    def get_info(self):
        return f"{self.owner}: ${self.balance}"

acct = BankAccount("Alice", 100)
acct.deposit(50)
print(acct.get_info())   # Alice: $150
acct.withdraw(30)
print(acct.get_info())   # Alice: $120
```

## The `__str__` and `__repr__` Methods

These special methods control how your object appears when printed:

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def __str__(self):
        return f"{self.name} the {self.breed}"

    def __repr__(self):
        return f"Dog('{self.name}', '{self.breed}')"

rex = Dog("Rex", "Labrador")
print(rex)       # Rex the Labrador  (uses __str__)
print(repr(rex)) # Dog('Rex', 'Labrador')  (uses __repr__)
```

## Common Mistakes

**Forgetting `self`:**
```python
class Dog:
    def __init__(self, name):
        name = name  # This does nothing! Should be self.name = name
```

**Forgetting `self` in method signatures:**
```python
class Dog:
    def bark():          # Missing self!
        print("Woof!")
# Dog().bark()  # TypeError: bark() takes 0 positional arguments but 1 was given
```

**Using class name instead of `self`:**
```python
class Counter:
    def __init__(self):
        self.count = 0    # Correct: per-instance attribute

    def increment(self):
        self.count += 1   # Modifies this instance's count
```

## Key Takeaways

- Classes are blueprints; objects are instances of classes
- `__init__` sets up the object's initial state
- `self` refers to the current instance -- always the first parameter of a method
- Instance attributes (`self.x`) belong to each individual object
- `__str__` controls the print output; `__repr__` gives a developer-friendly representation
- Use CamelCase for class names and snake_case for methods and attributes
