// Code for IoTHamster
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiUdp.h>
#include <WiFiClientSecure.h>
#include <SPI.h>
#include <FS.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <ArduinoJson.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

#define SCAN_PERIOD 5000
long lastScanMillis;

// NTP setup
# define NTP_OFFSET 0
# define NTP_INTERVAL 60 * 1000
# define NTP_ADDRESS "ntp0.nl.net"

// Inital configs
struct Config {
  char mqtt_host[64];
  char mqtt_password[64];
  char mqtt_username[64];
  int mqtt_port;
  char wifi_ssid[64];
  char wifi_password[64];
};
Config config;

String deviceName = "iotdevice";
String clientMac = "";
String clientId = deviceName;
String ssids = "";
boolean listenRfid = true;
boolean wifi_softmode = false;
boolean wifi_connected_before = false;
String getContentType(String filename); // convert the file extension to the MIME type
bool handleFileRead(String path);       // send the right file to the client (if it exists)
unsigned char mac[6];

String macToStr(const uint8_t* mac) {
  String result;
  for (int i = 0; i < 6; ++i) {
  result += String(mac[i], 16);
  }
  return result;
}

// Inits
ESP8266WiFiMulti WiFiMulti;
WiFiClientSecure espClient;
PubSubClient client(espClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, NTP_ADDRESS, NTP_OFFSET, NTP_INTERVAL);
ESP8266WebServer server(80);

// Main Setup
void setup() {
  Serial.begin(115200);
  SPI.begin();

  // Start SPIFFS
  if (!SPIFFS.begin()) {
    Serial.println("Failed to mount file system");
    ESP.deepSleep(0);
  }
  delay(1000);

  // Load config
  loadConfig(config);
  delay(100);

  Serial.println("Start ntp service");
  timeClient.begin();
  delay(200);
  configTime(8 * 3600, 0, NTP_ADDRESS);
  delay(200);

  // Create unique clientID
  WiFi.macAddress(mac);
  clientMac += macToStr(mac);
  clientId = deviceName + '_' + clientMac;
  Serial.println(clientId);

  // Connect wifi
  Serial.println("Start connect WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(config.wifi_ssid, config.wifi_password);
  connectWifi();
  delay(200);

  if (!MDNS.begin(deviceName)) {
    Serial.println("Error setting up MDNS responder!");
  }
  Serial.print("mDNS responder started at ");
  Serial.println(deviceName);

  // Set SSL certs
  loadCerts();
  delay(200);

  // Connect MQTT broker
  client.setServer(config.mqtt_host, config.mqtt_port);
  client.setCallback(callback);
}

void loadConfig(Config & config) {
  Serial.println("Loading config...");
  File configFile = SPIFFS.open("/config.json", "r");
  if (!configFile) {
    Serial.println("Failed to open config file");
    return;
  }

  // Don't forget to change the capacity to match your requirements.
  StaticJsonDocument <1024> doc;

  DeserializationError error = deserializeJson(doc, configFile);
  if (error) {
    Serial.println(F("Failed to read file, using default configuration"));
    ESP.deepSleep(0);
  }

  strlcpy(config.wifi_ssid, doc["wifi_ssid"], sizeof(config.wifi_ssid));
  strlcpy(config.wifi_password, doc["wifi_password"], sizeof(config.wifi_password));
  strlcpy(config.mqtt_host, doc["mqtt_host"], sizeof(config.mqtt_host));
  config.mqtt_port = doc["mqtt_port"];
  strlcpy(config.mqtt_username, doc["mqtt_username"], sizeof(config.mqtt_username));
  strlcpy(config.mqtt_password, doc["mqtt_password"], sizeof(config.mqtt_password));

  configFile.close();
  Serial.println("Config loaded!");
  WiFiMulti.addAP(doc["wifi_ssid"], doc["wifi_password"]);
}

void setupMode() {
  Serial.println("SETUP MODE!");
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_AP);
  delay(1000);
  wifi_softmode = true;
  WiFi.softAP(clientId.c_str(), deviceName + "1234");
  Serial.print("Access Point ");
  Serial.print(clientId);
  Serial.println(" started");

  Serial.print("IP address:\t");
  Serial.println(WiFi.softAPIP());

  server.on("/networks", HTTP_GET, [ssids]() {
    server.send(200, "text/plain", ssids);
  });


  server.onNotFound([]() {
    if (!handleFileRead(server.uri())) {
      server.send(404, "text/plain", "404: Not Found");
    }
  });
  
  server.on("/send", HTTP_POST, []() {
    StaticJsonDocument <1024> doc;
    doc["mqtt_port"] = server.arg("mqtt_port");
    doc["mqtt_host"] = server.arg("mqtt_host");
    doc["mqtt_username"] = server.arg("mqtt_username");
    doc["mqtt_password"] = server.arg("mqtt_password");
    doc["wifi_ssid"] = server.arg("wifi_ssid");
    doc["wifi_password"] = server.arg("wifi_password");

    File file = SPIFFS.open("/config.json", "w");

    if (!file) {
      Serial.println("Error opening config file for writing");
      ESP.deepSleep(0);
    }
    
    serializeJson(doc, file);
    
    Serial.println("Config file was written");
    file.close();
    
    WiFi.mode(WIFI_OFF);
    delay(1000);
    WiFi.mode(WIFI_STA);

    // Connect wifi
    Serial.println("Start connect WiFi");
    WiFi.mode(WIFI_STA);
    WiFi.begin(server.arg("wifi_ssid"), server.arg("wifi_password"));
    connectWifi();
  });

  server.begin();
  Serial.println("HTTP server started");
}

