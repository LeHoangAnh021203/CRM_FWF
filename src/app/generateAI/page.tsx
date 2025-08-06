"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  ImageIcon,
  Wand2,
  Download,
  RefreshCw,
  Sparkles,
  Palette,
  Camera,
} from "lucide-react";
import Image from "next/image";

export default function ImageGenerator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [strength, setStrength] = useState([0.8]);
  const [style, setStyle] = useState("realistic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageOptions = [
    "/fox.png",
    "/fox2.jpg",
    "/fox3.jpg",
    "/fox4.jpg",
    "/fox5.jpg",
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const stylePresets = [
    { value: "realistic", label: "Realistic", icon: "📷" },
    { value: "artistic", label: "Artistic", icon: "🎨" },
    { value: "anime", label: "Anime", icon: "🌸" },
    { value: "cartoon", label: "Cartoon", icon: "🎭" },
    { value: "oil-painting", label: "Oil Painting", icon: "🖼️" },
    { value: "watercolor", label: "Watercolor", icon: "💧" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
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
          <div className="space-y-6 ">
            <Card className="border-orange-200 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 ">
                  <Upload className="w-5 h-5" />
                  Upload Hình Ảnh
                </CardTitle>
                <CardDescription>
                  Chọn hình ảnh từ máy tính của bạn để bắt đầu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed  rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <div className="space-y-4">
                      <Image
                        src={selectedImage || "/placeholder.svg"}
                        alt="Selected image"
                        width={300}
                        height={300}
                        className="mx-auto rounded-lg object-cover max-h-64"
                      />
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Chọn ảnh khác
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Kéo thả hoặc click để chọn ảnh
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, WEBP (tối đa 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Mô Tả Biến Đổi
                </CardTitle>
                <CardDescription>
                  Mô tả cách bạn muốn biến đổi hình ảnh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ví dụ: Biến thành tranh sơn dầu phong cách Van Gogh, với bầu trời đầy sao..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Style Preset</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-1">
                        <SelectValue>{style}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {stylePresets.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <span className="flex items-center gap-2">
                              <span>{preset.icon}</span>
                              {preset.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Strength: {strength[0]}</Label>
                    <Slider
                      value={strength}
                      onValueChange={setStrength}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Giữ nguyên</span>
                      <span>Thay đổi hoàn toàn</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedImage || !prompt || isGenerating}
                  className="w-full bg-orange-500"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Tạo Hình Ảnh
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Kết Quả
                </CardTitle>
                <CardDescription>
                  Hình ảnh được tạo bởi Face Wash Fox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600">Đang tạo hình ảnh...</p>
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full animate-pulse"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full space-y-4">
                      <Image
                        src={generatedImage || "/placeholder.svg"}
                        alt="Generated image"
                        width={512}
                        height={512}
                        className="w-full rounded-lg object-cover"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownload}
                          className="flex-1 bg-orange-500"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleGenerate}
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Tạo lại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                      <p className="text-gray-500">
                        Hình ảnh sẽ xuất hiện ở đây sau khi tạo
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Examples */}
            <Card className="border-2 border-[#f78da7]">
              <CardHeader>
                <CardTitle className="text-sm">Gợi Ý Prompt</CardTitle>
              </CardHeader>
              <CardContent className="gap-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Biến thành tranh sơn dầu cổ điển",
                    "Phong cách anime Nhật Bản",
                    "Tranh vẽ bằng bút chì",
                    "Phong cách cyberpunk tương lai",
                    "Tranh watercolor nhẹ nhàng",
                  ].map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer bg-white/10 backdrop-blur-sm border border-[#f78da7] rounded-md px-3 py-1 transition-all hover:bg-white/20 hover:scale-105"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
