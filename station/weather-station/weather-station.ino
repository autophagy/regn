/*
  Regn :: Weather Station

  @version    0.1.0
  @author     Mika Naylor [Autophagy] :: http://autophagy.io/
  @hardware   Mika Naylor [Autophagy] :: http://autophagy.io/

  @description
  A client that reads temp, humidity, atmospheric pressure and
  luminosity at 10 minute intervals. POSTs these readings at a
  predefined endpoint, running the Regn server.

  Implementation Details :: https://github.com/Autophagy/regn
*/

// Libraries
#include <DHT.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>
#include <Adafruit_BMP085_U.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

// Constants
#define DHTPIN 12 // DHT22 connected to pin 12
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_LOW, 12345);
Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);

// Connectivity
const char* ssid = "ssid";
const char* password = "password";

const char* host = "https://regn-weather.herokuapp.com/api/insert";
const char* fingerprint = "08 3B 71 72 02 43 6E CA ED 42 86 93 BA 7E DF 81 C4 BC 62 30";
const char* api_key = "apikey";


// Variables
bool DEBUG = true; // Set to true to output sensor information to the Serial port.

long sensor_interval = 600000; // 10 minutes
float temperature;
float humidity;
float pressure;
float lux;

void setup() {

  if (DEBUG) {
    Serial.begin(115200);
  }

  dht.begin();
  tsl.enableAutoRange(true);
  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_13MS);
  bmp.begin();

  if (DEBUG) {
    Serial.print("Connecting to ");
    Serial.println(ssid);
  }

  WiFi.begin(ssid, password);

  if (DEBUG) {
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Netmask: ");
    Serial.println(WiFi.subnetMask());
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
  }
}

void loop() {
  temperature = getTemperature();
  humidity = getHumidity();
  pressure = getPressure();
  lux = getLux();

  if (DEBUG) {
    outputDebugInfo();
  }

  // POST sensor readings to endpoint
  StaticJsonBuffer<300> JSONbuffer;
  JsonObject& JSONencoder = JSONbuffer.createObject();
  JSONencoder["temperature"] = temperature;
  JSONencoder["humidity"] = humidity;
  JSONencoder["pressure"] = pressure;
  JSONencoder["luminosity"] = lux;
  char JSONmessageBuffer[300];
  JSONencoder.prettyPrintTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));

  if (DEBUG) {
    Serial.println("JSON Data:");
    Serial.println(JSONmessageBuffer);
  }

  int code = -1;
  HTTPClient http;
  while(code != 201) {
    http.begin(host, fingerprint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", api_key);
    code = http.POST(JSONmessageBuffer);

    if (DEBUG) {
      Serial.println(code);
      Serial.println(http.getString());
    }

    http.end();
    delay(1000);
  }

  // Delay by sensor_interval for each read

  delay(sensor_interval);
}

// Returns the temperature reading from the DHT22 sensor
float getTemperature() {
  return dht.readTemperature();
}

// Returns the humidity reading from the DHT22 sensor
float getHumidity() {
  return dht.readHumidity();
}

// Returns the pressure reading from the BMP180 sensor
float getPressure() {
  sensors_event_t event;
  bmp.getEvent(&event);
  return event.pressure;
}

// Returns the lux reading from the TSL2561 sensor
float getLux() {
  sensors_event_t event;
  tsl.getEvent(&event);
  return event.light;
}

// Prints sensor info out to Serial for debugging purposes
void outputDebugInfo() {
  Serial.println("------------------------------------");

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" *C");

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %\t");

  Serial.print("Barometric pressure: ");
  Serial.print(pressure);
  Serial.println(" hPa");

  Serial.print("Luminosity: ");
  Serial.print(lux);
  Serial.println(" lux");

  Serial.println("------------------------------------");
}
