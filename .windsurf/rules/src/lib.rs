use windsurf_engine::prelude::*;

// Eksempel på en simpel regel
pub struct MinFørsteRule;

impl Rule for MinFørsteRule {
    fn evaluate(&self, _context: &RuleContext) -> RuleResult {
        // Din logik her
        RuleResult::new(true)
    }
}

// Eksempel på en regel med konfiguration
#[derive(Deserialize, Serialize)]
struct MinKonfigurerbarRuleConfig {
    threshold: f64,
}

pub struct MinKonfigurerbarRule {
    config: MinKonfigurerbarRuleConfig,
}

impl MinKonfigurerbarRule {
    pub fn new(config: MinKonfigurerbarRuleConfig) -> Self {
        Self { config }
    }
}

impl Rule for MinKonfigurerbarRule {
    fn evaluate(&self, context: &RuleContext) -> RuleResult {
        // Brug self.config.threshold i din logik
        RuleResult::new(true)
    }
}
