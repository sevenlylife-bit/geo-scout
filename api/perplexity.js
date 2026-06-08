export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Perplexity API key not configured' });

  try {
    const { query } = req.body;
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a helpful assistant answering local business recommendation queries. Be direct and specific.' },
          { role: 'user', content: query }
        ],
        max_tokens: 400
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Perplexity error' });
    }

    const data = await response.json();
    return res.status(200).json({
      answer: data.choices?.[0]?.message?.content || '',
      citations: data.citations || []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
