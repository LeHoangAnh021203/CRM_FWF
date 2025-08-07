"use client";

import { useState, useRef, lazy, Suspense } from "react";
import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load the main component sections
const InputSection = lazy(() => import("./components/InputSection"));
const OutputSection = lazy(() => import("./components/OutputSection"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
  </div>
);

export default function ImageGenerator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [strength, setStrength] = useState([0.8]);
  const [style, setStyle] = useState("realistic");

  const imageOptions = [
    "/fox.png",
    "/fox2.jpg",
    "/fox3.jpg",
    "/fox4.jpg",
    "/fox5.jpg",
  ];

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * imageOptions.length);
      setGeneratedImage(imageOptions[randomIndex]);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "generated-image.png";
      link.click();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-center items-center text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-orange-700 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400 transition duration-300 hover:drop-shadow-[0_0_6px_rgba(253,224,71,0.8)] hover:scale-110" />
            AI Image Generator
          </h1>
          <p className="text-gray-600 flex flex-wrap justify-center items-center gap-[3px] text-sm sm:text-base">
            Biến đổi hình ảnh của bạn thành tác phẩm nghệ thuật với{" "}
            <span className="text-orange-500 flex justify-center items-center">
              Face Wash Fox
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Suspense fallback={<LoadingFallback />}>
            <InputSection
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              prompt={prompt}
              setPrompt={setPrompt}
              style={style}
              setStyle={setStyle}
              strength={strength}
              setStrength={setStrength}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </Suspense>

          {/* Output Section */}
          <Suspense fallback={<LoadingFallback />}>
            <OutputSection
              generatedImage={generatedImage}
              isGenerating={isGenerating}
              onDownload={handleDownload}
              onRegenerate={handleGenerate}
              setPrompt={setPrompt}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}