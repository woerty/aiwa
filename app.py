import openai
from flask import Flask, request, redirect, url_for, flash, jsonify
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config["SECRET_KEY"] = "420420420"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)


# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    api_key = db.Column(db.String(150), nullable=True)  # Store OpenAI key


class Prompt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    prompt_text = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route("/submit", methods=["POST"])
@login_required
def submit():
    data = request.get_json()
    prompt = data.get("prompt")
    messages = [
        {"role": "system", "content": "you are a helpful assistant"},
        {"role": "user", "content": prompt},
    ]

    # Use the current user's API key if already stored
    if current_user.api_key:
        api_key = current_user.api_key
    else:
        api_key = request.form["api_key"]
        # Optionally save the API key for future use
        current_user.api_key = api_key
        db.session.commit()

    # Set the OpenAI API key
    openai.api_key = api_key

    # Make request to OpenAI
    response = openai.chat.completions.create(
        model="gpt-4o-mini", messages=messages, max_tokens=100
    )
    response_text = response.choices[0].message.content.strip()

    return jsonify({"response": response_text})


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True})


@app.route("/check_login")
def check_login():
    if current_user.is_authenticated:
        return {"status": "logged_in"}
    else:
        return {"status": "not_logged_in"}, 401


@app.route("/api/user-info", methods=["GET"])
@login_required
def user_info():
    return jsonify({"username": current_user.username, "api_key": current_user.api_key})


@app.route("/save_prompt", methods=["POST"])
@login_required
def save_prompt():
    data = request.get_json()
    prompt_text = data.get("prompt")

    if not prompt_text:
        return jsonify({"error": "No prompt provided"}), 400

    new_prompt = Prompt(user_id=current_user.id, prompt_text=prompt_text)
    db.session.add(new_prompt)
    db.session.commit()

    return jsonify({"message": "Prompt saved successfully!"}), 200

@app.route('/delete_prompt/<int:prompt_id>', methods=['DELETE', 'OPTIONS'])
@login_required
def delete_prompt(prompt_id):
    if request.method == "OPTIONS":
        return "", 200
    prompt = Prompt.query.get(prompt_id)

    if not prompt or prompt.user_id != current_user.id:
        return jsonify({"error": "Prompt not found or unauthorized"}), 404

    db.session.delete(prompt)
    db.session.commit()

    return jsonify({"message": "Prompt deleted successfully"}), 200


@app.route("/get_prompts", methods=["GET"])
@login_required
def get_prompts():
    prompts = Prompt.query.filter_by(user_id=current_user.id).all()
    prompts_data = [
        {"id": p.id, "prompt_text": p.prompt_text, "timestamp": p.timestamp}
        for p in prompts
    ]

    return jsonify(prompts_data), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Creates the database and tables
    app.run(host="0.0.0.0", port=5000)
