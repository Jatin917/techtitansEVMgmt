from flask import Flask, request, jsonify
import pickle
import numpy as np

# Load the trained model
with open("svm_ev_anomaly_model.pkl", "rb") as file:
    model = pickle.load(file)

app = Flask(__name__)

@app.route("/anomaly/predict", methods=["POST"])
def predict():
    data = request.json
    input_energy = data.get("input_energy")
    output_energy = data.get("output_energy")

    if input_energy == 0:
        return jsonify({"error": "Input energy cannot be zero."}), 400

    # Calculate percentage difference
    diff_percent = ((input_energy - output_energy) / input_energy) * 100

    # Predict using the model
    prediction = model.predict(np.array([[diff_percent]]))[0]
    if prediction == 0:
        status = "normal"
    elif prediction == 1:
        status = "Suspecious"
    else: 
        status = "Anomaly"

    return jsonify({
        "input_energy": input_energy,
        "output_energy": output_energy,
        "percentage_difference": round(diff_percent, 2),
        "status": status
    })

if __name__ == "__main__":
    app.run(debug=True)
