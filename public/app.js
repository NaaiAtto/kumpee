/* ============================================
   คัมภีร์พูดได้ — พระไตรปิฎก AI
   Main Application Logic (Claude API)
   ============================================ */

// ============================================
// CONFIG
// ============================================
const CONFIG = {
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/1n5AOccnPA8HFisqr5nLkQjL0WYps9invvAWl1g6eZss/export?format=csv&gid=1043334436',
    CHAT_API_URL: '/api/chat',
    CACHE_KEY: 'tipitaka_data_v2',
    CACHE_TS_KEY: 'tipitaka_data_ts_v2',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    TYPING_SPEED: 12,
    MAX_SEARCH_RESULTS: 5,
    MAX_CONTEXT_LENGTH: 4000,
    TTS_LANG: 'th-TH',
    STT_LANG: 'th-TH',
    SYSTEM_PROMPT: `คุณคือ "คัมภีร์พูดได้" เป็นคัมภีร์พระไตรปิฎกโบราณที่มีชีวิตขึ้นมา ผู้เปี่ยมด้วยความรู้และความเคารพในพระธรรม

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

เป้าหมายสูงสุด: ช่วยให้ผู้คนเข้าใจธรรมะอย่างชัดเจน ลดความทุกข์ และสร้างเสริมปัญญาและความสงบสุขในชีวิตประจำวัน`,
};

// ============================================
// CSV PARSER
// ============================================
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') {
                    currentField += '"';
                    i += 2;
                    continue;
                } else {
                    inQuotes = false;
                    i++;
                    continue;
                }
            } else {
                currentField += char;
                i++;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
                i++;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
                i++;
            } else if (char === '\n' || char === '\r') {
                currentRow.push(currentField.trim());
                currentField = '';
                if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
                    i++;
                }
                if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                i++;
            } else {
                currentField += char;
                i++;
            }
        }
    }

    // Last field/row
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
            rows.push(currentRow);
        }
    }

    return rows;
}

