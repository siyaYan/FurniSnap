import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onUpload: (file: File) => void;
}

export const Hero: React.FC<HeroProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-20 px-4 text-center relative z-10">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-7xl font-serif text-brand-terracotta mb-4"
      >
        Snap a space. Find your style.
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-brand-dark/60 mb-12 max-w-2xl"
      >
        Upload an image to identify and match furniture styles instantly.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-3xl aspect-[3/1] bg-white/40 backdrop-blur-sm border-2 border-brand-sage/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 transition-all group shadow-xl shadow-brand-dark/5"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        <div className="w-16 h-16 rounded-2xl bg-brand-sage/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Camera size={32} className="text-brand-sage" />
        </div>
        <h3 className="text-xl font-medium text-brand-dark mb-1">
          Click to upload or drag & drop
        </h3>
        <p className="text-sm text-brand-dark/40">
          Supports JPG, PNG, WEBP · Max 10MB
        </p>
      </motion.div>
    </div>
  );
};
