/* ============================================
   คัมภีร์พูดได้ — Vercel Serverless: Claude API Proxy
   POST /api/chat
   ============================================ */

const HARDCODED_CLAUDE_KEY = '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';

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-API-Key, X-API-Key');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let bodyData = req.body;
    if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) { }
    }
    const { system, messages, model } = bodyData || {};
    const lastUserMsg = (messages || []).filter(m => m.role === 'user').pop()?.content || '';

    // Get Claude API key from User Header, Environment Variable, or Hardcoded Original Key
    const userApiKey = req.headers['x-user-api-key'] || req.headers['x-api-key'];
    const rawKey = userApiKey || process.env.CLAUDE_API_KEY || HARDCODED_CLAUDE_KEY;
    const apiKey = rawKey.replace(/^\uFEFF/, '').trim();

    const targetModel = model || process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';

    if (apiKey) {
        try {
            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: targetModel,
                    max_tokens: 1024,
                    system: system || '',
                    messages: messages || [],
                }),
            });

            if (claudeResponse.ok) {
                const data = await claudeResponse.json();
                if (data?.content?.[0]?.text) {
                    return res.status(200).json(data);
                }
            } else {
                const errorText = await claudeResponse.text();
                console.warn(`Claude API error (${claudeResponse.status}):`, errorText);
            }
        } catch (err) {
            console.warn('Claude API request error:', err.message);
        }
    }

    // Smart Fallback Responder (Synthesizes Dharma response from Tipitaka database if Key is missing/invalid)
    const fallbackText = generateSmartFallback(lastUserMsg);
    return res.status(200).json({ content: [{ text: fallbackText }] });
};

function generateSmartFallback(fullMsg) {
    let question = fullMsg;
    let suttaContext = '';

    if (fullMsg.includes('--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---')) {
        const parts = fullMsg.split('--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---');
        question = parts[0].trim();
        suttaContext = parts[1].split('--- จบข้อมูลพระสูตร ---')[0].trim();
    }

    if (suttaContext) {
        const suttaBlocks = suttaContext.split('📖 ชื่อ:').filter(b => b.trim());
        let summary = 'เจริญพร... จากการสืบค้นคัมภีร์พระไตรปิฎกในเรื่องนี้ มีพระธรรมคำสอนที่เกี่ยวข้องดังนี้:\n\n';

        for (const block of suttaBlocks.slice(0, 3)) {
            const lines = block.trim().split('\n');
            const title = lines[0]?.trim() || '';
            const contentLine = lines.find(l => l.startsWith('เนื้อหา:')) || '';
            const content = contentLine.replace('เนื้อหา:', '').trim();

            if (title) {
                summary += `📖 ${title}\n${content.substring(0, 300)}${content.length > 300 ? '...' : ''}\n\n`;
            }
        }

        summary += 'หลักธรรมเหล่านี้มุ่งเน้นให้เราเจริญสติ รู้เท่าทันสภาวธรรม และนำไปประยุกต์ใช้เพื่อความสงบสุขในชีวิตประจำวัน 🙏';
        return summary;
    }

    return `เจริญพร... คำถามเรื่อง "${question.substring(0, 50)}" เป็นข้อคิดทางธรรมที่ดี ในทางพุทธศาสนา ท่านสอนให้เราเจริญสติ รู้เท่าทันอารมณ์ และดำเนินชีวิตตามหลักอริยมรรคมีองค์ 8 หมั่นรักษาศีล ฝึกสมาธิ และสร้างปัญญา เพื่อความสงบสุขและความหลุดพ้นจากความทุกข์ 🙏✨`;
}
