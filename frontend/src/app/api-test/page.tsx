'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ApiTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      console.log('Testing API call...');
      console.log('Base URL:', api.defaults.baseURL);
      console.log('Request URL:', `${api.defaults.baseURL}/auth/login`);
      
      // First, let's test if we can reach the backend at all
      const healthResponse = await fetch('http://192.168.1.15:3001/health');
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      const healthData = await healthResponse.json();
      console.log('Health check success:', healthData);
      
      // Now test the login endpoint
      const response = await api.post('/auth/login', { 
        email: 'test@example.com', 
        password: 'testpass' 
      });
      console.log('Success:', response.data);
      setResult(`Success!\n\nHealth: ${JSON.stringify(healthData)}\nLogin: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('API Error:', error);
      console.log('Error type:', typeof error);
      console.log('Error request:', error.request);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error config:', error.config);
      
      let errorDetails = `Error: ${error.message}\n\n`;
      errorDetails += `Type: ${typeof error}\n`;
      errorDetails += `Code: ${error.code}\n`;
      errorDetails += `Has request: ${!!error.request}\n`;
      errorDetails += `Has response: ${!!error.response}\n`;
      errorDetails += `Response status: ${error.response?.status}\n`;
      errorDetails += `Response data: ${JSON.stringify(error.response?.data)}\n`;
      errorDetails += `Request URL: ${error.config?.url}\n`;
      errorDetails += `Request method: ${error.config?.method}\n\n`;
      errorDetails += `Full error: ${JSON.stringify(error, null, 2)}`;      
      setResult(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const testFetch = async () => {
    setLoading(true);
    try {
      console.log('Testing fetch...');
      const response = await fetch('http://192.168.1.15:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetch Success:', data);
      setResult(`Fetch Success!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Fetch Error:', error);
      setResult(`Fetch Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    try {
      console.log('Testing health endpoint...');
      const response = await fetch('http://192.168.1.15:3001/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Health Success:', data);
      setResult(`Health Check Success!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Health Error:', error);
      setResult(`Health Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testExternal = async () => {
    setLoading(true);
    try {
      console.log('Testing external API...');
      const response = await fetch('https://httpbin.org/get');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('External Success:', data);
      setResult(`External API Success!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('External Error:', error);
      setResult(`External API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFetchRegistration = async () => {
    setLoading(true);
    try {
      console.log('Testing Fetch API registration...');
      const response = await fetch('http://192.168.1.15:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass',
          name: 'testuser'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetch Registration Success:', data);
      setResult(`Fetch Registration Success!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Fetch Registration Error:', error);
      setResult(`Fetch Registration Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <p className="mb-4">Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.15:3001/api'}</p>
      <p className="mb-4">Axios Base URL: {api.defaults.baseURL}</p>
      
      <div className="space-x-4">
        <button 
          onClick={testApi} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Axios API Call'}
        </button>
        
        <button 
          onClick={testFetch} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Fetch API Call'}
        </button>
        
        <button 
          onClick={testHealth} 
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Health Check'}
        </button>
        
        <button 
          onClick={testExternal} 
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test External API'}
        </button>
        
        <button 
          onClick={testFetchRegistration} 
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Fetch Registration'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
