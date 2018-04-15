insert_sensor_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "insert-sensor-schema",
    "description": "Schema for inserting new sensor readings",
    "type": "object",
    "properties": {
        "temperature": {
            "$id": "/properties/temperature",
            "type": "number",
            "title": "A temperature reading (in celsius)",
            "examples": [23.7],
        },
        "humidity": {
            "$id": "/properties/humidity",
            "type": "number",
            "title": "A humidity reading (in percentage)",
            "examples": [46.79],
        },
        "pressure": {
            "$id": "/properties/pressure",
            "type": "number",
            "title": "A pressure reading (in hPa)",
            "default": 0,
            "examples": [1010.6],
        },
        "luminosity": {
            "$id": "/properties/luminosity",
            "type": "integer",
            "title": "A luminosity reading (in lux)",
            "default": 0,
            "examples": [200],
        },
    },
    "required": ["temperature", "humidity", "pressure", "luminosity"],
}
