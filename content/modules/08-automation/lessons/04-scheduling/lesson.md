---
id: "04-scheduling"
title: "Task Scheduling"
concepts:
  - schedule-module
  - cron-basics
  - time-module
  - periodic-tasks
why: "Many automation tasks need to run at specific times or intervals. Python's schedule library and system tools like cron let you run scripts on autopilot without manual intervention."
prerequisites:
  - 03-subprocess
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 22 - Web Scraping"
    license: "MIT"
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 17 - Time and Scheduling"
    license: "CC BY-NC-SA 3.0"
---

# Task Scheduling

Automation becomes truly powerful when scripts run themselves. Python offers several ways to schedule tasks, from the simple `schedule` library to the operating system's built-in cron.

## The `time` Module Basics

Before scheduling, understand time-related tools:

```python
import time
from datetime import datetime

# Current timestamp
print(time.time())  # 1706745600.0 (seconds since 1970)

# Formatted current time
now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))  # 2024-02-01 12:00:00

# Pause execution
print("Starting...")
time.sleep(2)  # Wait 2 seconds
print("Done!")
```

## Simple Scheduling with `schedule`

The `schedule` library provides a human-readable way to run tasks:

```python
import schedule
import time

def job():
    print("Running scheduled task...")

# Schedule the job
schedule.every(10).seconds.do(job)
schedule.every(5).minutes.do(job)
schedule.every().hour.do(job)
schedule.every().day.at("10:30").do(job)

# Run the scheduler loop
while True:
    schedule.run_pending()
    time.sleep(1)
```

## Passing Arguments to Scheduled Jobs

```python
import schedule

def greet(name):
    print(f"Hello, {name}!")

schedule.every(5).seconds.do(greet, "Alice")
schedule.every(5).seconds.do(greet, "Bob")
```

## Running a Job a Limited Number of Times

```python
import schedule

def task():
    print("Running...")
    return schedule.CancelJob  # Cancels after running once

schedule.every(2).seconds.do(task)
```

## Cron Basics (Linux/macOS)

Cron is the system's built-in task scheduler. A crontab entry has five time fields:

```
# minute  hour  day-of-month  month  day-of-week  command
  0       9     *             *      1-5          python3 /path/to/script.py
```

This runs the script at 9:00 AM, Monday through Friday.

Common patterns:
```
*/5 * * * *     # Every 5 minutes
0 */2 * * *     # Every 2 hours
0 0 * * *       # Daily at midnight
0 0 * * 0       # Weekly on Sunday
0 0 1 * *       # Monthly on the 1st
```

## Managing Cron from Python

```python
import subprocess

# List current crontab
result = subprocess.run(
    ["crontab", "-l"],
    capture_output=True, text=True
)
print(result.stdout)
```

## The `sched` Module (Standard Library)

Python's built-in `sched` module schedules one-time events:

```python
import sched
import time

scheduler = sched.scheduler(time.time, time.sleep)

def task(name):
    print(f"Task {name} running at {time.time():.0f}")

# Schedule events (delay in seconds, priority, function, args)
scheduler.enter(2, 1, task, ("first",))
scheduler.enter(4, 1, task, ("second",))

print("Scheduler starting...")
scheduler.run()
print("All tasks complete!")
```

## Building a Simple Watchdog

A practical pattern is watching a directory for changes:

```python
import time
from pathlib import Path

def check_for_changes(directory, known_files):
    current = set(Path(directory).iterdir())
    new_files = current - known_files
    for f in new_files:
        print(f"New file detected: {f.name}")
    return current

watched = set(Path(".").iterdir())
print("Watching for new files... (Ctrl+C to stop)")

while True:
    watched = check_for_changes(".", watched)
    time.sleep(5)
```

## Common Mistakes

**Blocking the main thread with `time.sleep()` in the wrong place:**
```python
# Bad — sleeps for 60 seconds before checking
while True:
    time.sleep(60)
    schedule.run_pending()

# Good — check frequently, sleep briefly
while True:
    schedule.run_pending()
    time.sleep(1)
```

**Forgetting the scheduler loop:**
```python
schedule.every(5).seconds.do(job)
# Nothing happens without the while loop!
```

## Key Takeaways

- `time.sleep()` pauses execution for a given number of seconds
- The `schedule` library provides readable interval-based scheduling
- Cron is the standard system scheduler for Linux/macOS
- `sched` from the standard library handles one-time delayed events
- Always include a scheduler loop when using the `schedule` library
- Return `schedule.CancelJob` from a job to run it only once
