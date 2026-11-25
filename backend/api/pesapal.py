import os
import requests


class PesapalService:
    def __init__(self):
        self.env = os.environ.get("PESAPAL_ENV", "sandbox").lower()
        if self.env == "live":
            self.base_url = "https://pay.pesapal.com/v3"
            self.consumer_key = os.environ.get("PESAPAL_CONSUMER_KEY")
            self.consumer_secret = os.environ.get("PESAPAL_CONSUMER_SECRET")
        else:
            self.base_url = "https://cybqa.pesapal.com/pesapalv3"
            self.consumer_key = os.environ.get("PESAPAL_CONSUMER_KEY") or "qkio1BGGYAXTuZaJG6AlcdA74pCmsa0J"
            self.consumer_secret = os.environ.get("PESAPAL_CONSUMER_SECRET") or "osGQIIXWOps84XN1wS18rL/EktI="

    def _get_headers(self, token=None):
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers

    def get_access_token(self):
        response = requests.post(
            f"{self.base_url}/api/Auth/RequestToken",
            json={"consumer_key": self.consumer_key, "consumer_secret": self.consumer_secret},
            headers=self._get_headers(),
            timeout=15,
        )
        if response.status_code == 200:
            return response.json().get("token")
        raise Exception(f"Failed to get Pesapal token: {response.text}")

    def register_ipn(self, url, ipn_notification_type="POST"):
        token = self.get_access_token()
        response = requests.post(
            f"{self.base_url}/api/URLSetup/RegisterIPN",
            json={"url": url, "ipn_notification_type": ipn_notification_type},
            headers=self._get_headers(token),
            timeout=15,
        )
        if response.status_code == 200:
            return response.json().get("ipn_id")
        raise Exception(f"Failed to register IPN: {response.text}")

    def submit_order(self, order_data):
        token = self.get_access_token()
        response = requests.post(
            f"{self.base_url}/api/Transactions/SubmitOrderRequest",
            json=order_data,
            headers=self._get_headers(token),
            timeout=15,
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Failed to submit order: {response.text}")

    def get_transaction_status(self, order_tracking_id):
        token = self.get_access_token()
        response = requests.get(
            f"{self.base_url}/api/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}",
            headers=self._get_headers(token),
            timeout=15,
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Failed to get transaction status: {response.text}")


pesapal_service = PesapalService()