// Load SSL Certificates
void loadCerts() {
  // Load CA file from SPIFFS
  File ca = SPIFFS.open("/ca.der", "r");
  if (!ca) {
    Serial.println("Failed to open ca ");
    ESP.deepSleep(0);
  }

  // Set server CA file
  if (!espClient.loadCACert(ca)) {
    Serial.println("ca failed");
    ESP.deepSleep(0);
  }
}

void connectWifi() {
  int Attempt = 0;
  while (WiFiMulti.run() != WL_CONNECTED) {
    if (digitalRead(0) == 0) {
      setupMode();
      return;
    }
  
    Attempt++;
    if (Attempt == 12 && wifi_connected_before == false) {
      Serial.println("");
      Serial.println("Too much reconnect retries, going into softAP mode");
      setupMode();
      return;
    }

    Serial.print(" trying to connect...");
    delay(500);
  }

  if (wifi_connected_before == false) {
    wifi_connected_before = true;
  
    randomSeed(micros());
  
    Serial.print("Connected WiFi to ");
    Serial.println(WiFi.SSID());
    Serial.print("local IP: ");
    Serial.println(WiFi.localIP());
  }
}

void loop() {
  long currentMillis = millis();
  
  if (wifi_softmode) { 
    server.handleClient();
    return;
  }
  
  // Make sure wifi is connected
  connectWifi();

  // Make sure mqtt broker is connected
  if (!client.connected()) {
    connectMqtt();
  }

  // Needs to be called else the broker gives a timeout to the client esp
  client.loop();

  // Do we even need to keep updating time??
  // timeClient.update();

  // Do some other st00f?

  // trigger Wi-Fi network scan
  if (currentMillis - lastScanMillis > SCAN_PERIOD) {
    WiFi.scanNetworks(true);
    Serial.print("\nScan start ... ");
    lastScanMillis = currentMillis;
  }
  
  int n = WiFi.scanComplete();
  if(n >= 0) {
    Serial.printf("%d network(s) found\n", n);
    for (int i = 0; i < n; i++)
    {
      ssids = ssids + "["+ WiFi.SSID(i).c_str() + "][" + WiFi.RSSI(i) + "],";
      Serial.printf("%d: %s, Ch:%d (%ddBm) %s\n", i+1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i), WiFi.encryptionType(i) == ENC_TYPE_NONE ? "open" : "");
    }
    WiFi.scanDelete();
  }
}

String getContentType(String filename) { // convert the file extension to the MIME type
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".png")) return "image/png";
  return "text/plain";
}

bool handleFileRead(String path) { // send the right file to the client (if it exists)
  Serial.println("handleFileRead: " + path);
  if (path.endsWith("/")) path += "index.html";         // If a folder is requested, send the index file
  String contentType = getContentType(path);            // Get the MIME type
  if (SPIFFS.exists(path)) {                            // If the file exists
    File file = SPIFFS.open(path, "r");                 // Open it
    size_t sent = server.streamFile(file, contentType); // And send it to the client
    file.close();                                       // Then close the file again
    return true;
  }
  Serial.println("\tFile Not Found");
  return false;                                         // If the file doesn't exist, return false
}

void callback(char * topic, byte * payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char) payload[i]);
  }
  Serial.println();
  
  if ((char) payload[0] == 'r' && (char) payload[1] == 'e' && (char) payload[2] == 's' && (char) payload[3] == 't' && (char) payload[4] == 'a' && (char) payload[5] == 'r' && (char) payload[6] == 't') {
    ESP.restart();
  }
}

void connectMqtt() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }
  int Attempt = 0;
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(config.mqtt_host);
    Serial.print(" as ");
    Serial.print(clientId.c_str());
    Serial.print(" with username ");
    Serial.print(config.mqtt_username);
    Serial.print(" and password ");
    Serial.print(config.mqtt_password);
    Serial.print(" ...");

    if (digitalRead(0) == 0) {
      setupMode();
      return;
    }
    
    if (client.connect(clientId.c_str(), (char *) config.mqtt_username, (char *) config.mqtt_password)) {
      Serial.println("Connected!");
      if (!espClient.verifyCertChain(config.mqtt_host)) {
        Serial.println("ERROR: certificate verification failed!");
        ESP.deepSleep(0);
      }
      client.subscribe("frontdoor/action");
    } else {
      Serial.print("failed, rc=");
      Attempt++;
      Serial.print(client.state());
      Serial.println(" try again in 2 sec");
      if (Attempt >= 10) {
        Attempt = 0;
        delay(4000);
      }
      delay(2000);
    }
  }
}
