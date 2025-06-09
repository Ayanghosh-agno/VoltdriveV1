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
    console.log('Salesforce Auth Function - Event path:', event.path);
    console.log('Salesforce Auth Function - HTTP method:', event.httpMethod);
    
    // Check if Salesforce credentials are configured
    const clientId = process.env.VITE_SALESFORCE_CLIENT_ID || process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.VITE_SALESFORCE_CLIENT_SECRET || process.env.SALESFORCE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret || clientId === 'default_client_id') {
      console.log('Salesforce credentials not configured, returning demo mode response');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Salesforce not configured',
          mode: 'demo',
          message: 'Running in demo mode - configure Salesforce environment variables for production'
        }),
      };
    }
    
    // Extract the path after /salesforce-auth
    const pathParts = event.path.split('/salesforce-auth');
    const salesforcePath = pathParts[1] || '';
    const salesforceUrl = `https://login.salesforce.com${salesforcePath}`;
    
    console.log('Forwarding to Salesforce URL:', salesforceUrl);

    const requestHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'VoltRide-App/1.0',
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
    
    // Return demo mode response on error
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Salesforce connection failed',
        mode: 'demo',
        message: 'Running in demo mode due to connection error',
        details: error.message
      }),
    };
  }
};