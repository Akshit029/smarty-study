from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

app = Flask(__name__)
model_path = 'model.pkl'

# Initialize a dummy model if none exists to bootstrap the prediction engine
if not os.path.exists(model_path):
    # Dummy features: time_of_day (hour), duration_minutes, mood (1-10), distraction (1-10)
    dummy_X = np.array([[8, 60, 8, 2], [14, 120, 5, 8], [20, 30, 9, 1]]) 
    dummy_y = np.array([85, 40, 95]) # Expected efficiency score out of 100
    model = LinearRegression()
    model.fit(dummy_X, dummy_y)
    joblib.dump(model, model_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        features = np.array([[
            data['time_of_day'], 
            data['duration_minutes'], 
            data['mood'], 
            data['distraction_level']
        ]])
        model = joblib.load(model_path)
        prediction = model.predict(features)
        
        # Clamp score between 0 and 100
        score = min(100, max(0, float(prediction[0])))
        return jsonify({'predicted_efficiency_score': round(score, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/train', methods=['POST'])
def train():
    data = request.json
    try:
        logs = data['logs']
        df = pd.DataFrame(logs)
        X = df[['time_of_day', 'duration_minutes', 'mood', 'distraction_level']]
        y = df['efficiency_score']
        
        model = LinearRegression()
        model.fit(X, y)
        joblib.dump(model, model_path)
        
        return jsonify({'message': 'Model trained successfully on new user logs'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
