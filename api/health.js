export default async function handler(req, res) {
    // Simple health check endpoint
    // Your app.js calls: fetch(`${BACKEND_URL}/health`)
    
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  }