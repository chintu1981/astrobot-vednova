import os
import openai

def get_vedari_response(data):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    prompt = f"You are Vedari, a wise Vedic astrology AI. Help {data['name']} born on {data['date']} at {data['time']} in {data['place']}."
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return {"response": response['choices'][0]['message']['content']}
