import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert data['modelVersion'].startswith('geoguard-v')
    assert data['datasetSource'] == 'dataset_fixed'
    assert len(data['datasetFingerprints']) == 15
    assert 'Panamax' in data['evaluationMetrics']

def test_predict(client):
    res = client.post('/predict', json={'vesselClass': 'Panamax', 'horizonWeeks': 8, 'baseRate': 14.20})
    assert res.status_code == 200
    data = res.get_json()
    assert 'currentRatePerTon' in data
    assert 'fourWeekForecastPerTon' in data
    assert 'eightWeekForecastPerTon' in data
    assert len(data['timeSeries']) > 0
    assert 'confidenceLower' in data['timeSeries'][-1]
    assert 'confidenceUpper' in data['timeSeries'][-1]

def test_anomaly_nominal(client):
    res = client.post('/anomaly', json={'rates': [14.0, 14.1, 14.2], 'bunkerPrices': [615.0, 618.0, 620.0], 'congestionHours': 24.0})
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'NORMAL'
    assert data['anomalyDetected'] is False

def test_anomaly_warning(client):
    res = client.post('/anomaly', json={'rates': [14.0, 22.0, 35.0], 'bunkerPrices': [600.0, 750.0, 950.0], 'congestionHours': 168.0})
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'WARNING'
    assert data['anomalyDetected'] is True

def test_anomaly_missing_telemetry(client):
    res = client.post('/anomaly', json={})
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'UNAVAILABLE'

def test_monte_carlo(client):
    res = client.post('/simulate', json={'baseCost': 21.15, 'scenarioCount': 1000})
    assert res.status_code == 200
    data = res.get_json()
    assert data['scenarioCount'] == 1000
    assert 'valueAtRisk95' in data
    assert 'conditionalValueAtRisk95' in data
    assert len(data['distribution']) == 7

def test_contract_optimization(client):
    res = client.post('/optimize', json={'planningDurationMonths': 12, 'riskTolerance': 'Moderate', 'totalQuantityMT': 600000, 'expectedSpot': 23.00})
    assert res.status_code == 200
    data = res.get_json()
    assert data['mixAllocation'] == '60% Medium-Term / 40% Spot'
    assert len(data['strategies']) == 4

def test_vessel_port_compatibility(client):
    res = client.post('/compatibility', json={'originMaxDraft': 18.0, 'destMaxDraft': 14.5, 'destMaxLoa': 260.0})
    assert res.status_code == 200
    data = res.get_json()
    assert len(data['feasibility']) == 4

def test_explain(client):
    res = client.post('/explain', json={'vesselClass': 'Panamax'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'factors' in data
    assert 'plainEnglishRationale' in data
    assert len(data['factors']) > 0
