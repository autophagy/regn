from flask import Flask, make_response, request, jsonify, abort
from datetime import datetime

application = Flask(__name__)

VALID_DURATIONS = ["day", "week", "month", "year"]
VALID_SENSOR_TYPES = ["temperature", "humidity", "pressure", "luminosity"]


@application.route("/")
def index():
    return "Hello!"


# REST-ish Endpoints
# Sensor Data Insertion


@application.route("/api/insert", methods=["POST"])
def insert():
    data = json.loads(request.data)
    print(data)
    return 201


# Sensor Data Retrieval

# Latest Values


@application.route("/api/latest", methods=["GET"])
def latest():
    return jsonify(
        {
            "latitude": 52.489,
            "longitude": 13.354,
            "temperature": 11.2,
            "humidity": 91,
            "pressure": 1012,
            "luminosity": 107,
        }
    )


# Specific Sensor Types


@application.route("/api/<string:sensor>/<string:duration>", methods=["GET"])
def sensorReadings(sensor, duration):
    if sensor not in VALID_SENSOR_TYPES or duration not in VALID_DURATIONS:
        abort(404)
    return "{} for duration: {}".format(sensor, duration)


@application.route("/api/<string:sensor>/<string:duration>/<int:ts>", methods=["GET"])
def sensorReadingsSinceTimestamp(sensor, duration, ts):
    if sensor not in VALID_SENSOR_TYPES or duration not in VALID_DURATIONS:
        abort(404)

    dt = datetime.fromtimestamp(ts / 1000)
    return "{} for duration {} since timestamp: {}".format(
        sensor, duration, dt.strftime("%Y.%m.%d // %H.%M.%S")
    )


if __name__ == "__main__":
    application.run(host="0.0.0.0")
