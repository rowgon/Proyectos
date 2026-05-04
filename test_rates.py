import inspect
import json
from pyDolarVenezuela import Monitor
from pyDolarVenezuela.pages import ExchangeMonitor

try:
    print(inspect.signature(Monitor.get_value_monitors))
except Exception as e:
    print(e)
