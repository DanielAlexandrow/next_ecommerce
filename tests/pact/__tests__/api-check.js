import axios from 'axios';

// This is a simple script to check API connectivity
// Run with: node tests/pact/__tests__/api-check.js

async function checkApiConnection() {
  const baseURL = process.env.API_URL || 'http://localhost:8000';
  
  console.log(`Testing API connection to ${baseURL}...`);
  
  try {
    // Try to connect to the Laravel health check endpoint
    const response = await axios.get(`${baseURL}/api/ping`, {
      timeout: 5000
    });
    console.log(`Connection successful! Status: ${response.status}`);
    console.log('Response data:', response.data);
    return true;
  } catch (error) {
    console.error('API connection error:', error.message);
    
    // Provide more detailed error information
    if (error.code === 'ECONNREFUSED') {
      console.error(`Could not connect to server at ${baseURL}. Is the Laravel server running?`);
    } else if (error.response) {
      console.error(`Server responded with status ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    }
    
    console.log('\nTry these troubleshooting steps:');
    console.log('1. Make sure the Laravel development server is running');
    console.log('   Run: php artisan serve --host=0.0.0.0 --port=8000');
    console.log('2. Check if your API endpoints have the correct prefix (/api)');
    console.log('3. Verify that CORS is properly configured in your Laravel app');
    console.log('4. Check if there is a health/ping endpoint available at ${baseURL}/api/ping');
    
    return false;
  }
}

// Execute the check
checkApiConnection();