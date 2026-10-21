/* ============================================
   คัมภีร์พูดได้ — Server with Claude API Proxy
   ============================================ */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIG
// ============================================
const PORT = 8080;
const CLAUDE_API_KEY = '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';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;

// ============================================
// SYSTEM PROMPT (Server-side only)
// ============================================
const SYSTEM_PROMPT = `คุณคือ "คัมภีร์พูดได้" เป็นคัมภีร์พระไตรปิฎกโบราณที่มีชีวิตขึ้นมา ผู้เปี่ยมด้วยความรู้และความเคารพในพระธรรม

บทบาทของคุณคือการตอบคำถามเกี่ยวกับพระไตรปิฎก หลักคำสอนทางพุทธศาสนา และเรื่องราวทางธรรม ด้วยถ้อยคำที่ชัดเจน เรียบง่าย และเข้าใจง่าย ไม่ว่าผู้ถามจะถามเรื่องอะไรมา ให้เชื่อมโยงกลับมาสู่หลักธรรมะเสมอ

แนวทางปฏิบัติ:

1. น้ำเสียงและรูปแบบการสื่อสาร:
- สุภาพ ใจเย็น และเปี่ยมด้วยความเมตตา
- ใช้ภาษาที่เรียบง่าย เหมาะสำหรับผู้เริ่มต้นศึกษา
- หลีกเลี่ยงศัพท์วิชาการหรือศัพท์เฉพาะทางที่ซับซ้อนเกินไปหากไม่จำเป็น
- ไม่สั่งสอนในเชิงตำหนิ ตัดสิน หรือวิพากษ์วิจารณ์ผู้อื่น
- รักษาโทนเสียงที่นุ่มนวลและให้เกียรติ เปรียบเสมือนพระภิกษุผู้ทรงภูมิปัญญาที่อธิบายธรรมด้วยความเมตตา

2. ความถูกต้องของเนื้อหา:
- อ้างอิงคำอธิบายตามหลักพุทธศาสนาเถรวาทและพระไตรปิฎก
- ถ้าได้รับข้อมูลพระสูตรที่เกี่ยวข้อง ให้อ้างอิงจากข้อมูลนั้นเป็นหลัก พร้อมระบุชื่อพระสูตรและเล่ม
- ถ้าไม่มีข้อมูลพระสูตรที่ตรงกัน ให้ตอบจากความรู้ทั่วไปเกี่ยวกับพระพุทธศาสนา
- ห้ามกุเรื่องคำคมหรือการอ้างอิงพระคัมภีร์ขึ้นมาเอง
- หากไม่แน่ใจในรายละเอียดเฉพาะเจาะจง ให้ตอบตามตรงและหลีกเลี่ยงการคาดเดา

3. รูปแบบการอธิบาย:
- อธิบายแนวคิดทางธรรมด้วยภาษาที่นำไปใช้ได้จริงในชีวิตประจำวัน
- ยกตัวอย่างที่เห็นภาพชัดเจนและเชื่อมโยงกับชีวิตจริงได้
- มุ่งเน้นช่วยให้ผู้ถามเข้าใจและนำธรรมะไปประยุกต์ใช้ในชีวิตจริง
- ตอบเป็นภาษาไทยเสมอ
- อย่าใช้ Markdown formatting (เช่น **, ##, *) ในคำตอบ เพราะจะถูกอ่านออกเสียง ให้ใช้ข้อความธรรมดา
- ใช้อิโมจิเล็กน้อยเพื่อความเป็นกันเอง (เช่น 🙏 📖 ✨ ☸️)

4. ขอบเขตการตอบคำถาม:
- ไม่ให้คำแนะนำทางการแพทย์ กฎหมาย หรือการเงิน
- ไม่โต้เถียงหรือแสดงความคิดเห็นในประเด็นทางการเมือง
- หากคำถามอยู่นอกเหนือหลักคำสอนทางพุทธศาสนา ให้เบี่ยงประเด็นการสนทนาอย่างนุ่มนวลกลับมาสู่ธรรมะ
- หากคำถามเกี่ยวข้องกับความทุกข์ใจ ให้ตอบด้วยความเห็นอกเห็นใจและให้คำแนะนำตามหลักธรรม

5. แนวทางการสอน:
- ส่งเสริมการไตร่ตรองพิจารณามากกว่าการเชื่อตามกันโดยปราศจากการคิดวิเคราะห์
- เน้นย้ำหลักคำสอนสำคัญ เช่น อริยสัจ 4, มรรคมีองค์ 8, ความไม่เที่ยง (อนิจจัง), ทุกขัง, อนัตตา, สติ
- ส่งเสริมปัญญา ความเมตตา และการดำเนินชีวิตอย่างมีศีลธรรม

6. การตรวจสอบข้อความคลาดเคลื่อนและการปฏิเสธข้อความที่ไม่ถูกต้อง (ตามหลักมหาปเทส 4):
- หากคำถามมีประเด็น ข้อความ หรือความเชื่อที่คลาดเคลื่อน บิดเบือน หรือขัดแย้งกับหลักพระธรรมวินัย (เช่น ถามว่าดื่มสุราไม่ผิดศีลใช่ไหม, พระพุทธเจ้าอนุญาตให้เสพเมถุนใช่ไหม, ฆ่าคนเลวได้บุญใช่ไหม, จิตหรือนิพพานเป็นอัตตาเที่ยงแท้ใช่ไหม, หรืออ้างพุทธวจนปลอม/คำคมปลอม)
- ให้ชี้แจงอย่างชัดเจนและสุภาพทันทีว่า ข้อความดังกล่าว "คลาดเคลื่อนจากหลักพระธรรมวินัย" หรือ "ไม่มีปรากฏในพระไตรปิฎก" หรือ "เป็นความเข้าใจผิดที่ขัดต่อหลักธรรม" พร้อมอธิบายตัวบทพระธรรมวินัยและพุทธวจนะที่ถูกต้องตามหลักเถรวาทเสมอ

เป้าหมายสูงสุด: ช่วยให้ผู้คนเข้าใจธรรมะอย่างชัดเจน ลดความทุกข์ และสร้างเสริมปัญญาและความสงบสุขในชีวิตประจำวัน`;

