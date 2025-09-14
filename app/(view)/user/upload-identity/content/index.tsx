"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Tesseract, { type RecognizeResult } from "tesseract.js";

type LangCode = "eng" | "ara" | "spa" | "fra" | "deu";

export default function OCRConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<LangCode>("eng");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0); // 0..1
  const [status, setStatus] = useState<string>(""); // human-readable progress text
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Create/revoke preview URL
  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const filenameBase = useMemo(() => {
    if (!file?.name) return "extracted-text";
    const dot = file.name.lastIndexOf(".");
    return dot > 0 ? file.name.slice(0, dot) : file.name;
  }, [file]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      setText("");
      setProgress(0);
      setStatus("");
      setFile(f);
    },
    []
  );

  const handleExtractText = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setText("");
    setProgress(0);
    setStatus("Loading…");

    try {
      // You can pass either the File object or the previewUrl; File is fine.
      const result: RecognizeResult = await Tesseract.recognize(
        file,
        language,
        {
          logger: (m) => {
            // m.status: "loading image", "initializing tesseract", "recognizing text", etc
            setStatus(m.status ?? "");
            if (typeof m.progress === "number") {
              setProgress(m.progress);
            }
          },
        }
      );

      setText(result.data.text || "");
    } catch (err) {
      console.error("Error extracting text:", err);
      alert("Failed to extract text. Please try another image or language.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }, [file, language]);

  const handleDownloadText = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filenameBase}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [text, filenameBase]);

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filenameBase}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [text, filenameBase]);

//   const handleDownloadPDF = useCallback(() => {
//     const pdf = new jsPDF();
//     // Simple flow: split long text into lines to avoid overflow on page
//     const lines = pdf.splitTextToSize(text || "", 180);
//     pdf.text(lines, 10, 10);
//     pdf.save(`${filenameBase}.pdf`);
//   }, [text, filenameBase]);

  const reset = useCallback(() => {
    setFile(null);
    setText("");
    setProgress(0);
    setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Image → Text Converter
        </h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangCode)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="eng">English</option>
            <option value="ara">Arabic</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Uploader & Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm"
            />
            {file && (
              <button
                onClick={reset}
                className="px-3 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>

          {previewUrl && (
            <div className="border rounded overflow-hidden bg-white">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          <button
            onClick={handleExtractText}
            disabled={!file || loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Extracting…" : "Extract Text"}
          </button>

          {loading && (
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {status} {Math.round(progress * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="space-y-3">
          <h2 className="font-semibold">Extracted Text</h2>
          <pre className="bg-[#1f2937] text-white p-4 rounded max-h-[420px] overflow-auto text-sm whitespace-pre-wrap">
            {text || "—"}
          </pre>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadText}
              disabled={!text}
              className={`px-3 py-2 rounded text-white ${
                text ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
              }`}
            >
              Download .txt
            </button>
            {/* <button
              onClick={handleDownloadPDF}
              disabled={!text}
              className={`px-3 py-2 rounded text-white ${
                text ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"
              }`}
            >
              Download PDF
            </button> */}
            <button
              onClick={handleDownloadMarkdown}
              disabled={!text}
              className={`px-3 py-2 rounded text-white ${
                text ? "bg-gray-800 hover:bg-gray-900" : "bg-gray-400"
              }`}
            >
              Download .md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
