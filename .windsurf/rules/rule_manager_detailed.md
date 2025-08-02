# rule_manager.py - Detailed Line-by-Line Documentation

This document provides line-by-line explanations of `rule_manager.py` logic and data flows.

| Lines     | Code Snippet                                          | Explanation                                                                                               |
|-----------|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| 1–4       | `""" Intelligent Rule Manager ... Version: 2.0.0`   | Module docstring: describes purpose and version of the component.                                         |
| 6–14      | Imports (`os`, `yaml`, `json`, `logging`, etc.)       | Load libraries for filesystem, YAML parsing, JSON handling, logging, type hints, and date/time.           |
| 16–56     | `@dataclass class Rule` + `to_dict`, `from_dict`      | Defines `Rule` structure: id, name, description, enabled, priority, tags, conditions, actions; serialization. |
| 58–65     | `class RuleManager.__init__(self, rules_dir: str)`    | Constructor: sets `rules_dir`, initializes `rules` and `rule_files`, and calls `_load_rules()`.          |
| 67–93     | `def _load_rules(self)`                                | Load all `.yaml` files: parse single or list of rules, create `Rule` objects, track file paths, log info.   |
| 95–97     | `get_rule(self, rule_id: str) -> Optional[Rule]`      | Lookup a rule by its ID in `self.rules`.                                                                 |
| 99–101    | `get_rules_by_tag(self, tag: str) -> List[Rule]`      | Return list of rules containing the given tag.                                                            |
| 103–114   | `evaluate_conditions(self, rule, context)`            | Basic condition evaluator: returns True if rule.conditions empty; else match each context key/value.     |
| 116–153   | `execute_actions(self, rule, context)`                | Iterate `rule.actions`; for `log` type: call `logger.info`; simulate other types; catch and log errors.  |
| 155–182   | `process_rules(self, context)`                        | Sort enabled rules by descending priority; for each: evaluate conditions and execute actions; collect results. |
| 184–216   | `save_rule(self, rule)`                               | Persist updated or new rule back to YAML file: loads existing, updates/appends entry, writes back.       |
| 218–244   | `main()` example usage                                | Demonstrates creating `RuleManager`, loading rules, processing with sample context, and printing results.|
| 245–248   | `if __name__ == ...: main()`                         | Entry-point check to run example only when invoked as script.                                            |
