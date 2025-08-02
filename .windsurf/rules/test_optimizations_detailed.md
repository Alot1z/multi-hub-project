# test_optimizations.py - Detailed Line-by-Line Documentation

This document provides line-by-line explanations of `test_optimizations.py` logic and test flows.

| Lines     | Code Snippet                             | Explanation                                                                                       |
|-----------|------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1–4       | `""" Testmodul til Windsurf optimeringer` | Module docstring: describes purpose of this test module.                                         |
| 6–15      | Imports (`unittest`, `tempfile`, etc.)   | Imports standard libs for testing, temp dirs, YAML parsing, file paths, and mocking.             |
| 17–52     | `class TestRuleManager(unittest.TestCase)` | Test suite for `RuleManager` class.                                                             |
| 19–25     | `setUp(self)`                            | Create temporary directory, set up `test_rules` folder, write `test_rules.yaml` with test rule.  |
| 27–28     | `self.manager = RuleManager(...)`        | Instantiate `RuleManager` pointing to the test rules directory.                                  |
| 53–55     | `tearDown(self)`                         | Cleanup temporary directory after each test.                                                     |
| 57–60     | `test_load_rules(self)`                  | Assert that rule ID `test_rule_1` is loaded and name matches expected.                           |
| 62–72     | `test_evaluate_conditions(self)`         | Verify `evaluate_conditions()` returns True for matching context and False for non-matching.      |
| 74–84     | `@patch('rule_manager.logger')` + `test_execute_actions` | Patch logger to capture info; call `execute_actions()`, verify message and result status.        |
| 86–137    | `class TestConfigManager(unittest.TestCase)` | Test suite for `ConfigManager` class.                                                          |
| 89–108    | `setUp(self)`                            | Create temp config file, dump `test_config` YAML, instantiate `ConfigManager` with its path.      |
| 110–112   | `tearDown(self)`                         | Cleanup temporary directory.                                                                     |
| 114–117   | `test_load_config(self)`                 | Assert `get('test_setting')` and nested `get('nested.key')` return expected values.              |
| 119–126   | `test_set_value(self)`                   | Update top-level and nested keys via `set()`, then assert retrieval with `get()`.                |
| 128–137   | `test_save_config(self)`                 | Modify a setting, call `save()`, reload file, and verify new setting persisted in YAML.          |
| 138–141   | `if __name__ == '__main__': unittest.main()` | Entry-point guard: run tests when script executed directly.                                     |

## Dependencies
- `RuleManager`, `Rule` from `rule_manager.py`
- `ConfigManager` from `config_manager.py`
- YAML parsing via `yaml`
- Standard `unittest` and mocking framework
