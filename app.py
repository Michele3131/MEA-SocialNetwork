from flask import Flask, request, redirect, url_for, session, render_template
import mysql.connector
from mysql.connector import Error
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Path assoluto per PythonAnywhere
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB max
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Assicurati che la cartella upload esista
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Configurazione Database (Aggiornata per PythonAnywhere)
DB_CONFIG = {
    'host': 'Michele3131.mysql.pythonanywhere-services.com',
    'user': 'Michele3131',
    'password': 'sql@mea1234',
    'database': 'Michele3131$MEA'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        # Verifica veloce se la colonna last_seen_likes esiste (per compatibilità)
        # Questo è utile solo durante la migrazione
        return conn
    except Error as e:
        print(f"Errore durante la connessione a MySQL: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_likes INT DEFAULT 0")
            conn.commit()
        except:
            pass
        finally:
            cur.close()
            conn.close()

# Esegui inizializzazione all'avvio
init_db()

@app.route("/")
def index():
    if "user_id" not in session:
        return redirect(url_for("access"))
    
    user = None
    conn = get_db_connection()
    if conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE id = %s", (session["user_id"],))
        user = cur.fetchone()
        cur.close()
        conn.close()
    return render_template("index.html", user=user)

@app.route("/access")
def access():
    error = request.args.get("error")
    success = request.args.get("success")
    return render_template("access.html", error=error, success=success)

@app.route("/register", methods=["POST"])
def register():
    nickname = request.form["name"]
    email = request.form["email"]
    dob = request.form["year_of_birth"]
    sex = request.form["sex"]
    password = request.form["password"]
    
    avatar_file = request.files.get("avatar")
    avatar_url = None

    if avatar_file and allowed_file(avatar_file.filename):
        import time
        import uuid
        filename = secure_filename(avatar_file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"avatar_{int(time.time())}_{uuid.uuid4().hex[:8]}.{ext}"
        avatar_file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        avatar_url = f"/static/uploads/{unique_filename}"
    else:
        # Immagine standard recuperata da internet (DiceBear o un placeholder)
        avatar_url = f"https://api.dicebear.com/7.x/pixel-art/svg?seed={nickname}"

    conn = get_db_connection()
    if conn is None: 
        return redirect(url_for("access", error="Errore database"))
    
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO users (Nickname, Email, Date_of_birth, Sex, Password, Avatar)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (nickname, email, dob, sex, password, avatar_url),
        )
        conn.commit()
    except Error as e:
        return redirect(url_for("access", error="Email o Nickname già esistenti"))
    finally:
        cur.close()
        conn.close()

    return redirect(url_for("access", success="Registrazione completata! Accedi ora."))

@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db_connection()
    if conn is None: 
        return redirect(url_for("access", error="Errore database"))
        
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, Nickname, Password FROM users WHERE Email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user is None or user["Password"] != password:
        return redirect(url_for("access", error="Email o password invalidi"))

    session["user_id"] = user["id"]
    session["nickname"] = user["Nickname"]

    return redirect(url_for("index"))

@app.route("/api/posts")
def get_posts():
    user_id = session.get("user_id")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    offset = (page - 1) * limit

    conn = get_db_connection()
    if conn is None: return {"error": "db error"}, 500
    cur = conn.cursor(dictionary=True)
    
    # Recupera i post con le info dell'utente e il voto dell'utente loggato
    cur.execute("""
        SELECT posts.*, users.Nickname as user, users.Avatar as avatar,
               (SELECT vote FROM likes WHERE likes.post_id = posts.id AND likes.user_id = %s) as user_vote
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """, (user_id, limit, offset))
    
    posts = cur.fetchall()
    cur.close()
    conn.close()
    return {"posts": posts}

@app.route("/api/notifications")
def get_notifications():
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401
    
    user_id = session["user_id"]
    conn = get_db_connection()
    if conn is None: return {"error": "db error"}, 500
    cur = conn.cursor(dictionary=True)
    
    # 1. Calcola il totale attuale dei like ricevuti dall'utente
    cur.execute("SELECT SUM(likes) as total FROM posts WHERE user_id = %s", (user_id,))
    current_total = cur.fetchone()["total"] or 0
    
    # 2. Recupera l'ultimo valore visto salvato nel DB
    cur.execute("SELECT last_seen_likes FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()
    last_seen = user_data["last_seen_likes"] if user_data else 0
    
    new_likes = current_total - last_seen
    
    # 3. Se ci sono nuovi like, aggiorniamo il valore nel DB per la prossima volta
    # (o possiamo farlo solo quando l'utente "legge" la notifica, ma il requisito dice "mostra la somma")
    if new_likes > 0:
        cur.execute("UPDATE users SET last_seen_likes = %s WHERE id = %s", (current_total, user_id))
        conn.commit()
    
    cur.close()
    conn.close()
    
    return {"new_likes": new_likes if new_likes > 0 else 0}

@app.route("/api/trends")
def get_trends():
    time_filter = request.args.get("filter", "all") # "all" o "24h"
    
    conn = get_db_connection()
    if conn is None: return {"error": "db error"}, 500
    cur = conn.cursor(dictionary=True)
    
    query = """
        SELECT posts.*, users.Nickname as user 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
    """
    params = []
    
    if time_filter == "24h":
        query += " WHERE posts.created_at >= NOW() - INTERVAL 1 DAY "
    
    query += " ORDER BY likes DESC LIMIT 5"
    
    cur.execute(query, params)
    trends = cur.fetchall()
    cur.close()
    conn.close()
    return {"trends": trends}

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("access"))
    return "Welcome! You are logged in."

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("access"))

