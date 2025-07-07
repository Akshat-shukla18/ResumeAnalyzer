import React, { useState } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }

      setResumeText(text);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      extractTextFromPDF(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const analyzeResume = async () => {
    setLoading(true);
    try {
      // Replace OpenAI API call with Gemini API call
      const response = await axios.post(
        'https://api.gemini.com/v1/analyze',
        {
          text: resumeText,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAnalysis(response.data.analysis || "No analysis returned.");
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload Your Resume (PDF)</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={analyzeResume}
        disabled={!resumeText || loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </button>
      {analysis && (
        <div className="mt-6 whitespace-pre-wrap bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
          {analysis}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
