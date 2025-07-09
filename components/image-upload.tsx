"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  className?: string
}

export function ImageUpload({ currentImage, onImageChange, className = "" }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      // In a real app, you'd upload to your server/cloud storage
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file)
      onImageChange(imageUrl)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage || "/placeholder.svg"}
            alt="Product preview"
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `/placeholder.svg?height=128&width=200`
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onImageChange("")}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Upload className="h-8 w-8 mx-auto text-blue-400" />
            </motion.div>
            <p className="text-sm text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
