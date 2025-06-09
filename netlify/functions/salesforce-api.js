exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Salesforce-Instance',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('Salesforce API Function - Event path:', event.path);
    console.log('Salesforce API Function - HTTP method:', event.httpMethod);
    
    // Check if we have authorization header
    if (!event.headers.authorization) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'No authorization header provided'
        }),
      };
    }

    // Check if this is a local token
    if (event.headers.authorization.includes('local_token_')) {
      console.log('Local token detected, returning mock response');
      
      // Return appropriate mock responses based on the endpoint
      const pathParts = event.path.split('/salesforce-api');
      const salesforcePath = pathParts[1] || '';
      
      let mockResponse = {
        success: true,
        message: 'Local storage response',
        timestamp: new Date().toISOString()
      };

      if (salesforcePath.includes('/settings')) {
        if (event.httpMethod === 'GET') {
          mockResponse = {
            success: true,
            settings: null,
            message: 'No settings found in local storage'
          };
        } else {
          mockResponse = {
            success: true,
            message: 'Settings saved in local storage'
          };
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockResponse),
      };
    }
    
    // Get instance URL from headers or use default
    const instanceUrl = event.headers['x-salesforce-instance'] || 'https://agno-dev-ed.develop.my.salesforce.com';
    
    // Extract the path after /salesforce-api
    const pathParts = event.path.split('/salesforce-api');
    const salesforcePath = pathParts[1] || '';
    const salesforceUrl = `${instanceUrl}${salesforcePath}`;
    
    console.log('Forwarding to Salesforce API URL:', salesforceUrl);

    const requestHeaders = {
      'Content-Type': event.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'VoltRide-App/1.0',
    };

    // Forward Authorization header
    if (event.headers.authorization) {
      requestHeaders.Authorization = event.headers.authorization;
    }

    console.log('Request headers:', Object.keys(requestHeaders));

    const response = await fetch(salesforceUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const responseText = await response.text();
    
    console.log('Salesforce API response status:', response.status);
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: responseText,
    };
  } catch (error) {
    console.error('Salesforce API function error:', error);
    
    // Return local storage response on error
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Salesforce API connection failed',
        message: 'Using local storage due to API connection error',
        details: error.message
      }),
    };
  }
};