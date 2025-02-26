import io
import base64
import pandas as pd
import plotly.express as px
import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output

def parse_uploaded_file(contents):
    # Check if the contents is a CSV or Excel file
    if contents.startswith('data:text/csv;base64,'):
        # Remove the 'data:text/csv;base64,' prefix
        _, encoded_contents = contents.split(',')

        # Decode the base64 string
        decoded_contents = base64.b64decode(encoded_contents)

        # Create a file-like object from the decoded contents
        csv_string = io.StringIO(decoded_contents.decode('utf-8'))

        # Read the CSV data from the file-like object
        df = pd.read_csv(csv_string)

    elif contents.startswith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,'):
        # Remove the 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' prefix
        _, encoded_contents = contents.split(',')

        # Decode the base64 string
        decoded_contents = base64.b64decode(encoded_contents)

        # Create a file-like object from the decoded contents
        excel_string = io.BytesIO(decoded_contents)

        # Read the Excel data from the file-like object
        df = pd.read_excel(excel_string)

    else:
        raise ValueError("Unsupported file type")

    return df

# Load the data
df = pd.read_csv('visita julio.csv')

# Create the app
app = dash.Dash(__name__)

# Define the layout
app.layout = html.Div([
    html.H1('Power BI-type Dashboard'),
    dcc.Upload(id='upload-data', children=html.Div(['Drag and Drop or ', html.A('Select Files')]), style={'width': '100%', 'height': '60px', 'lineHeight': '60px', 'borderWidth': '1px', 'borderStyle': 'dashed', 'borderRadius': '5px', 'textAlign': 'center', 'margin': '10px'}),
    html.Div(id='output-data-upload'),
    dcc.Dropdown(id='column-dropdown', options=[{'label': i, 'value': i} for i in df.columns]),
    dcc.Dropdown(id='graph-type-dropdown', options=[{'label': 'Scatter', 'value': 'scatter'}, {'label': 'Bar', 'value': 'bar'}, {'label': 'Line', 'value': 'line'}]),
    html.Div(id='output-graphs')
])

# Define the callback for the upload component
@app.callback(Output('output-data-upload', 'children'), [Input('upload-data', 'contents')])
def update_output_callback(contents):
    if contents:
        df = parse_uploaded_file(contents)
        return html.Div(['You have uploaded a file with {} rows and {} columns.'.format(df.shape[0], df.shape[1])])
    else:
        return html.Div(['No file uploaded yet.'])

# Define the callback for the dropdown component
@app.callback(Output('output-graphs', 'children'), [Input('column-dropdown', 'value'), Input('graph-type-dropdown', 'value')])
def update_graphs(selected_column, graph_type):
    global df  # Add this line to access the global df variable
    if selected_column and graph_type:
        if graph_type == 'scatter':
            fig = px.scatter(df, x='date', y=selected_column)
        elif graph_type == 'bar':
            fig = px.bar(df, x='date', y=selected_column)
        elif graph_type == 'line':
            fig = px.line(df, x='date', y=selected_column)
        return dcc.Graph(figure=fig)
    else:
        return html.Div(['No column or graph type selected yet.'])

# Run the app
if __name__ == '__main__':
    app.run_server(debug=True)