# performance_monitor.py - Detailed Line-by-Line Documentation

This document provides line-by-line explanations of `performance_monitor.py` logic and data flows.

| Lines    | Code Snippet                                     | Explanation                                                                                       |
|----------|--------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1–4      | `""" Avanceret Performance Overvågningssystem`  | Module docstring with description and version.                                                   |
| 6        | `import time`                                    | Import time module for timestamps and intervals.                                                 |
| 7        | `import psutil`                                  | Import psutil library to collect system metrics (CPU, memory, disk, network).                    |
| 8        | `import platform`                                | Get platform and Python version information.                                                     |
| 9        | `import logging`                                 | Logging for info, debug, and error messages.                                                     |
| 10–14    | Dataclasses, typing, datetime, json imports      | Import helpers for dataclass definitions, type hints, formatting dates, and JSON serialization.  |
| 16–18    | `logging.basicConfig(...)`, `logger = ...`       | Configure root logger at INFO level and obtain module-specific logger.                           |
| 19–34    | `@dataclass class Metric` and `to_dict()`        | Defines Metric with `name`, `value`, `timestamp`, `tags`; `to_dict()` serializes to dict.         |
| 36–49    | `class PerformanceMonitor.__init__`              | Constructor initializes config, metrics list, stats dict, start time, and calls `_setup_metrics`.|
| 51–68    | `_setup_metrics(self)`                           | Pre-populate metrics for CPU count/percent and initial memory/disk stats via `add_metric()`.     |
| 70–74    | `add_metric(self, name, value, tags)`            | Create Metric instance, append to list, update aggregate stats via `_update_stats()`.             |
| 76–84    | `_update_stats(self, metric)`                    | Update `self.stats` summary dictionary for category metrics (cpu, memory, disk, network).         |
| 86–112   | `collect_system_metrics(self)`                   | Sample live metrics: CPU percent, memory available/percent, disk used/free/percent, network I/O.  |
| 114–125  | `get_metrics_summary(self)`                      | Return summary with system info (platform, Python version, uptime, timestamp), last 100 metrics. |
| 127–136  | `save_metrics(self, filename)`                   | Write JSON dump of `get_metrics_summary()` to file; log success or error.                         |
| 138–162  | `monitor(self, interval, callback)`              | Loop: collect metrics, invoke optional callback, sleep until next interval; handles errors.       |
| 164–169  | `def example_callback(metrics)`                  | Example callback prints formatted metrics summary.                                               |
| 171–183  | `def main():` example usage                      | Demonstrates creating monitor, running `monitor()` with callback, saving metrics on exit.         |
| 184–187  | `if __name__ == ...: main()`                     | Script entry point guard.                                                                        |
