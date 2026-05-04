import json
from pyDolarVenezuela import Monitor
from pyDolarVenezuela.pages import CriptoDolar

def get_rates():
    try:
        monitor = Monitor(CriptoDolar, 'USD')
        
        airtm = monitor.get_value_monitors('airtm')
        binance = monitor.get_value_monitors('binance')
        
        data = {
            "airtm": airtm.__dict__ if hasattr(airtm, '__dict__') else airtm,
            "binance": binance.__dict__ if hasattr(binance, '__dict__') else binance,
        }
        
        print(json.dumps({"status": "success", "data": data}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    get_rates()
