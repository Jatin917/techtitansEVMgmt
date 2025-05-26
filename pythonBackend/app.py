from flask import Flask, request, jsonify
import pickle
import numpy as np
from geopy.distance import geodesic
import pandas as pd
from model import ChargingStationOptimizer
from flask_cors import CORS
import os

# Load the trained model
with open("svm_ev_anomaly_model.pkl", "rb") as file:
    model1 = pickle.load(file)

with open('charging_station_model.pkl', 'rb') as f:
    model = pickle.load(f)

model.cluster_analysis()

app = Flask(__name__)
CORS(app)  # Allow all origins


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
    prediction = model1.predict(np.array([[diff_percent]]))[0]
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


@app.route('/predict', methods=['POST'])
def stations_predict():
    """Endpoint for getting optimal locations"""
    try:
        # Get parameters from request
        data = request.json
        n_locations = data.get('n_locations', 5)
        min_distance_km = data.get('min_distance_km', 1.5)
        
        # Get predictions
        results = model.get_optimal_locations(n_locations, min_distance_km)
        
        # Convert to JSON-serializable format
        output = results[['latitude', 'longitude', 'placement_score']].to_dict('records')
        # with open('charging_station_model.pkl', 'wb') as f:
        # pickle.dump(model, f)
        return jsonify({
            'status': 'success',
            'predictions': output
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/add_station', methods=['POST'])
def add_station():
    """Endpoint for adding new stations"""
    try:
        data = request.json
        lat = float(data['latitude'])
        lon = float(data['longitude'])
        
        # Update model
        updated_locations = model.add_station(lat, lon)
        
        # Return updated predictions
        output = updated_locations[['latitude', 'longitude', 'placement_score']].to_dict('records')

        return jsonify({
            'status': 'success',
            'message': 'Station added successfully',
            'updated_predictions': output
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use the PORT environment variable if available
    app.run(host='0.0.0.0', port=port, debug=True)
