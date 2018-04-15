import requests
import noise
from datetime import datetime, timedelta
from math import floor
from time import sleep
import random

s = 0.1
step = 0.01

while True:
    while s < 1 and s > 0:
        t1 = random.randint(0,10000000) / 10000000
        t2 = random.randint(0,10000000) / 10000000
        t3 = random.randint(0,10000000) / 10000000
        t4 = random.randint(0,10000000) / 10000000
        data = {"temperature": round(20 * t1, 1),
                "pressure": round(900 + (100*t2),1),
                "humidity": round(100 * t3, 1),
                "luminosity": floor(500 * t4)}
        print(data)
        requests.post("http://0.0.0.0:42069/api/insert",
                      json=data,
                      headers={"x-api-key": "development-token"})
        s += step
        sleep(1)
    step = step * -1
    s += step
