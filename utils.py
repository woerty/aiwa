import os
import re
from PyPDF2 import PdfReader
from app import app, db
from models import User
import openai
from app import login_manager
from flask_login import UserMixin


# User loader for Flask-Login
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
    return extract_text_from_pdf(file_path)

def process_workflow_steps(steps, current_user):
    results = {}
    file_regex = r'🗄️(\S+)'  # Regex to find file symbols and extract the filename
    output_regex = r'📄(\S+)'  # Regex to find output symbols and extract the output ID

    for step in steps:
        prompt = step['text']

        # Replace output references (📄) with actual output from previous steps
        output_matches = re.findall(output_regex, prompt)
        for output_id in output_matches:
            if output_id in results:
                prompt = prompt.replace(f"📄{output_id}", results[output_id])
            else:
                prompt = prompt.replace(f"📄{output_id}", f"[Output {output_id} not found]")

        # Find all file references in the prompt (🗄️)
        file_matches = re.findall(file_regex, prompt)
        for file_name in file_matches:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)

            if os.path.exists(file_path):
                _, file_extension = os.path.splitext(file_path)
                if file_extension.lower() == '.pdf':
                    file_content = process_pdf(file_path)
                else:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        file_content = file.read()

                prompt = prompt.replace(f"🗄️{file_name}", file_content)
            else:
                prompt = prompt.replace(f"🗄️{file_name}", f"[File {file_name} not found]")

        # Call OpenAI or any other processing service
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ]

        openai.api_key = current_user.api_key
        response = openai.chat.completions.create(
            model="gpt-4o-mini", messages=messages, max_tokens=1000
        )
        output = response.choices[0].message.content.strip()

        results[step['outputId']] = output

    return list(results.values())
