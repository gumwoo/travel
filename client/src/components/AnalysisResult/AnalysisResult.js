// src/components/AnalysisResult/AnalysisResult.js
import React from 'react';
import './AnalysisResult.css';

function AnalysisResult({ analysis }) {
  return (
    <div className="analysis-result">
      <h2>분석 결과</h2>
      <pre>{analysis}</pre>
    </div>
  );
}

export default AnalysisResult;
