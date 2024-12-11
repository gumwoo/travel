// SearchBar.js 수정
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

function SearchBar() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    try {
      const response = await axios.get('/api/places/search', { params: { query: input } });
      const place = response.data.results[0];

      // place정보가 없다면 기록 저장 및 페이지 이동 불가
      if (!place) {
        console.warn("해당 장소를 찾을 수 없습니다.");
        return;
      }

      const newEntry = { 
        query: input, 
        location: place.formatted_address || '정보 없음' 
      };

      const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
      // newEntry.query와 비교해 중복 제거
      const updatedHistory = [newEntry, ...storedHistory.filter((item) => item.query !== input)];

      // 최대 10개 기록 유지
      if (updatedHistory.length > 10) updatedHistory.pop();

      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

      navigate('/results', { state: { query: input, place } });
    } catch (error) {
      console.error('검색 에러:', error);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="여행지, 맛집 등 정보를 입력하세요."
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = '여행지, 맛집 등 정보를 입력하세요.')}
      />
      <button type="submit">검색</button>
    </form>
  );
}

export default SearchBar;