// ============================================
// DOCTRINAL DISTORTION DETECTOR (Mahapadesa 4)
// ============================================
function detectDoctrinalDistortion(text) {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    const distortionKeywords = [
        'คลาดเคลื่อน',
        'ขัดกับหลัก',
        'ขัดแย้งกับหลัก',
        'ขัดต่อพระธรรมวินัย',
        'ขัดกับพระธรรมวินัย',
        'มิใช่คำสอน',
        'ไม่ใช่คำสอน',
        'ไม่ปรากฏในพระไตรปิฎก',
        'ไม่มีปรากฏในพระไตรปิฎก',
        'ไม่ได้มีบันทึกในพระไตรปิฎก',
        'มิจฉาทิฏฐิ',
        'บิดเบือน',
        'ความเข้าใจผิด',
        'เข้าใจผิด',
        'มิได้ทรงอนุญาต',
        'ไม่ได้ทรงอนุญาต',
        'มิได้ทรงอนุโลม',
        'ไม่ได้อนุโลม',
        'มิได้ทรงบัญญัติ',
        'ไม่ใช่พุทธวจนะ',
        'มิใช่พุทธวจนะ',
        'คำสอนที่แต่งขึ้นใหม่',
        'แอบอ้าง'
    ];
    return distortionKeywords.some(kw => lower.includes(kw));
}

// ============================================
// RATE LIMITER
// ============================================
const rateLimitMap = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (rateLimitMap.size > 1000) {
        for (const [key, val] of rateLimitMap) {
            if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
        }
    }
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// ============================================
// MESSAGE SANITIZER
// ============================================
function sanitizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.slice(-MAX_MESSAGES).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content.substring(0, MAX_MESSAGE_LENGTH) : '',
    })).filter(msg => msg.content.length > 0);
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

// ============================================
// SERVER
// ============================================
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Proxy: POST /api/chat
    if (req.method === 'POST' && req.url === '/api/chat') {
        handleChatProxy(req, res);
        return;
    }

    // TTS Proxy: GET /api/tts?text=...
    if (req.method === 'GET' && req.url.startsWith('/api/tts')) {
        handleTTSProxy(req, res);
        return;
    }

    // Static file serving
    serveStaticFile(req, res);
});

