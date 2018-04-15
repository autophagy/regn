from . import db
from calendar import timegm


class SensorData(db.Model):
    __tablename__ = "sensordata"
    timestamp = db.Column(db.DateTime, primary_key=True)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    pressure = db.Column(db.Float)
    luminosity = db.Column(db.Integer)

    def dict(self):
        return {
            "timestamp": timegm(self.timestamp.utctimetuple()) * 1000,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "pressure": self.pressure,
            "luminosity": self.luminosity
        }
