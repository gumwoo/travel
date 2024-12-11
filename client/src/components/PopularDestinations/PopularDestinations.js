// src/components/PopularDestinations/PopularDestinations.js
import React from 'react';
import Slider from 'react-slick';
import './PopularDestinations.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PopularDestinations() {
  const destinations = [
    { name: '제주도', image: 'jeju.jpg' },
    { name: '부산 해운대', image: 'haeundae.jpg' },
    { name: '서울 남산타워', image: 'namsan.jpg' },
    { name: '경주 불국사', image: 'bulguksa.jpg' },
    // 이미지와 함께 여행지 목록 추가
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // 데스크톱에서 3개 보여주기
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // width 768px 이하
        settings: {
          slidesToShow: 1 // 모바일에서는 1개만 표시
        }
      },
      {
        breakpoint: 1024, // 1024px 이하
        settings: {
          slidesToShow: 2 // 태블릿 환경에서는 2개만 표시
        }
      }
    ]
  };

  return (
    <div className="popular-destinations">
      <Slider {...settings}>
        {destinations.map((place, index) => (
          <div key={index} className="card">
            <h3>{place.name}</h3>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default PopularDestinations;
