import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import axios from "axios";
import "./ResultPage.css";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { place } = location.state;
  const [analysis, setAnalysis] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const [loadingDots, setLoadingDots] = useState("...");

  // 로딩 화면 점 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((prevDots) => (prevDots.length === 3 ? "." : prevDots + "." ));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Google 지도 링크 생성
  const generateGoogleMapsLink = (placeName, address) => {
    const query = encodeURIComponent(`${placeName} ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // 긍정 및 부정 비율 계산
  const calculateSentimentPercentage = (sentiments) => {
    const total = sentiments.positive + sentiments.negative;
    if (total === 0) return { positive: 50, negative: 50 };
    return {
      positive: (sentiments.positive / total) * 100,
      negative: (sentiments.negative / total) * 100,
    };
  };

  const handleMouseEnter = (e, sentiments) => {
    const { positive, negative } = calculateSentimentPercentage(sentiments);
    const { clientX, clientY } = e;
    setTooltip({
      visible: true,
      text: `긍정: ${positive.toFixed(1)}% | 부정: ${negative.toFixed(1)}%`,
      x: clientX + 10,
      y: clientY + 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
  };

  useEffect(() => {
    const fetchDetailsAndAnalysis = async () => {
      try {
        // 장소 상세 정보 요청
        const detailsResponse = await axios.get("/api/places/details", {
          params: { place_id: place.place_id },
        });

        const details = detailsResponse.data;
        setDetails(details);

        const reviews = details.reviews?.map((review) => review.text) || [];

        if (reviews.length === 0) {
          setAnalysis({
            summary: ["한국어 리뷰가 없습니다."],
            advantages: [],
            disadvantages: [],
            usefulInfo: [],
            // petFriendly, recommendedActivities, foodAndDrink, priceRange, eventDetails, culturalPoints 등이 필요하다면 여기도 기본값 설정
            sentiments: { positive: 0, negative: 0 },
          });
          setLoading(false);
          return;
        }

        // 리뷰 분석 요청
        const analysisResponse = await axios.post("/api/openai/analyze", {
          reviews,
        });

        // analysisResponse.data에 petFriendly, recommendedActivities, foodAndDrink, priceRange, eventDetails, culturalPoints 등 필드를 추가했다면 여기서 구조분해 할당
        const {
          summary,
          advantages,
          disadvantages,
          usefulInfo,
          sentiments,
          // 아래 필드는 /analyze 수정 시 추가로 반환되었다고 가정
          recommendedActivities = ["정보 없음"],
          foodAndDrink = ["정보 없음"],
          priceRange = ["정보 없음"],
          eventDetails = ["정보 없음"],
          culturalPoints = ["정보 없음"],
          petFriendly // 이 필드가 없다면 undefined
        } = analysisResponse.data;

        setAnalysis({
          summary,
          advantages,
          disadvantages,
          usefulInfo,
          sentiments,
          recommendedActivities,
          foodAndDrink,
          priceRange,
          eventDetails,
          culturalPoints,
          petFriendly: petFriendly || "정보 없음" // petFriendly가 없으면 '정보 없음'
        });
      } catch (error) {
        console.error("분석 에러:", error);
        setAnalysis({
          summary: ["분석 중 오류가 발생했습니다."],
          advantages: [],
          disadvantages: [],
          usefulInfo: [],
          sentiments: { positive: 0, negative: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndAnalysis();
  }, [place.place_id]);

  if (loading) {
    // 로딩 화면
    return (
        <div className="loading-screen">
          <div className="loading-content">
            <img
                src="https://img.freepik.com/free-vector/travel-background_23-2148052980.jpg?t=st=1733150200~exp=1733153800~hmac=732c3615d286f6df9c8b1b231ce94639ab366775a4b2f1069e6a86698baee826&w=740"
                alt="Loading"
                className="loading-image"
            />
            <p>{`${place.name} 가는중${loadingDots}`}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="result-page">
        <div className="left-pane">
          {details && (
              <div className="place-details">
                {/* 로고 */}
                <div className="logo-container" onClick={() => navigate('/history')}>
                  <img src="/assets/ReviewTrip.png" alt="ReviewTrip" className="logo-image"/>
                </div>

                <img
                    className="place-photo"
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0]?.photo_reference}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`}
                    alt={details.name}
                />
                <h2 className="place-name">{details.name}</h2>
                <p className="place-address">{details.formatted_address}</p>
                <div className="place-stats">
                  <span>⭐ {details.rating} / 5</span>
                  <span>📋 리뷰 수: {details.user_ratings_total}</span>
                </div>


                <div
                    className="rating-chart"
                    onMouseEnter={(e) => handleMouseEnter(e, analysis.sentiments)}
                    onMouseLeave={handleMouseLeave}
                >
                  <div className="rating-bar-container">
                    <div
                        className="positive-bar"
                        style={{
                          width: `${calculateSentimentPercentage(analysis.sentiments).positive}%`,
                        }}
                    ></div>
                    <div
                        className="negative-bar"
                        style={{
                          width: `${calculateSentimentPercentage(analysis.sentiments).negative}%`,
                        }}
                    ></div>
                  </div>
                  <div className="rating-labels">
                    <span>긍정</span>
                    <span>부정</span>
                  </div>
                </div>
              </div>
          )}

          {analysis && (
              <>
                <div className="analysis-summary">
                  <h3>3줄 요약</h3>
                  <ul>
                  {analysis.summary.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advantages">
                  <h3>🌞 장점</h3>
                  <ul>
                    {analysis.advantages.map((adv, index) => (
                        <li key={index}>
                          <strong>{adv.advantage}</strong>
                          <ul>
                            {adv.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </li>
                    ))}
                  </ul>
                </div>

                <div className="disadvantages">
                  <h3>⚠️ 단점</h3>
                  <ul>
                    {analysis.disadvantages.map((disadv, index) => (
                        <li key={index}>
                          <strong>{disadv.disadvantage}</strong>
                          <ul>
                            {disadv.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </li>
                    ))}
                  </ul>
                </div>

                <div className="useful-info">
                  <h3>📌 유용한 정보</h3>
                  <ul>
                    {analysis.usefulInfo.map((info, index) => (
                        <li key={index}>{info}</li>
                    ))}
                  </ul>
                </div>
                {details && (
                    <div className="google-maps-button-container">
                      <a
                          href={generateGoogleMapsLink(details.name, details.formatted_address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="google-maps-button"
                      >
                        {details.name}로 이동하기
                      </a>
                    </div>
                )}
              </>
          )}
        </div>

        <div className="right-pane">
          {details && <ChatWindow placeName={details?.name} />}
        </div>

        {tooltip.visible && (
            <div
                className="tooltip"
                style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }}
            >
              {tooltip.text}
            </div>
        )}
      </div>
  );
}

export default ResultPage;
