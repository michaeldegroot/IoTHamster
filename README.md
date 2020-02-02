# IoTHamster

![](logo.png)

![](https://i.imgur.com/wC8Gzra.gif)

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
