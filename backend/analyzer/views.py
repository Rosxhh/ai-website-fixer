from rest_framework.decorators import api_view
from rest_framework.response import Response
@api_view(['POST'])
def chatbot_query(request):
    import google.generativeai as genai
    import json

    user_message = request.data.get('message', '')
    niche = request.data.get('niche', 'website')
    history = request.data.get('history', [])

    genai.configure(api_key="YOUR_API_KEY")
    model = genai.GenerativeModel("gemini-pro")

    # 🧠 Conversation memory
    conversation = ""
    for msg in history:
        role = msg.get("role", "")
        content = msg.get("content", "")
        conversation += f"{role}: {content}\n"

    prompt = f"""
You are a PROFESSIONAL AI WEBSITE DESIGN AGENT.

Website type: {niche}

Conversation:
{conversation}

User: {user_message}

Rules:
- NEVER repeat the same sentence
- Always give new useful response
- Be short and smart
- Act like a UI/UX expert

Behavior:
- If user says "yes", "ok", "go" → START_BUILD
- If analysis completed → PLAN_READY
- Otherwise → NORMAL CHAT

Respond ONLY in JSON:
{{
"text": "your response",
"action": "NONE | START_BUILD | PLAN_READY"
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean Gemini output
        text = text.replace("```json", "").replace("```", "").strip()

        try:
            parsed = json.loads(text)
        except:
            parsed = {
                "text": text,
                "action": "NONE"
            }

        return Response(parsed)

    except Exception as e:
        return Response({
            "text": "⚠️ AI error. Try again.",
            "action": "NONE"
        })