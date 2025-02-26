import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Cargar el archivo de Excel
file_path = 'visita julio - Hoja 1.csv'  # Cambia esto a la ruta de tu archivo
df = pd.read_excel(file_path, sheet_name='Julio 2024')

# Configuración de estilo de gráficos
sns.set(style="whitegrid")

# 1. Distribución de usuarios activos por URL visitada (fullPageUrl)
plt.figure(figsize=(12, 6))
url_plot = sns.barplot(
    x='activeUsers', 
    y='fullPageUrl', 
    data=df.groupby('fullPageUrl')['activeUsers'].sum().reset_index().sort_values(by='activeUsers', ascending=False)
)
url_plot.set_title('Distribución de Usuarios Activos por URL Visitada')
plt.show()

# 2. Distribución de usuarios activos según la página de referencia (pageReferrer)
plt.figure(figsize=(12, 6))
referrer_plot = sns.barplot(
    x='activeUsers', 
    y='pageReferrer', 
    data=df.groupby('pageReferrer')['activeUsers'].sum().reset_index().sort_values(by='activeUsers', ascending=False)
)
referrer_plot.set_title('Distribución de Usuarios Activos según la Página de Referencia')
plt.show()

# 3. Relación entre las URLs visitadas y sus páginas de referencia
plt.figure(figsize=(12, 6))
url_referrer_plot = sns.heatmap(
    df.pivot_table(index='fullPageUrl', columns='pageReferrer', values='activeUsers', aggfunc='sum').fillna(0),
    cmap="YlGnBu", linewidths=.5, cbar_kws={'label': 'Active Users'}
)
url_referrer_plot.set_title('Relación entre URLs Visitadas y Páginas de Referencia')
plt.show()
