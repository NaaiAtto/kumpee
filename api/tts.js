/* ============================================
   คัมภีร์พูดได้ — Vercel Serverless: Google TTS Proxy
   GET /api/tts?text=...
   ============================================ */

const ALLOWED_ORIGINS = [
    'https://kumpee-ai-psi.vercel.app',
    'https://kumpee-ai-stl-s.vercel.app',
    'https://kumpee-ai-naaiatto-stl-s.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
];

function isOriginAllowed(origin) {
    if (!origin) return false;
    for (const allowed of ALLOWED_ORIGINS) {
        if (typeof allowed === 'string' && allowed === origin) return true;
        if (allowed instanceof RegExp && allowed.test(origin)) return true;
    }
    return false;
}

module.exports = async (req, res) => {
    // CORS Headers
    const origin = req.headers.origin || '';
    const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

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
