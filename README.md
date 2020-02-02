# IoTHamster

![](https://i.imgur.com/wC8Gzra.gif)

Service software for centralizing your IoT devices, brings your devices together in a modern, fast and secure environment. Features device health uptime checks, push notifications, IFTTT, data encryption at rest. All linked up with your external or internal local MQTT broker. 

### Start frontend

```bash
cd client

# First time dep install
npm i

# Spin up webpack dev server
npm run start
```

### Start backend

```bash
cd api

# First time dep install
npm i

# Create certs
cd certs
cd express
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certificate.key -out certificate.crt
cd ../
cd mqtt

# This should be the certificate from MQTT
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certificate.key -out certificate.crt

# Normal
DEBUG=iothamster* node app.js
```
