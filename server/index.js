// server/index.js
require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const cors = require('cors');
const app = express();

const placesRouter = require('./routes/places');
const openaiRouter = require('./routes/openai');

// 루트 경로에 대한 라우트 추가
app.get('/', (req, res) => {
    res.send('백엔드 서버가 정상적으로 실행되고 있습니다.');
  });

app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  credentials: true,
}));
app.use(express.json());

// 라우트 설정
app.use('/api/places', placesRouter);
app.use('/api/openai', openaiRouter);

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
