from selenium import webdriver
from PIL import Image
import time
import os
import imageio
from urllib.parse import urlparse

def create_gif(url):
    driver = webdriver.Chrome()  # Asegúrate de tener ChromeDriver configurado
    driver.get(url)
    driver.maximize_window()
    time.sleep(5)  # Espera para cargar la página completamente
    images = []

    scroll_height = driver.execute_script("return document.body.scrollHeight")
    screen_height = driver.execute_script("return window.innerHeight")
    scroll_position = 0

    while scroll_position < scroll_height:
        file_name = f"temp_{scroll_position}.png"
        driver.save_screenshot(file_name)
        images.append(imageio.imread(file_name))
        scroll_position += screen_height
        driver.execute_script(f"window.scrollTo(0, {scroll_position});")
        time.sleep(1)

    # Usar el nombre del dominio como nombre del archivo GIF
    domain_name = urlparse(url).netloc.replace(".", "_")
    gif_path = f'static/{domain_name}.gif'
    imageio.mimsave(gif_path, images, duration=1)
    driver.quit()

    for file_name in os.listdir():
        if file_name.startswith("temp_") and file_name.endswith(".png"):
            os.remove(file_name)

    return gif_path