// ============================================
// SMART FALLBACK ENGINE
// ============================================
function generateSmartFallback(userMessage) {
    const msg = (userMessage || '').toLowerCase();

    // สกัดบริบทพระสูตรจากข้อความ (ถ้ามี context แนบมา)
    const contextMatch = msg.match(/--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---([\s\S]*?)--- จบข้อมูลพระสูตร ---/);
    if (contextMatch && contextMatch[1]) {
        const suttaContext = contextMatch[1].trim();
        const titles = [...suttaContext.matchAll(/ชื่อ:\s*(.+)/g)].map(m => m[1].trim());
        const contents = [...suttaContext.matchAll(/เนื้อหา:\s*(.+)/g)].map(m => m[1].trim().substring(0, 300));

        let response = '🙏 เจริญพร\n\n';
        if (titles.length > 0) {
            response += `จากการสืบค้นในคลังพระไตรปิฎก พบพระสูตรที่เกี่ยวข้องกับคำถามของท่าน ดังนี้:\n\n`;
            for (let i = 0; i < Math.min(titles.length, 3); i++) {
                response += `📖 ${titles[i]}\n`;
                if (contents[i]) response += `${contents[i]}...\n\n`;
            }
            response += `\nขอให้ท่านพิจารณาตามหลักธรรมด้วยสติและปัญญา เพื่อความเจริญในทางธรรมยิ่งๆ ขึ้นไป 🙏`;
        } else {
            response += `คำถามของท่านเป็นข้อคิดทางธรรมที่ดี ในทางพุทธศาสนา ท่านสอนให้เราเจริญสติ รู้เท่าทันอารมณ์ และดำเนินชีวิตตามหลักอริยมรรคมีองค์ 8 ☸️\n\nขอให้ท่านพิจารณาด้วยปัญญาและความเมตตา 🙏`;
        }
        return response;
    }

    // Dharma topic matching
    const dharmaTopics = [
        { keywords: ['อริยสัจ', 'สัจ', 'ความจริง'], response: '🙏 เจริญพร\n\nอริยสัจ 4 คือความจริงอันประเสริฐ 4 ประการ ได้แก่:\n1. ทุกข์ - ความไม่สบายกาย ไม่สบายใจ\n2. สมุทัย - เหตุแห่งทุกข์ คือตัณหา\n3. นิโรธ - ความดับทุกข์ คือนิพพาน\n4. มรรค - ทางปฏิบัติให้ถึงความดับทุกข์ คืออริยมรรคมีองค์ 8\n\nพระพุทธเจ้าทรงตรัสรู้อริยสัจ 4 ในคืนวันตรัสรู้ ☸️' },
        { keywords: ['ศีล', 'ศีล 5'], response: '🙏 เจริญพร\n\nศีล 5 เป็นหลักการดำเนินชีวิตพื้นฐานของชาวพุทธ ได้แก่:\n1. ปาณาติปาตา - เว้นจากการทำลายชีวิต\n2. อทินนาทานา - เว้นจากการถือเอาสิ่งที่เขาไม่ได้ให้\n3. กาเมสุมิจฉาจารา - เว้นจากการประพฤติผิดในกาม\n4. มุสาวาทา - เว้นจากการพูดเท็จ\n5. สุราเมรยมัชชปมาทัฏฐานา - เว้นจากสุราเมรัย\n\nการรักษาศีลเป็นพื้นฐานแห่งความสุขและความสงบในชีวิต 🙏' },
        { keywords: ['กรรม', 'วิบาก', 'ผลกรรม'], response: '🙏 เจริญพร\n\nกรรม ในทางพุทธศาสนาหมายถึง การกระทำที่มีเจตนา ทั้งทางกาย วาจา และใจ\n\nกรรมแบ่งเป็น 2 ประเภทหลัก:\n- กุศลกรรม (กรรมดี) นำไปสู่ความสุข\n- อกุศลกรรม (กรรมชั่ว) นำไปสู่ความทุกข์\n\nพระพุทธเจ้าตรัสว่า "สัตว์ทั้งหลายมีกรรมเป็นของตน เป็นทายาทแห่งกรรม มีกรรมเป็นกำเนิด" 🙏' },
        { keywords: ['สติ', 'สมาธิ', 'ภาวนา', 'ปัญญา'], response: '🙏 เจริญพร\n\nสติ สมาธิ ปัญญา เป็นไตรสิกขา อันเป็นหลักการปฏิบัติธรรมสำคัญ:\n\n- สติ คือ ความระลึกได้ รู้ตัวทั่วพร้อม\n- สมาธิ คือ ความตั้งใจมั่น จิตแน่วแน่\n- ปัญญา คือ ความรู้แจ้ง เข้าใจสิ่งต่างๆ ตามความเป็นจริง\n\nการเจริญสติปัฏฐาน 4 เป็นทางสายตรงเพื่อความบริสุทธิ์แห่งจิต 🙏' },
        { keywords: ['ขันธ์', 'รูป', 'นาม'], response: '🙏 เจริญพร\n\nขันธ์ 5 คือองค์ประกอบของชีวิต ได้แก่:\n1. รูปขันธ์ - ร่างกายและสิ่งที่เป็นรูปธรรม\n2. เวทนาขันธ์ - ความรู้สึก สุข ทุกข์ เฉยๆ\n3. สัญญาขันธ์ - ความจำได้ หมายรู้\n4. สังขารขันธ์ - ความคิดปรุงแต่ง เจตนา\n5. วิญญาณขันธ์ - ความรู้แจ้งอารมณ์\n\nพระพุทธเจ้าทรงสอนให้เห็นขันธ์ 5 เป็นอนิจจัง ทุกขัง อนัตตา 🙏' },
    ];

    for (const topic of dharmaTopics) {
        if (topic.keywords.some(kw => msg.includes(kw))) {
            return topic.response;
        }
    }

    return '🙏 เจริญพร\n\nคำถามของท่านเป็นข้อคิดทางธรรมที่ดี ในทางพุทธศาสนา พระพุทธเจ้าทรงสอนให้เราเจริญสติ รู้เท่าทันอารมณ์ และดำเนินชีวิตตามหลักอริยมรรคมีองค์ 8 ☸️\n\nหลักสำคัญคือ สัมมาทิฏฐิ (ความเห็นชอบ) สัมมาสังกัปปะ (ความดำริชอบ) สัมมาวาจา (วาจาชอบ) สัมมากัมมันตะ (กระทำชอบ) สัมมาอาชีวะ (เลี้ยงชีพชอบ) สัมมาวายามะ (ความเพียรชอบ) สัมมาสติ (ความระลึกชอบ) สัมมาสมาธิ (ความตั้งจิตมั่นชอบ)\n\nขอให้ท่านพิจารณาด้วยปัญญาและความเมตตา เพื่อความเจริญงอกงามในทางธรรม 🙏';
}

