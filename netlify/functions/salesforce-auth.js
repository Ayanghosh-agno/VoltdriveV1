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
    console.log('Salesforce Auth Function - Event path:', event.path);
    console.log('Salesforce Auth Function - HTTP method:', event.httpMethod);
    console.log('Salesforce Auth Function - Body:', event.body);
    
    // Extract the path after /salesforce-auth
    const pathParts = event.path.split('/salesforce-auth');
    const salesforcePath = pathParts[1] || '';
    const salesforceUrl = `https://login.salesforce.com${salesforcePath}`;
    
    console.log('Forwarding to Salesforce URL:', salesforceUrl);

    const requestHeaders = {
      'Accept': 'application/json',
    };

    // Set content type based on the request
    if (event.httpMethod === 'POST' && event.body) {
      requestHeaders['Content-Type'] = event.headers['content-type'] || 'application/x-www-form-urlencoded';
    }

    const response = await fetch(salesforceUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.httpMethod !== 'GET' ? event.body : undefined,
    });

    const responseText = await response.text();
    
    console.log('Salesforce response status:', response.status);
    console.log('Salesforce response:', responseText);
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: responseText,
    };
  } catch (error) {
    console.error('Salesforce auth function error:', error);
    
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