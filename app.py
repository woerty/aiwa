import openai
from flask import Flask, request, jsonify
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
import os
import re
from PyPDF2 import PdfReader

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config["SECRET_KEY"] = "420420420"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config['UPLOAD_FOLDER'] = 'uploads/'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    api_key = db.Column(db.String(150), nullable=True)

class Prompt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    prompt_text = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Thread(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('thread.id'), nullable=False)
    sender = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    steps = db.Column(db.Text, nullable=False)  # JSON string with steps
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def process_pdf(file_path):
    text = extract_text_from_pdf(file_path)
    return text

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
        # Fetch all workflows for the logged-in user
        workflows = Workflow.query.filter_by(user_id=current_user.id).all()
        # Format the workflows to return them as JSON
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

        # Function to process each step and look for file symbols
        results = process_workflow_steps(steps)  # Updated function to process the steps
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import re

def process_workflow_steps(steps):
    results = {}
    file_regex = r'🗄️(\S+)'  # Regex to find file symbols and extract the filename
    output_regex = r'📄(\S+)'  # Regex to find output symbols and extract the output ID

    for step in steps:
        prompt = step['text']

        # Replace output references (📄) with actual output from previous steps
        output_matches = re.findall(output_regex, prompt)
        for output_id in output_matches:
            if output_id in results:
                # Replace 📄{outputId} with the actual output from a previous step
                prompt = prompt.replace(f"📄{output_id}", results[output_id])
            else:
                prompt = prompt.replace(f"📄{output_id}", f"[Output {output_id} not found]")

        # Find all file references in the prompt (🗄️)
        file_matches = re.findall(file_regex, prompt)
        for file_name in file_matches:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)

            # Load the file content based on the file type
            if os.path.exists(file_path):
                _, file_extension = os.path.splitext(file_path)
                if file_extension.lower() == '.pdf':
                    file_content = process_pdf(file_path)
                else:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        file_content = file.read()

                # Replace 🗄️{filename} with the actual file content
                prompt = prompt.replace(f"🗄️{file_name}", file_content)
            else:
                prompt = prompt.replace(f"🗄️{file_name}", f"[File {file_name} not found]")

        # Call OpenAI or any other processing service
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ]

        openai.api_key = current_user.api_key  # Assuming OpenAI key is stored in current_user
        response = openai.chat.completions.create(
            model="gpt-4o-mini", messages=messages, max_tokens=1000
        )
        output = response.choices[0].message.content.strip()

        # Save the result for this step, so it can be used in later steps
        results[step['outputId']] = output

    return list(results.values())

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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
