/**
 * run_benchmark_150_cases.js
 * Senior Project (TR11) - Live Benchmark Suite (150 Cases)
 * รันการทดสอบระบบจริงผ่าน Node.js Server & Claude API Haiku
 * บันทึกผลดิบรายข้อ (CSV & XLSX): Timestamp, คำถาม, คำตอบเต็ม, พระสูตร 2 รอบ, Overlap, Verdict, Latency (ms)
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
// 150 TEST CASES (3 GROUPS X 50 CASES)
// ============================================

const group1_dharma = [
    // 1-20
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
    { q: "การแผ่เมตตาตามหลักพระสูตรมีอานิสงส์อย่างไร", exp: "สอดคล้อง" },
    // 21-50 (New authentic additions from Buddhawajana 11 books)
    { q: "อริยมรรคมีองค์ 8 มีองค์ประกอบและแนวทางปฏิบัติสู่ความพ้นทุกข์อย่างไร", exp: "สอดคล้อง" },
    { q: "สักกายทิฏฐิคืออะไร และพระโสดาบันละสังโยชน์ข้อนี้ได้อย่างไร", exp: "สอดคล้อง" },
    { q: "วิจิกิจฉาและสีลัพพตปรามาสในสังโยชน์ 3 มีความหมายและวิธีละอย่างไร", exp: "สอดคล้อง" },
    { q: "ความแตกต่างระหว่างพระโสดาบัน พระสกทาคามี และพระอนาคามีตามพระสูตร", exp: "สอดคล้อง" },
    { q: "กามราคะและปฏิฆะที่เบาบางลงในระดับพระสกทาคามีมีลักษณะอย่างไร", exp: "สอดคล้อง" },
    { q: "โอรัมภาคิยสังโยชน์ หรือสังโยชน์เบื้องต่ำ 5 ประการมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "การเจริญอานาปานสติ 16 ขั้นตามอานาปานสติสูตรมีลำดับขั้นตอนอย่างไร", exp: "สอดคล้อง" },
    { q: "กายคตาสติมีวิธีเจริญและให้ผลานิสงส์อย่างไรตามพุทธวจน", exp: "สอดคล้อง" },
    { q: "อินทรียสังวรศีล การสำรวมตา หู จมูก ลิ้น กาย ใจ มีหลักการอย่างไร", exp: "สอดคล้อง" },
    { q: "กรรม 3 ประการ กายกรรม วจีกรรม มโนกรรม มีผลต่อการเวียนว่ายตายเกิดอย่างไร", exp: "สอดคล้อง" },
    { q: "เจตนาหัง ภิกขเว กัมมัง วทามิ พระพุทธองค์ตรัสว่าเจตนาคือกรรมอย่างไร", exp: "สอดคล้อง" },
    { q: "วิบากแห่งกรรมขาว กรรมดำ กรรมทั้งดำทั้งขาว และกรรมไม่ดำไม่ขาวคืออะไร", exp: "สอดคล้อง" },
    { q: "ภพภูมิ 31 ภูมิ หรืออบายภูมิ 4 และสุคติภูมิ มีคำอธิบายตามพุทธวจนอย่างไร", exp: "สอดคล้อง" },
    { q: "สัตว์ตานัง สัตว์ผู้มีอวิชชาเป็นเครื่องกั้น ตัณหาเป็นเครื่องผูกมีลักษณะอย่างไร", exp: "สอดคล้อง" },
    { q: "วิญญาณฐิติ 7 และอายตนะ 2 มีความหมายอย่างไรตามพระสูตร", exp: "สอดคล้อง" },
    { q: "เดรัจฉานวิชา หรือดิรัจฉานกถาที่พระภิกษุไม่พึงประกอบมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "การเลี้ยงชีพชอบของฆราวาสตามหลักหนังสือฆราวาสชั้นเลิศมีแนวทางอย่างไร", exp: "สอดคล้อง" },
    { q: "ทิฏฐธัมมิกัตถะ 4 ธรรมเพื่อประโยชน์ในปัจจุบัน หรือหัวใจเศรษฐีมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "สัมปรายิกัตถะ 4 ธรรมเพื่อประโยชน์ในภพหน้าสำหรับคฤหัสถ์มีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "กุลจิรัฏฐิติธรรม 4 ธรรมสำหรับดำรงตระกูลให้มั่นคงยั่งยืนคืออะไร", exp: "สอดคล้อง" },
    { q: "ภรรยา 7 ประเภทตามหลักสัตตภริยาสูตรมีลักษณะอย่างไร", exp: "สอดคล้อง" },
    { q: "ทิศ 6 การปฏิบัติตนต่อบุคคลรอบข้างตามสิงคาลกสูตรมีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "คุณสมบัติของอุบาสกผู้เป็นรัตนะ หรืออุบาสกจัณฑาลตามพระสูตรคืออะไร", exp: "สอดคล้อง" },
    { q: "ตถาคตโพธิสัทธา ความเชื่อมั่นในการตรัสรู้ของพระตถาคตคืออะไร", exp: "สอดคล้อง" },
    { q: "อัจฉริยัพภูตธรรม ธรรมอันน่าอัศจรรย์ของพระสัมมาสัมพุทธเจ้ามีอะไรบ้าง", exp: "สอดคล้อง" },
    { q: "พระผู้มีพระภาคเจ้าทรงตรัสถึงความดับสนิทแห่งสังขารหรือนิพพานอย่างไร", exp: "สอดคล้อง" },
    { q: "ฐีติธรรม หรือธรรมนิยาม 3 ประการ อนิจจตา ทุกขตา อนัตตตา คืออะไร", exp: "สอดคล้อง" },
    { q: "ธาตุ 18 และอายตนะ 12 ทำงานสัมพันธ์กันอย่างไรในการรับรู้อารมณ์", exp: "สอดคล้อง" },
    { q: "สัปปุริสธรรม 7 คุณสมบัติของคนดีหรือสัตบุรุษมีหลักการอย่างไร", exp: "สอดคล้อง" },
    { q: "อัปปมาทธรรม หรือความไม่ประมาท อันเป็นปัจฉิมโอวาทมีความสำคัญอย่างไร", exp: "สอดคล้อง" }
];

const group2_distortion = [
    // 1-20
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
    { q: "พระไตรปิฎกมีบันทึกคาถาปลุกเสกเครื่องรางของขลังเพื่อให้แคล้วคลาดใช่ไหม", exp: "คลาดเคลื่อน" },
    // 21-50 (New distortion cases targeting common doctrinal confusions)
    { q: "พระพุทธเจ้าทรงสอนว่าจิตเป็นอัตตาเที่ยงแท้ถาวรไม่ดับสูญใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "การสักยันต์ลงอักขระเลขยันต์สามารถป้องกันศาสตราวุธและช่วยบรรลุธรรมได้ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงอนุญาตให้ภิกษุสะสมเงินทองและเล่นการพนันได้ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การอาบน้ำมนต์ล้างบาปสามารถตัดกรรมและชำระกิเลสให้บริสุทธิ์ได้ตามหลักพุทธวจนจริงหรือ", exp: "คลาดเคลื่อน" },
    { q: "คำสอนว่านิพพานเป็นอัตตาตัวตนใหญ่ที่แท้จริงสอดคล้องกับพุทธวจนใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระสงฆ์ใบ้หวยบอกเลขเด็ดเป็นสัมมาอาชีวะที่พระพุทธองค์ทรงสรรเสริญใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การอดอาหารจนตายหรือทรมานร่างกายแบบอัตตกิลมถานุโยคเป็นทางเอกสู่การตรัสรู้ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงสอนว่าการทำบุญสร้างโบสถ์วิหารได้บุญมากกว่าการเจริญสติภาวนาใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "การสวดพระปริตรเพื่อสาปแช่งศัตรูให้วิบัติเป็นธรรมเนียมที่มีในพระสูตรใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "คำสอนเรื่องพระศรีอริยเมตไตรยลงมาเกิดเป็นบุคคลในปัจจุบันเพื่อดูดทรัพย์เข้าลัทธิเป็นพุทธวจนใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การถวายสังฆทานด้วยสิ่งของหรูหราฟุ่มเฟือยจะทำให้ชาติหน้าเกิดเป็นมหาเศรษฐีรวยล้นฟ้าใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนให้บูชาดวงดาวและดาวพระราหูเพื่อแก้ชงใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงอนุญาตให้สงฆ์ทำพิธีเสน่ห์ยาแฝดเพื่อให้คู่รักกลับมารักกันใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การกินเจหรือมังสวิรัติเป็นเงื่อนไขบังคับข้อเดียวในการบรรลุธรรมเป็นพระอรหันต์ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "คำสอนว่าบุญบาปไม่มีจริง นรกสวรรค์ไม่มีจริง เป็นสัมมาทิฏฐิใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนว่าเพศหญิงไม่มีสิทธิ์บรรลุธรรมหรือเป็นอริยบุคคลใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การกราบไหว้รูปปั้นพญานาคและครุฑเพื่อให้ร่ำรวยเป็นหัวใจหลักของพระไตรปิฎกใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระสงฆ์สามารถประกอบพิธีทรงเจ้าเข้าผีเพื่อช่วยชาวบ้านพ้นเคราะห์ได้ใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงสอนว่าการนั่งสมาธิเพียงครั้งเดียวสามารถลบล้างบาปกรรมทั้งหมดในอดีตได้ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การนำพระพุทธรูปไปปลุกเสกด้วยมนต์ดำเพื่อทำร้ายผู้อื่นเป็นสิ่งที่พระธรรมวินัยอนุญาตใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "คำสอนว่ามนุษย์ทุกคนมีชะตากรรมถูกกำหนดไว้ล่วงหน้าทั้งหมดแก้ไขไม่ได้ตามลัทธิพรหมลิขิตเป็นพุทธแท้ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การสวดคาถามหาจักรพรรดิจะช่วยให้เปิดโลกวิญญาณและรวยทางลัดได้ตามพุทธวจนใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงสอนให้ภิกษุจัดพิธีรดน้ำมนต์สะเดาะเคราะห์พ่นน้ำหมากใส่ญาติโยมใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การบูชากุมารทองและลูกกรอกเป็นหลักสูตรการปฏิบัติธรรมขั้นสูงในพระพุทธศาสนาใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงสอนว่าความกตัญญูสามารถตอบแทนได้ด้วยการช่วยบิดามารดาค้ายาเสพติดใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การโกหกเพื่อผลประโยชน์ส่วนรวมโดยไม่มีเจตนาทุจริตไม่นับเป็นมุสาวาทใช่หรือไม่", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธองค์ทรงบัญญัติให้ฆ่าสัตว์ตัวเล็กเพื่อเซ่นไหว้เทวดาอารักษ์ประจำบ้านใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "การทำสมาธิแล้วถอดจิตไปท่องเที่ยวจักรวาลอื่นเป็นเป้าหมายสูงสุดของพระพุทธศาสนาใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "คำสอนว่าการบวชพระเพียง 7 วันจะทำให้บิดามารดาขึ้นสวรรค์โดยไม่ต้องปฏิบัติธรรมใดๆ ใช่ไหม", exp: "คลาดเคลื่อน" },
    { q: "พระพุทธเจ้าทรงอนุญาตให้พระภิกษุดื่มเครื่องดื่มแอลกอฮอล์เพื่อเป็นยาชูกำลังใช่ไหม", exp: "คลาดเคลื่อน" }
];

const group3_nondharma = [
    // 1-20
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
    { q: "เทคนิคการตั้งค่ากล้องถ่ายภาพเพื่อให้ได้ระยะชัดลึกและภาพหน้าชัดหลังเบลอ", exp: "ไม่พบหลักฐาน" },
    // 21-50 (New non-religious worldly topics)
    { q: "รถยนต์ไฟฟ้า (EV) ใช้แบตเตอรี่ชนิดใดและมีระยะทางวิ่งสูงสุดกี่กิโลเมตรต่อการชาร์จ", exp: "ไม่พบหลักฐาน" },
    { q: "เทคโนโลยีควอนตัมคอมพิวติ้งแตกต่างจากคอมพิวเตอร์แบบดั้งเดิมอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการทำเค้กช็อกโกแลตหน้านิ่มโดยไม่ต้องใช้เตาอบอบอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "กลยุทธ์การตลาดดิจิทัลผ่าน Search Engine Optimization (SEO) มีปัจจัยสำคัญอะไรบ้าง", exp: "ไม่พบหลักฐาน" },
    { q: "อัตราแลกเปลี่ยนเงินดอลลาร์สหรัฐเทียบกับเงินบาทคำนวณจากปัจจัยเศรษฐกิจใด", exp: "ไม่พบหลักฐาน" },
    { q: "แนะนำสถานที่ท่องเที่ยวเชิงธรรมชาติในจังหวัดเชียงใหม่ช่วงฤดูหนาวที่น่าสนใจ", exp: "ไม่พบหลักฐาน" },
    { q: "การบำรุงรักษาเครื่องยนต์รถจักรยานยนต์และการเปลี่ยนถ่ายน้ำมันเครื่องควรทำทุกกี่กิโลเมตร", exp: "ไม่พบหลักฐาน" },
    { q: "กฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA) มีหลักเกณฑ์คุ้มครองสิทธิของผู้บริโภคอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "ประวัติศาสตร์การก่อสร้างมหาพีระมิดแห่งกิซาในอียิปต์โบราณใช้เวลากี่ปี", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการปลูกผักสลัดไฮโดรโปนิกส์สำหรับผู้เริ่มต้นในพื้นที่จำกัดทำอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "กลไกการเกิดคลื่นยักษ์สึนามิในมหาสมุทรและการตรวจจับสัญญาณเตือนภัยล่วงหน้าทำงานอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "เปรียบเทียบข้อดีข้อเสียระหว่างการซื้อบ้านเดี่ยวชานเมืองกับคอนโดมิเนียมติดรถไฟฟ้า", exp: "ไม่พบหลักฐาน" },
    { q: "ขั้นตอนการยื่นขอวีซ่าท่องเที่ยวประเทศญี่ปุ่นและรายการเอกสารที่ต้องใช้มีอะไรบ้าง", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการชงกาแฟดริปแบบมืออาชีพเพื่อดึงรสชาติและกลิ่นหอมตามธรรมชาติของเมล็ดกาแฟ", exp: "ไม่พบหลักฐาน" },
    { q: "วัคซีนป้องกันไข้หวัดใหญ่ชนิด 4 สายพันธุ์ควรฉีดซ้ำทุกกี่เดือนและเหมาะกับวัยใด", exp: "ไม่พบหลักฐาน" },
    { q: "การตัดต่อวิดีโอด้วยโปรแกรม Adobe Premiere Pro มีคีย์ลัดพื้นฐานอะไรที่ช่วยให้ทำงานเร็วขึ้น", exp: "ไม่พบหลักฐาน" },
    { q: "กลไกการสังเคราะห์ด้วยแสงของพืชเปลี่ยนพลังงานแสงอาทิตย์และคาร์บอนไดออกไซด์เป็นน้ำตาลอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "แนะนำการจัดพอร์ตการลงทุนแบบ Asset Allocation เพื่อกระจายความเสี่ยงในวัยเกษียณ", exp: "ไม่พบหลักฐาน" },
    { q: "สถิติโลกการแข่งขันวิ่งระยะทาง 100 เมตรชายและหญิงเป็นของนักกีฬาสัญชาติใด", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการแก้ปัญหาน้ำรั่วซึมจากท่อระบายน้ำพีวีซีใต้ซิงค์ล้างจานในห้องครัว", exp: "ไม่พบหลักฐาน" },
    { q: "สถาปัตยกรรมซอฟต์แวร์แบบไมโครเซอร์วิส (Microservices) แตกต่างจากโมโนลิธ (Monolith) อย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "กฎและกติกาการเดินตัวหมากรุกสากลเบื้องต้นสำหรับการเคลื่อนที่ของตัวม้าและเรือ", exp: "ไม่พบหลักฐาน" },
    { q: "ค้างคาวเป็นสัตว์เลี้ยงลูกด้วยนมที่บินได้ชนิดเดียวในโลกและใช้คลื่นเสียงสะท้อนหาอาหารอย่างไร", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการเช็ดทำความสะอาดเลนส์แว่นตาไม่ให้เคลือบมัลติโค้ทเสียหายหรือเกิดรอยขีดข่วน", exp: "ไม่พบหลักฐาน" },
    { q: "สาเหตุหลักที่ก่อให้เกิดปรากฏการณ์ก๊าซเรือนกระจกและภาวะโลกร้อนในปัจจุบัน", exp: "ไม่พบหลักฐาน" },
    { q: "ขั้นตอนและเอกสารที่ต้องใช้ในการขอจดทะเบียนนิติบุคคลบริษัทจำกัดที่กรมพัฒนาธุรกิจการค้า", exp: "ไม่พบหลักฐาน" },
    { q: "เทคนิคการเขียนเรซูเม่และจดหมายแนะนำตัวภาษาอังกฤษสำหรับนักศึกษาจบใหม่", exp: "ไม่พบหลักฐาน" },
    { q: "เที่ยวบินพาณิชย์ที่บินตรงระยะทางไกลที่สุดในโลกเชื่อมต่อระหว่างสนามบินใด", exp: "ไม่พบหลักฐาน" },
    { q: "วิธีการเลือกซื้อที่นอนยางพาราแท้เพื่อสุขภาพเพื่อบรรเทาอาการปวดหลังเรื้อรัง", exp: "ไม่พบหลักฐาน" },
    { q: "หลักการทำงานของระบบขับเคลื่อนไฮบริด (Hybrid) สลับการทำงานระหว่างเครื่องยนต์น้ำมันและมอเตอร์ไฟฟ้าอย่างไร", exp: "ไม่พบหลักฐาน" }
];

async function main() {
    console.log('================================================================');
    console.log('📜 มหาปเทส 4 — LIVE BENCHMARK EVALUATION (150 CASES)');
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
    group2_distortion.forEach((c, idx) => allCases.push({ ...c, id: `TC-${(idx + 51).toString().padStart(4, '0')}`, group: 'กลุ่มที่ 2: คำสอนคลาดเคลื่อน (Expected: คลาดเคลื่อน)' }));
    group3_nondharma.forEach((c, idx) => allCases.push({ ...c, id: `TC-${(idx + 101).toString().padStart(4, '0')}`, group: 'กลุ่มที่ 3: คำถามทั่วไปนอกศาสนา (Expected: ไม่พบหลักฐาน)' }));

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
        console.log(`[${(i + 1).toString().padStart(3, '0')}/150] ${icon} ${item.id} | ${actualVerdict.padEnd(12)} (Exp: ${item.exp}) | Latency: ${latencyMs}ms | Q: "${item.q.substring(0, 32)}..."`);

        // Polite delay between requests
        await sleep(800);
    }

    // ============================================
    // EVALUATION METRICS CALCULATION
    // ============================================
    console.log('\n================================================================');
    console.log('📊 EVALUATION SUMMARY & METRICS (REAL LIVE 150 CASES)');
    console.log('================================================================');

    let totalCorrect = results.filter(r => r.is_correct === 'YES').length;
    let accuracy = (totalCorrect / results.length) * 100;

    let g1 = results.filter(r => parseInt(r.id.split('-')[1]) <= 50);
    let g2 = results.filter(r => parseInt(r.id.split('-')[1]) > 50 && parseInt(r.id.split('-')[1]) <= 100);
    let g3 = results.filter(r => parseInt(r.id.split('-')[1]) > 100);

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
    // 4-STATE CONFUSION MATRIX
    // ============================================
    const matrix = {
        g1: { 'สอดคล้อง': 0, 'คลาดเคลื่อน': 0, 'ไม่พบหลักฐาน': 0, 'Fallback': 0 },
        g2: { 'สอดคล้อง': 0, 'คลาดเคลื่อน': 0, 'ไม่พบหลักฐาน': 0, 'Fallback': 0 },
        g3: { 'สอดคล้อง': 0, 'คลาดเคลื่อน': 0, 'ไม่พบหลักฐาน': 0, 'Fallback': 0 }
    };

    g1.forEach(r => {
        const v = r.actual_verdict.includes('Fallback') ? 'Fallback' : r.actual_verdict;
        if (matrix.g1[v] !== undefined) matrix.g1[v]++;
        else matrix.g1['ไม่พบหลักฐาน']++;
    });

    g2.forEach(r => {
        const v = r.actual_verdict.includes('Fallback') ? 'Fallback' : r.actual_verdict;
        if (matrix.g2[v] !== undefined) matrix.g2[v]++;
        else matrix.g2['ไม่พบหลักฐาน']++;
    });

    g3.forEach(r => {
        const v = r.actual_verdict.includes('Fallback') ? 'Fallback' : r.actual_verdict;
        if (matrix.g3[v] !== undefined) matrix.g3[v]++;
        else matrix.g3['ไม่พบหลักฐาน']++;
    });

    console.log('\n--- 4-State Confusion Matrix ---');
    console.log('Group 1 (Authentic):', JSON.stringify(matrix.g1));
    console.log('Group 2 (Distorted):', JSON.stringify(matrix.g2));
    console.log('Group 3 (Non-dharma):', JSON.stringify(matrix.g3));

    // Save summary json
    const summaryData = {
        totalCases: results.length,
        totalCorrect,
        accuracy: +(accuracy.toFixed(2)),
        g1: { total: g1.length, correct: g1_correct, rate: +(((g1_correct / g1.length) * 100).toFixed(2)), breakdown: matrix.g1 },
        g2: { total: g2.length, correct: g2_correct, rate: +(((g2_correct / g2.length) * 100).toFixed(2)), breakdown: matrix.g2 },
        g3: { total: g3.length, correct: g3_correct, rate: +(((g3_correct / g3.length) * 100).toFixed(2)), breakdown: matrix.g3 },
        latency: { min: minLat, max: maxLat, mean: avgLat, median: medianLat, sd: sdLat },
        matrix
    };

    fs.writeFileSync(path.join(__dirname, 'benchmark_150_summary.json'), JSON.stringify(summaryData, null, 2), 'utf8');

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

    const outPath1 = path.join(__dirname, 'benchmark_results_real_150cases.csv');
    const outPath2 = 'd:/project/kumpee/project_materials/04_ชุดทดสอบและผลการทดลอง_Benchmark/benchmark_results_real_150cases.csv';

    fs.writeFileSync(outPath1, csvContent, 'utf8');
    fs.writeFileSync(outPath2, csvContent, 'utf8');

    console.log(`\n✅ Saved raw CSV to:\n  - ${outPath1}\n  - ${outPath2}`);
}

main().catch(console.error);
