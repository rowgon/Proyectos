from flask import Flask, render_template, request, redirect, url_for, session, flash
from scripts.gif_creator import create_gif
from scripts.summarize import generate_summary
from scripts.db_handler import insert_project, insert_message, get_projects, get_messages
from werkzeug.urls import quote, unquote
import os

app = Flask(__name__)
app.secret_key = "clave_secreta"

@app.route('/')
def index():
    projects = get_projects()
    return render_template('index.html', projects=projects)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form['username'] == 'admin' and request.form['password'] == 'admin':
            session['logged_in'] = True
            return redirect(url_for('dashboard'))
        else:
            flash('Credenciales incorrectas')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/add_project', methods=['POST'])
def add_project():
    url = request.form['project_url']
    gif_path = create_gif(url)
    summary = generate_summary(url)
    insert_project(url, gif_path, summary)
    flash('Proyecto agregado exitosamente')
    return redirect(url_for('index'))

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        insert_message(name, email, message)
        flash('Mensaje enviado')
    return render_template('contact.html')

@app.route('/messages')
def messages():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    messages = get_messages()
    return render_template('messages.html', messages=messages)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('Sesión cerrada')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
