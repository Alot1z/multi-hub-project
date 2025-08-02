"""
Intelligent Rule Manager for Windsurf
Version: 2.0.0
"""

import os
import yaml
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime

# Opsæt logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Rule:
    """Klasse til at repræsentere en enkelt regel"""
    id: str
    name: str
    description: str
    enabled: bool = True
    priority: int = 0
    tags: List[str] = field(default_factory=list)
    conditions: Dict[str, Any] = field(default_factory=dict)
    actions: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Konverter regel til dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'enabled': self.enabled,
            'priority': self.priority,
            'tags': self.tags,
            'conditions': self.conditions,
            'actions': self.actions
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Rule':
        """Opret regel fra dictionary"""
        return cls(
            id=data.get('id', ''),
            name=data.get('name', ''),
            description=data.get('description', ''),
            enabled=data.get('enabled', True),
            priority=data.get('priority', 0),
            tags=data.get('tags', []),
            conditions=data.get('conditions', {}),
            actions=data.get('actions', [])
        )

class RuleManager:
    """Hovedklasse til håndtering af regler"""
    
    def __init__(self, rules_dir: str = 'rules'):
        self.rules_dir = Path(rules_dir)
        self.rules: Dict[str, Rule] = {}
        self.rule_files: Dict[str, str] = {}
        self._load_rules()
    
    def _load_rules(self) -> None:
        """Indlæs regler fra filer"""
        if not self.rules_dir.exists():
            logger.warning(f"Regelmappe ikke fundet: {self.rules_dir}")
            return
        
        # Gennemgå alle YAML-filer i regelmappen
        for rule_file in self.rules_dir.glob('*.yaml'):
            try:
                with open(rule_file, 'r', encoding='utf-8') as f:
                    rules_data = yaml.safe_load(f) or {}
                
                # Behandl enkeltstående regel eller liste af regler
                rules_list = rules_data.get('rules', [rules_data] if rules_data else [])
                
                for rule_data in rules_list:
                    if not rule_data:
                        continue
                        
                    rule = Rule.from_dict(rule_data)
                    self.rules[rule.id] = rule
                    self.rule_files[rule.id] = str(rule_file)
                    
                logger.info(f"Indlæst {len(rules_list)} regler fra {rule_file.name}")
                
            except Exception as e:
                logger.error(f"Fejl ved indlæsning af {rule_file}: {e}")
    
    def get_rule(self, rule_id: str) -> Optional[Rule]:
        """Hent en specifik regel"""
        return self.rules.get(rule_id)
    
    def get_rules_by_tag(self, tag: str) -> List[Rule]:
        """Hent regler med et specifikt tag"""
        return [rule for rule in self.rules.values() if tag in rule.tags]
    
    def evaluate_conditions(self, rule: Rule, context: Dict) -> bool:
        """Evaluer betingelser for en regel"""
        if not rule.conditions:
            return True
            
        # Simpel evaluering - kan udvides til mere kompleks logik
        for key, expected in rule.conditions.items():
            value = context.get(key)
            if value != expected:
                return False
                
        return True
    
    def execute_actions(self, rule: Rule, context: Dict) -> Dict:
        """Udfør handlinger for en regel"""
        results = {}
        
        for action in rule.actions:
            action_type = action.get('type')
            action_params = action.get('params', {})
            
            try:
                if action_type == 'log':
                    message = action_params.get('message', '').format(**context)
                    level = action_params.get('level', 'info').lower()
                    getattr(logger, level)(message)
                    results[action_type] = {'status': 'success', 'message': message}
                    
                elif action_type == 'set_config':
                    config_key = action_params.get('key')
                    config_value = action_params.get('value')
                    # Her ville vi normalt opdatere konfigurationen
                    logger.info(f"Vil opdatere konfiguration: {config_key} = {config_value}")
                    results[action_type] = {'status': 'success', 'key': config_key, 'value': config_value}
                    
                elif action_type == 'run_command':
                    command = action_params.get('command', '').format(**context)
                    # ADVARSEL: Kør kun kommandoer fra pålidelige kilder
                    logger.warning(f"Vil køre kommando: {command}")
                    # Her ville vi normalt eksekvere kommandoen
                    results[action_type] = {'status': 'simulated', 'command': command}
                    
                else:
                    logger.warning(f"Ukendt handlingstype: {action_type}")
                    results[action_type] = {'status': 'error', 'message': f'Ukendt handlingstype: {action_type}'}
                    
            except Exception as e:
                logger.error(f"Fejl ved udførelse af handling {action_type}: {e}")
                results[action_type] = {'status': 'error', 'message': str(e)}
        
        return results
    
    def process_rules(self, context: Optional[Dict] = None) -> Dict[str, Dict]:
        """Behandl alle aktive regler"""
        context = context or {}
        results = {}
        
        # Sorter regler efter prioritet (højeste først)
        sorted_rules = sorted(
            [r for r in self.rules.values() if r.enabled],
            key=lambda x: x.priority,
            reverse=True
        )
        
        for rule in sorted_rules:
            try:
                if self.evaluate_conditions(rule, context):
                    logger.info(f"Udfører regel: {rule.name}")
                    results[rule.id] = {
                        'name': rule.name,
                        'actions': self.execute_actions(rule, context)
                    }
            except Exception as e:
                logger.error(f"Fejl ved behandling af regel {rule.id}: {e}")
                results[rule.id] = {
                    'name': rule.name,
                    'error': str(e)
                }
        
        return results
    
    def save_rule(self, rule: Rule) -> bool:
        """Gem en regel til fil"""
        try:
            rule_file = self.rule_files.get(rule.id, self.rules_dir / 'custom_rules.yaml')
            
            # Hent eksisterende regler
            rules = []
            if os.path.exists(rule_file):
                with open(rule_file, 'r', encoding='utf-8') as f:
                    existing_rules = yaml.safe_load(f) or {}
                    rules = existing_rules.get('rules', [existing_rules] if existing_rules else [])
            
            # Opdater eller tilføj regel
            rule_found = False
            for i, r in enumerate(rules):
                if r.get('id') == rule.id:
                    rules[i] = rule.to_dict()
                    rule_found = True
                    break
            
            if not rule_found:
                rules.append(rule.to_dict())
            
            # Gem tilbage til fil
            with open(rule_file, 'w', encoding='utf-8') as f:
                yaml.safe_dump({'rules': rules}, f, default_flow_style=False, allow_unicode=True)
            
            logger.info(f"Regel gemt: {rule.id} i {rule_file}")
            return True
            
        except Exception as e:
            logger.error(f"Fejl ved lagring af regel {rule.id}: {e}")
            return False

def main():
    """Eksempel på brug"""
    # Opret en ny regelhåndter
    manager = RuleManager()
    
    # Vis antal indlæste regler
    print(f"Indlæste {len(manager.rules)} regler")
    
    # Opret en testkontekst
    context = {
        'user': 'test_bruger',
        'environment': 'development',
        'time': datetime.now().isoformat()
    }
    
    # Behandl regler med den givne kontekst
    results = manager.process_rules(context)
    print(f"Udførte {len(results)} regler")
    
    # Vis resultater
    for rule_id, result in results.items():
        print(f"\n{result.get('name')} ({rule_id}):")
        if 'error' in result:
            print(f"  Fejl: {result['error']}")
        else:
            for action, action_result in result.get('actions', {}).items():
                print(f"  - {action}: {action_result.get('status')}")

if __name__ == "__main__":
    main()
