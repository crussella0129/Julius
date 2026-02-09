---
id: "07-loops"
title: "Loops and Iteration"
concepts:
  - for-loop
  - while-loop
  - range-function
  - break-continue
why: "Loops let your program repeat actions without repeating code. Almost every useful program — from games to data analysis — relies on loops to process collections of data."
prerequisites:
  - 06-conditionals
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 10 - Loops"
    license: "MIT"
  - repo: "trekhleb/learn-python"
    section: "Loops"
    license: "MIT"
---

# Loops and Iteration

Imagine printing the numbers 1 through 100. Writing 100 `print()` calls would be tedious. **Loops** let you repeat code automatically.

## The `for` Loop

A `for` loop repeats code for each item in a sequence:

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
```

Output:
```
apple
banana
cherry
```

The variable `fruit` takes on each value in the list, one at a time.

## The `range()` Function

`range()` generates a sequence of numbers, perfect for counting:

```python
for i in range(5):
    print(i)
```

Output:
```
0
1
2
3
4
```

`range(5)` produces 0 through 4 (five numbers, starting from 0).

### `range()` Variations

```python
range(5)        # 0, 1, 2, 3, 4
range(2, 6)     # 2, 3, 4, 5
range(0, 10, 2) # 0, 2, 4, 6, 8 (step by 2)
range(10, 0, -1) # 10, 9, 8, ..., 1 (count down)
```

## The `while` Loop

A `while` loop repeats as long as a condition is `True`:

```python
count = 0

while count < 5:
    print(count)
    count += 1
```

Output:
```
0
1
2
3
4
```

**Be careful:** if the condition never becomes `False`, you get an **infinite loop**:

```python
# DON'T do this — it never stops!
# while True:
#     print("forever")
```

## `break` and `continue`

**`break`** exits the loop immediately:

```python
for i in range(10):
    if i == 5:
        break
    print(i)
# Prints: 0, 1, 2, 3, 4
```

**`continue`** skips to the next iteration:

```python
for i in range(6):
    if i == 3:
        continue
    print(i)
# Prints: 0, 1, 2, 4, 5
```

## Looping with Strings

Strings are sequences, so you can loop over their characters:

```python
for char in "Python":
    print(char)
# Prints each character on its own line
```

## Common Loop Patterns

**Accumulator** — building up a result:

```python
total = 0
for i in range(1, 6):
    total += i
print(total)  # 15 (1+2+3+4+5)
```

**Search** — finding something:

```python
numbers = [4, 7, 2, 9, 1]
for num in numbers:
    if num > 8:
        print(f"Found a big number: {num}")
        break
```

**Counting**:

```python
word = "mississippi"
count = 0
for char in word:
    if char == "s":
        count += 1
print(f"Found {count} s's")  # Found 4 s's
```

## Nested Loops

Loops inside loops — the inner loop runs completely for each outer iteration:

```python
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()  # New line after each row
```

Output:
```
(0,0) (0,1) (0,2)
(1,0) (1,1) (1,2)
(2,0) (2,1) (2,2)
```

## Common Mistakes

**Off-by-one errors:**
```python
# range(5) gives 0-4, not 1-5
for i in range(1, 6):  # If you want 1, 2, 3, 4, 5
    print(i)
```

**Modifying a list while looping over it:**
```python
# Don't do this — unpredictable behavior
# for item in my_list:
#     my_list.remove(item)
```

## Key Takeaways

- `for` loops iterate over sequences (lists, strings, `range()`)
- `range(n)` produces 0 through n-1; `range(start, stop, step)` for control
- `while` loops repeat until a condition is `False`
- `break` exits a loop; `continue` skips to the next iteration
- Common patterns: accumulator, search, counting
