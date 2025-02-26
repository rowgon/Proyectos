from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'secret_key'

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///messages.db'
db = SQLAlchemy(app)

# Configuración de Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'tu_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'tu_contraseña'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

# Modelo de la base de datos para los mensajes
class Mensaje(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    email = db.Column(db.String(100))
    mensaje = db.Column(db.Text)

# Modelo para el usuario administrador
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Ruta principal
@app.route('/')
def index():
    return render_template('index.html')

# Ruta de contacto con formulario
@app.route('/contacto', methods=['GET', 'POST'])
def contacto():
    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        mensaje = request.form['mensaje']

        # Guardar mensaje en la base de datos
        nuevo_mensaje = Mensaje(nombre=nombre, email=email, mensaje=mensaje)
        db.session.add(nuevo_mensaje)
        db.session.commit()

        # Enviar email de confirmación
        msg = Message('Nuevo Mensaje de Contacto', sender=email, recipients=['tu_email@gmail.com'])
        msg.body = f'Nombre: {nombre}\nEmail: {email}\nMensaje: {mensaje}'
        mail.send(msg)

        return redirect(url_for('index'))
    return render_template('contacto.html')

# Ruta de login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        usuario = Usuario.query.filter_by(username=username).first()

        if usuario and usuario.check_password(password):
            session['admin'] = True
            return redirect(url_for('ver_mensajes'))
        else:
            return "Login fallido. Verifica tus credenciales."
    return render_template('login.html')

# Ruta para ver los mensajes (solo accesible con sesión iniciada)
@app.route('/ver_mensajes')
def ver_mensajes():
    if not session.get('admin'):
        return redirect(url_for('login'))
    mensajes = Mensaje.query.all()
    return render_template('ver_mensajes.html', mensajes=mensajes)

# Ruta para cerrar sesión
@app.route('/logout')
def logout():
    session.pop('admin', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
