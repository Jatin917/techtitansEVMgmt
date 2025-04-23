import json
from datetime import datetime
from flask import Flask, jsonify

app = Flask(_name_)

# Simulate charge point details
charge_point_id = "CP_001"
charge_point_model = "Wallbox XYZ"
charge_point_vendor = "aNewOne"
connector_count = 2

# Simulated data for various functionalities
boot_notification_data = {
    "chargePoint": {
        "model": charge_point_model,
        "vendorName": charge_point_vendor
    },
    "reason": "PowerUp"
}

heartbeat_data = {
    "chargePoint": charge_point_id,
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

charging_status = {
    "chargePoint": charge_point_id,
    "status": "Charging",
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

transaction_details = {
    "transactionId": "TXN001",
    "startTime": datetime.utcnow().isoformat() + "Z",
    "endTime": None,
    "energyUsed": 15.5,  # kWh
    "amount": 10.5  # USD
}

charging_configuration = {
    "chargePoint": charge_point_id,
    "maxCurrent": 32,  # Amps
    "voltage": 230,  # Volts
    "connectorTypes": ["Type2", "CCS"]
}

connectors = [
    {"connectorId": 1, "status": "Available", "type": "Type2"},
    {"connectorId": 2, "status": "Occupied", "type": "CCS"}
]


# Dummy BootNotification payload
def send_boot_notification():
    print(f"Sending BootNotification: {boot_notification_data}")
    return boot_notification_data


# Dummy Heartbeat payload
def send_heartbeat():
    print(f"Sending Heartbeat: {heartbeat_data}")
    return heartbeat_data


@app.route('/')
def index():
    return "Dummy Charge Point Simulator is running!"


@app.route('/send-boot-notification', methods=['GET'])
def boot_notification():
    return jsonify(send_boot_notification())


@app.route('/send-heartbeat', methods=['GET'])
def heartbeat():
    return jsonify(send_heartbeat())


@app.route('/get-boot-notification', methods=['GET'])
def get_boot_notification():
    return jsonify({
        "status": "Accepted",
        "currentTime": datetime.utcnow().isoformat() + "Z",
        "interval": 10,
        "chargePoint": {
            "model": charge_point_model,
            "vendorName": charge_point_vendor
        },
        "reason": "PowerUp"
    })


@app.route('/get-heartbeat', methods=['GET'])
def get_heartbeat():
    return jsonify({
        "status": "OK",
        "chargePoint": charge_point_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })


@app.route('/get-status', methods=['GET'])
def get_status():
    return jsonify({
        "chargePoint": charge_point_id,
        "status": charging_status['status'],
        "timestamp": charging_status['timestamp']
    })


@app.route('/get-transaction', methods=['GET'])
def get_transaction():
    return jsonify(transaction_details)


@app.route('/get-configuration', methods=['GET'])
def get_configuration():
    return jsonify(charging_configuration)


@app.route('/get-connectors', methods=['GET'])
def get_connectors():
    return jsonify(connectors)


if _name_ == '_main_':
    app.run(host='0.0.0.0', port=5050, debug=True)