import openai
import dotenv  
dotenv.load_dotenv()

def generate_reply(customer_email, context):
    system_prompt = (
        "You are a customer support assistant. Draft a reply using ONLY the provided "
        "Ground Truth Context. If the context doesn't contain the answer, say you need to escalate."
    )
    user_content = f"Context:\n{context}\n\nEmail:\n{customer_email}"
    
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        temperature=0.0 # Lowest temperature ensures strict adherence to context
    )
    return response.choices[0].message.content