// ============================================
// CLAUDE API PROXY
// ============================================
function handleChatProxy(req, res) {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request body too large' }));
            req.destroy();
        }
    });

    req.on('end', () => {
        // --- Rate Limit ---
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.socket?.remoteAddress || 'unknown';
        if (isRateLimited(clientIP)) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Too many requests', message: 'กรุณารอสักครู่แล้วลองใหม่' }));
            return;
        }

        let clientData;
        try {
            clientData = JSON.parse(body);
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
        }

        // --- Sanitize Messages ---
        const messages = sanitizeMessages(clientData.messages);
        if (messages.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No valid messages' }));
            return;
        }

        // Build Claude API request — ★ Always use server-side SYSTEM_PROMPT
        const claudeBody = JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: messages,
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(claudeBody),
            },
        };

        const lastMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

        const proxyReq = https.request(options, (proxyRes) => {
            if (proxyRes.statusCode === 200) {
                let responseData = '';
                proxyRes.on('data', chunk => responseData += chunk);
                proxyRes.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        const aiText = parsed?.content?.[0]?.text || '';
                        parsed._isDistorted = detectDoctrinalDistortion(aiText);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(parsed));
                    } catch (e) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(responseData);
                    }
                });
            } else {
                let errData = '';
                proxyRes.on('data', chunk => errData += chunk);
                proxyRes.on('end', () => {
                    console.warn(`Claude API status ${proxyRes.statusCode}, using Smart Fallback`);
                    const fallbackText = generateSmartFallback(lastMsg);
                    const isDistorted = detectDoctrinalDistortion(fallbackText) || detectDoctrinalDistortion(lastMsg);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ content: [{ text: fallbackText }], _fallback: true, _isDistorted: isDistorted }));
                });
            }
        });

        proxyReq.on('error', (err) => {
            console.error('Claude API proxy error:', err.message);
            const fallbackText = generateSmartFallback(lastMsg);
            const isDistorted = detectDoctrinalDistortion(fallbackText) || detectDoctrinalDistortion(lastMsg);
            if (!res.headersSent) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ content: [{ text: fallbackText }], _fallback: true, _isDistorted: isDistorted }));
            }
        });

        proxyReq.setTimeout(30000, () => {
            proxyReq.destroy();
            const fallbackText = generateSmartFallback(lastMsg);
            const isDistorted = detectDoctrinalDistortion(fallbackText) || detectDoctrinalDistortion(lastMsg);
            if (!res.headersSent) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ content: [{ text: fallbackText }], _fallback: true, _isDistorted: isDistorted }));
            }
        });

        proxyReq.write(claudeBody);
        proxyReq.end();
    });
}

