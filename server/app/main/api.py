from flask import request, jsonify, abort, json, current_app
from datetime import datetime, timedelta
from calendar import timegm
from sqlalchemy import desc, asc
from functools import reduce, wraps
from math import ceil

from . import main
from .. import db
from ..schema import validate_schema
from ..schema.sensor_insert import insert_sensor_schema
from ..models import SensorData

VALID_DURATIONS = {
    "day": timedelta(days=1),
    "week": timedelta(weeks=1),
    "month": timedelta(days=30),
    "year": timedelta(days=365),
}
VALID_SENSOR_TYPES = {
    "temperature": SensorData.temperature,
    "humidity": SensorData.humidity,
    "pressure": SensorData.pressure,
    "luminosity": SensorData.luminosity,
}
COORDINATES = {"latitude": 52.489, "longitude": 13.354}


def require_api_key(view_function):

    @wraps(view_function)
    def decorated_function(*args, **kwargs):
        if request.headers.get("x-api-key") and request.headers.get(
            "x-api-key"
        ) == current_app.config[
            "API_KEY"
        ]:
            return view_function(*args, **kwargs)

        else:
            abort(401)

    return decorated_function


# REST-ish Endpoints
# Sensor Data Insertion


@main.route("/api/insert", methods=["POST"])
@validate_schema(insert_sensor_schema)
@require_api_key
def insert():
    data = json.loads(request.data)
    timestamp = datetime.utcnow()
    db_data = SensorData(
        timestamp=timestamp,
        temperature=data["temperature"],
        humidity=data["humidity"],
        pressure=data["pressure"],
        luminosity=data["luminosity"],
    )

    db.session.add(db_data)
    db.session.commit()
    return "", 201


# Sensor Data Retrieval

# Latest Values


@main.route("/api/latest", methods=["GET"])
def latest():
    latest_results = COORDINATES
    latest = db.session.query(SensorData).order_by(desc("timestamp")).first()
    if (latest is not None):
        latest_results.update(latest.dict())
    return jsonify(latest_results)


# Specific Sensor Types


@main.route("/api/<string:sensor>/<string:duration>", methods=["GET"])
@main.route("/api/<string:sensor>/<string:duration>/<int:datapoints>", methods=["GET"])
def sensorReadings(sensor, duration, datapoints=None):
    if sensor not in VALID_SENSOR_TYPES or duration not in VALID_DURATIONS:
        abort(404)
    now = datetime.utcnow()
    values = db.session.query(getattr(SensorData, sensor), SensorData.timestamp).filter(
        SensorData.timestamp >= now - VALID_DURATIONS[duration]
    ).order_by(
        asc("timestamp")
    ).all()
    # Average the result set by the amount of required datapoints
    values = list(
        map(
            lambda x: {"timestamp": timegm(x[1].utctimetuple()) * 1000, "value": x[0]},
            values,
        )
    )
    reduced_data = []
    if datapoints is not None and datapoints < len(values):
        chunk_size = ceil(len(values) / datapoints)
        reduced_data = []
        for i in range(0, datapoints):
            chunk = values[i * chunk_size:(i + 1) * chunk_size]
            if len(chunk) > 0:
                summed = reduce(
                    lambda x,
                    y: {
                        "timestamp": x["timestamp"] + y["timestamp"],
                        "value": x["value"] + y["value"],
                    },
                    chunk,
                )
                reduced_data.append(
                    {
                        "timestamp": summed["timestamp"] / len(chunk),
                        "value": summed["value"] / len(chunk),
                    }
                )
        values = reduced_data
    return jsonify(values)


@main.route("/api/<string:sensor>/<string:duration>/since/<int:ts>", methods=["GET"])
def sensorReadingsSinceTimestamp(sensor, duration, ts):
    if sensor not in VALID_SENSOR_TYPES or duration not in VALID_DURATIONS:
        abort(404)
    dt = datetime.utcfromtimestamp(ts / 1000)
    values = db.session.query(getattr(SensorData, sensor), SensorData.timestamp).filter(
        SensorData.timestamp > dt
    ).order_by(
        asc("timestamp")
    ).all()
    values = list(
        map(
            lambda x: {"timestamp": timegm(x[1].utctimetuple()) * 1000, "value": x[0]},
            values,
        )
    )
    return jsonify(values)
