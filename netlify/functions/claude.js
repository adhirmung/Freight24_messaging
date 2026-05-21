// Netlify Function — proxies POST /api/claude → Anthropic
// API key is read from ANTHROPIC_API_KEY environment variable (set in Netlify dashboard)

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: { message: 'Method not allowed' } }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not configured on server' } }),
    };
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: event.body,
    });

    const text = await upstream.text();
    return { statusCode: upstream.status, headers: cors, body: text };
  } catch (e) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: { message: e.message } }),
    };
  }
};
