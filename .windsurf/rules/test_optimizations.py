"""
Testmodul til Windsurf optimeringer
"""

import unittest
import tempfile
import os
import yaml
from pathlib import Path
from unittest.mock import patch, MagicMock

# Import de moduler, der skal testes
from rule_manager import RuleManager, Rule
from config_manager import ConfigManager

class TestRuleManager(unittest.TestCase):
    """Testklasse for RuleManager"""
    
    def setUp(self):
        """Opsæt testmiljø"""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.rules_dir = Path(self.temp_dir.name) / 'test_rules'
        self.rules_dir.mkdir(exist_ok=True)
        
        # Opret en testregelfil
        self.test_rule = {
            'id': 'test_rule_1',
            'name': 'Test Regel',
            'description': 'En testregel',
            'enabled': True,
            'priority': 1,
            'tags': ['test', 'unittest'],
            'conditions': {
                'environment': 'test'
            },
            'actions': [
                {
                    'type': 'log',
                    'params': {
                        'message': 'Test regel udført',
                        'level': 'info'
                    }
                }
            ]
        }
        
        self.rule_file = self.rules_dir / 'test_rules.yaml'
        with open(self.rule_file, 'w', encoding='utf-8') as f:
            yaml.dump({'rules': [self.test_rule]}, f)
        
        self.manager = RuleManager(str(self.rules_dir))
    
    def tearDown(self):
        """Ryd op efter test"""
        self.temp_dir.cleanup()
    
    def test_load_rules(self):
        """Test indlæsning af regler"""
        self.assertIn('test_rule_1', self.manager.rules)
        self.assertEqual(self.manager.rules['test_rule_1'].name, 'Test Regel')
    
    def test_evaluate_conditions(self):
        """Test evaluering af betingelser"""
        rule = self.manager.rules['test_rule_1']
        
        # Test med matchende betingelser
        context = {'environment': 'test'}
        self.assertTrue(self.manager.evaluate_conditions(rule, context))
        
        # Test med ikke-matchende betingelser
        context = {'environment': 'production'}
        self.assertFalse(self.manager.evaluate_conditions(rule, context))
    
    @patch('rule_manager.logger')
    def test_execute_actions(self, mock_logger):
        """Test udførelse af handlinger"""
        rule = self.manager.rules['test_rule_1']
        context = {'environment': 'test'}
        
        results = self.manager.execute_actions(rule, context)
        
        # Tjek at logningen blev kaldt korrekt
        mock_logger.info.assert_called_once_with('Test regel udført')
        self.assertEqual(results['log']['status'], 'success')

class TestConfigManager(unittest.TestCase):
    """Testklasse for ConfigManager"""
    
    def setUp(self):
        """Opsæt testmiljø"""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.config_file = Path(self.temp_dir.name) / 'test_config.yaml'
        
        # Opret en testkonfiguration
        self.test_config = {
            'version': '1.0.0',
            'settings': {
                'test_setting': 'test_value',
                'nested': {
                    'key': 'value'
                }
            }
        }
        
        with open(self.config_file, 'w', encoding='utf-8') as f:
            yaml.dump(self.test_config, f)
        
        self.manager = ConfigManager(str(self.config_file))
    
    def tearDown(self):
        """Ryd op efter test"""
        self.temp_dir.cleanup()
    
    def test_load_config(self):
        """Test indlæsning af konfiguration"""
        self.assertEqual(self.manager.get('test_setting'), 'test_value')
        self.assertEqual(self.manager.get('nested.key'), 'value')
    
    def test_set_value(self):
        """Test opdatering af konfiguration"""
        self.manager.set('new_setting', 'new_value')
        self.assertEqual(self.manager.get('new_setting'), 'new_value')
        
        # Test nested opdatering
        self.manager.set('nested.new_key', 'nested_value')
        self.assertEqual(self.manager.get('nested.new_key'), 'nested_value')
    
    def test_save_config(self):
        """Test gemning af konfiguration"""
        self.manager.set('test_save', 'save_test')
        self.manager.save()
        
        # Indlæs konfigurationen igen for at bekræfte gemningen
        with open(self.config_file, 'r', encoding='utf-8') as f:
            saved_config = yaml.safe_load(f)
        
        self.assertEqual(saved_config['settings']['test_save'], 'save_test')

if __name__ == '__main__':
    unittest.main()
