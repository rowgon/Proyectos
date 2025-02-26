import sqlite3

def create_tables():
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS projects (
                        id INTEGER PRIMARY KEY,
                        url TEXT,
                        gif_path TEXT,
                        description TEXT
                    )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY,
                        name TEXT,
                        email TEXT,
                        message TEXT
                    )''')
    conn.commit()
    conn.close()

def insert_project(url, gif_path, description):
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO projects (url, gif_path, description) VALUES (?, ?, ?)', (url, gif_path, description))
    conn.commit()
    conn.close()

def insert_message(name, email, message):
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', (name, email, message))
    conn.commit()
    conn.close()
    
def get_projects():
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM projects')
    projects = cursor.fetchall()
    conn.close()
    return projects

def get_messages():
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM messages')
    messages = cursor.fetchall()
    conn.close()
    return messages

create_tables()  # Ejecuta la creación de tablas al inicio
