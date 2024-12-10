// server/routes/places.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const keys = require('../../config/keys');

// 장소 검색 API
router.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query,
          key: keys.google.placesApiKey,
          language: 'ko',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('장소 검색 에러:', error.response?.data || error.message);
    res.status(500).json({ error: '장소 검색에 실패했습니다.' });
  }
});

// 장소 상세 정보 및 한국어 리뷰 가져오기
router.get('/details', async (req, res) => {
  const { place_id } = req.query;

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id,
          key: keys.google.placesApiKey,
          language: 'ko',
        },
      }
    );

    const data = response.data.result;

    // 한국어 리뷰만 필터링
    const koreanReviews = data.reviews?.filter(
      (review) => review.language === 'ko'
    ) || [];

    data.reviews = koreanReviews;

    res.json(data);
  } catch (error) {
    console.error('장소 상세 정보 가져오기 에러:', error.response?.data || error.message);
    res.status(500).json({ error: '장소 상세 정보를 가져오는 데 실패했습니다.' });
  }
});

module.exports = router;
