"""
Avanceret Performance Overvågningssystem
Version: 2.0.0
"""

import time
import psutil
import platform
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable
from datetime import datetime
import json

# Opsæt logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Metric:
    """Klasse til at repræsentere en enkelt metrik"""
    name: str
    value: float
    timestamp: float = field(default_factory=time.time)
    tags: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Konverter metrik til dictionary"""
        return {
            'name': self.name,
            'value': self.value,
            'timestamp': self.timestamp,
            'tags': self.tags
        }

class PerformanceMonitor:
    """Hovedklasse til performance overvågning"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.metrics: List[Metric] = []
        self.stats: Dict[str, Dict] = {
            'cpu': {},
            'memory': {},
            'disk': {},
            'network': {}
        }
        self.start_time = time.time()
        self._setup_metrics()
    
    def _setup_metrics(self) -> None:
        """Opsæt standard metrikker"""
        # CPU metrikker
        self.add_metric('cpu.percent', 0.0, {'type': 'gauge'})
        self.add_metric('cpu.count', psutil.cpu_count(), {'type': 'count'})
        
        # Hukommelsesmetrikker
        mem = psutil.virtual_memory()
        self.add_metric('memory.total', mem.total, {'type': 'gauge', 'unit': 'bytes'})
        self.add_metric('memory.available', mem.available, {'type': 'gauge', 'unit': 'bytes'})
        self.add_metric('memory.percent', mem.percent, {'type': 'gauge', 'unit': 'percent'})
        
        # Diskmetrikker
        disk = psutil.disk_usage('/')
        self.add_metric('disk.total', disk.total, {'type': 'gauge', 'unit': 'bytes'})
        self.add_metric('disk.used', disk.used, {'type': 'gauge', 'unit': 'bytes'})
        self.add_metric('disk.free', disk.free, {'type': 'gauge', 'unit': 'bytes'})
        self.add_metric('disk.percent', disk.percent, {'type': 'gauge', 'unit': 'percent'})
    
    def add_metric(self, name: str, value: float, tags: Optional[Dict] = None) -> None:
        """Tilføj en ny metrik"""
        metric = Metric(name=name, value=float(value), tags=tags or {})
        self.metrics.append(metric)
        self._update_stats(metric)
    
    def _update_stats(self, metric: Metric) -> None:
        """Opdater statistikker baseret på ny metrik"""
        parts = metric.name.split('.')
        if not parts:
            return
            
        category = parts[0]
        if category in self.stats:
            self.stats[category][metric.name] = metric.value
    
    def collect_system_metrics(self) -> None:
        """Indsaml systemmæssige metrikker"""
        try:
            # CPU brug
            cpu_percent = psutil.cpu_percent(interval=1)
            self.add_metric('cpu.percent', cpu_percent)
            
            # Hukommelsesbrug
            mem = psutil.virtual_memory()
            self.add_metric('memory.available', mem.available)
            self.add_metric('memory.percent', mem.percent)
            
            # Diskbrug
            disk = psutil.disk_usage('/')
            self.add_metric('disk.used', disk.used)
            self.add_metric('disk.free', disk.free)
            self.add_metric('disk.percent', disk.percent)
            
            # Netværk
            net_io = psutil.net_io_counters()
            self.add_metric('network.bytes_sent', net_io.bytes_sent)
            self.add_metric('network.bytes_recv', net_io.bytes_recv)
            
            logger.debug("Systemmæssige metrikker indsamlet")
            
        except Exception as e:
            logger.error(f"Fejl ved indsamling af systemmæssige metrikker: {e}")
    
    def get_metrics_summary(self) -> Dict:
        """Hent en oversigt over alle metrikker"""
        return {
            'system': {
                'platform': platform.platform(),
                'python_version': platform.python_version(),
                'uptime': time.time() - self.start_time,
                'timestamp': datetime.now().isoformat()
            },
            'metrics': [m.to_dict() for m in self.metrics[-100:]],  # Seneste 100 målepunkter
            'stats': self.stats
        }
    
    def save_metrics(self, filename: str = 'performance_metrics.json') -> bool:
        """Gem metrikker til fil"""
        try:
            with open(filename, 'w') as f:
                json.dump(self.get_metrics_summary(), f, indent=2)
            logger.info(f"Metrikker gemt til {filename}")
            return True
        except Exception as e:
            logger.error(f"Fejl ved lagring af metrikker: {e}")
            return False
    
    def monitor(self, interval: int = 60, callback: Optional[Callable] = None) -> None:
        """Start overvågning med givet interval"""
        logger.info(f"Starter overvågning med interval {interval} sekunder")
        
        try:
            while True:
                start_time = time.time()
                
                # Indsaml metrikker
                self.collect_system_metrics()
                
                # Kald callback hvis angivet
                if callback:
                    callback(self.get_metrics_summary())
                
                # Vent til næste interval
                elapsed = time.time() - start_time
                sleep_time = max(0, interval - elapsed)
                if sleep_time > 0:
                    time.sleep(sleep_time)
                    
        except KeyboardInterrupt:
            logger.info("Overvågning stoppet")
        except Exception as e:
            logger.error(f"Fejl under overvågning: {e}")

def example_callback(metrics: Dict) -> None:
    """Eksempel på en callback-funktion"""
    print(f"\n--- Performance Oversigt ({metrics['system']['timestamp']}) ---")
    print(f"CPU: {metrics['stats']['cpu'].get('cpu.percent', 0):.1f}%")
    print(f"Hukommelse: {metrics['stats']['memory'].get('memory.percent', 0):.1f}%")
    print(f"Disk: {metrics['stats']['disk'].get('disk.percent', 0):.1f}%")

def main():
    """Eksempel på brug"""
    # Opret en ny performance monitor
    monitor = PerformanceMonitor()
    
    try:
        # Start overvågning med callback
        monitor.monitor(interval=5, callback=example_callback)
    except KeyboardInterrupt:
        print("\nAfslutter...")
    finally:
        # Gem metrikker ved afslutning
        monitor.save_metrics()

if __name__ == "__main__":
    main()
