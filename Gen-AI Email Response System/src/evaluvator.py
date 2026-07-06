import json
import openai
from dotenv import load_dotenv

import numpy as np

def get_embedding(text, model="text-embedding-3-small"):
    response = openai.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

def calculate_similarity(reply_embedding, ideal_embedding):
    # Standard Cosine Similarity formula
    return np.dot(reply_embedding, ideal_embedding) / (np.linalg.norm(reply_embedding) * np.linalg.norm(ideal_embedding))
load_dotenv()

def evaluate_response(context, generated_reply):
    eval_prompt = f"""
    You are an AI Quality Auditor. Rate the Factual Accuracy of the Generated Reply against the Ground Truth Context.
    Factual Accuracy means the reply contains ZERO information not explicitly found in or implied by the Context.
    
    Context: {context}
    Generated Reply: {generated_reply}
    
    Return ONLY a JSON object matching this schema:
    {{
        "accuracy_score": <int between 0 and 100>,
        "hallucination_detected": <true/false>,
        "reasoning": "<string summary>"
    }}
    """
    
    response = openai.chat.completions.create(
        model="gpt-4o", # Use a smarter model for the grading process
        messages=[{"role": "user", "content": eval_prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)