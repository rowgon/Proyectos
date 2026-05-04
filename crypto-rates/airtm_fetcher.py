import json
from pyDolarVenezuela import Monitor
from pyDolarVenezuela.pages import MonitorDolarWeb, EnParaleloVzla

def fetch_airtm():
    try:
        m = Monitor(MonitorDolarWeb, 'USD')
        val = m.get_value_monitors('airtm')
        return val.price if hasattr(val, 'price') else (val['price'] if isinstance(val, dict) else val)
    except Exception:
        pass

    try:
        m = Monitor(EnParaleloVzla, 'USD')
        val = m.get_value_monitors('enparalelovzla')
        return val.price if hasattr(val, 'price') else (val['price'] if isinstance(val, dict) else val)
    except Exception:
        return 0

if __name__ == '__main__':
    print(fetch_airtm())
