exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
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
    console.log('Salesforce API Function - Headers:', event.headers);
    
    // Extract the path after /salesforce-api
    const pathParts = event.path.split('/salesforce-api');
    const salesforcePath = pathParts[1] || '';
    const salesforceUrl = `https://agno-dev-ed.develop.my.salesforce.com${salesforcePath}`;
    
    console.log('Forwarding to Salesforce API URL:', salesforceUrl);

    const requestHeaders = {
      'Content-Type': event.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
    };

    // Forward Authorization header if present
    if (event.headers.authorization) {
      requestHeaders.Authorization = event.headers.authorization;
    }

    console.log('Request headers:', requestHeaders);

    const response = await fetch(salesforceUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const responseText = await response.text();
    
    console.log('Salesforce API response status:', response.status);
    console.log('Salesforce API response:', responseText);
    
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
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: error.stack,
      }),
    };
  }
};