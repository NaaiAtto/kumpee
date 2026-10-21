/* ============================================
   คัมภีร์พูดได้ — Vercel Serverless: Claude API Proxy
   POST /api/chat
   ============================================ */

// ============================================
const HARDCODED_CLAUDE_KEY = '';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;      // 15 requests per minute per IP

// ============================================
// ALLOWED ORIGINS
// ============================================
const ALLOWED_ORIGINS = [
    'https://kumpee-ai-psi.vercel.app',
    'https://kumpee-ai-stl-s.vercel.app',
    'https://kumpee-ai-naaiatto-stl-s.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
];

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
// RATE LIMITER (in-memory, per serverless instance)
// ============================================
const rateLimitMap = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    // Cleanup old entries periodically
    if (rateLimitMap.size > 1000) {
        for (const [key, val] of rateLimitMap) {
            if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }
    return false;
}

// ============================================
// ORIGIN VALIDATOR
// ============================================
function isOriginAllowed(origin) {
    if (!origin) return false;
    for (const allowed of ALLOWED_ORIGINS) {
        if (typeof allowed === 'string' && allowed === origin) return true;
        if (allowed instanceof RegExp && allowed.test(origin)) return true;
    }
    return false;
}

// ============================================
// MESSAGE SANITIZER
// ============================================
function sanitizeMessages(messages) {
    if (!Array.isArray(messages)) return [];

    // Limit number of messages
    const limited = messages.slice(-MAX_MESSAGES);

    return limited.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string'
            ? msg.content.substring(0, MAX_MESSAGE_LENGTH)
            : '',
    })).filter(msg => msg.content.length > 0);
}

// ============================================
// SMART FALLBACK — uses sutta context from user message
// ============================================
function generateSmartFallback(fullMsg) {
    let question = fullMsg;
    let suttaContext = '';

    // Parse sutta context embedded in the user message by the client
    if (fullMsg.includes('--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---')) {
        const parts = fullMsg.split('--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---');
        question = parts[0].trim();
        suttaContext = (parts[1] || '').split('--- จบข้อมูลพระสูตร ---')[0].trim();
    }

    // If we have sutta context, generate a response using the top sutta
    if (suttaContext) {
        const suttaBlocks = suttaContext.split('📖 ชื่อ:').filter(b => b.trim());

        if (suttaBlocks.length > 0) {
            // Extract top sutta details
            const topBlock = suttaBlocks[0].trim();
            const lines = topBlock.split('\n');
            const title = lines[0]?.trim() || 'พระสูตร';
            const volumeLine = lines.find(l => l.startsWith('เล่ม:')) || '';
            const contentLine = lines.find(l => l.startsWith('เนื้อหา:')) || '';
            const content = contentLine.replace('เนื้อหา:', '').trim();
            const memorableLine = lines.find(l => l.startsWith('วลีสำคัญ:')) || '';
            const memorable = memorableLine.replace('วลีสำคัญ:', '').trim();

            let response = `🙏 เจริญพร\n\n`;
            response += `จากการสืบค้นคัมภีร์พระไตรปิฎก พบพระสูตรที่เกี่ยวข้องกับคำถามของท่านโดยตรง:\n\n`;
            response += `📖 ${title}\n`;
            if (volumeLine) response += `${volumeLine}\n\n`;
            if (content) response += `${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
            if (memorable) response += `วลีสำคัญ: "${memorable}"\n\n`;

            // Add other suttas if available
            if (suttaBlocks.length > 1) {
                response += `พระสูตรที่เกี่ยวข้องเพิ่มเติม:\n`;
                for (let i = 1; i < Math.min(suttaBlocks.length, 3); i++) {
                    const block = suttaBlocks[i].trim();
                    const bLines = block.split('\n');
                    const bTitle = bLines[0]?.trim() || '';
                    if (bTitle) response += `  📖 ${bTitle}\n`;
                }
                response += `\n`;
            }

            response += `หลักธรรมเหล่านี้มุ่งเน้นให้เราเจริญสติ รู้เท่าทันสภาวธรรม และนำไปประยุกต์ใช้เพื่อความสงบสุขในชีวิตประจำวัน 🙏`;
            return response;
        }
    }

    // Generic fallback when no sutta context is available
    return `🙏 เจริญพร\n\nคำถามเรื่อง "${question.substring(0, 80)}" เป็นข้อคิดทางธรรมที่ดี ในทางพุทธศาสนา พระพุทธเจ้าทรงสอนให้เราเจริญสติ รู้เท่าทันอารมณ์ และดำเนินชีวิตตามหลักอริยมรรคมีองค์ 8 ☸️\n\nหมั่นรักษาศีล ฝึกสมาธิ และสร้างปัญญา เพื่อความสงบสุขและความหลุดพ้นจากความทุกข์\n\n(หมายเหตุ: คำตอบนี้เป็นคำตอบสำรองจากระบบ เนื่องจากไม่สามารถเชื่อมต่อ AI ได้ชั่วคราว) 🙏`;
}

// ============================================
// MAIN HANDLER
// ============================================
module.exports = async (req, res) => {
    // --- CORS Headers ---
    const origin = req.headers.origin || '';
    const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    // --- Preflight ---
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // --- Origin Check ---
    if (origin && !isOriginAllowed(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    // --- Rate Limit ---
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || 'unknown';

    if (isRateLimited(clientIP)) {
        return res.status(429).json({
            error: 'Too many requests',
            message: 'กรุณารอสักครู่แล้วลองใหม่ (จำกัด 15 ครั้งต่อนาที)',
        });
    }

    // --- Parse Body ---
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) { }
    }
    if (!bodyData) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // --- Sanitize Messages ---
    const messages = sanitizeMessages(bodyData.messages);
    if (messages.length === 0) {
        return res.status(400).json({ error: 'No valid messages provided' });
    }

    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

    // --- Resolve API Key (env > hardcoded; client keys no longer accepted) ---
    const rawKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || HARDCODED_CLAUDE_KEY;
    const apiKey = rawKey.replace(/^\uFEFF/, '').trim();
    const targetModel = process.env.CLAUDE_MODEL || DEFAULT_MODEL;

    // --- Call Claude API ---
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
                    max_tokens: bodyData.max_tokens || 400,
                    system: SYSTEM_PROMPT,  // ★ Always use server-side prompt
                    messages: messages,
                }),
            });

            if (claudeResponse.ok) {
                const data = await claudeResponse.json();
                if (data?.content?.[0]?.text) {
                    const aiText = data.content[0].text;
                    data._isDistorted = detectDoctrinalDistortion(aiText);
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

    // --- Fallback: generate response from sutta context ---
    const fallbackText = generateSmartFallback(lastUserMsg);
    return res.status(200).json({
        content: [{ text: fallbackText }],
        _fallback: true,  // ★ Flag so client knows this is a fallback
        _isDistorted: detectDoctrinalDistortion(fallbackText) || detectDoctrinalDistortion(lastUserMsg),
    });
};
