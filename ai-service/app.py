# app.py
# AI Microservice - inapokea title + description ya lalamiko,
# inarudisha category iliyotabiriwa na urgency score.
#
# Endesha kwa: python app.py
# Itaendesha kwenye http://localhost:8000

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from urgency import score_urgency

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

model = None
vectorizer = None

if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("AI model loaded successfully.")
else:
    print("WARNING: model.pkl not found. Run 'python train_model.py' first.")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "AI service is running", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    if model is None or vectorizer is None:
        return jsonify({"success": False, "error": "Model not loaded. Train it first."}), 500

    data = request.get_json()
    title = data.get("title", "")
    description = data.get("description", "")

    if not title and not description:
        return jsonify({"success": False, "error": "title or description is required"}), 400

    combined_text = f"{title} {description}".strip()

    # Tabiri category
    vectorized_text = vectorizer.transform([combined_text])
    predicted_category = model.predict(vectorized_text)[0]

    # Tambua uzito (urgency)
    urgency_score, priority = score_urgency(combined_text)

    return jsonify({
        "success": True,
        "ai_category": predicted_category,
        "ai_urgency_score": urgency_score,
        "priority": priority,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)