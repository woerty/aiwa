from flask import request, jsonify
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from models import User, Prompt, Workflow
from utils import process_workflow_steps, process_pdf
import os

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    api_key = data.get('api_key')

    if not username or not password or not api_key:
        return jsonify({"error": "All fields (username, password, api_key) are required"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password, api_key=api_key)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/submit", methods=["POST"])
@login_required
def submit():
    data = request.get_json()
    prompt = data.get("prompt")
    messages = [
        {"role": "system", "content": "you are a helpful assistant"},
        {"role": "user", "content": prompt},
    ]

    if current_user.api_key:
        api_key = current_user.api_key
    else:
        api_key = request.form["api_key"]
        current_user.api_key = api_key
        db.session.commit()

    openai.api_key = api_key

    response = openai.chat.completions.create(
        model="gpt-4o-mini", messages=messages, max_tokens=1000
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

@app.route('/get_workflows', methods=['GET'])
@login_required
def get_workflows():
    try:
        workflows = Workflow.query.filter_by(user_id=current_user.id).all()
        workflows_data = [
            {
                "id": w.id,
                "name": w.name,
                "description": w.description,
                "steps": w.steps,
                "timestamp": w.timestamp
            }
            for w in workflows
        ]
        return jsonify(workflows_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_workflow', methods=['POST'])
@login_required
def create_workflow():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    steps = data.get('steps')  # Steps as JSON string
    
    if not name or not steps:
        return jsonify({"error": "Name and steps are required"}), 400
    
    new_workflow = Workflow(user_id=current_user.id, name=name, description=description, steps=steps)
    db.session.add(new_workflow)
    db.session.commit()
    
    return jsonify({"message": "Workflow created successfully", "workflow_id": new_workflow.id}), 201

@app.route('/process', methods=['POST'])
def process_workflow():
    try:
        data = request.json
        steps = data.get('steps', [])
        results = process_workflow_steps(steps, current_user)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list_files', methods=['GET'])
@login_required
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
        return jsonify(files), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_file', methods=['POST'])
@login_required
def delete_file():
    data = request.get_json()
    filename = data.get('filename')

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File does not exist"}), 404

    try:
        os.remove(file_path)
        return jsonify({"message": "File deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
