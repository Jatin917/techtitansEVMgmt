from flask import Flask, request, jsonify
import pickle
import numpy as np
from geopy.distance import geodesic
import pandas as pd
from model import ChargingStationOptimizer

with open('charging_station_model.pkl', 'rb') as f:
    model = pickle.load(f)

model.cluster_analysis()
results = model.get_optimal_locations(n_locations = 5, min_distance_km = 1)
print (results)