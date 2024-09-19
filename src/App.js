import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Row, Col, Alert, Spin, Switch } from 'antd';
import './App.css';
import MapComponent from './MapComponent';
import debounce from 'lodash.debounce';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const fetchWeatherData = debounce(async (query, setWeather, setError, setLoading) => {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=3`;

  setLoading(true);
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      setWeather(data);
      setError('');
    } else {
      setWeather(null);
      setError(data.error?.message || 'Invalid location or no data available.');
    }
  } catch (err) {
    setError('Error fetching data.');
    setWeather(null);
  } finally {
    setLoading(false);
  }
}, 500);

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleSubmit = (values) => {
    const { location } = values;
    if (location) {
      setQuery(location);
      fetchWeatherData(location, setWeather, setError, setLoading);
    } else {
      setError('Please enter a valid country or city.');
    }
  };

  const toggleTheme = (checked) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">
          <Title level={3} style={{ color: theme === 'light' ? '#1890ff' : '#fff' }}>Weather App</Title>
        </div>
        <div className="theme-toggle">
          <span style={{ color: theme === 'light' ? '#000' : '#fff', marginRight: '10px' }}>
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />
        </div>
      </Header>
      <Content style={{ padding: '0 50px', minHeight: '80vh' }}>
        <div className="site-layout-content">
          <Row justify="center" gutter={[16, 16]}>
            <Col xs={24} sm={20} md={16} lg={12}>
              <Card className="search-card" bordered={false}>
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Form.Item
                    label="Enter City or Country"
                    name="location"
                    rules={[{ required: true, message: 'Please enter a location!' }]}
                  >
                    <Input
                      placeholder="e.g., New York, London, Tokyo"
                      size="large"
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                      Search
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>

          {error && (
            <Row justify="center" gutter={[16, 16]}>
              <Col xs={24} sm={20} md={16} lg={12}>
                <Alert message={error} type="error" showIcon />
              </Col>
            </Row>
          )}

          {loading && (
            <Row justify="center" gutter={[16, 16]}>
              <Col>
                <Spin tip="Fetching weather data..." size="large" />
              </Col>
            </Row>
          )}

          {weather && (
            <>
              <Row justify="center" gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col xs={24} sm={20} md={16} lg={12}>
                  <Card className="weather-card" bordered={false}>
                    <Title level={4}>
                      {weather.location.name}, {weather.location.country}
                    </Title>
                    {weather.forecast.forecastday.map((day, index) => (
                      <div key={index} style={{ marginBottom: '20px' }}>
                        <Text strong>Date:</Text> {day.date}<br />
                        <Text strong>Temperature:</Text> {day.day.avgtemp_c}°C<br />
                        <Text strong>Condition:</Text> {day.day.condition.text}<br />
                        <img src={day.day.condition.icon} alt="Weather Icon" />
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
              <Row justify="center" gutter={[16, 16]}>
                <Col xs={24} sm={20} md={16} lg={12}>
                  <MapComponent lat={weather.location.lat} lon={weather.location.lon} />
                </Col>
              </Row>
            </>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Weather App ©2023 Created by Abdurakhim</Footer>
    </Layout>
  );
}

export default App;
