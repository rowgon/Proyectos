from bs4 import BeautifulSoup
import requests

def generate_summary(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    title = soup.title.string if soup.title else 'Sin título'
    paragraphs = soup.find_all('p')
    summary_text = " ".join(p.text for p in paragraphs[:3])  # Primeros 3 párrafos
    
    return f"{title}: {summary_text[:300]}..."
