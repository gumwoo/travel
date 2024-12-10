import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // 헤더 스타일링 파일

function Header() {
    const navigate = useNavigate();
    return (
        <header className="header">
            <div className="logo-container" onClick={() => navigate('/')}>
                <img src="/assets/ReviewTrip.png" alt="ReviewTrip" className="logo-image" />
            </div>
        </header>
    );
}

export default Header;
