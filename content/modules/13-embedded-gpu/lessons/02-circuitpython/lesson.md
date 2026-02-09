---
id: "02-circuitpython"
title: "CircuitPython & Hardware"
concepts:
  - circuitpython
  - sensors
  - pwm
  - i2c-spi
why: "CircuitPython makes hardware projects as easy as editing a file -- it shows up as a USB drive, and your code runs when you save it, making it perfect for physical computing projects."
prerequisites:
  - 01-micropython-intro
sources:
  - repo: "adafruit/circuitpython"
    section: "Getting Started"
    license: "MIT"
  - repo: "micropython/micropython"
    section: "Hardware APIs"
    license: "MIT"
---

# CircuitPython & Hardware

CircuitPython is Adafruit's fork of MicroPython, designed for education and ease of use. When you plug in a CircuitPython board, it appears as a USB drive. You edit `code.py` on the drive, save it, and your program runs automatically.

## CircuitPython vs MicroPython

| Feature | CircuitPython | MicroPython |
|---------|--------------|-------------|
| Workflow | USB drive, edit & save | Serial REPL, file transfer |
| Libraries | Adafruit unified drivers | Board-specific |
| Focus | Education, ease of use | Performance, flexibility |
| Boards | Adafruit, many others | ESP32, Pico, STM32 |

```python
# CircuitPython code.py (runs on save)
# import board
# import digitalio
# import time
#
# led = digitalio.DigitalInOut(board.LED)
# led.direction = digitalio.Direction.OUTPUT
#
# while True:
#     led.value = True
#     time.sleep(0.5)
#     led.value = False
#     time.sleep(0.5)
```

## Reading Sensors

Sensors convert physical quantities (temperature, light, motion) into electrical signals:

```python
# Simulating sensor readings for learning
import random

class TemperatureSensor:
    """Simulate a temperature sensor (like DHT22 or BME280)."""

    def __init__(self, base_temp=22.0, noise=0.5):
        self.base_temp = base_temp
        self.noise = noise

    def read(self):
        """Return a temperature reading with simulated noise."""
        temp = self.base_temp + random.gauss(0, self.noise)
        humidity = 45 + random.gauss(0, 5)
        return round(temp, 1), round(humidity, 1)

class LightSensor:
    """Simulate an analog light sensor."""

    def __init__(self, max_value=65535):
        self.max_value = max_value

    def read_raw(self):
        """Return raw ADC value (0-65535)."""
        return random.randint(0, self.max_value)

    def read_lux(self):
        """Convert to approximate lux value."""
        raw = self.read_raw()
        return round(raw / self.max_value * 1000, 1)

# Read sensors
random.seed(42)
temp_sensor = TemperatureSensor()
light_sensor = LightSensor()

for i in range(3):
    temp, humidity = temp_sensor.read()
    lux = light_sensor.read_lux()
    print(f"Reading {i+1}: {temp}C, {humidity}% RH, {lux} lux")
```

## PWM (Pulse Width Modulation)

PWM controls the brightness of LEDs, speed of motors, and angle of servos by rapidly switching a pin on and off:

```python
class PWM:
    """Simulate PWM output."""

    def __init__(self, pin, frequency=1000):
        self.pin = pin
        self.frequency = frequency
        self._duty = 0  # 0-65535

    @property
    def duty_cycle(self):
        return self._duty

    @duty_cycle.setter
    def duty_cycle(self, value):
        self._duty = max(0, min(65535, int(value)))

    def percent(self):
        """Return duty cycle as a percentage."""
        return self._duty / 65535 * 100

# LED dimming example
pwm_led = PWM(pin=13)

# Fade from 0% to 100% brightness
for brightness in range(0, 101, 25):
    pwm_led.duty_cycle = int(brightness / 100 * 65535)
    print(f"Brightness: {brightness}% (duty: {pwm_led.duty_cycle})")
```

Output:
```
Brightness: 0% (duty: 0)
Brightness: 25% (duty: 16383)
Brightness: 50% (duty: 32767)
Brightness: 75% (duty: 49151)
Brightness: 100% (duty: 65535)
```

## I2C Communication

I2C is a two-wire protocol for connecting multiple sensors to a microcontroller:

```python
class I2CDevice:
    """Simulate an I2C device."""

    def __init__(self, address, name):
        self.address = address
        self.name = name
        self.registers = {}

    def write_register(self, reg, value):
        self.registers[reg] = value

    def read_register(self, reg):
        return self.registers.get(reg, 0)

class I2CBus:
    """Simulate an I2C bus with multiple devices."""

    def __init__(self):
        self.devices = {}

    def scan(self):
        """Return list of addresses on the bus."""
        return sorted(self.devices.keys())

    def attach(self, device):
        self.devices[device.address] = device
        print(f"Attached {device.name} at address 0x{device.address:02x}")

# Set up I2C bus with sensors
bus = I2CBus()
bus.attach(I2CDevice(0x76, "BME280 (temp/humidity/pressure)"))
bus.attach(I2CDevice(0x68, "MPU6050 (accelerometer/gyro)"))
bus.attach(I2CDevice(0x3C, "SSD1306 (OLED display)"))

addresses = bus.scan()
print(f"Devices found: {[hex(a) for a in addresses]}")
```

## Building a Sensor Station

Combine multiple sensors into a monitoring system:

```python
import random
import time

class SensorStation:
    """A multi-sensor monitoring station."""

    def __init__(self, name):
        self.name = name
        self.readings = []

    def read_all(self):
        """Read all sensors and return a data dict."""
        data = {
            "temp_c": round(22 + random.gauss(0, 0.5), 1),
            "humidity": round(45 + random.gauss(0, 3), 1),
            "light_lux": round(random.uniform(100, 800), 0),
            "pressure_hpa": round(1013 + random.gauss(0, 2), 1),
        }
        self.readings.append(data)
        return data

    def summary(self):
        if not self.readings:
            print("No readings yet")
            return
        temps = [r["temp_c"] for r in self.readings]
        print(f"Station: {self.name}")
        print(f"Readings: {len(self.readings)}")
        print(f"Temp range: {min(temps)}-{max(temps)} C")

random.seed(42)
station = SensorStation("Outdoor")
for _ in range(5):
    data = station.read_all()
    print(f"  Temp: {data['temp_c']}C, Humidity: {data['humidity']}%")
station.summary()
```

## Common Mistakes

**Forgetting pull-up resistors**: Many I2C and button circuits need pull-up resistors. Without them, readings are erratic.

**PWM frequency too low**: For LEDs, use at least 1000 Hz to avoid visible flicker. For motors, 20-50 kHz.

**Not debouncing buttons**: Physical buttons "bounce" and register multiple presses. Add a small delay after detecting a press.

## Key Takeaways

- CircuitPython appears as a USB drive; edit code.py and save to run
- Sensors convert physical measurements to electrical signals
- PWM controls brightness/speed by varying the duty cycle (0-65535)
- I2C connects multiple sensors on two wires (SDA and SCL)
- Always scan the I2C bus to verify device connections
- Combine multiple sensors into a station for environmental monitoring