@app.route("/post", methods=["POST"])
def create_post():
    if "user_id" not in session:
        return redirect("/access")

    description = request.form.get("description")
    file = request.files.get("image")
    content_url = None

    if file and allowed_file(file.filename):
        import time
        import uuid
        filename = secure_filename(file.filename)
        # Nome univoco con UUID + timestamp
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}.{ext}"
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        content_url = f"/static/uploads/{unique_filename}"

    if not description and not content_url:
        return redirect(request.referrer or "/")

    conn = get_db_connection()
    if conn is None: return redirect(request.referrer or "/")
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO posts (user_id, Content, Description) VALUES (%s, %s, %s)",
            (session["user_id"], content_url, description)
        )
        conn.commit()
    except Error as e:
        pass
    finally:
        cur.close()
        conn.close()

    return redirect(request.referrer or "/")

@app.route("/<username>")
def profile(username):
    conn = get_db_connection()
    if conn is None: return redirect("/")
    cur = conn.cursor(dictionary=True)
    
    cur.execute("SELECT * FROM users WHERE Nickname = %s", (username,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return "User not found", 404

    # Calcola il punteggio totale (somma dei likes di tutti i post dell'utente)
    cur.execute("SELECT SUM(likes) as total_score FROM posts WHERE user_id = %s", (user["id"],))
    total_score = cur.fetchone()["total_score"] or 0

    cur.execute("""
        SELECT p.*, u.Nickname, u.Avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE u.id = %s
        ORDER BY p.created_at DESC
    """, (user["id"],))
    posts = cur.fetchall()
    
    cur.close()
    conn.close()

    return render_template("profile.html", user=user, posts=posts, total_score=total_score)

@app.route("/like/<int:post_id>", methods=["POST"])
def like(post_id):
    if "user_id" not in session:
        return {"error": "Unauthorized"}, 401

    vote = request.json.get("vote") # 1 per plus, -1 per minus, 0 per rimuovere
    user_id = session["user_id"]

    conn = get_db_connection()
    if conn is None: return {"error": "DB error"}, 500
    cur = conn.cursor(dictionary=True)
    
    try:
        # Impedisci il self-like
        cur.execute("SELECT user_id FROM posts WHERE id = %s", (post_id,))
        post_owner = cur.fetchone()
        if post_owner and post_owner["user_id"] == user_id:
            return {"error": "Non puoi votare i tuoi post"}, 400

        # Verifica se l'utente ha già votato questo post
        cur.execute("SELECT vote FROM likes WHERE user_id = %s AND post_id = %s", (user_id, post_id))
        existing_vote = cur.fetchone()

        if existing_vote:
            old_vote = existing_vote["vote"]
            if vote == 0 or vote == old_vote:
                # Rimuovi voto
                cur.execute("DELETE FROM likes WHERE user_id = %s AND post_id = %s", (user_id, post_id))
                diff = -old_vote
            else:
                # Cambia voto
                cur.execute("UPDATE likes SET vote = %s WHERE user_id = %s AND post_id = %s", (vote, user_id, post_id))
                diff = vote - old_vote
        else:
            # Nuovo voto
            if vote != 0:
                cur.execute("INSERT INTO likes (user_id, post_id, vote) VALUES (%s, %s, %s)", (user_id, post_id, vote))
                diff = vote
            else:
                diff = 0

        if diff != 0:
            cur.execute("UPDATE posts SET likes = likes + %s WHERE id = %s", (diff, post_id))
        
        conn.commit()
        
        # Recupera nuovo score e voto attuale dell'utente
        cur.execute("SELECT likes FROM posts WHERE id = %s", (post_id,))
        new_score = cur.fetchone()["likes"]
        
        cur.execute("SELECT vote FROM likes WHERE user_id = %s AND post_id = %s", (user_id, post_id))
        updated_vote = cur.fetchone()
        user_vote = updated_vote["vote"] if updated_vote else 0
        
        return {"new_score": new_score, "user_vote": user_vote}
    except Exception as e:
        print(f"Errore: {e}")
        return {"error": str(e)}, 400
    finally:
        cur.close()
        conn.close()

@app.route("/success")
def success():
    return "Registrazione completata! <a href='/access'>Accedi ora</a>"

if __name__ == "__main__":
    app.run(debug=True)
