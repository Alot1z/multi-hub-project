# Module Dependencies for Windsurf Rules Engine

This document maps module dependencies across the core rules engine files.

| Module                         | Imports/Depends On                                | Notes                                                             |
|--------------------------------|----------------------------------------------------|-------------------------------------------------------------------|
| **config_manager.py**          | `yaml`, `dataclasses`, `pathlib`, `logging`       | Standalone; no internal rules.
| **performance_monitor.py**     | `time`, `psutil`, `platform`, `logging`, `json`   | Standalone performance metrics.                                   |
| **rule_manager.py**            | `os`, `yaml`, `json`, `logging`, `pathlib`, `dataclasses`, `datetime` | Core rule loader/executor.                                         |
| **test_optimizations.py**      | `unittest`, `tempfile`, `yaml`, `pathlib`, `unittest.mock`<br>`rule_manager`, `Rule`, `config_manager`, `ConfigManager` | Unit tests for rules and config managers.                        |

## Dependency Graph

```mermaid
graph TD
  config_manager --> yaml
  config_manager --> dataclasses
  config_manager --> pathlib
  config_manager --> logging

  performance_monitor --> psutil
  performance_monitor --> platform
  performance_monitor --> datetime
  performance_monitor --> json
  performance_monitor --> logging

  rule_manager --> os
  rule_manager --> yaml
  rule_manager --> json
  rule_manager --> logging
  rule_manager --> pathlib
  rule_manager --> dataclasses
  rule_manager --> datetime

  test_optimizations --> rule_manager
  test_optimizations --> config_manager
  test_optimizations --> unittest
  test_optimizations --> tempfile
  test_optimizations --> yaml
  test_optimizations --> pathlib
  test_optimizations --> unittest.mock
```

## Next Steps
- Add dependencies for `rules_engine` directory modules.
- Verify any cross-module calls in deeper logic flows.
- Integrate into master module dependency chart.
