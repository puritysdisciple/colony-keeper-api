#include <esp_now.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "ESPAsyncWebServer.h"
#include "AsyncTCP.h"
#include <ArduinoJson.h>
#include <Adafruit_AHTX0.h>
#include <HTTPClient.h>
#include <time.h>

const char* SERVER_NAME = "https://zcaxdd5l3a.execute-api.us-east-1.amazonaws.com/";

void setup () {
    setup_wifi();
    setup_time();
    setup_esp_now();
}

void loop () {

}

void setup_wifi (String ssid, String password) {
    log_d("MAC address %s", WiFi.softAPmacAddress());
    log_d("wifi connecting to %s with password %s", ssid, password);

    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(10);
    }

    log_i("wifi connected to %s on channel %i", ssid, WiFi.channel());
}

void setup_time () {
    configTime(0, 0, "pool.ntp.org");
}

void setup_esp_now () {
    if (esp_now_init() != ESP_OK) {
        log_e("failed to initialize ESP-NOW");

        return;
    }

    esp_now_register_send_cb(handleDataSent);
    esp_now_register_recv_cb(handle_data_received);
}

enum class MESSAGE_TYPE {
    PAIRING,
    DATA
};

void handle_data_received (const uint8_t *mac_address, const uint8_t *incoming_data, int length) {
    log_d("received %i bytes from %s", length, mac_to_string(mac_address));

    uint8_t type = incoming_data[0];

    log_d("incoming data type %i", type);

    if (type === MESSAGE_TYPE.PAIRING) {
        handle_pairing(mac_address, incoming_data, length);
        return;
    }

    if (type === MESSAGE_TYPE.DATA) {
        handle_incoming_data(mac_address, incoming_data, length);
        return;
    }
}

String mac_to_string (const uint8_t *mac_address) {
    char mac_string[18];

    snprintf(mac_string, sizeof(mac_string), "%02x:%02x:%02x:%02x:%02x:%02x", mac_address[0], mac_address[1], mac_address[2], mac_address[3], mac_address[4], mac_address[5]);

    return mac_string;
}

typedef struct PairingMessage {
    uint8_t message_type;
    uint8_t id;
    uint8_t mac_address[6];
    uint8_t channel;
};

void handle_pairing (const uint8_t *mac_address, const uint8_t *incoming_data, int length) {
    PairingMessage pairing_message;

    memcpy(&pairing_message, incoming_data, sizeof(pairing_data));

    log_i("pairing request received from %s on channel %i", mac_to_string(mac_address), pairing_message.channel);

    if (pairing_message.id <= 0) {
        log_e("pairing request received from the server");

        return;
    }

    if (pairing_message.message_type != MESSAGE_TYPE.PAIRING) {
        log_e("pairing request received with message_type %i", pairing_message.message_type);

        return;
    }

    log_d("sending pairing response to %s", mac_to_string(mac_address));

    esp_err_t result = esp_now_send(mac_address, (uint8_t *) &pairing_message, sizeof(pairing_message));

    if (result == ESP_OK) {
        log_d("pairing response sent successfully");
    } else {
        log_e("error sending pairing response");
    }

    add_peer(mac_address);
}

bool add_peer (const uint8_t *peer_address) {
    memset(&slave, 0, sizeof(slave));
    const esp_now_peer_info_t *peer = &slave;
    memcpy(slave.peer_addr, peer_address, 6);

    slave.channel = chan;
    slave.encrypt = 0;

    bool exists = esp_now_is_peer_exist(slave.peer_addr);

    if (exists) {
        log_d("already paired with %s", mac_to_string(peer_address));

        return true;
    }
    esp_err_t addStatus = esp_now_add_peer(peer);

    if (addStatus == ESP_OK) {
        log_i("successfully paired with %s", mac_to_string(peer_address));

        return true;
    }

    log_i("failed to paired with %s", mac_to_string(peer_address));

    return false;
}

typedef struct ReadingMessage {
    uint8_t message_type;//type of message either DATA or PAIRING
    uint8_t id;//BOARD_ID used to identify unique board Use for Sensor ID
    String sensor_id; // "Hub:" + mac
    String SampleDate; // Epoch of sample time
    float temperature;// Temperature data
    float humidity;// Humidity data
    unsigned int reading_id;// for setting LED on=1 0=off for Hive#
};

void handle_incoming_data (const uint8_t *mac_address, const uint8_t *incoming_data, int length) {
    ReadingMessage reading_message;

    memcpy(&reading_message, incoming_data, sizeof(reading_message));

    log_i("incoming reading from %s", mac_to_string(mac_address));

    send_reading_to_api(reading_message.sensor_id, reading_message.temperature, reading_message.humidity);
}

void send_reading_to_api (String sensor_id, float temperature, float humidity) {
    if (Wifi.status() != WL_CONNECTED) {
        log_e("attempting to send reading when WiFi is not connected");

        return;
    }

    WiFiClientSecure *client = new WiFiClientSecure;
    client->setInsecure();

    HTTPClient http;

    http.begin(*client, SERVER_NAME);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "PostmanRuntime/7.31.1");
    http.addHeader("Accept", "*/*");
    http.addHeader("Accept-Encoding", "gzip, deflate, br");
    http.addHeader("Connection", "keep-alive");

    DynamicJsonDocument post_payload(1024);

    post_payload["query"] = "mutation CreateDataPoint($input: [CreateDataPointInput]!) { createDataPoint(input: $input) { success }}";
    post_payload["variables"]["input"][0]["sensorId"] = sensor_id;
    post_payload["variables"]["input"][0]["timestamp"] = get_timestamp(); // Todo: figure out how to get current timestamp
    post_payload["variables"]["input"][0]["value1"] = temperature;
    post_payload["variables"]["input"][0]["value2"] = humidity;

    String payload_json = "";

    serializeJson(post_payload, payload_json);

    int response_code = http.POST(payload_json);

    if (response_code <= 0) {
        log_e("error sending reading to server; code: %i", response_code);
    }

    String response = http.getString();

    log_d("api responded with code %i", response_code);
    log_d("api response: %s", response);

    http.end();
}

unsigned long get_timestamp () {
    time_t now;
    struct tm time_info;

    if (!getLocalTime(&time_info)) {
        return 0;
    }

    time(&now);

    return now;
}