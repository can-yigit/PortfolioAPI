"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  currentImage?: string;
  onFileSelect: (file: File | null) => void;
  label?: string;
}

export default function ImageUpload({ currentImage, onFileSelect, label = "Bild" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    } else {
      setPreview(currentImage || null);
      onFileSelect(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  return (
    <div>
      <label className="block text-[13px] font-medium text-black/60 mb-2">{label}</label>
      <div
        className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
          isDragging 
            ? "bg-black/[0.06] border-black/20" 
            : "bg-black/[0.03] border-black/[0.06] hover:border-black/15"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        {preview ? (
          <div className="relative">
            <div className="relative w-full h-36 bg-black/[0.04]">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-black/[0.04] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-black/30" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-black/40 font-medium">
              Klicken oder hierher ziehen
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
