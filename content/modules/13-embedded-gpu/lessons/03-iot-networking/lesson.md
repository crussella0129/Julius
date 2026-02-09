---
id: "03-iot-networking"
title: "IoT Networking"
concepts:
  - mqtt
  - http-api
  - wifi-connection
  - data-publishing
why: "IoT devices need to communicate over networks -- MQTT provides lightweight pub/sub messaging, while HTTP APIs connect devices to cloud services and dashboards."
prerequisites:
  - 02-circuitpython
sources:
  - repo: "micropython/micropython"
    section: "Network Module"
    license: "MIT"
  - repo: "adafruit/circuitpython"
    section: "WiFi and Network"
    license: "MIT"
---

# IoT Networking

Internet of Things (IoT) devices collect data from the physical world and transmit it over networks. The two most common protocols are MQTT (lightweight messaging) and HTTP (web APIs). Understanding both is essential for building connected devices.

## MQTT: Message Queue Telemetry Transport

MQTT uses a publish/subscribe model. Devices publish messages to topics, and subscribers receive messages from topics they've subscribed to. A broker (server) routes the messages.

```python
# Simulating MQTT for learning
class MQTTBroker:
    """Simple MQTT broker simulation."""

    def __init__(self):
        self.topics = {}  # topic -> [callbacks]
        self.retained = {}  # topic -> last message

    def subscribe(self, topic, callback):
        if topic not in self.topics:
            self.topics[topic] = []
        self.topics[topic].append(callback)
        # Send retained message if available
        if topic in self.retained:
            callback(topic, self.retained[topic])

    def publish(self, topic, message, retain=False):
        if retain:
            self.retained[topic] = message
        for cb in self.topics.get(topic, []):
            cb(topic, message)

# Set up
broker = MQTTBroker()

# Subscriber
def on_message(topic, msg):
    print(f"Received on '{topic}': {msg}")

broker.subscribe("sensors/temperature", on_message)
broker.subscribe("sensors/humidity", on_message)

# Publisher (sensor device)
broker.publish("sensors/temperature", "22.5")
broker.publish("sensors/humidity", "45.2")
broker.publish("alerts/fire", "false")  # No subscriber -- not delivered
```

Output:
```
Received on 'sensors/temperature': 22.5
Received on 'sensors/humidity': 45.2
```

## MQTT Topics

Topics use a hierarchical structure with `/` separators:

```python
# Topic naming conventions
topics = {
    "home/livingroom/temperature": "Room-specific sensor",
    "home/livingroom/humidity": "Room-specific sensor",
    "home/+/temperature": "Wildcard: any room's temperature",
    "home/#": "Multi-level wildcard: everything under home/",
}

def match_topic(pattern, topic):
    """Check if a topic matches a pattern with wildcards."""
    pattern_parts = pattern.split("/")
    topic_parts = topic.split("/")

    for i, p in enumerate(pattern_parts):
        if p == "#":
            return True  # Matches everything after
        if i >= len(topic_parts):
            return False
        if p != "+" and p != topic_parts[i]:
            return False
    return len(pattern_parts) == len(topic_parts)

# Test matching
test_topic = "home/kitchen/temperature"
patterns = ["home/kitchen/temperature", "home/+/temperature", "home/#", "office/#"]
for pat in patterns:
    result = "MATCH" if match_topic(pat, test_topic) else "NO MATCH"
    print(f"  {pat:30s} -> {result}")
```

## HTTP API for IoT

Many IoT platforms use REST APIs to receive sensor data:

```python
import json

class IoTCloud:
    """Simulate an IoT cloud platform API."""

    def __init__(self):
        self.devices = {}
        self.data_points = []

    def register_device(self, device_id, device_type):
        self.devices[device_id] = {
            "type": device_type,
            "status": "online",
        }
        return {"status": "ok", "device_id": device_id}

    def post_data(self, device_id, readings):
        """Simulate POST /api/v1/data"""
        if device_id not in self.devices:
            return {"status": "error", "message": "Unknown device"}
        entry = {
            "device": device_id,
            "readings": readings,
        }
        self.data_points.append(entry)
        return {"status": "ok", "points_stored": len(self.data_points)}

    def get_latest(self, device_id):
        """Simulate GET /api/v1/data/latest"""
        for entry in reversed(self.data_points):
            if entry["device"] == device_id:
                return entry["readings"]
        return None

# Usage
cloud = IoTCloud()
cloud.register_device("sensor-001", "temperature")
result = cloud.post_data("sensor-001", {"temp": 22.5, "humidity": 45})
print(f"Posted: {result}")
latest = cloud.get_latest("sensor-001")
print(f"Latest: {latest}")
```

## WiFi Connection Management

IoT devices need robust WiFi handling:

```python
class WiFiManager:
    """Simulate WiFi connection management."""

    def __init__(self):
        self.connected = False
        self.ssid = None
        self.ip = None

    def connect(self, ssid, password, timeout=10):
        """Simulate connecting to a WiFi network."""
        # In real code: wifi.radio.connect(ssid, password)
        if len(password) < 8:
            print(f"ERROR: Password too short for WPA2")
            return False
        self.connected = True
        self.ssid = ssid
        self.ip = "192.168.1.100"
        print(f"Connected to '{ssid}' with IP {self.ip}")
        return True

    def ensure_connected(self, ssid, password):
        """Reconnect if disconnected."""
        if not self.connected:
            print("WiFi disconnected, reconnecting...")
            return self.connect(ssid, password)
        return True

    def status(self):
        if self.connected:
            print(f"WiFi: Connected to '{self.ssid}' ({self.ip})")
        else:
            print("WiFi: Disconnected")

wifi = WiFiManager()
wifi.connect("HomeNetwork", "secretpass123")
wifi.status()
```

## Data Logging to Cloud

```python
import json

class DataLogger:
    """Log sensor data locally and sync to cloud."""

    def __init__(self, device_id, buffer_size=10):
        self.device_id = device_id
        self.buffer = []
        self.buffer_size = buffer_size
        self.synced_count = 0

    def log(self, reading):
        """Buffer a reading locally."""
        self.buffer.append(reading)
        print(f"Buffered: {reading} ({len(self.buffer)}/{self.buffer_size})")
        if len(self.buffer) >= self.buffer_size:
            self.sync()

    def sync(self):
        """Simulate syncing buffered data to cloud."""
        if not self.buffer:
            return
        print(f"Syncing {len(self.buffer)} readings to cloud...")
        self.synced_count += len(self.buffer)
        self.buffer.clear()
        print(f"Total synced: {self.synced_count}")

logger = DataLogger("sensor-001", buffer_size=3)
for temp in [22.1, 22.5, 23.0, 22.8, 23.2]:
    logger.log({"temp": temp})
```

## Common Mistakes

**Not handling disconnections**: WiFi drops happen. Always implement reconnection logic and local buffering.

**Publishing too frequently**: Sending data every millisecond wastes bandwidth and power. Batch readings and send at reasonable intervals.

**Unencrypted communication**: Always use TLS for production IoT. Unencrypted MQTT and HTTP expose data to eavesdroppers.

## Key Takeaways

- MQTT uses publish/subscribe for lightweight device-to-cloud messaging
- MQTT topics are hierarchical (home/room/sensor) with wildcard support
- HTTP APIs provide RESTful data access for IoT platforms
- Buffer data locally and sync in batches to handle disconnections
- Always implement WiFi reconnection logic for reliability
- Use TLS encryption for production IoT deployments
