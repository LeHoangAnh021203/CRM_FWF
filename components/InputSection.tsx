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
import { Upload, ImageIcon, Wand2, Camera } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load the Image component with custom loading
const LazyImage = dynamic(() => import("next/image"), {
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  ),
  ssr: false,
});

interface InputSectionProps {
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  style: string;
  setStyle: (style: string) => void;
  strength: number[];
  setStrength: (strength: number[]) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function InputSection({
  selectedImage,
  setSelectedImage,
  prompt,
  setPrompt,
  style,
  setStyle,
  strength,
  setStrength,
  isGenerating,
  onGenerate,
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const stylePresets = [
    { value: "realistic", label: "Realistic", icon: "📷" },
    { value: "artistic", label: "Artistic", icon: "🎨" },
    { value: "anime", label: "Anime", icon: "🌸" },
    { value: "cartoon", label: "Cartoon", icon: "🎭" },
    { value: "oil-painting", label: "Oil Painting", icon: "🖼️" },
    { value: "watercolor", label: "Watercolor", icon: "💧" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Hình Ảnh
          </CardTitle>
          <CardDescription>
            Chọn hình ảnh từ máy tính của bạn để bắt đầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <div className="space-y-4">
                <LazyImage
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected image"
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg object-cover max-h-64"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
                className="w-full mt-2 h-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full appearance-none
[&::-webkit-slider-thumb]:appearance-none
[&::-webkit-slider-thumb]:h-4
[&::-webkit-slider-thumb]:w-4
[&::-webkit-slider-thumb]:bg-white
[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:border-solid
[&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Giữ nguyên</span>
                <span>Thay đổi hoàn toàn</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={!selectedImage || !prompt || isGenerating}
            className="w-full bg-orange-500"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <div className="w-4 h-4 mr-2">✨</div>
                Tạo Hình Ảnh
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}