# 📜 คัมภีร์พูดได้ (Kumpee AI — Tipitaka AI)

โครงงานระบบปัญญาประดิษฐ์สนทนาธรรมและสืบค้นพระไตรปิฎก (Senior Project TR11)  
พัฒนาด้วยสถาปัตยกรรมสนทนาสองทาง (Double-Reference RAG) และระบบตรวจสอบความถูกต้องตามหลักมหาปเทศ 4 (Explainable AI / XAI)

---

## 🌟 คุณสมบัติเด่นของระบบ (Key Features)

- **สนทนาธรรมด้วย AI (Interactive Dialogue):** สอบถามประเด็นข้อสงสัยทางพระพุทธศาสนาและพระไตรปิฎกด้วยภาษาที่เป็นมิตรและเข้าใจง่าย
- **ตรวจสอบพระไตรปิฎก (Mahapadesa 4 Verdict System):** มีระบบประเมินความสอดคล้องของคำตอบเทียบเคียงกับคัมภีร์พระไตรปิฎก แสดงสถานะชัดเจน (สอดคล้อง / คลาดเคลื่อน / ไม่พบหลักฐาน)
- **ระบบอ่านออกเสียงภาษาไทย (Thai Speech Synthesis - TTS):** อ่านออกเสียงภาษาไทยอย่างเป็นธรรมชาติ ปรับความเร็วและโทนเสียงได้
- **แอนิเมชันอวตารผู้ช่วย (Dynamic Animated Avatar):** แสดงท่าทางขยับปากและกะพริบตาสัมพันธ์กับเสียงพูดแบบเรียลไทม์

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+), Web Speech API
- **Backend Server:** Node.js (HTTP / HTTPS Proxy), Claude API (Haiku Model)
- **Deployment:** Vercel Serverless Functions (`/api/chat`, `/api/tts`) หรือ Node.js Server (`server.js`)
- **Containerization:** Docker & Docker Compose

---

## 🚀 วิธีการติดตั้งและเปิดใช้งาน (Getting Started)

### 1. วิธีที่สะดวกรวดเร็ว (บนระบบปฏิบัติการ Windows)
ดับเบิลคลิกไฟล์ **`start.bat`** (หรือรัน `start.ps1`) เพื่อเริ่มเซิร์ฟเวอร์และเปิดหน้าเว็บให้อัตโนมัติที่:
```text
http://localhost:8080
```

### 2. วิธีรันด้วย Node.js ผ่าน Terminal
```bash
# ติดตั้ง dependencies (หากต้องการฟังก์ชันเพิ่มเติม)
npm install

# เริ่มต้นเซิร์ฟเวอร์
node server.js
```

### 3. รันด้วย Docker (ทางเลือก)
```bash
docker compose up -d
```

---

## 📂 โครงสร้างซอร์สโค้ด (Source Code Structure)

```text
kumpee/
├── api/                    # Vercel Serverless Functions (/api/chat, /api/tts)
├── assets/                 # ทรัพยากรระบบ (โลโก้, อวตาร, แผนภาพสถาปัตยกรรม)
├── public/                 # เว็บแอปพลิเคชันส่วนหน้า (index.html, index.css, app.js)
├── Dockerfile              # Docker Container build file
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # รายละเอียดโปรเจกต์และ dependencies
├── server.js               # Node.js Web & API Server
├── start.bat               # สคริปต์เปิดระบบด่วนสำหรับ Windows
├── start.ps1               # สคริปต์เปิดระบบด่วนสำหรับ PowerShell
├── test_verdict_system.js  # ชุดทดสอบ Unit Test สำหรับระบบคำตัดสินความถูกต้อง
└── vercel.json             # คอนฟิกูเรชันสำหรับการ Deploy บน Vercel
```

---

## 🧪 การทดสอบระบบ (Running Tests)

ทดสอบการทำงานของระบบตรวจสอบคำสอนและสถาปัตยกรรมมหาปเทศ 4:
```bash
node test_verdict_system.js
```
