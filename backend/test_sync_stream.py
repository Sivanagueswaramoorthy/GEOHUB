import unittest
from fastapi.testclient import TestClient
import main
from routers.sync_router import broadcast_sync_event

class TestSyncStream(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(main.app)

    def test_sync_status(self):
        res = self.client.get("/api/sync/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("active_devices_connected", data)
        self.assertIn("capabilities", data)
        self.assertIn("sse_stream", data["capabilities"])

    def test_broadcast_without_subscribers(self):
        # Should execute safely without errors even if no clients are connected
        broadcast_sync_event("TEST_EVENT", {"hello": "world"})

    def test_sync_router_registered(self):
        res = self.client.get("/api/sync/status")
        self.assertEqual(res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
