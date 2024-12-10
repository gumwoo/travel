import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import SearchHistoryPage from './pages/SearchHistoryPage'; // 검색 기록 페이지 추가
import Header from './components/Header/Header';


function App() {
    return (
        <Router>
            <Header /> {/* 항상 상단에 표시되는 헤더 */}
            <div style={{ marginTop: '60px' }}> {/* 헤더 높이만큼 페이지 컨텐츠 아래로 이동 */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<ResultPage />} />
                    <Route path="/history" element={<SearchHistoryPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

