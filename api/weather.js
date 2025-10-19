// Vercel Serverless Function - Weather API Proxy
// This securely proxies weather API requests to hide the API key

export default async function handler(req, res) {
  // CORS headers for your domain
  res.setHeader('Access-Control-Allow-Origin', 'https://bshs-es.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported' 
    });
  }

  // Get API key from environment variable (set in Vercel dashboard)
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    console.error('WEATHER_API_KEY environment variable not set');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Weather service is not properly configured' 
    });
  }

  // Fixed location for security (prevents API abuse)
  const location = 'Balangkayan,Eastern Samar,Philippines';

  try {
    // Call WeatherAPI.com from server side
    // Using forecast.json to get hourly forecast data for accurate rainfall intensity
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=yes`,
      {
        headers: {
          'User-Agent': 'BSHS-Weather-Service/1.0'
        }
      }
    );

    // Check if API request was successful
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', weatherResponse.status, errorText);
      
      return res.status(weatherResponse.status).json({ 
        error: 'Weather API error',
        message: 'Unable to fetch weather data from provider',
        status: weatherResponse.status
      });
    }

    // Parse the weather data
    const data = await weatherResponse.json();

    // Set caching headers (cache for 5 minutes)
    // This reduces API calls and improves performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    // Return weather data to frontend
    return res.status(200).json(data);

  } catch (error) {
    // Log error for debugging (visible in Vercel logs)
    console.error('Weather proxy error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Return generic error to client (don't expose internal details)
    return res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: 'The weather service is temporarily unavailable. Please try again later.'
    });
  }
}
