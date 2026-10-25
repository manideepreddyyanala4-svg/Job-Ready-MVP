import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from app.db import Base, get_db
from app.main import app
from sqlalchemy.orm import sessionmaker


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    def override():
        db = Session()
        try: yield db
        finally: db.close()
    app.dependency_overrides[get_db] = override
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()


def register(client, email="customer@example.com", role="customer"):
    return client.post("/auth/register", json={"email": email, "full_name": "Test User", "password": "password123", "role": role})


def test_register_login_and_profile(client):
    response = register(client)
    assert response.status_code == 201
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/users/me", headers=headers).json()["email"] == "customer@example.com"
    assert client.post("/customers/me", headers=headers, json={"address": "10 Main Street", "phone": "555"}).status_code == 200


def test_order_lifecycle_and_invalid_transition(client):
    response = register(client)
    headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
    client.post("/customers/me", headers=headers, json={"address": "10 Main Street"})
    order = client.post("/orders", headers=headers, json={"pickup_address": "A depot", "delivery_address": "B depot", "description": "Box"}).json()
    assert client.post(f"/orders/{order['id']}/transition", headers=headers, json={"status": "delivered"}).status_code == 409
    assert client.post(f"/orders/{order['id']}/transition", headers=headers, json={"status": "confirmed"}).status_code == 200


def test_bad_login_is_rejected(client):
    register(client)
    assert client.post("/auth/login", json={"email": "customer@example.com", "password": "wrongpass"}).status_code == 401