// ============================================
// DATA MODULE
// ============================================
const DataModule = {
    suttas: [],
    headers: [],

    async load(onProgress) {
        // Check cache
        const cachedData = this._getCache();
        if (cachedData) {
            onProgress && onProgress(50, 'กำลังโหลดจากแคช...');
            this._processData(cachedData);
            onProgress && onProgress(100, 'โหลดสำเร็จ');
            return;
        }

        // Fetch from Google Sheets
        onProgress && onProgress(10, 'กำลังดึงข้อมูลจาก Google Sheets...');
        try {
            const response = await fetch(CONFIG.SHEET_CSV_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();

            onProgress && onProgress(40, 'กำลังประมวลผลข้อมูล...');
            const rows = parseCSV(text);

            onProgress && onProgress(70, 'กำลังจัดเก็บข้อมูล...');
            this._processData(rows);
            this._setCache(rows);

            onProgress && onProgress(100, 'โหลดสำเร็จ');
        } catch (error) {
            console.error('Data load error:', error);
            onProgress && onProgress(100, 'โหลดข้อมูลไม่สำเร็จ แต่ยังสนทนาได้');
        }
    },

    _processData(rows) {
        if (rows.length < 2) return;

        this.headers = rows[0];
        this.suttas = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 5) continue;

            const title = (row[0] || '').trim();
            const volume = (row[1] || '').trim();
            const topicNum = (row[2] || '').trim();
            const pageNum = (row[3] || '').trim();
            const content = (row[4] || '').trim();
            const notes = (row[5] || '').trim();
            const memorable = (row[7] || '').trim();
            const topicTag = (row[9] || '').trim();
            const nounTag = (row[10] || '').trim();
            const keywords = (row[11] || '').trim();
            const metaphor = (row[13] || '').trim();

            if (!title && !content) continue;

            this.suttas.push({
                title,
                volume,
                topicNum,
                pageNum,
                content,
                notes,
                memorable,
                topicTag,
                nounTag,
                keywords,
                metaphor,
                _searchText: `${title} ${content} ${memorable} ${topicTag} ${nounTag} ${keywords} ${metaphor} ${notes}`.toLowerCase(),
            });
        }
    },

    _getCache() {
        try {
            const ts = localStorage.getItem(CONFIG.CACHE_TS_KEY);
            if (!ts || Date.now() - parseInt(ts) > CONFIG.CACHE_DURATION) return null;
            const data = localStorage.getItem(CONFIG.CACHE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch { return null; }
    },

    _setCache(rows) {
        try {
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(rows));
            localStorage.setItem(CONFIG.CACHE_TS_KEY, Date.now().toString());
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    },

    search(query) {
        if (!query || this.suttas.length === 0) return [];

        const queryLower = query.toLowerCase()
            .replace(/[?!.,;:'"()\[\]{}\s]+/g, ' ')
            .trim();

        if (queryLower.length === 0) return [];

        // Thai text doesn't use spaces between words,
        // so we search for the full query AND individual space-separated segments
        const querySegments = queryLower.split(/\s+/).filter(t => t.length > 0);
        // Also extract common Thai dharma keywords from the query for better matching
        const thaiKeywords = this._extractThaiKeywords(queryLower);

        const scored = [];
        for (const sutta of this.suttas) {
            let score = 0;
            const searchText = sutta._searchText;
            const titleLower = sutta.title.toLowerCase();
            const topicLower = sutta.topicTag.toLowerCase();
            const memorableLower = sutta.memorable.toLowerCase();
            const nounLower = sutta.nounTag.toLowerCase();
            const keywordsLower = sutta.keywords.toLowerCase();

            // Full query match (highest priority)
            if (searchText.includes(queryLower)) score += 8;
            if (titleLower.includes(queryLower)) score += 10;

            // Segment matching
            for (const seg of querySegments) {
                if (seg.length < 1) continue;
                if (searchText.includes(seg)) score += 1;
                if (titleLower.includes(seg)) score += 4;
                if (topicLower.includes(seg)) score += 3;
                if (memorableLower.includes(seg)) score += 3;
                if (nounLower.includes(seg)) score += 2;
                if (keywordsLower.includes(seg)) score += 2;
            }

            // Thai keyword matching (dharma-specific terms)
            for (const kw of thaiKeywords) {
                if (searchText.includes(kw)) score += 3;
                if (titleLower.includes(kw)) score += 5;
                if (nounLower.includes(kw)) score += 3;
            }

            if (score > 0) {
                scored.push({ sutta, score });
            }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, CONFIG.MAX_SEARCH_RESULTS).map(s => s.sutta);
    },

    // Extract common Thai Buddhist keywords from query
    _extractThaiKeywords(query) {
        const dharmaTerms = [
            'ทุกข์', 'ทุกขัง', 'สุข', 'นิพพาน', 'สติ', 'สมาธิ', 'ปัญญา',
            'ศีล', 'กรรม', 'วิบาก', 'ตัณหา', 'อุปาทาน', 'ราคะ', 'โทสะ', 'โมหะ',
            'อริยสัจ', 'มรรค', 'ผล', 'อนิจจัง', 'อนัตตา', 'ขันธ์', 'ธาตุ',
            'อายตนะ', 'ปฏิจจสมุปบาท', 'เวทนา', 'สัญญา', 'สังขาร', 'วิญญาณ',
            'รูป', 'นาม', 'จิต', 'เจตสิก', 'ฌาน', 'วิปัสสนา', 'สมถะ',
            'ภิกษุ', 'พระพุทธ', 'พระธรรม', 'พระสงฆ์', 'อริยมรรค', 'โพชฌงค์',
            'อินทรีย์', 'พละ', 'สังโยชน์', 'นิวรณ์', 'อนุสัย', 'ผัสสะ',
            'ฉันทะ', 'ปฏิฆะ', 'อวิชชา', 'วิชชา', 'อุปมา', 'ภพ', 'ชาติ',
            'ชรา', 'มรณะ', 'โสกะ', 'เพลิดเพลิน', 'นันทิ', 'สาราคะ',
            'อัสสาทะ', 'อาทีนวะ', 'นิสสรณะ', 'สัมมาทิฏฐิ', 'สัมมาสังกัปปะ',
            'สัมมาวาจา', 'สัมมากัมมันตะ', 'สัมมาอาชีวะ', 'สัมมาวายามะ',
            'สัมมาสติ', 'สัมมาสมาธิ', 'อภิชฌา', 'ถีนมิทธะ', 'โกรธ',
            'ปธาน', 'สังวร', 'เบียดเบียน', 'พาล', 'บัณฑิต', 'คนพาล',
            'เพียร', 'ความเพียร', 'ความพอใจ', 'ความเพลิน', 'หลุดพ้น',
            'ไตรลักษณ์', 'โลกธรรม', 'พรหมวิหาร', 'เมตตา', 'กรุณา',
            'มุทิตา', 'อุเบกขา', 'ทาน', 'ปริยัติ', 'ปฏิบัติ', 'ปฏิเวธ',
        ];
        const found = [];
        for (const term of dharmaTerms) {
            if (query.includes(term)) {
                found.push(term);
            }
        }
        return found;
    },
};

// ============================================
// CLAUDE AI MODULE
// ============================================
const AIModule = {
    conversationHistory: [],

    async chat(userMessage) {
        // Search for relevant suttas
        const relevantSuttas = DataModule.search(userMessage);
        let context = '';

        if (relevantSuttas.length > 0) {
            context = '\n\n--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---\n';
            let totalLen = 0;
            for (const sutta of relevantSuttas) {
                const suttaText = `\n📖 ชื่อ: ${sutta.title}\nเล่ม: ${sutta.volume} | หัวข้อที่: ${sutta.topicNum}\nเนื้อหา: ${sutta.content.substring(0, 800)}${sutta.content.length > 800 ? '...' : ''}\n${sutta.memorable ? 'วลีสำคัญ: ' + sutta.memorable : ''}\n`;
                totalLen += suttaText.length;
                if (totalLen > CONFIG.MAX_CONTEXT_LENGTH) break;
                context += suttaText;
            }
            context += '\n--- จบข้อมูลพระสูตร ---\n';
        }

        // Build Claude messages array (role: "user" | "assistant")
        const messages = [];

        // Add conversation history (last 6 exchanges = 12 messages)
        const recentHistory = this.conversationHistory.slice(-12);
        messages.push(...recentHistory);

        // Add current user message with context
        const fullUserMessage = context
            ? `${userMessage}\n${context}`
            : userMessage;
        messages.push({ role: 'user', content: fullUserMessage });

        // Call local proxy → Claude API
        const response = await fetch(CONFIG.CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: CONFIG.SYSTEM_PROMPT,
                messages: messages,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Claude API error:', errorBody);
            if (response.status === 401 || response.status === 403) {
                throw new Error('API Key ไม่ถูกต้องหรือหมดอายุ');
            }
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data?.content?.[0]?.text || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้';

        // ★★★ Round 2: Cross-reference AI response against Tipitaka database ★★★
        // นำคำตอบของ AI ไปค้นหาในชีทพระไตรปิฎกอีกรอบ เพื่อตรวจสอบว่าตรงกับพระสูตรข้อไหน
        const verifiedSuttas = DataModule.search(aiText);

        // Save to history (plain user message, no context for history)
        this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiText }
        );

        return { text: aiText, sources: relevantSuttas, verified: verifiedSuttas };
    },
};

// ============================================
// SPEECH MODULE (Google TTS + STT)
// ============================================
const SpeechModule = {
    recognition: null,
    isSpeaking: false,
    isListening: false,
    currentAudio: null,
    onListeningResult: null,
    onListeningEnd: null,

    // TTS Settings state with localStorage persistence
    settings: {
        rate: 1.0,        // 0.6 - 1.6
        tone: 'normal',   // normal | deep | light
        engine: 'google_th', // google_th | web_speech
    },

    init() {
        this.loadSettings();
        this._initRecognition();
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('tts_settings');
            if (saved) {
                this.settings = Object.assign(this.settings, JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Failed to load TTS settings:', e);
        }
    },

    saveSettings(newSettings) {
        this.settings = Object.assign(this.settings, newSettings);
        try {
            localStorage.setItem('tts_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save TTS settings:', e);
        }
    },

    _initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = CONFIG.STT_LANG;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            if (this.onListeningResult) {
                this.onListeningResult(finalTranscript || interimTranscript, !!finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            this.isListening = false;
            if (this.onListeningEnd) this.onListeningEnd();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onListeningEnd) this.onListeningEnd();
        };
    },

    // ★ Clean text for TTS (remove emojis, markdown, etc.)
    _cleanText(text) {
        return text
            .replace(/[\u{1F600}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
            .replace(/[*#_~`]/g, '')
            .trim();
    },

    // ★ Split text into chunks suitable for Google TTS (~180 chars max)
    _splitText(text, maxLen) {
        const chunks = [];
        // Split on Thai/common sentence endings and newlines
        const sentences = text.split(/(?<=[.!?。\n])\s*/);
        let current = '';

        for (const sentence of sentences) {
            if ((current + sentence).length > maxLen && current) {
                chunks.push(current.trim());
                current = sentence;
            } else {
                current += (current ? ' ' : '') + sentence;
            }
        }
        if (current.trim()) chunks.push(current.trim());

        // Further split any chunk that's still too long
        const finalChunks = [];
        for (const chunk of chunks) {
            if (chunk.length <= maxLen) {
                finalChunks.push(chunk);
            } else {
                // Split on spaces or Thai word-ish boundaries
                let remaining = chunk;
                while (remaining.length > maxLen) {
                    let splitAt = remaining.lastIndexOf(' ', maxLen);
                    if (splitAt < 20) splitAt = maxLen; // No good space found
                    finalChunks.push(remaining.substring(0, splitAt).trim());
                    remaining = remaining.substring(splitAt).trim();
                }
                if (remaining) finalChunks.push(remaining);
            }
        }

        return finalChunks.length > 0 ? finalChunks : [text.substring(0, maxLen)];
    },

    // ★★★ SPEAK using Google TTS via server proxy ★★★
    speak(text) {
        // Always stop any ongoing speech first
        this.stopSpeaking();

        const cleanText = this._cleanText(text);
        if (!cleanText) return false;

        const chunks = this._splitText(cleanText, 180);
        this.isSpeaking = true;
        NavigatorModule.startTalking();
        this._playChunks(chunks, 0);
        return true;
    },

    _playChunks(chunks, index) {
        if (index >= chunks.length || !this.isSpeaking) {
            this._onSpeechEnd();
            return;
        }

        const engine = this.settings.engine || 'google_th';
        const rate = parseFloat(this.settings.rate) || 1.0;
        const tone = this.settings.tone || 'normal';

        if (engine === 'web_speech' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(chunks[index]);
            utterance.lang = 'th-TH';
            utterance.rate = rate;

            // Pitch adjustment based on tone setting
            if (tone === 'deep') {
                utterance.pitch = 0.7; // Lower pitch for male/monk tone
            } else if (tone === 'light') {
                utterance.pitch = 1.35; // Higher pitch
            } else {
                utterance.pitch = 1.0;
            }

            // Find best Thai voice
            const voices = window.speechSynthesis.getVoices();
            const thaiVoice = voices.find(v => v.lang.startsWith('th') && (v.name.includes('Male') || v.name.includes('Pattara'))) ||
                             voices.find(v => v.lang.startsWith('th')) || null;
            if (thaiVoice) utterance.voice = thaiVoice;

            utterance.onend = () => {
                if (this.isSpeaking) this._playChunks(chunks, index + 1);
            };
            utterance.onerror = () => {
                if (this.isSpeaking) this._playChunks(chunks, index + 1);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            // Google TTS Proxy (audio/mpeg)
            const url = `/api/tts?text=${encodeURIComponent(chunks[index])}`;
            const audio = new Audio(url);

            // Calculate effective rate & pitch
            let effectiveRate = rate;
            if (tone === 'deep') {
                effectiveRate *= 0.90; // Slower deep monk voice tone
                audio.preservesPitch = false; // Lower pitch naturally with speed
            } else if (tone === 'light') {
                effectiveRate *= 1.08;
            }

            audio.playbackRate = effectiveRate;
            this.currentAudio = audio;

            audio.onended = () => {
                if (this.isSpeaking) this._playChunks(chunks, index + 1);
            };

            audio.onerror = (e) => {
                console.warn('TTS audio error for chunk', index, ':', e);
                if (this.isSpeaking) {
                    setTimeout(() => this._playChunks(chunks, index + 1), 300);
                }
            };

            audio.play().catch(e => {
                console.warn('Audio play blocked:', e);
                if (this.isSpeaking) {
                    setTimeout(() => this._playChunks(chunks, index + 1), 300);
                }
            });
        }
    },

    _onSpeechEnd() {
        this.isSpeaking = false;
        this.currentAudio = null;
        BookModule.stopSpeaking();
        NavigatorModule.stopTalking();
        const wrapper = document.getElementById('stopTtsWrapper');
        if (wrapper) wrapper.classList.add('hidden');
    },

    // ★★★ STOP — works for both Audio playback and Web Speech ★★★
    stopSpeaking() {
        this.isSpeaking = false;
        // Stop Audio element
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        // Also cancel Web Speech API just in case
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        BookModule.stopSpeaking();
        NavigatorModule.stopTalking();
        const wrapper = document.getElementById('stopTtsWrapper');
        if (wrapper) wrapper.classList.add('hidden');
    },

    startListening() {
        if (!this.recognition) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการรับเสียง กรุณาใช้ Chrome');
            return false;
        }
        // ★ Stop TTS before listening
        this.stopSpeaking();

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (e) {
            console.warn('Cannot start recognition:', e);
            return false;
        }
    },

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    },
};

// ============================================
// BOOK MODULE (Animation)
// ============================================
const BookModule = {
    container: null,
    statusText: null,

    init() {
        this.container = document.getElementById('bookContainer');
        this.statusText = document.querySelector('.status-text');
        this._createParticles();
    },

    _createParticles() {
        const particlesEl = document.getElementById('bookParticles');
        if (!particlesEl) return;
        // Clear existing
        particlesEl.innerHTML = '';

        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.setProperty('--x', `${(Math.random() - 0.5) * 80}px`);
            p.style.setProperty('--duration', `${2 + Math.random() * 2}s`);
            p.style.setProperty('--delay', `${Math.random() * 2}s`);
            p.style.left = `${30 + Math.random() * 40}%`;
            p.style.bottom = `${20 + Math.random() * 30}%`;
            p.style.width = `${2 + Math.random() * 4}px`;
            p.style.height = p.style.width;
            particlesEl.appendChild(p);
        }
    },

    setStatus(status, text) {
        if (!this.container) return;
        this.container.classList.remove('speaking', 'thinking', 'listening');
        if (status) this.container.classList.add(status);
        if (this.statusText) this.statusText.textContent = text || 'พร้อมสนทนา';
    },

    startSpeaking() { this.setStatus('speaking', '🔊 กำลังอ่าน...'); },
    stopSpeaking()  { this.setStatus(null, 'พร้อมสนทนา'); },
    startThinking() { this.setStatus('thinking', '🤔 กำลังคิด...'); },
    startListening(){ this.setStatus('listening', '🎤 กำลังฟัง...'); },

    showReference(contextSuttas, verifiedSuttas) {
        const content = document.getElementById('referenceContent');
        if (!content) return;

        const hasContext = contextSuttas && contextSuttas.length > 0;
        const hasVerified = verifiedSuttas && verifiedSuttas.length > 0;

        if (!hasContext && !hasVerified) {
            content.innerHTML = '<p class="reference-placeholder">ไม่พบพระสูตรที่เกี่ยวข้องโดยตรง</p>';
            return;
        }

        let html = '';

        // ★ Section 1: Verified References (Round 2) — อ้างอิงจากคำตอบ AI
        if (hasVerified) {
            html += `
                <div class="reference-section verified-section" style="background: rgba(56, 161, 105, 0.1); border: 1px solid rgba(56, 161, 105, 0.4); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span>✅</span>
                        <h4 style="margin: 0; color: #38a169;">ตรวจสอบจากคำตอบ AI</h4>
                        <span style="background: #38a169; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${verifiedSuttas.length} รายการ</span>
                    </div>
                    <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #276749;">พระสูตรที่สอดคล้องกับคำตอบของ AI</p>
                    ${verifiedSuttas.map(s => `
                        <div class="reference-item" style="border-left: 3px solid #38a169; padding-left: 8px; margin-bottom: 8px;">
                            <div class="reference-item-title">✅ ${s.title || 'ไม่ระบุชื่อ'}</div>
                            <div class="reference-item-meta">เล่ม: ${s.volume || '-'} | หัวข้อที่: ${s.topicNum || '-'} | หน้า: ${s.pageNum || '-'}</div>
                            <div class="reference-item-text">${(s.content || '').substring(0, 150)}${s.content && s.content.length > 150 ? '...' : ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            html += `
                <div style="background: rgba(237, 137, 54, 0.1); border: 1px solid rgba(237, 137, 54, 0.4); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>⚠️</span>
                        <h4 style="margin: 0; color: #dd6b20;">ไม่พบพระสูตรยืนยัน</h4>
                    </div>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #c05621;">คำตอบนี้มาจากความรู้ทั่วไปของโมเดล (ไม่พบตัวบทพระสูตรยืนยันตรงในคลังข้อมูล)</p>
                </div>
            `;
        }

        // ★ Section 2: Context References (Round 1) — พระสูตรที่ใช้ตอบ
        if (hasContext) {
            html += `
                <div class="reference-section context-section" style="background: rgba(212, 160, 23, 0.1); border: 1px solid rgba(212, 160, 23, 0.4); border-radius: 8px; padding: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span>🔍</span>
                        <h4 style="margin: 0; color: #d4a017;">พระสูตรที่ใช้ประกอบการตอบ</h4>
                        <span style="background: #d4a017; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${contextSuttas.length} รายการ</span>
                    </div>
                    ${contextSuttas.map(s => `
                        <div class="reference-item" style="border-left: 3px solid #d4a017; padding-left: 8px; margin-bottom: 8px;">
                            <div class="reference-item-title">📖 ${s.title || 'ไม่ระบุชื่อ'}</div>
                            <div class="reference-item-meta">เล่ม: ${s.volume || '-'} | หัวข้อที่: ${s.topicNum || '-'} | หน้า: ${s.pageNum || '-'}</div>
                            <div class="reference-item-text">${(s.content || '').substring(0, 150)}${s.content && s.content.length > 150 ? '...' : ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        content.innerHTML = html;
    },
};

// ============================================
// NAVIGATOR MODULE (Avatar & Lip Sync)
// ============================================
const NavigatorModule = {
    widget: null,
    bubbleText: null,
    avatarIdle: null,
    avatarTalking: null,
    talkTimer: null,
    isTalking: false,
    greetings: [
        "เจริญพร... มีเรื่องธรรมะอันใดสอบถามได้เลย 🙏",
        "ธรรมะย่อมรักษาผู้ประพฤติธรรม ✨",
        "สติ มา ปัญญา เกิด... ถามมาได้เลยครับ ☸️",
        "ความทุกข์เกิดแต่เหตุ เมื่อดับเหตุ ทุกข์ก็ดับ 📖",
        "ยินดีช่วยไขข้อข้องใจในพระไตรปิฎกครับ 🙏",
    ],

    init() {
        this.widget = document.getElementById('navigatorWidget');
        this.bubbleText = document.getElementById('navigatorBubbleText');
        this.avatarIdle = document.getElementById('avatarIdle');
        this.avatarTalking = document.getElementById('avatarTalking');

        if (!this.widget) return;

        // Process images to remove pure white background dynamically
        this._cleanBackgrounds();

        // Enable drag interaction for Mouse & Touch (Desktop + Mobile)
        this._setupDraggable();
    },

    _setupDraggable() {
        if (!this.widget) return;
        let isDragging = false;
        let hasMoved = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;

        const onPointerDown = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            isDragging = true;
            hasMoved = false;
            startX = clientX;
            startY = clientY;

            const rect = this.widget.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            this.widget.style.bottom = 'auto';
            this.widget.style.right = 'auto';
            this.widget.style.left = `${initialLeft}px`;
            this.widget.style.top = `${initialTop}px`;
            this.widget.classList.add('dragging');
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                hasMoved = true;
            }

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const maxLeft = window.innerWidth - this.widget.offsetWidth - 10;
            const maxTop = window.innerHeight - this.widget.offsetHeight - 10;

            newLeft = Math.max(10, Math.min(newLeft, maxLeft));
            newTop = Math.max(10, Math.min(newTop, maxTop));

            this.widget.style.left = `${newLeft}px`;
            this.widget.style.top = `${newTop}px`;
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            this.widget.classList.remove('dragging');
        };

        // Mouse events
        this.widget.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        // Touch events for mobile screens
        this.widget.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // Click greeting only if not dragged
        this.widget.addEventListener('click', (e) => {
            if (hasMoved) {
                e.stopImmediatePropagation();
                e.preventDefault();
                hasMoved = false;
                return;
            }
            this.sayRandomGreeting();
        });
    },

    async _cleanBackgrounds() {
        if (!this.avatarIdle || !this.avatarTalking) return;
        try {
            const cleanIdle = await this._removeWhiteBg(this.avatarIdle.src);
            const cleanTalking = await this._removeWhiteBg(this.avatarTalking.src);
            if (cleanIdle) this.avatarIdle.src = cleanIdle;
            if (cleanTalking) this.avatarTalking.src = cleanTalking;
        } catch (e) {
            console.warn('Navigator background clean fallback:', e);
        }
    },

    _removeWhiteBg(imgUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    // Clean solid white background
                    if (r > 230 && g > 230 && b > 230) {
                        data[i+3] = 0; // Set Alpha to 0
                    } else if (r > 205 && g > 205 && b > 205) {
                        // Anti-alias edge softening
                        const avg = (r + g + b) / 3;
                        const alpha = Math.max(0, 255 - (avg - 205) * 5);
                        data[i+3] = Math.min(data[i+3], alpha);
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imgUrl);
        });
    },

    startTalking(customText) {
        if (!this.widget) return;
        this.isTalking = true;
        this.widget.classList.add('speaking');
        
        if (this.bubbleText) {
            this.bubbleText.textContent = customText || "🔊 กำลังเล่าธรรมะจากพระไตรปิฎก...";
        }

        // Lip-sync loop (rapid toggle between idle mouth and open mouth)
        if (this.talkTimer) clearInterval(this.talkTimer);
        let showOpen = false;

        this.talkTimer = setInterval(() => {
            if (!this.isTalking) return;
            showOpen = !showOpen;
            if (showOpen) {
                this.avatarIdle?.classList.remove('active');
                this.avatarTalking?.classList.add('active');
            } else {
                this.avatarTalking?.classList.remove('active');
                this.avatarIdle?.classList.add('active');
            }
        }, 150);
    },

    stopTalking() {
        if (!this.widget) return;
        this.isTalking = false;
        this.widget.classList.remove('speaking');

        if (this.talkTimer) {
            clearInterval(this.talkTimer);
            this.talkTimer = null;
        }

        // Return to idle mouth
        this.avatarTalking?.classList.remove('active');
        this.avatarIdle?.classList.add('active');

        if (this.bubbleText) {
            this.bubbleText.textContent = "เจริญพร... มีเรื่องธรรมะอันใดสอบถามได้เลย 🙏";
        }
    },

    sayRandomGreeting() {
        const rand = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        this.startTalking(rand);
        setTimeout(() => this.stopTalking(), 3500);
    }
};

// ============================================
// CHAT MODULE (UI)
// ============================================
const ChatModule = {
    messagesContainer: null,
    typingInterval: null,

    init() {
        this.messagesContainer = document.getElementById('chatMessages');
        // Clear previous content
        if (this.messagesContainer) this.messagesContainer.innerHTML = '';
        this._showWelcome();
    },

    _showWelcome() {
        const suggestions = [
            'ทุกข์คืออะไร?',
            'อริยสัจ 4 คืออะไร?',
            'อุปาทานคืออะไร?',
            'ตัณหาเกิดจากอะไร?',
            'สัมมาสังกัปปะคืออะไร?',
        ];

        const welcome = document.createElement('div');
        welcome.className = 'welcome-msg';
        welcome.innerHTML = `
            <span class="welcome-icon">📜</span>
            <h2 class="welcome-title">สวัสดีครับ ข้าพเจ้าคือคัมภีร์พูดได้ 🙏</h2>
            <p class="welcome-subtitle">ข้าพเจ้าเป็นคัมภีร์พระไตรปิฎกที่มีชีวิต พร้อมจะแบ่งปันปัญญาธรรมกับท่าน ถามมาได้เลยครับ ไม่ว่าจะพิมพ์หรือพูด</p>
            <div class="welcome-suggestions" id="welcomeSuggestions">
                ${suggestions.map(s => `<button class="suggestion-chip" data-query="${s}">${s}</button>`).join('')}
            </div>
        `;
        this.messagesContainer.appendChild(welcome);
    },

    removeWelcome() {
        const welcome = this.messagesContainer.querySelector('.welcome-msg');
        if (welcome) welcome.remove();
    },

    addMessage(role, text, animate = true) {
        this.removeWelcome();

        const msg = document.createElement('div');
        msg.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'ai' ? '📜' : '🪷';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        msg.appendChild(avatar);
        msg.appendChild(bubble);
        this.messagesContainer.appendChild(msg);

        if (animate && role === 'ai') {
            return this._typeText(bubble, text);
        } else {
            bubble.innerHTML = this._formatText(text);
            this.scrollToBottom();
            return Promise.resolve();
        }
    },

    _typeText(element, text) {
        return new Promise((resolve) => {
            const formattedText = this._formatText(text);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedText;
            const fullText = tempDiv.textContent || tempDiv.innerText;

            let index = 0;
            const speed = CONFIG.TYPING_SPEED;
            const adjustedSpeed = fullText.length > 300 ? Math.max(3, speed - 5) : speed;

            element.innerHTML = '';
            const textSpan = document.createElement('span');
            element.appendChild(textSpan);

            const cursor = document.createElement('span');
            cursor.style.cssText = 'display:inline-block;width:2px;height:1em;background:var(--gold-500);margin-left:2px;animation:pulse 0.8s infinite;vertical-align:text-bottom;';
            element.appendChild(cursor);

            if (this.typingInterval) clearInterval(this.typingInterval);

            this.typingInterval = setInterval(() => {
                if (index < fullText.length) {
                    textSpan.textContent += fullText[index];
                    index++;
                    if (index % 20 === 0) this.scrollToBottom();
                } else {
                    clearInterval(this.typingInterval);
                    this.typingInterval = null;
                    element.innerHTML = formattedText;
                    this.scrollToBottom();
                    resolve();
                }
            }, adjustedSpeed);
        });
    },

    _formatText(text) {
        return text
            .split(/\n\n+/)
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
    },

    addTypingIndicator() {
        this.removeWelcome();
        const msg = document.createElement('div');
        msg.className = 'message ai';
        msg.id = 'typingMsg';

        msg.innerHTML = `
            <div class="message-avatar">📜</div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(msg);
        this.scrollToBottom();
    },

    removeTypingIndicator() {
        const typing = document.getElementById('typingMsg');
        if (typing) typing.remove();
    },

    addSourceTag(suttaCount) {
        const messages = this.messagesContainer.querySelectorAll('.message.ai');
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) return;

        const bubble = lastMsg.querySelector('.message-bubble');
        if (!bubble) return;

        const tag = document.createElement('div');
        tag.className = 'message-source';
        tag.textContent = suttaCount > 0
            ? `📖 อ้างอิงจาก ${suttaCount} พระสูตร`
            : '💡 จากความรู้ทั่วไป';
        bubble.appendChild(tag);
    },

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    },
};

// ============================================
// APP CONTROLLER
// ============================================
const App = {
    isProcessing: false,

    async init() {
        // No API key modal needed — key is server-side
        // Go directly to loading data
        await this._loadData();

        // Initialize modules
        SpeechModule.init();
        BookModule.init();
        ChatModule.init();
        NavigatorModule.init();

        // Setup event listeners
        this._setupEventListeners();
    },

    async _loadData() {
        const loading = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        const progress = document.getElementById('loadingProgress');
        const status = document.getElementById('loadingStatus');

        if (loading) loading.classList.remove('hidden');
        if (app) app.classList.add('hidden');

        await DataModule.load((pct, msg) => {
            if (progress) progress.style.width = `${pct}%`;
            if (status) status.textContent = msg;
        });

        // Update sutta count
        const countEl = document.getElementById('suttaCount');
        if (countEl) countEl.textContent = DataModule.suttas.length;

        // Small delay for visual effect
        await new Promise(r => setTimeout(r, 600));

        if (loading) loading.classList.add('hidden');
        if (app) app.classList.remove('hidden');
    },

    _setupEventListeners() {
        // Toggle book panel
        const toggleBook = document.getElementById('toggleBookPanel');
        const bookPanel = document.getElementById('bookPanel');
        if (toggleBook && bookPanel) {
            toggleBook.addEventListener('click', () => {
                bookPanel.classList.toggle('collapsed');
            });
        }

        // Settings Modal Controls
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const ttsRateInput = document.getElementById('ttsRateInput');
        const ttsRateValue = document.getElementById('ttsRateValue');
        const ttsToneSelect = document.getElementById('ttsToneSelect');
        const ttsEngineSelect = document.getElementById('ttsEngineSelect');
        const testTtsBtn = document.getElementById('testTtsBtn');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');

        const updateRateLabel = (val) => {
            const v = parseFloat(val);
            let speedText = 'ปกติ';
            if (v <= 0.8) speedText = 'ช้า';
            else if (v >= 1.3) speedText = 'เร็ว';
            else if (v > 1.0) speedText = 'ค่อนข้างเร็ว';
            else if (v < 1.0) speedText = 'ค่อนข้างช้า';
            if (ttsRateValue) ttsRateValue.textContent = `${v.toFixed(2)}x (${speedText})`;
        };

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                // Populate current settings
                const s = SpeechModule.settings;
                if (ttsRateInput) {
                    ttsRateInput.value = s.rate || 1.0;
                    updateRateLabel(ttsRateInput.value);
                }
                if (ttsToneSelect) ttsToneSelect.value = s.tone || 'normal';
                if (ttsEngineSelect) ttsEngineSelect.value = s.engine || 'google_th';
                
                settingsModal.classList.remove('hidden');
            });
        }

        if (closeSettingsBtn && settingsModal) {
            closeSettingsBtn.addEventListener('click', () => {
                SpeechModule.stopSpeaking();
                settingsModal.classList.add('hidden');
            });
        }

        if (ttsRateInput) {
            ttsRateInput.addEventListener('input', (e) => {
                updateRateLabel(e.target.value);
            });
        }

        // Test Voice Button
        if (testTtsBtn) {
            testTtsBtn.addEventListener('click', () => {
                const tempSettings = {
                    rate: parseFloat(ttsRateInput?.value || 1.0),
                    tone: ttsToneSelect?.value || 'normal',
                    engine: ttsEngineSelect?.value || 'google_th'
                };
                SpeechModule.stopSpeaking();
                SpeechModule.saveSettings(tempSettings);
                SpeechModule.speak("เจริญพร... นี่คือตัวอย่างเสียงอ่านคัมภีร์พูดได้ครับ");
            });
        }

        // Save Settings Button
        if (saveSettingsBtn && settingsModal) {
            saveSettingsBtn.addEventListener('click', () => {
                const newSettings = {
                    rate: parseFloat(ttsRateInput?.value || 1.0),
                    tone: ttsToneSelect?.value || 'normal',
                    engine: ttsEngineSelect?.value || 'google_th'
                };
                SpeechModule.saveSettings(newSettings);
                SpeechModule.stopSpeaking();
                settingsModal.classList.add('hidden');
                
                if (window.NavigatorModule) {
                    NavigatorModule.startTalking("💾 บันทึกการตั้งค่าระบบและเสียงเรียบร้อยแล้ว!");
                    setTimeout(() => NavigatorModule.stopTalking(), 3000);
                }
            });
        }

        // Send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this._handleSend());
        }

        // Chat input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._handleSend();
                }
            });

            // Auto-resize textarea
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });
        }

        // Mic button
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (SpeechModule.isListening) {
                    SpeechModule.stopListening();
                    micBtn.classList.remove('recording');
                    BookModule.stopSpeaking();
                } else {
                    // ★ Stop TTS before listening
                    SpeechModule.stopSpeaking();

                    const started = SpeechModule.startListening();
                    if (started) {
                        micBtn.classList.add('recording');
                        BookModule.startListening();
                    }
                }
            });

            // Speech recognition callbacks
            SpeechModule.onListeningResult = (text, isFinal) => {
                if (chatInput) chatInput.value = text;
                if (isFinal && text.trim()) {
                    micBtn.classList.remove('recording');
                    BookModule.stopSpeaking();
                    setTimeout(() => this._handleSend(), 300);
                }
            };

            SpeechModule.onListeningEnd = () => {
                micBtn.classList.remove('recording');
                BookModule.setStatus(null, 'พร้อมสนทนา');
            };
        }

        // ★★★ Stop TTS button ★★★
        const stopBtn = document.getElementById('stopTtsBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                SpeechModule.stopSpeaking();
            });
        }

        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const query = e.target.getAttribute('data-query');
                if (query && chatInput) {
                    chatInput.value = query;
                    this._handleSend();
                }
            }
        });
    },

    async _handleSend() {
        const chatInput = document.getElementById('chatInput');
        const text = chatInput?.value?.trim();
        if (!text || this.isProcessing) return;

        // ★★★ CRITICAL: Stop any ongoing TTS immediately ★★★
        SpeechModule.stopSpeaking();

        // Stop any ongoing typing animation
        if (ChatModule.typingInterval) {
            clearInterval(ChatModule.typingInterval);
            ChatModule.typingInterval = null;
        }

        this.isProcessing = true;
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Add user message
        ChatModule.addMessage('user', text, false);

        // Show typing indicator
        ChatModule.addTypingIndicator();
        BookModule.startThinking();

        try {
            // Call Claude AI
            const response = await AIModule.chat(text);

            // Remove typing indicator
            ChatModule.removeTypingIndicator();

            // Show reference in book panel (2-section: Verified + Context)
            BookModule.showReference(response.sources, response.verified);

            // Add AI response with typing animation
            await ChatModule.addMessage('ai', response.text, true);

            // Add source tag with verification badge
            const verifiedCount = response.verified?.length || 0;
            const contextCount = response.sources?.length || 0;
            if (verifiedCount > 0) {
                ChatModule.addSourceTag(contextCount, `✅ ตรวจสอบแล้ว ${verifiedCount} พระสูตร`);
            } else {
                ChatModule.addSourceTag(contextCount);
            }

            // ★ Start TTS — will auto-cancel old speech
            BookModule.startSpeaking();
            SpeechModule.speak(response.text);

            // Show stop TTS button
            const stopWrapper = document.getElementById('stopTtsWrapper');
            if (stopWrapper && SpeechModule.isSpeaking) {
                stopWrapper.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Chat error:', error);
            ChatModule.removeTypingIndicator();
            BookModule.stopSpeaking();

            const errorMsg = `⚠️ ขออภัย เกิดข้อผิดพลาด: ${error.message} กรุณาลองอีกครั้ง`;
            ChatModule.addMessage('ai', errorMsg, false);
        }

        this.isProcessing = false;
    },
};

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
