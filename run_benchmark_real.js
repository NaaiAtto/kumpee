/**
 * run_benchmark_real.js
 * Senior Project (TR11) - Live Benchmark Suite (60 Cases)
 * รันการทดสอบระบบจริงผ่าน Node.js Server & Claude API Haiku
 * บันทึกผลดิบรายข้อ (CSV): Timestamp, คำถาม, คำตอบเต็ม, พระสูตร 2 รอบ, Overlap, Verdict, Latency (ms)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// 1. Mock Browser Environment for DataModule in app.js
global.localStorage = { getItem: () => null, setItem: () => { } };
global.document = {
    addEventListener: () => { },
    getElementById: () => ({ addEventListener: () => { }, style: {} }),
    querySelector: () => null,
    querySelectorAll: () => []
};
global.window = { addEventListener: () => { } };
global.navigator = { userAgent: 'Node' };

// 2. Load Logic from app.js
const appJsPath = path.join(__dirname, 'public', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');
const sandbox = {};
const fn = new Function('exports', appJsContent + '; return { DataModule, AIModule, parseCSV, CONFIG };');
const { DataModule, AIModule, parseCSV, CONFIG } = fn(sandbox);

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function callLocalChatApi(userQuery) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            messages: [{ role: 'user', content: userQuery }]
        });

        const req = http.request('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body.substring(0, 100)}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(45000, () => {
            req.destroy();
            reject(new Error('Request timeout after 45s'));
        });
        req.write(postData);
        req.end();
    });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// 60 TEST CASES (3 GROUPS X 20 CASES)
// ============================================

const group1_dharma = [
    { q: "อริยสัจ 4 คืออะไร และมีหลักปฏิบัติอย่างไรตามหลักพุทธศาสนา", exp: "สอดคล้อง" },
    { q: "การเจริญสติปัฏฐาน 4 มีองค์ประกอบและวิธีปฏิบัติอย่างไร", exp: "สอดคล้อง" },
    { q: "อานาปานสติ หรือการกำหนดรู้ลมหายใจตามพระสูตรมีขั้นตอนอย่างไร", exp: "สอดคล้อง" },
    { q: "ขันธ์ 5 มีอะไรบ้าง และเหตุใดพระพุทธองค์จึงทรงสอนว่าเป็นอนัตตา", exp: "สอดคล้อง" },
    { q: "ศีล 5 มีข้อใดบ้าง และอานิสงส์ของการรักษาศีลมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "ไตรลักษณ์ อนิจจัง ทุกขัง อนัตตา มีความหมายอย่างไร", exp: "สอดคล้อง" },
    { q: "ปฏิจจสมุปบาท คือสายการเกิดและดับแห่งทุกข์อย่างไร", exp: "สอดคล้อง" },
    { q: "พรหมวิหาร 4 เมตตา กรุณา มุทิตา อุเบกขา นำไปใช้ในชีวิตอย่างไร", exp: "สอดคล้อง" },
    { q: "อิทธิบาท 4 มีหลักธรรมอะไรบ้างเพื่อความสำเร็จในการงาน", exp: "สอดคล้อง" },
    { q: "พละ 5 และอินทรีย์ 5 ประกอบด้วยหลักธรรมใดบ้าง", exp: "สอดคล้อง" },
    { q: "สัมมาทิฏฐิ ความเห็นชอบในอริยมรรคมีองค์ 8 คืออะไร", exp: "สอดคล้อง" },
    { q: "นิวรณ์ 5 เครื่องกั้นจิตมิให้บรรลุความดีมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "มงคลชีวิต 38 ประการ มีความสำคัญอย่างไรต่อการดำเนินชีวิต", exp: "สอดคล้อง" },
    { q: "สัมมัปปธาน 4 หรือความเพียรชอบ 4 ประการคืออะไร", exp: "สอดคล้อง" },
    { q: "โพชฌงค์ 7 องค์แห่งการตรัสรู้มีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "ความแตกต่างระหว่างสมถกรรมฐานและวิปัสสนากรรมฐานคืออะไร", exp: "สอดคล้อง" },
    { q: "โอวาทปาติโมกข์ หัวใจสำคัญของพระพุทธศาสนามีหลักการอย่างไร", exp: "สอดคล้อง" },
    { q: "ธัมมจักกัปปวัตตนสูตร แสดงธรรมเรื่องใดแก่ปัญจวัคคีย์", exp: "สอดคล้อง" },
    { q: "อนัตตลักขณสูตร แสดงความจริงเรื่องรูปและนามอย่างไร", exp: "สอดคล้อง" },
    { q: "การแผ่เมตตาตามหลักพระสูตรมีอานิสงส์อย่างไร", exp: "สอดคล้อง" }
];

const group2_distortion = [
    { q: "พระพุทธเจ้าสอนว่าการเสพเมถุนเป็นเรื่องธรรมดาของพระภิกษุใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "การฆ่าคนชั่วเพื่อปกป้องคนดีจัดเป็นบุญกุศลตามหลักพุทธศาสนาใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงอนุญาตให้พระสงฆ์ประกอบพิธีสะเดาะเคราะห์และต่อชะตาใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การทำบุญบริจาคเงินจำนวนมากจะช่วยลบล้างบาปกรรมที่เคยทำมาได้ทั้งหมดจริงหรือ", exp: "คลาดเคลื่อน" },
    { q: "นิพพานคือแดนสวรรค์อันเป็นทิพย์ที่จิตจะไปสถิตอยู่ตลอดไปใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าเคยสอนว่าสัตว์ทั้งหลายไม่มีกรรมเป็นของตนเองใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การดื่มสุราเพียงเล็กน้อยเพื่อเข้าสังคมไม่ผิดศีล 5 ตามหลักพระสูตรใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "คำสอนเรื่องการแก้กรรมด้วยการนอนในโลงศพมีบันทึกอยู่ในพระไตรปิฎกเล่มใด", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนให้บูชายัญสัตว์เพื่อความเจริญรุ่งเรืองใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การปล่อยนกปล่อยปลาสะเดาะเคราะห์เป็นข้อปฏิบัติหลักที่พระพุทธเจ้าทรงบัญญัติใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "คำสอนว่าตายแล้วสูญ ขาดสูญ ไม่มีการเกิดใหม่อีก เป็นสัมมาทิฏฐิใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงอนุญาตให้พระสงฆ์เรียกร้องค่าจ้างในการสวดมนต์ใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "การดูหมอและการทำนายดวงชะตาเป็นกิจที่พระพุทธองค์ทรงสรรเสริญใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนว่าคนเราเกิดมาเพราะพระผู้สร้างดลบันดาลใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "มีพระสูตรใดระบุว่าการกราบไหว้ต้นไม้ศักดิ์สิทธิ์ทำให้พ้นทุกข์ได้", exp: "คลาดเคลื่อน" },
    { q: "การเสพสิ่งเสพติดช่วยให้เข้าถึงสมาธิชั้นสูงได้ตามหลักพุทธวจนะใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงสอนว่าความโลภและความโกรธเป็นสิ่งที่ดีหากนำไปใช้หาเงินใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การลักทรัพย์คนรวยมาแจกคนจนไม่ถือว่าผิดศีลอทินนาทานใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนให้แก้บนด้วยการนำหัวหมูและเหล้ามาถวายใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระไตรปิฎกมีบันทึกคาถาปลุกเสกเครื่องรางของขลังเพื่อให้แคล้วคลาดใช่ไหม", exp: "คลาดเคลื่อน" }
];

const group3_nondharma = [
    { q: "การซื้อขายหุ้นและเทรดคริปโตเคอร์เรนซีมีกลยุทธ์ทำกำไรอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "ปัญญาประดิษฐ์ Large Language Model มีหลักการประมวลผลอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "กฎหมายจราจรของประเทศไทยมีบทลงโทษการขับรถฝ่าไฟแดงอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "สูตรการทำต้มยำกุ้งน้ำข้นให้อร่อยต้องเตรียมวัตถุดิบอะไรบ้าง", exp: "ไม่พบหลักฐาน" },
    { q: "ความแตกต่างระหว่างภาษา Python และ JavaScript คืออะไร", exp: "ไม่พบหลักฐาน" },
    { q: "ทีมฟุตบอลเรอัลมาดริดเคยได้แชมป์ยูฟ่าแชมเปียนส์ลีกกี่สมัย", exp: "ไม่พบหลักฐาน" },
    { q: "ขั้นตอนการยื่นแบบและคำนวณภาษีเงินได้บุคคลธรรมดาประจำปีทำอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "ทฤษฎีสัมพัทธภาพทั่วไปของอัลเบิร์ต ไอน์สไตน์ อธิบายแรงโน้มถ่วงอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "ระบบสุริยะมีดาวเคราะห์บริวารกี่ดวง และดาวเคราะห์ใดมีขนาดใหญ่ที่สุด", exp: "ไม่พบหลักฐาน" },
    { q: "การออกกำลังกายแบบ Interval Training (HIIT) มีประโยชน์ต่อหัวใจอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "สาเหตุหลักที่ทำให้คอมพิวเตอร์เปิดไม่ติดและขึ้นจอฟ้า (BSOD) คืออะไร", exp: "ไม่พบหลักฐาน" },
    { q: "เปรียบเทียบข้อดีและข้อเสียระหว่างระบบปฏิบัติการ iOS และ Android", exp: "ไม่พบหลักฐาน" },
    { q: "ประวัติศาสตร์และชนวนเหตุของการเกิดสงครามโลกครั้งที่ 2 เริ่มต้นอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "เทคนิคการจองตั๋วเครื่องบินระหว่างประเทศให้ได้ราคาประหยัดที่สุด", exp: "ไม่พบหลักฐาน" },
    { q: "การปลูกต้นไม้กระถางในร่มช่วยฟอกอากาศและดูดซับสารพิษได้จริงหรือไม่", exp: "ไม่พบหลักฐาน" },
    { q: "หลักการทำงานของคลื่นแม่เหล็กไฟฟ้าในเตาอบไมโครเวฟเป็นอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "สูตรโครงสร้างทางเคมีของน้ำบริสุทธิ์และก๊าซคาร์บอนไดออกไซด์คืออะไร", exp: "ไม่พบหลักฐาน" },
    { q: "ขั้นตอนการลงทะเบียนผู้ประกันตนมาตรา 39 และมาตรา 40 ทำอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "สภาพภูมิอากาศและกลไกการก่อตัวของพายุหมุนเขตร้อนเกิดขึ้นได้อย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "เทคนิคการตั้งค่ากล้องถ่ายภาพเพื่อให้ได้ระยะชัดลึกและภาพหน้าชัดหลังเบลอ", exp: "ไม่พบหลักฐาน" }
];

async function main() {
    console.log('================================================================');
    console.log('📜 มหาปเทส 4 — LIVE BENCHMARK EVALUATION (60 CASES)');
    console.log('🏛️  Senior Project TR11 | Faculty of Engineering');
    console.log('📡 Server: http://localhost:8080 (Claude Haiku 4.5)');
    console.log('================================================================\n');

    console.log('📥 Loading 932 Suttas dataset from Google Sheets CSV...');
    const csvRaw = await fetchUrl(CONFIG.SHEET_CSV_URL);
    const parsedRows = parseCSV(csvRaw);
    DataModule._processData(parsedRows);
    console.log(`✅ Loaded ${DataModule.suttas.length} Suttas into DataModule!\n`);

    const allCases = [];
    group1_dharma.forEach((c, idx) => allCases.push({ ...c, id: `TC-${(idx + 1).toString().padStart(4, '0')}`, group: 'กลุ่มที่ 1: พระธรรมวินัย (Expected: สอดคล้อง)' }));
    group2_distortion.forEach((c, idx) => allCases.push({ ...c, id: `TC-${(idx + 21).toString().padStart(4, '0')}`, group: 'กลุ่มที่ 2: คำสอนคลาดเคลื่อน (Expected: คลาดเคลื่อน)' }));
    group3_nondharma.forEach((c, idx) => allCases.push({ ...c, id: `TC-${(idx + 41).toString().padStart(4, '0')}`, group: 'กลุ่มที่ 3: คำถามทั่วไปนอกศาสนา (Expected: ไม่พบหลักฐาน)' }));

    const results = [];
    const latencies = [];

    console.log(`Starting real test execution of ${allCases.length} cases...\n`);

    for (let i = 0; i < allCases.length; i++) {
        const item = allCases[i];
        const timestamp = new Date().toISOString();

        // Round 1: Search relevant suttas for context
        const relevantSuttas = DataModule.search(item.q);
        const suttaRound1Titles = relevantSuttas.slice(0, 5).map(s => s.title);

        let context = '';
        if (relevantSuttas.length > 0) {
            context = '\n\n--- พระสูตรที่เกี่ยวข้องจากฐานข้อมูล ---\n';
            let totalLen = 0;
            for (const s of relevantSuttas) {
                const sText = `\n📖 ชื่อ: ${s.title}\nเล่ม: ${s.volume} | หัวข้อที่: ${s.topicNum}\nเนื้อหา: ${s.content.substring(0, 800)}\n`;
                totalLen += sText.length;
                if (totalLen > 3500) break;
                context += sText;
            }
            context += '\n--- จบข้อมูลพระสูตร ---\n';
        }

        const fullQuery = context ? `${item.q}\n${context}` : item.q;

        const startTime = performance.now();
        let apiRes = null;
        let aiText = '';
        let isFallback = false;
        let serverDistorted = false;

        try {
            apiRes = await callLocalChatApi(fullQuery);
            aiText = apiRes?.content?.[0]?.text || '';
            isFallback = apiRes?._fallback === true;
            serverDistorted = apiRes?._isDistorted === true;
        } catch (err) {
            console.error(`Error on ${item.id}:`, err.message);
            aiText = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
            isFallback = true;
        }

        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);
        latencies.push(latencyMs);

        // Round 2: Search verification from Claude's response
        const verifiedSuttas = DataModule.search(aiText, { minScore: 3 });
        const suttaRound2Titles = verifiedSuttas.slice(0, 5).map(s => s.title);

        // Mahapadesa 4 Verdict
        const verdictObj = AIModule._generateVerdict(relevantSuttas, verifiedSuttas, isFallback, aiText, item.q, serverDistorted);
        const actualVerdict = verdictObj.verdict;
        const overlapCount = verdictObj.overlapCount || 0;

        const isMatch = actualVerdict === item.exp;

        const record = {
            id: item.id,
            group: item.group,
            timestamp,
            question: item.q,
            expected_verdict: item.exp,
            actual_verdict: actualVerdict,
            is_correct: isMatch ? 'YES' : 'NO',
            overlap_count: overlapCount,
            suttas_round1: suttaRound1Titles.join(' | '),
            suttas_round2: suttaRound2Titles.join(' | '),
            latency_ms: latencyMs,
            claude_response: aiText.replace(/\r?\n/g, ' ')
        };

        results.push(record);

        const icon = isMatch ? '✅' : '❌';
        console.log(`[${(i + 1).toString().padStart(2, '0')}/60] ${icon} ${item.id} | ${actualVerdict.padEnd(12)} (Exp: ${item.exp}) | Latency: ${latencyMs}ms | Q: "${item.q.substring(0, 30)}..."`);

        // Polite delay between requests to avoid rate limits (2.5 - 3.5s)
        await sleep(2800);
    }

    // ============================================
    // EVALUATION METRICS CALCULATION
    // ============================================
    console.log('\n================================================================');
    console.log('📊 EVALUATION SUMMARY & METRICS (REAL LIVE DATA)');
    console.log('================================================================');

    let totalCorrect = results.filter(r => r.is_correct === 'YES').length;
    let accuracy = (totalCorrect / results.length) * 100;

    let g1 = results.filter(r => r.id.startsWith('TC-00') && parseInt(r.id.split('-')[1]) <= 20);
    let g2 = results.filter(r => parseInt(r.id.split('-')[1]) > 20 && parseInt(r.id.split('-')[1]) <= 40);
    let g3 = results.filter(r => parseInt(r.id.split('-')[1]) > 40);

    let g1_correct = g1.filter(r => r.is_correct === 'YES').length;
    let g2_correct = g2.filter(r => r.is_correct === 'YES').length;
    let g3_correct = g3.filter(r => r.is_correct === 'YES').length;

    console.log(`\nAccuracy รวม: ${accuracy.toFixed(2)}% (${totalCorrect}/${results.length})`);
    console.log(`- กลุ่มที่ 1 (ธรรมะแท้): ${((g1_correct / g1.length) * 100).toFixed(2)}% (${g1_correct}/${g1.length})`);
    console.log(`- กลุ่มที่ 2 (คำสอนคลาดเคลื่อน): ${((g2_correct / g2.length) * 100).toFixed(2)}% (${g2_correct}/${g2.length})`);
    console.log(`- กลุ่มที่ 3 (คำถามทั่วไป): ${((g3_correct / g3.length) * 100).toFixed(2)}% (${g3_correct}/${g3.length})`);

    // Latency Distribution
    latencies.sort((a, b) => a - b);
    let minLat = latencies[0];
    let maxLat = latencies[latencies.length - 1];
    let avgLat = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    let medianLat = latencies[Math.floor(latencies.length / 2)];
    let variance = latencies.reduce((sum, val) => sum + Math.pow(val - avgLat, 2), 0) / latencies.length;
    let sdLat = Math.round(Math.sqrt(variance));

    console.log(`\nLatency Statistics:`);
    console.log(`- ต่ำสุด (Min): ${minLat} ms`);
    console.log(`- สูงสุด (Max): ${maxLat} ms`);
    console.log(`- ค่าเฉลี่ย (Mean): ${avgLat} ms`);
    console.log(`- มัธยฐาน (Median): ${medianLat} ms`);
    console.log(`- ส่วนเบี่ยงเบนมาตรฐาน (SD): ${sdLat} ms`);

    // ============================================
    // EXPORT TO CSV
    // ============================================
    const csvHeaders = ['Case_ID', 'Group', 'Timestamp', 'Question', 'Expected_Verdict', 'Actual_Verdict', 'Verdict_Match', 'Overlap_Count', 'Suttas_Round1', 'Suttas_Round2', 'Latency_ms', 'Claude_Full_Response'];
    const csvRows = [csvHeaders.join(',')];

    for (const r of results) {
        const row = [
            `"${r.id}"`,
            `"${r.group}"`,
            `"${r.timestamp}"`,
            `"${r.question.replace(/"/g, '""')}"`,
            `"${r.expected_verdict}"`,
            `"${r.actual_verdict}"`,
            `"${r.is_correct}"`,
            r.overlap_count,
            `"${r.suttas_round1.replace(/"/g, '""')}"`,
            `"${r.suttas_round2.replace(/"/g, '""')}"`,
            r.latency_ms,
            `"${r.claude_response.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n'); // with UTF-8 BOM for Excel

    const outPath1 = path.join(__dirname, 'benchmark_results_real_60cases.csv');
    const outPath2 = path.join('d:\\project\\kumpee\\project_materials\\04_ชุดข้อมูลและผลทดสอบ_Benchmark', 'benchmark_results_real_60cases.csv');

    fs.writeFileSync(outPath1, csvContent, 'utf8');
    fs.writeFileSync(outPath2, csvContent, 'utf8');

    console.log(`\n✅ Saved raw CSV to:\n  - ${outPath1}\n  - ${outPath2}`);
}

main().catch(console.error);
