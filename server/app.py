from flask import Flask, request, jsonify, abort, json
from datetime import datetime
from .schema import validate_schema
from .schema.sensor_insert import insert_sensor_schema
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc

VALID_DURATIONS = ["day", "week", "month", "year"]
VALID_SENSOR_TYPES = ["temperature", "humidity", "pressure", "luminosity"]

application = Flask(__name__)
application.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"
db = SQLAlchemy(application)


class SensorData(db.Model):
    __tablename__ = "sensordata"
    timestamp = db.Column(db.DateTime, primary_key=True)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    pressure = db.Column(db.Float)
    luminosity = db.Column(db.Integer)

    def dict(self):
        return {
            "timestamp": self.timestamp,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "pressure": self.pressure,
            "luminosity": self.luminosity,
        }


db.create_all()
db.session.commit()


@application.route("/")
def index():
    return "Hello!"


# REST-ish Endpoints
# Sensor Data Insertion


@application.route("/api/insert", methods=["POST"])
@validate_schema(insert_sensor_schema)
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


@application.route("/api/latest", methods=["GET"])
def latest():
    latest = db.session.query(SensorData).order_by(desc("timestamp")).first()
    return jsonify(latest.dict())


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
