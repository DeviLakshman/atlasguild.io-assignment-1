import requests

API_URL = "https://api-inference.huggingface.co/models/google/gemma-1.1-2b-it"
headers = {"Authorization": "Bearer Enter_your_huddingface_API_KEY_here"}
 
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

prompt = ""

with open("outputs/prompt.txt", "r") as file:
    prompt = file.read().strip()

output = query({"inputs": prompt})

# Extract and clean response
generated_text = output[0]['generated_text']

# Remove the original prompt text from generated_text
clean_response = generated_text.replace(prompt, "").strip()


# print("LLM Response:", clean_response)
with open("outputs/result.txt","w") as file :
    file.write(clean_response)

print("got result from LLM")
