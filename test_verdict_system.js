// Test script for Mahapadesa 4 verdict system & distortion detection
const assert = require('assert');
const fs = require('fs');

console.log('=== STARTING UNIT TESTS: MAHAPADESA 4 VERDICT SYSTEM ===\n');

// 1. Test Server Distortion Detection
const chatApiSource = fs.readFileSync('api/chat.js', 'utf8');
const serverSource = fs.readFileSync('server.js', 'utf8');
const appSource = fs.readFileSync('public/app.js', 'utf8');

function extractDetectDistortion(src) {
    const fnMatch = src.match(/function detectDoctrinalDistortion\(text\)\s*\{([\s\S]*?)\n\}/);
    if (!fnMatch) throw new Error('detectDoctrinalDistortion not found in source');
    return new Function('text', fnMatch[1]);
}

const serverDetect = extractDetectDistortion(serverSource);
const apiDetect = extractDetectDistortion(chatApiSource);

console.log('--- Test Suite 1: Distortion Keyword Detection ---');

const distortedCases = [
    'เรื่องนี้เป็นความเข้าใจที่คลาดเคลื่อนจากหลักพระธรรมวินัย',
    'ข้อความดังกล่าวขัดต่อพระธรรมวินัยในศีลข้อ 5',
    'พระพุทธเจ้ามิได้ทรงอนุญาตให้เสพเมถุนไม่ว่าในกรณีใด',
    'สิ่งนี้มิใช่คำสอนของพระสัมมาสัมพุทธเจ้า',
    'การอ้างว่าฆ่าคนเลวได้บุญจัดเป็นมิจฉาทิฏฐิที่ร้ายแรง',
    'ไม่ปรากฏในพระไตรปิฎก และมิใช่พุทธวจนะแท้จริง',
    'นี่คือคำสอนที่แต่งขึ้นใหม่ ไม่ตรงกับหลักเถรวาท'
];

distortedCases.forEach((text, i) => {
    const resServer = serverDetect(text);
    const resApi = apiDetect(text);
    console.log(`  [Case 1.${i+1}] Distorted text: "${text.substring(0, 35)}..." => Server: ${resServer}, API: ${resApi}`);
    assert.strictEqual(resServer, true, `Server failed on case 1.${i+1}`);
    assert.strictEqual(resApi, true, `API failed on case 1.${i+1}`);
});

console.log('  -> All distortion detection tests passed!\n');

console.log('--- Test Suite 2: Authentic & Non-distorted Text Detection ---');

const authenticCases = [
    'พระพุทธองค์ทรงแสดงอริยสัจ 4 ในธัมมจักกัปปวัตตนสูตร',
    'สติปัฏฐาน 4 เป็นทางสายเอกเพื่อความบริสุทธิ์หมดจดของสัตว์',
    'การเจริญเมตตาภาวนาช่วยให้จิตสงบและลดความโกรธ',
    'วันนี้อากาศดี มีอะไรให้ผมช่วยแนะนำธรรมะไหมครับ'
];

authenticCases.forEach((text, i) => {
    const resServer = serverDetect(text);
    const resApi = apiDetect(text);
    console.log(`  [Case 2.${i+1}] Authentic text: "${text.substring(0, 35)}..." => Server: ${resServer}, API: ${resApi}`);
    assert.strictEqual(resServer, false, `Server false-positive on case 2.${i+1}`);
    assert.strictEqual(resApi, false, `API false-positive on case 2.${i+1}`);
});

console.log('  -> All authentic detection tests passed!\n');

console.log('--- Test Suite 3: Client AIModule._generateVerdict States ---');

// Extract _generateVerdict from public/app.js
const detectFnMatch = appSource.match(/_detectDistortion\(text\)\s*\{([\s\S]*?)\n\s*\},/);
const genVerdictMatch = appSource.match(/_generateVerdict\(contextSuttas, verifiedSuttas, isFallback, aiText = '', userMessage = '', serverDistorted = false\)\s*\{([\s\S]*?)\n\s*\},/);

const testAIModule = {
    _detectDistortion: new Function('text', detectFnMatch[1]),
    _generateVerdict: new Function('contextSuttas', 'verifiedSuttas', 'isFallback', 'aiText = ""', 'userMessage = ""', 'serverDistorted = false', genVerdictMatch[1])
};

// 3.1 Test Case: สอดคล้อง (Consistent)
const contextSuttas1 = [{ title: 'ธัมมจักกัปปวัตตนสูตร', volume: '4', topicNum: '13' }];
const verifiedSuttas1 = [{ title: 'ธัมมจักกัปปวัตตนสูตร', volume: '4', topicNum: '13' }];
const v1 = testAIModule._generateVerdict(contextSuttas1, verifiedSuttas1, false, 'พระพุทธเจ้าทรงแสดงปฐมเทศนาอริยสัจ 4');
console.log('  [Verdict 1 - สอดคล้อง]:', v1.verdict, '| Reasoning:', v1.reasoning);
assert.strictEqual(v1.verdict, 'สอดคล้อง');
assert.strictEqual(v1.overlapCount, 1);

// 3.2 Test Case: คลาดเคลื่อน (Distorted)
const contextSuttas2 = [{ title: 'สิคาโลวาทสูตร', volume: '11', topicNum: '190' }];
const verifiedSuttas2 = [{ title: 'สิคาโลวาทสูตร', volume: '11', topicNum: '190' }];
const aiDistortedResponse = 'เรื่องการดื่มสุราเพื่อเข้าสังคมนั้น คลาดเคลื่อนจากหลักพระธรรมวินัยอย่างยิ่ง พระพุทธองค์มิได้ทรงอนุญาต เพราะการดื่มสุราเป็นโทษ 6 ประการในสิคาโลวาทสูตร';
const v2 = testAIModule._generateVerdict(contextSuttas2, verifiedSuttas2, false, aiDistortedResponse);
console.log('  [Verdict 2 - คลาดเคลื่อน]:', v2.verdict, '| Reasoning:', v2.reasoning);
assert.strictEqual(v2.verdict, 'คลาดเคลื่อน');
assert.strictEqual(v2.citations.length > 0, true);

// 3.3 Test Case: ไม่พบหลักฐาน (Secular / Unverified)
const contextSuttas3 = [];
const verifiedSuttas3 = [];
const aiSecularResponse = 'แกงเขียวหวานเป็นอาหารไทยที่ใช้กะทิและพริกแกงเขียวหวาน';
const v3 = testAIModule._generateVerdict(contextSuttas3, verifiedSuttas3, false, aiSecularResponse);
console.log('  [Verdict 3 - ไม่พบหลักฐาน]:', v3.verdict, '| Reasoning:', v3.reasoning);
assert.strictEqual(v3.verdict, 'ไม่พบหลักฐาน');

// 3.4 Test Case: Fallback
const v4 = testAIModule._generateVerdict([], [], true);
console.log('  [Verdict 4 - fallback]:', v4.verdict, '| Reasoning:', v4.reasoning);
assert.strictEqual(v4.verdict, 'fallback');

console.log('\n=== ALL 4 VERDICT STATES AND TEST SUITES PASSED PERFECTLY (100%) ===');
