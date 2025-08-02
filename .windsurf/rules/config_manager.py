"""
Avanceret Konfigurations Manager for Windsurf Optimeringer
Version: 2.0.0
"""

import yaml
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional
from pathlib import Path
import logging

# Opsæt logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class OptimizationProfile:
    """Klasse til at håndtere optimeringsprofiler"""
    name: str
    description: str
    settings: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Konverter profil til dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'settings': self.settings
        }

class ConfigManager:
    """Hovedklasse til konfigurationshåndtering"""
    
    def __init__(self, config_path: str = 'optimized_config.yaml'):
        self.config_path = Path(config_path)
        self.profiles: Dict[str, OptimizationProfile] = {}
        self.active_profile: Optional[OptimizationProfile] = None
        self._load_config()
        self._setup_default_profiles()
    
    def _load_config(self) -> None:
        """Indlæs konfiguration fra fil"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self.config = yaml.safe_load(f) or {}
            else:
                self.config = {}
                logger.warning(f"Config file {self.config_path} not found, using defaults")
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            self.config = {}
    
    def _setup_default_profiles(self) -> None:
        """Opret standard optimeringsprofiler"""
        # SWE-1 Optimering
        swe1_profile = OptimizationProfile(
            name="swe1_optimized",
            description="Optimeret for SWE-1 med reduceret hukommelsesforbrug",
            settings={
                'performance': {
                    'max_memory_mb': 4096,
                    'max_parallel_ops': 2,
                    'enable_caching': True,
                    'cache_size_mb': 512,
                    'background_processing': False,
                    'max_background_threads': 1
                },
                'compatibility': {
                    'swe1': {
                        'enabled': True,
                        'max_thought_depth': 2,
                        'disable_mcp_extensions': True,
                        'lightweight_mode': True
                    }
                }
            }
        )
        
        # DeepSeek Optimering
        deepseek_profile = OptimizationProfile(
            name="deepseek_optimized",
            description="Optimeret for DeepSeek med batch processing",
            settings={
                'performance': {
                    'max_memory_mb': 8192,
                    'max_parallel_ops': 4,
                    'enable_caching': True,
                    'cache_size_mb': 1024,
                    'batch_processing': True,
                    'max_batch_size': 8
                },
                'compatibility': {
                    'deepseek': {
                        'enabled': True,
                        'enable_streaming': True,
                        'optimize_token_usage': True
                    }
                }
            }
        )
        
        # Tilføj standardprofiler
        self.profiles[swe1_profile.name] = swe1_profile
        self.profiles[deepseek_profile.name] = deepseek_profile
        
        # Brug SWE-1 som standard
        self.active_profile = swe1_profile
    
    def activate_profile(self, profile_name: str) -> bool:
        """Aktiver en specifik optimeringsprofil"""
        if profile_name in self.profiles:
            self.active_profile = self.profiles[profile_name]
            logger.info(f"Aktiveret profil: {profile_name}")
            return True
        logger.warning(f"Profil ikke fundet: {profile_name}")
        return False
    
    def get_active_settings(self) -> Dict[str, Any]:
        """Hent aktive indstillinger"""
        if self.active_profile:
            return self.active_profile.settings
        return {}
    
    def update_setting(self, section: str, key: str, value: Any) -> None:
        """Opdater en specifik indstilling"""
        if self.active_profile:
            keys = key.split('.')
            settings = self.active_profile.settings
            
            # Naviger gennem nestede nøgler
            for k in keys[:-1]:
                if k not in settings:
                    settings[k] = {}
                settings = settings[k]
            
            # Opdater værdien
            settings[keys[-1]] = value
            logger.debug(f"Opdateret indstilling {key} = {value}")
    
    def save_config(self) -> bool:
        """Gem konfiguration til fil"""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                config_to_save = {
                    'active_profile': self.active_profile.name if self.active_profile else None,
                    'profiles': {name: profile.to_dict() for name, profile in self.profiles.items()}
                }
                yaml.safe_dump(config_to_save, f, default_flow_style=False, allow_unicode=True)
            logger.info(f"Konfiguration gemt til {self.config_path}")
            return True
        except Exception as e:
            logger.error(f"Fejl ved lagring af konfiguration: {e}")
            return False

def main():
    """Eksempel på brug"""
    # Opret en ny konfigurationsmanager
    config_manager = ConfigManager()
    
    # Skift til DeepSeek-profil
    config_manager.activate_profile("deepseek_optimized")
    
    # Opdater en specifik indstilling
    config_manager.update_setting('performance', 'max_memory_mb', 10240)
    
    # Gem ændringer
    config_manager.save_config()
    
    # Vis aktive indstillinger
    print("Aktive indstillinger:", config_manager.get_active_settings())

if __name__ == "__main__":
    main()
