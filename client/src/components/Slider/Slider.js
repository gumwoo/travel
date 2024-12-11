import React from 'react';
import './Slider.css';

const Slider = ({ onSearch }) => {
    const slides = [
        {
            image: '/assets/image1.jpg',
            name: '디즈니랜드',
            alt: '디즈니랜드',
        },
        {
            image: '/assets/image2.jpg',
            name: '디즈니월드',
            alt: '디즈니월드',
        },
        {
            image: '/assets/image3.jpg',
            name: '에펠탑',
            alt: '에펠탑',
        },
        {
            image: '/assets/image4.jpg',
            name: '콜로세움',
            alt: '콜로세움',
        },
    ];

    const handleImageClick = (name) => {
        if (onSearch) {
            onSearch(name); // 부모 컴포넌트에서 전달받은 콜백 함수 실행
        } else {
            console.error('onSearch 함수가 전달되지 않았습니다.');
        }
    };

    return (
        <div className="slider">
            <div className="slider-track">
                {slides.map((slide, index) => (
                    <div
                        className="slide"
                        key={index}
                        onClick={() => handleImageClick(slide.name)}
                    >
                        <img src={slide.image} alt={slide.alt} />
                        <p className="slide-name">{slide.name}</p>
                    </div>
                ))}
                {slides.map((slide, index) => (
                    <div
                        className="slide"
                        key={`duplicate-${index}`}
                        onClick={() => handleImageClick(slide.name)}
                    >
                        <img src={slide.image} alt={slide.alt} />
                        <p className="slide-name">{slide.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;