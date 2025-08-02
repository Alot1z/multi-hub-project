# config_manager.py - Detailed Line-by-Line Documentation

This document provides a line-by-line explanation of `config_manager.py` logic and data flows.

| Lines     | Code Snippet                                              | Explanation                                                                                          |
|-----------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1–4       | """ Avanceret Konfigurations Manager ... Version: 2.0.0 | Module docstring: describes purpose and version of this configuration manager module.              |
| 6         | `import yaml`                                             | Imports PyYAML for parsing and writing YAML config files.                                           |
| 7         | `from dataclasses import dataclass, asdict`               | Imports dataclass helper and asdict for serializing dataclasses.                                   |
| 8         | `from typing import Dict, Any, Optional`                  | Type hints for dictionaries, any type, and optional values.                                         |
| 9         | `from pathlib import Path`                                | Import Path for portable filesystem path manipulation.                                              |
| 10        | `import logging`                                          | Logging framework for info/error reporting.                                                         |
| 12–14     | `logging.basicConfig(...)`, `logger = ...`                | Set up root logger at INFO level and get module-specific logger.                                   |
| 16        | `@dataclass`                                              | Marks `OptimizationProfile` as a dataclass to auto-generate init, repr, etc.                       |
| 17–29     | `class OptimizationProfile` + `to_dict` method            | Defines profile data structure (name, description, settings) and serialization method.              |
| 31        | `class ConfigManager:`                                    | Main class for configuration management.                                                           |
| 34–39     | `def __init__(...)`                                       | Constructor: stores path, initializes profiles map, loads config file, sets up defaults.           |
| 41–52     | `_load_config(self)`                                      | Reads YAML from disk if exists; warns or logs on missing/parse error and sets `self.config`.        |
| 54–108    | `_setup_default_profiles(self)`                           | Creates two default `OptimizationProfile` instances for SWE-1 and DeepSeek, adds to `self.profiles`.|
| 110–117   | `activate_profile(self, profile_name)`                    | Switches active profile if found; logs outcome and returns success flag.                            |
| 119–123   | `get_active_settings(self)`                               | Returns `settings` dict of current `active_profile` or empty dict.                                 |
| 125–139   | `update_setting(self, section, key, value)`               | Updates nested setting by splitting key on '.', traversing dict, and assigning new value.           |
| 141–154   | `save_config(self)`                                       | Serializes `active_profile` name and all profiles to YAML; writes to `self.config_path`.            |
| 156–171   | `def main():` + example usage                             | Demonstration: instantiate manager, switch profile, update, save, and print settings.              |
| 172–175   | `if __name__ == "__main__": main()`                     | Entry point guard to run `main()` when executed as script.                                        |
