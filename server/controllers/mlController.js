const axios = require('axios');

// @desc    Get prediction from Python Microservice
// @route   POST /api/ml/predict
// @access  Private
const getPrediction = async (req, res) => {
    try {
        const { time_of_day, duration_minutes, mood, distraction_level } = req.body;
        
        const response = await axios.post('http://127.0.0.1:5001/predict', {
            time_of_day,
            duration_minutes,
            mood,
            distraction_level
        });

        res.json(response.data);
    } catch (error) {
        console.error('ML Service Error:', error.message);
        res.status(500).json({ message: 'Error retrieving prediction from ML service' });
    }
};

module.exports = { getPrediction };
