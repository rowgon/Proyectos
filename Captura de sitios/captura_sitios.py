from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image
import time
import imageio

# Configuración de Selenium
def iniciar_navegador():
    options = Options()
    options.add_argument('--headless')  # Ejecutar sin interfaz gráfica
    options.add_argument('--window-size=1280,1024')  # Tamaño de la ventana
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

# Capturar varias capturas de pantalla mientras se desplaza por la página
def generar_gif_scroll(url, output_file, duracion_frame=200, num_frames=30):
    driver = iniciar_navegador()
    driver.get(url)
    time.sleep(300)  # Esperar a que cargue el sitio

    images = []
    
    # Obtener la altura total de la página
    total_height = driver.execute_script("return document.body.scrollHeight")
    scroll_step = total_height // num_frames  # Definir el paso de desplazamiento

    for i in range(num_frames):
        # Capturar la pantalla y agregarla a la lista de imágenes
        screenshot_path = f"temp_screenshot_{i}.png"
        driver.save_screenshot(screenshot_path)
        img = Image.open(screenshot_path)
        images.append(img)

        # Desplazarse hacia abajo en la página
        driver.execute_script(f"window.scrollTo(0, {scroll_step * (i + 1)})")
        time.sleep(duracion_frame / 1000)  # Esperar un poco antes de la siguiente captura

    driver.quit()
    
    # Guardar el GIF animado
    images[0].save(output_file, save_all=True, append_images=images[1:], duration=duracion_frame, loop=0)

# Ejemplo de uso
url = 'https://mvpservicios.com'  # Cambia esto a la URL que desees
output_gif = 'scroll_gif.gif'  # Nombre del archivo GIF de salida

# Generar un GIF animado que simula el scroll por el sitio
generar_gif_scroll(url, output_gif, duracion_frame=200, num_frames=30)  # Puedes ajustar la duración y número de frames
