const express = require("express");
const router = express.Router();
const axios = require("axios");
const keys = require("../../config/keys");

router.post("/analyze", async (req, res) => {
    const { reviews } = req.body;

    try {
        // 리뷰가 없는 경우 기본값 반환
        if (!reviews || reviews.length === 0) {
            return res.json({
                summary: ["한국어 리뷰가 없습니다."],
                advantages: [],
                disadvantages: [],
                usefulInfo: [],
                recommendedActivities: ["정보 없음"],
                foodAndDrink: ["정보 없음"],
                priceRange: ["정보 없음"],
                eventDetails: ["정보 없음"],
                culturalPoints: ["정보 없음"],
                // 새로 추가할 카테고리 필드 (없으면 "정보 없음")
                lodgingInfo: ["정보 없음"],
                localFoods: ["정보 없음"],
                localActivities: ["정보 없음"],
                famousAspects: ["정보 없음"],
                mustDo: ["정보 없음"],
                wheelchairAccessible: "정보 없음",
                petFriendly: "정보 없음",
                sentiments: { positive: 0, negative: 0 },
            });
        }

        const prompt = `
다음은 특정 장소에 대한 한국어 리뷰들입니다. 리뷰를 꼼꼼히 분석한 뒤, 아래 JSON 형식으로 정보를 추출해주세요.
리뷰에 직접적으로 언급된 내용이 없으면 "정보 없음"이라고 기재하세요.
가능한 한 장소의 특징, 음식, 가격, 이벤트, 문화적 요소, 그리고 아래의 특정 카테고리들에 대한 정보를 풍부하고 구체적으로 반영해주세요.

추출할 항목:
- summary: 장소를 잘 요약하는 3줄
- advantages: 장점 목록 (advantage와 그것을 뒷받침하는 reasons)
- disadvantages: 단점 목록 (disadvantage와 그 이유들)
- usefulInfo: 여행자에게 유용한 정보
- recommendedActivities: 장소 내에서 즐길만한 활동 (없으면 "정보 없음")
- foodAndDrink: 음식 관련 정보 (없으면 "정보 없음")
- priceRange: 가격대 정보 (없으면 "정보 없음")
- eventDetails: 이벤트나 축제 관련 정보 (없으면 "정보 없음")
- culturalPoints: 문화적 특색, 전통 관련 정보 (없으면 "정보 없음")
- wheelchairAccessible: 휠체어 접근성 ("예"/"아니오"/"정보 없음")
- petFriendly: 반려동물 동반 가능 여부 ("가능"/"불가"/"정보 없음")

추가 카테고리 (추천질문 카테고리에 따른 분석):
1. lodgingInfo(숙박시설 관련 정보): 숙박에 관한 언급이 있으면 상세히, 없으면 "정보 없음"
2. localFoods(먹거리): 해당 장소 근처나 내부에서 꼭 먹어봐야 할 음식, 맛집 언급(없으면 "정보 없음")
3. localActivities(놀거리): 액티비티나 즐길거리 정보(없으면 "정보 없음")
4. famousAspects(유명한 것): 이 장소가 특히나 유명한 점이나 상징적 명소(없으면 "정보 없음")
5. mustDo(꼭 해야할 것): 방문 시 놓치면 안 될 필수 경험(없으면 "정보 없음")

리뷰:
${reviews.join("\n\n")}

응답 형식(JSON):
{
  "summary": ["문장1", "문장2", "문장3"],
  "advantages": [{"advantage": "장점 내용", "reasons": ["이유1","이유2"]}],
  "disadvantages": [{"disadvantage": "단점 내용", "reasons": ["이유1","이유2"]}],
  "usefulInfo": ["정보1","정보2"],
  "recommendedActivities": ["활동1","활동2" 또는 "정보 없음"],
  "foodAndDrink": ["음식정보" 또는 "정보 없음"],
  "priceRange": ["가격정보" 또는 "정보 없음"],
  "eventDetails": ["이벤트정보" 또는 "정보 없음"],
  "culturalPoints": ["문화적특징" 또는 "정보 없음"],
  "wheelchairAccessible": "예/아니오/정보 없음",
  "petFriendly": "가능/불가/정보 없음",
  "lodgingInfo": ["숙박시설 관련 정보" 또는 "정보 없음"],
  "localFoods": ["먹거리 정보" 또는 "정보 없음"],
  "localActivities": ["놀거리/액티비티 정보" 또는 "정보 없음"],
  "famousAspects": ["유명한 점" 또는 "정보 없음"],
  "mustDo": ["꼭 해야할 것" 또는 "정보 없음"],
  "sentiments": {"positive": 긍정개수, "negative": 부정개수}
}
`;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                temperature: 0,
                messages: [
                    { role: "system", content: "너는 주어진 데이터 기반 JSON 형태로만 답하는 분석기입니다. 지시사항을 충실히 따르세요." },
                    { role: "user", content: prompt }
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let data;
        try {
            data = JSON.parse(response.data.choices[0].message.content);
        } catch (parseError) {
            console.error("JSON 파싱 에러:", parseError.message);
            console.error("OpenAI 응답 데이터:", response.data.choices[0].message.content);
            return res.json({
                summary: ["파싱 실패: 기본값 사용"],
                advantages: [],
                disadvantages: [],
                usefulInfo: [],
                recommendedActivities: ["정보 없음"],
                foodAndDrink: ["정보 없음"],
                priceRange: ["정보 없음"],
                eventDetails: ["정보 없음"],
                culturalPoints: ["정보 없음"],
                wheelchairAccessible: "정보 없음",
                petFriendly: "정보 없음",
                lodgingInfo: ["정보 없음"],
                localFoods: ["정보 없음"],
                localActivities: ["정보 없음"],
                famousAspects: ["정보 없음"],
                mustDo: ["정보 없음"],
                sentiments: { positive: 0, negative: 0 },
            });
        }

        const wheelchairAccessible = data.wheelchairAccessible || "정보 없음";
        const petFriendly = data.petFriendly || "정보 없음";
        const lodgingInfo = data.lodgingInfo || ["정보 없음"];
        const localFoods = data.localFoods || ["정보 없음"];
        const localActivities = data.localActivities || ["정보 없음"];
        const famousAspects = data.famousAspects || ["정보 없음"];
        const mustDo = data.mustDo || ["정보 없음"];

        res.json({
            summary: data.summary || ["요약 데이터가 없습니다."],
            advantages: data.advantages || [],
            disadvantages: data.disadvantages || [],
            usefulInfo: data.usefulInfo || [],
            recommendedActivities: data.recommendedActivities || ["정보 없음"],
            foodAndDrink: data.foodAndDrink || ["정보 없음"],
            priceRange: data.priceRange || ["정보 없음"],
            eventDetails: data.eventDetails || ["정보 없음"],
            culturalPoints: data.culturalPoints || ["정보 없음"],
            wheelchairAccessible,
            petFriendly,
            lodgingInfo,
            localFoods,
            localActivities,
            famousAspects,
            mustDo,
            sentiments: data.sentiments || { positive: 0, negative: 0 },
        });
    } catch (error) {
        console.error("리뷰 분석 에러:", error.response?.data || error.message);
        res.status(500).json({ error: "리뷰 분석 실패" });
    }
});
// 추천 질문 생성 API (변경 없음)
router.post('/get-suggestions', async (req, res) => {
    const { placeName } = req.body;

    try {
        const prompt = `
"${placeName}"에 대하여 다음 주제별로 궁금해할 만한 질문을 각각 1개씩 총 5개 제공해줘.
주제:
1. 숙박시설 (어떤 종류나 예약 팁 등)
2. 먹거리 (대표 음식, 맛집)
3. 놀거리 (액티비티, 관광지 내 추천 활동)
4. 유명한 것 (해당 장소가 특히 유명한 특징, 명소)
5. 꼭 해야할 것 (방문 시 놓치지 말아야 할 필수 경험)

출력 형식:
["질문1(숙박 관련)", "질문2(먹거리 관련)", "질문3(놀거리 관련)", "질문4(유명한 것 관련)", "질문5(꼭 해야할 것 관련)"]

예시:
["이곳에서 편하게 묵을 수 있는 숙박시설은 어떤 것들이 있나요?", 
 "이곳에서 꼭 맛봐야 할 대표 음식이 있나요?", 
 "이곳에서 즐길 수 있는 액티비티나 체험은 무엇인가요?", 
 "이 장소가 특히나 유명한 이유는 무엇인가요?", 
 "방문 시 절대 놓치지 말아야 할 경험이 있다면 무엇인가요?"]
        `;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0, // 응답 형태의 일관성 유지
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const suggestions = JSON.parse(response.data.choices[0].message.content);
        res.json({ questions: suggestions });
    } catch (error) {
        console.error('추천 질문 생성 에러:', error.response?.data || error.message);
        res.status(500).json({ error: '추천 질문을 생성하는 데 실패했습니다.' });
    }
});

// 챗봇 대화 API
router.post("/chat", async (req, res) => {
    const { message, placeDetails } = req.body;

    if (!message) {
        return res.status(400).json({ error: "메시지가 누락되었습니다." });
    }

    if (!placeDetails || !placeDetails.name || !placeDetails.address) {
        return res.status(400).json({ error: "장소 정보가 누락되었습니다." });
    }

    if (!placeDetails.analysis) {
        return res.json({ reply: "죄송합니다. 분석된 내용이 없습니다." });
    }

    const messageLower = message.toLowerCase();
    const placeNameLower = placeDetails.name.toLowerCase();
    const placeAddressLower = placeDetails.address.toLowerCase();
    const isRelatedToPlace =
        messageLower.includes(placeNameLower) || messageLower.includes(placeAddressLower);

    if (!isRelatedToPlace) {
        return res.json({ reply: "죄송합니다. 분석된 내용이 아닙니다." });
    }

    try {
        const analysisData = JSON.stringify(placeDetails.analysis);
        const context = `
이 데이터는 ${placeDetails.name}에 대한 실제 분석 결과입니다.
사용자가 요청한 정보가 데이터에 있다면 적당히 간략하게 한 문장마다 줄 바꿔서 설명하고, 관련된 다른 정보(음식, 가격, 이벤트, 문화적 특징, 휠체어 접근성, 반려동물 동반 여부 등)를 추가로 제시하여 풍부하게 답변하세요.
데이터에 없는 내용에 대해서는 "죄송합니다. 분석된 내용이 없습니다."라고 하십시오.

데이터:
${analysisData}
`;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                temperature: 0,
                messages: [
                    { role: "system", content: "너는 주어진 데이터만 기반으로 답변하는 챗봇입니다. 데이터 내에서 최대한 풍부하고 구체적으로 답변하되, 데이터에 없는 내용은 '죄송합니다. 분석된 내용이 없습니다.'라고 하십시오." },
                    { role: "system", content: context },
                    { role: "user", content: message },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data.choices[0].message.content.trim();
        res.json({ reply });
    } catch (error) {
        console.error("챗봇 응답 에러:", error.response?.data || error.message);
        res.status(500).json({ error: "챗봇 응답에 실패했습니다." });
    }
});

module.exports = router;
