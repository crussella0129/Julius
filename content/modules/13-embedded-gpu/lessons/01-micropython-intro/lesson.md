---
id: "01-micropython-intro"
title: "MicroPython Introduction"
concepts:
  - micropython-basics
  - embedded-constraints
  - repl-workflow
  - gpio-control
why: "MicroPython brings Python to microcontrollers -- tiny computers that power everything from smart home devices to robots, running on hardware with as little as 256KB of RAM."
prerequisites:
  - 07-quant-project
sources:
  - repo: "micropython/micropython"
    section: "Getting Started"
    license: "MIT"
  - repo: "adafruit/circuitpython"
    section: "Welcome"
    license: "MIT"
---

# MicroPython Introduction

MicroPython is a lean implementation of Python 3 designed to run on microcontrollers -- tiny computers with limited memory and processing power. It opens up the world of embedded systems, robotics, and IoT to Python programmers.

## What is MicroPython?

Regular Python (CPython) needs hundreds of megabytes of RAM. MicroPython runs in as little as 256KB of RAM and 16KB of code space. It supports most of Python's syntax but with a smaller standard library.

Common MicroPython boards:
- **ESP32** -- WiFi + Bluetooth, ~$5-10
- **Raspberry Pi Pico** -- Dual-core ARM, ~$4
- **STM32** -- Industrial-grade, various prices

```python
# This runs on a microcontroller!
# Standard Python syntax works
import time

def blink(pin, times=3, delay=0.5):
    """Blink an LED connected to a GPIO pin."""
    for _ in range(times):
        pin.on()
        time.sleep(delay)
        pin.off()
        time.sleep(delay)
```

## Embedded Constraints

Working with microcontrollers means dealing with constraints that don't exist on regular computers:

```python
# Simulating embedded constraints
class EmbeddedSystem:
    """Simulate the constraints of a microcontroller."""

    def __init__(self, ram_kb=264, flash_kb=2048, clock_mhz=133):
        self.ram = ram_kb * 1024      # Convert to bytes
        self.flash = flash_kb * 1024
        self.clock_mhz = clock_mhz
        self.used_ram = 0

    def allocate(self, size_bytes):
        """Try to allocate memory."""
        if self.used_ram + size_bytes > self.ram:
            raise MemoryError(f"Cannot allocate {size_bytes} bytes "
                            f"({self.ram - self.used_ram} available)")
        self.used_ram += size_bytes
        return True

    def status(self):
        pct = self.used_ram / self.ram * 100
        print(f"RAM: {self.used_ram:,}/{self.ram:,} bytes ({pct:.1f}%)")
        print(f"Clock: {self.clock_mhz} MHz")

# Raspberry Pi Pico has 264KB RAM
pico = EmbeddedSystem(ram_kb=264)
pico.allocate(50000)   # 50KB for the program
pico.allocate(100000)  # 100KB for data
pico.status()
# RAM: 150,000/270,336 bytes (55.5%)
```

## GPIO (General Purpose Input/Output)

GPIO pins are how microcontrollers interact with the physical world:

```python
# Simulating GPIO for learning (real MicroPython uses machine.Pin)
class Pin:
    """Simulate a GPIO pin."""
    OUT = "output"
    IN = "input"

    def __init__(self, number, mode=None):
        self.number = number
        self.mode = mode or Pin.OUT
        self._value = 0

    def on(self):
        self._value = 1
        print(f"Pin {self.number}: HIGH")

    def off(self):
        self._value = 0
        print(f"Pin {self.number}: LOW")

    def value(self, val=None):
        if val is not None:
            self._value = val
        return self._value

    def toggle(self):
        self._value = 1 - self._value
        state = "HIGH" if self._value else "LOW"
        print(f"Pin {self.number}: {state}")

# Blink an LED
led = Pin(25, Pin.OUT)
led.on()    # Pin 25: HIGH
led.off()   # Pin 25: LOW
led.toggle()  # Pin 25: HIGH
```

## The REPL Workflow

MicroPython provides an interactive REPL (Read-Eval-Print Loop) over USB serial:

```python
# On a real board, you'd connect via serial:
# screen /dev/ttyACM0 115200
# or use tools like: mpremote, Thonny, rshell

# The MicroPython REPL looks like:
# >>> import machine
# >>> pin = machine.Pin(25, machine.Pin.OUT)
# >>> pin.on()   # LED lights up!
# >>> pin.off()  # LED turns off

# Common REPL commands:
# Ctrl+C  -- interrupt running program
# Ctrl+D  -- soft reset
# Ctrl+E  -- paste mode (for multi-line code)
```

## Memory-Efficient Programming

On microcontrollers, every byte counts:

```python
import sys

# Generators use less memory than lists
def memory_comparison():
    """Show the difference between list and generator memory usage."""
    # List: stores all values in memory
    data_list = [x * x for x in range(100)]
    list_size = sys.getsizeof(data_list)

    # Generator: computes values on demand
    data_gen = (x * x for x in range(100))
    gen_size = sys.getsizeof(data_gen)

    print(f"List size: {list_size} bytes")
    print(f"Generator size: {gen_size} bytes")
    print(f"Savings: {list_size - gen_size} bytes")

memory_comparison()
```

Other memory-saving techniques:
```python
# Use bytearray instead of list for raw data
sensor_data = bytearray(100)  # 100 bytes, mutable
sensor_data[0] = 255

# Use const() for values that never change (MicroPython-specific)
# LED_PIN = const(25)
# BUTTON_PIN = const(14)

# Delete objects you no longer need
# del large_buffer
# import gc; gc.collect()
```

## File System

MicroPython boards have a small filesystem for storing code:

```python
# boot.py -- runs first on power-up (system config)
# main.py -- runs after boot.py (your program)

# Writing files on the board
def save_config(config_dict):
    """Save configuration to the board's filesystem."""
    import json
    with open("config.json", "w") as f:
        json.dump(config_dict, f)

def load_config():
    """Load configuration from the board's filesystem."""
    import json
    try:
        with open("config.json") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"wifi_ssid": "", "wifi_pass": "", "interval": 60}
```

## Common Mistakes

**Running out of memory**: Microcontrollers have very little RAM. Use generators, avoid large strings, and call `gc.collect()` periodically.

**Blocking the main loop**: Long `time.sleep()` calls prevent the board from responding to inputs. Use non-blocking timing patterns.

**Not handling hardware errors**: Sensors can disconnect, pins can float. Always wrap hardware I/O in try/except.

## Key Takeaways

- MicroPython runs Python 3 on microcontrollers with as little as 256KB RAM
- GPIO pins connect software to the physical world (LEDs, sensors, motors)
- The REPL over USB serial enables interactive hardware debugging
- Memory efficiency is critical: use generators, bytearrays, and gc.collect()
- Programs are stored in boot.py (system) and main.py (application)
- Popular boards: ESP32 (WiFi), Raspberry Pi Pico (dual-core), STM32 (industrial)
