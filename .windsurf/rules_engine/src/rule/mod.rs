//! Rule definition and processing module

use serde::{Serialize, Deserialize};
use std::fmt;

/// Represents a rule in the rules engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    /// Unique identifier for the rule
    pub id: String,
    /// Human-readable name of the rule
    pub name: String,
    /// Rule expression or condition
    pub expression: String,
    /// Priority of the rule (higher = more important)
    pub priority: i32,
    /// Whether the rule is currently active
    pub is_active: bool,
}

impl Default for Rule {
    fn default() -> Self {
        Self {
            id: String::new(),
            name: String::new(),
            expression: String::new(),
            priority: 0,
            is_active: true,
        }
    }
}

impl fmt::Display for Rule {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Rule {{ id: {}, name: {}, priority: {} }}",
            self.id, self.name, self.priority
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rule_default() {
        let rule = Rule::default();
        assert!(rule.id.is_empty());
        assert!(rule.name.is_empty());
        assert!(rule.expression.is_empty());
        assert_eq!(rule.priority, 0);
        assert!(rule.is_active);
    }

    #[test]
    fn test_rule_display() {
        let rule = Rule {
            id: "test_rule".to_string(),
            name: "Test Rule".to_string(),
            expression: "1 == 1".to_string(),
            priority: 1,
            is_active: true,
        };
        
        let display = format!("{}", rule);
        assert!(display.contains("test_rule"));
        assert!(display.contains("Test Rule"));
        assert!(display.contains('1'));
    }
}
