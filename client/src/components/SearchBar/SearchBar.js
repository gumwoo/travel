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
      // 검색 기록 관리
      const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
      const updatedHistory = [input, ...storedHistory.filter((item) => item !== input)]; // 중복 제거 및 최신 검색어 우선
      if (updatedHistory.length > 10) updatedHistory.pop(); // 최대 10개 기록 유지
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

      // 백엔드 API 호출
      const response = await axios.get('/api/places/search', { params: { query: input } });
      const place = response.data.results[0];
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
            onBlur={(e) => (e.target.placeholder = '여행지, 맛집 등 정보를 입력하세요.')}/>
        <button type="submit">검색</button>
      </form>
  );
}

export default SearchBar;
