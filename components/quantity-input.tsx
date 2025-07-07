"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityInput({ value, onChange, min = 1, max = 99, className = "" }: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const numValue = Number.parseInt(newValue)
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue)
    }
  }

  const handleInputBlur = () => {
    const numValue = Number.parseInt(inputValue)
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString())
      onChange(min)
    } else if (numValue > max) {
      setInputValue(max.toString())
      onChange(max)
    }
  }

  const increment = () => {
    if (value < max) {
      const newValue = value + 1
      setInputValue(newValue.toString())
      onChange(newValue)
    }
  }

  const decrement = () => {
    if (value > min) {
      const newValue = value - 1
      setInputValue(newValue.toString())
      onChange(newValue)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={decrement}
          disabled={value <= min}
          className="hover:bg-white/10 disabled:opacity-50"
        >
          <Minus className="h-3 w-3" />
        </Button>
      </motion.div>

      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="w-16 text-center bg-white/5 border-white/10 text-white"
        min={min}
        max={max}
      />

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={increment}
          disabled={value >= max}
          className="hover:bg-white/10 disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </motion.div>
    </div>
  )
}
