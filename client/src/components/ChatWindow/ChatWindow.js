import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow({ placeName }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 궁금한 점을 물어보세요.' },
  ]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // 추가: placeDetails와 analysis 상태
  const [placeDetails, setPlaceDetails] = useState(null);

  // 1. 추천 질문 가져오기
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      try {
        const response = await axios.post('/api/openai/get-suggestions', { placeName });
        setSuggestedQuestions(response.data.questions);
      } catch (error) {
        console.error('추천 질문 가져오기 에러:', error);
        setSuggestedQuestions(["추천 질문을 불러오는 데 실패했습니다."]);
      }
    };
    if (placeName) {
      fetchSuggestedQuestions();
    }
  }, [placeName]);

  // 2. placeDetails 및 analysis 가져오기
  useEffect(() => {
    const fetchPlaceDetailsAndAnalyze = async () => {
      try {
        // placeName으로 place_id를 얻는 과정 필요 (가정)
        const searchRes = await axios.get('/api/places/search', { params: { query: placeName } });
        const place = searchRes.data.results && searchRes.data.results[0];
        if (!place) {
          console.error("해당 장소를 찾을 수 없습니다.");
          return;
        }

        const place_id = place.place_id;
        const detailsRes = await axios.get('/api/places/details', { params: { place_id } });

        // detailsRes.data 안에 reviews 존재
        const reviews = detailsRes.data.reviews || [];
        // 리뷰가 없으면 analysis 불가능
        if (reviews.length === 0) {
          console.warn("한국어 리뷰가 없어 분석할 수 없습니다.");
          setPlaceDetails({ name: detailsRes.data.name, address: detailsRes.data.formatted_address });
          return;
        }

        // 리뷰 분석 요청
        const analyzeRes = await axios.post('/api/openai/analyze', { reviews: reviews.map(r => r.text) });

        // placeDetails와 analysis 세팅
        setPlaceDetails({
          name: detailsRes.data.name,
          address: detailsRes.data.formatted_address,
          analysis: analyzeRes.data // 이 객체에 summary, advantages 등이 포함됨
        });
      } catch (error) {
        console.error("장소 상세 정보 및 분석 가져오기 에러:", error);
      }
    };

    if (placeName) {
      fetchPlaceDetailsAndAnalyze();
    }
  }, [placeName]);

  // 메시지 전송
  const sendMessage = async (message) => {
    // 사용자 메시지를 추가
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);

    try {
      // AI 응답 요청
      // placeDetails가 준비되지 않았다면 서버에서 "분석된 내용이 없습니다." 라고 할 수 있음.
      const response = await axios.post('/api/openai/chat', {
        message,
        placeDetails // placeDetails: { name, address, analysis } 형태로 전송
      });
      const botMessage = response.data.reply;

      // 봇 메시지를 추가
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.error('챗봇 에러:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: '응답을 받을 수 없습니다.' },
      ]);
    }
  };

  // 입력창에서 메시지 전송
  const handleSend = () => {
    if (input.trim() === '') return;
    const userMessage = input;
    setInput('');
    sendMessage(userMessage);
  };

  // 추천 질문 클릭 시 자동 전송
  const handleSuggestedQuestionClick = (question) => {
    sendMessage(question);
  };

  return (
      <div className="chat-window">
        <h2>챗봇과 대화하기</h2>
        <div className="suggested-questions">
          <h4>추천 질문</h4>
          <ul>
            {suggestedQuestions.map((question, index) => (
                <li key={index} onClick={() => handleSuggestedQuestionClick(question)}>
                  {question}
                </li>
            ))}
          </ul>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
              <div
                  key={index}
                  className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                <p>
                  <strong>{msg.sender === 'user' ? '나' : '봇'}</strong>: {msg.text}
                </p>
              </div>
          ))}
        </div>
        <div className="input-area">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>전송</button>
        </div>
      </div>
  );
}

export default ChatWindow;
