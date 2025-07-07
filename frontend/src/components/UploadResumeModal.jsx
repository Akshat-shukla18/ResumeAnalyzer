import { useEffect, useState } from "react";
import "./UploadResumeModal.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js?worker";
import runChat from "../utils/runChat";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;




const UploadResumeModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [extractedText, setExtractedText] = useState("");
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
      // setExtractedText(resumeText); // No need to store extracted text separately now

      // Use runChat function to get analysis from Gemini API
      const prompt = "You are an ATS resume analyzer. Analyze this resume for structure, skills, formatting, and give a score with improvement suggestions.\n\n" + resumeText;
      const analysis = await runChat(prompt);

      setAnalysisText(analysis);
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
          <>
            <div
              className="fixed inset-y-6  bg-blue-400 bg-opacity-95 flex items-start justify-start z-90 p-4  backdrop-blur-sm"
              style={{ width: "100vh", height:"100vh", maxHeight:"80vh", borderLeft: "8px solid #1f2937", boxShadow: "0 0 15px 3px #4f46e5" }}
              onClick={() => setAnalysisText("")}
            >
              <div
                className="bg-blue-900 text-white p-6 rounded-lg shadow-lg w-full h-full overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="mb-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => setAnalysisText("")}
                >
                  Close
                </button>
                <h3 className="text-2xl font-bold mb-4">ATS Analysis</h3>
                <pre className="whitespace-pre-wrap">
                  {analysisText.split(/(skills|score|improvement|formatting)/gi).map((part, i) =>
                    ["skills", "score", "improvement", "formatting"].includes(part.toLowerCase()) ? (
                      <mark key={i} className="bg-yellow-300 font-semibold">{part}</mark>
                    ) : (
                      part
                    )
                  )}
                </pre>
              </div>
            </div>
          </>
        )}
        {/* Removed extractedText display as per user request */}
      </div>
    </div>
  );
};

export default UploadResumeModal;
