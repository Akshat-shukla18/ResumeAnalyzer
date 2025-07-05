import { useEffect, useState } from "react";
import "./UploadResumeModal.css";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js?worker";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;




const UploadResumeModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setFile(null);
      setDescription("");
      setAnalysisText("");
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
          }
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleUploadClick = async () => {
    if (!file) {
      alert("Upload resume first");
      return;
    }

    setLoading(true);
    try {
      const resumeText = await extractTextFromPDF(file);

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an ATS system. Analyze this resume for structure, skills, formatting, and give a score with improvement suggestions.",
            },
            {
              role: "user",
              content: resumeText,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAnalysisText(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisText("Failed to analyze resume. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black fadeInBackdrop overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="modalRightSide"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <button
          className="buttonAnimated absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close modal"
        >
          &#x2715;
        </button>
        <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
        <p className="mb-6">Please upload your resume file here.</p>

        <input
          type="file"
          accept=".pdf"
          className="mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <textarea
          placeholder="Add description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button className="buttonAnimated" onClick={handleUploadClick}>
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>

        {analysisText && (
          <div className="mt-6 bg-white text-black p-4 rounded shadow max-h-[400px] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">ATS Analysis:</h3>
            <pre className="whitespace-pre-wrap">{analysisText}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResumeModal;
