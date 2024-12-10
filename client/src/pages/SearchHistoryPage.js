import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchHistoryPage.css';

function SearchHistoryPage() {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // LocalStorage에서 검색 기록 가져오기
        const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setHistory(storedHistory);
    }, []);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        try {
            const response = await axios.get('/api/places/search', {
                params: { query },
            });
            const place = response.data.results[0];

            // 검색 기록 중복 방지 및 저장
            const newEntry = { query, location: place.formatted_address || '정보 없음' };
            const updatedHistory = [newEntry, ...history.filter((item) => item.query !== query)];
            setHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

            // 검색 결과 페이지로 이동
            navigate('/results', { state: { query, place } });
        } catch (error) {
            console.error('검색 에러:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(input);
        setInput('');
    };

    const handleHistoryClick = (query) => {
        handleSearch(query);
    };

    const handleDelete = (query) => {
        const updatedHistory = history.filter((item) => item.query !== query);
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    return (
        <div className="search-history-page">
            <form className="search-bar" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="검색어를 입력하세요"
                />
                <button type="submit">검색</button>
            </form>
            <h1>검색 기록</h1>
            {history.length > 0 ? (
                <ul className="history-list">
                    {history.map((item, index) => (
                        <li key={index} className="history-item">
                            <div onClick={() => handleHistoryClick(item.query)}>
                                <strong>{item.query}</strong> - <span>{item.location}</span>
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(item.query)}>
                                ✖
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>검색 기록이 없습니다.</p>
            )}
        </div>
    );
}

export default SearchHistoryPage;
