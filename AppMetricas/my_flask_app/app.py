from flask import Flask, render_template, request, redirect, url_for
import pandas as pd
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

# Crear la carpeta de graficas si no existe
if not os.path.exists('static/graficas'):
    os.makedirs('static/graficas')

def generar_dashboard(file_path):
    # Verifica si la carpeta para las gráficas existe
    if not os.path.exists('static/graficas'):
        os.makedirs('static/graficas')
    
    df = pd.read_csv(file_path)

    # Filtrar datos para que solo se muestren valores >= 1
    df = df[(df.select_dtypes(include=['number']) > 1).any(axis=1)]

    graph_paths = []
    columns_to_plot = ['sessionMedium', 'sessionSource', 'date', 'fullPageUrl', 
                       'country', 'pageReferrer', 'deviceCategory', 'isKeyEvent', 
                       'eventName', 'activeUsers', 'keyEvents']

    for col in columns_to_plot:
        if col in df.columns:
            plt.figure(figsize=(15, 8))
            df[col].value_counts().plot(kind='bar')
            plt.title(f'Distribution of {col}')
            plt.xlabel(col)
            plt.ylabel('Counts')
            plt.tight_layout()

            graph_filename = f'static/graficas/{col}_bar.png'
            plt.savefig(graph_filename)
            plt.close()

            graph_paths.append(f'graficas/{col}_bar.png')

    return graph_paths

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(url_for('index'))
    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('index'))

    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    graph_paths = generar_dashboard(file_path)

    return render_template('dashboard.html', graphs=graph_paths)

if __name__ == "__main__":
    app.run(debug=True)
