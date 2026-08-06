/* ============================================
   คัมภีร์พูดได้ — Vercel Serverless: Google TTS Proxy
   GET /api/tts?text=...
   ============================================ */

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const text = req.query?.text;
    if (!text) {
        return res.status(400).json({ error: 'Missing text parameter' });
    }

    try {
        const encodedText = encodeURIComponent(text.substring(0, 200));
        const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodedText}`;

        const ttsResponse = await fetch(googleTTSUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
            },
        });

        if (!ttsResponse.ok) {
            return res.status(ttsResponse.status).end('TTS error');
        }

        const audioBuffer = await ttsResponse.arrayBuffer();

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS proxy error:', error);
        return res.status(502).json({ error: 'TTS proxy error: ' + error.message });
    }
};