// ============================================
// GOOGLE TTS PROXY (Thai Voice)
// ============================================
function handleTTSProxy(req, res) {
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const text = urlObj.searchParams.get('text');

    if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing text parameter' }));
        return;
    }

    // Encode for Google TTS
    const encodedText = encodeURIComponent(text.substring(0, 200));
    const googleTTSPath = `/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodedText}`;

    const options = {
        hostname: 'translate.google.com',
        path: googleTTSPath,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/',
        },
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Handle redirects
        if (proxyRes.statusCode === 302 || proxyRes.statusCode === 301) {
            const redirectUrl = proxyRes.headers.location;
            if (redirectUrl) {
                const redirectUrlObj = new URL(redirectUrl);
                const redirectOptions = {
                    hostname: redirectUrlObj.hostname,
                    path: redirectUrlObj.pathname + redirectUrlObj.search,
                    method: 'GET',
                    headers: options.headers,
                };
                const redirectReq = https.request(redirectOptions, (redirectRes) => {
                    res.writeHead(200, {
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'public, max-age=86400',
                    });
                    redirectRes.pipe(res);
                });
                redirectReq.on('error', () => {
                    res.writeHead(502);
                    res.end('TTS redirect error');
                });
                redirectReq.end();
                return;
            }
        }

        if (proxyRes.statusCode !== 200) {
            res.writeHead(proxyRes.statusCode);
            res.end('TTS error');
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
        });
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('TTS proxy error:', err.message);
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'TTS proxy error: ' + err.message }));
        }
    });

    proxyReq.setTimeout(10000, () => {
        proxyReq.destroy();
        if (!res.headersSent) {
            res.writeHead(504);
            res.end('TTS timeout');
        }
    });

    proxyReq.end();
}

// ============================================
// STATIC FILE SERVER
// ============================================
function serveStaticFile(req, res) {
    let urlPath = req.url.split('?')[0]; // Remove query string
    if (urlPath === '/') urlPath = '/index.html';

    const publicDir = path.join(__dirname, 'public');
    let filePath = path.join(publicDir, urlPath);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, urlPath);
    }

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// ============================================
// START
// ============================================
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n  📜 คัมภีร์พูดได้ Server`);
    console.log(`  ================================`);
    console.log(`  🌐 เครื่องนี้:  http://localhost:${PORT}`);
    console.log(`  📱 เครื่องอื่น: http://${localIP}:${PORT}`);
    console.log(`  🤖 Claude API: ${CLAUDE_MODEL}`);
    console.log(`  🔑 API Key: ...${CLAUDE_API_KEY.slice(-8)}`);
    console.log(`  ================================\n`);
});
