"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const slides = [
  {
    id: 1,
    type: "cover",
    title: "VendAI",
    subtitle: "AI Commerce for wholesale products",
    content: {
      presentedBy: "Timothy Lidede & Davis Kipchirchir",
      date: "July 2025",
    },
  },
  {
    id: 2,
    type: "problem",
    title: "The Problem",
    content: {
      points: [
        "Informal retailers struggle to restock consistently",
        "Distributors lack visibility, lose orders",
        "Existing B2B platforms are too complex, not mobile-first",
        "Search and product discovery are broken for African markets",
      ],
    },
  },
  {
    id: 3,
    type: "solution",
    title: "The Solution",
    content: {
      description: "A chat-first e-commerce platform built for Kenya's FMCG ecosystem",
      features: [
        "Retailers can chat naturally to find and order products",
        "Distributors get auto-assigned nearby orders",
        "Simple dashboards + M-Pesa + Google Maps = seamless fulfillment",
      ],
    },
  },
  {
    id: 4,
    type: "why-now",
    title: "Why Now?",
    content: {
      points: [
        "Kenya tops global ChatGPT usage rankings",
        "Smartphone + M-Pesa penetration at all-time high",
        "AI is becoming accessible to the mass market",
        "Informal trade still dominant (>80% of FMCG retail)",
      ],
    },
  },
  {
    id: 5,
    type: "market-size",
    title: "Market Size",
    content: {
      stats: [
        { label: "Kenya FMCG trade", value: "$20B+ annually" },
        { label: "Active dukas (informal shops)", value: "250K+" },
        { label: "Active FMCG distributors", value: "10K+" },
        { label: "Initial SAM", value: "20K Nairobi dukas + 1K key distributors" },
      ],
    },
  },
  {
    id: 6,
    type: "competition",
    title: "Competition",
    content: {
      competitors: "JumiaB2B, Twiga, BulkBox",
      insight: "Most are heavy ops / logistics models",
      positioning: "VendAI = leaner, software-led, AI-native",
      differentiators: ["Chat-first interface", "Local distributor fulfillment", "No inventory risk or warehousing"],
    },
  },
  {
    id: 7,
    type: "product",
    title: "The Product",
    content: {
      tech: "Built on Next.js + Firebase + Supabase (AI search)",
      integrations: "M-Pesa STK Push + Google Maps",
      roles: "Retailer, Distributor, Admin",
      features: ["Conversational ordering", "Smart search", "Distributor dashboards", "Location-based fulfillment"],
    },
  },
  {
    id: 8,
    type: "validation",
    title: "Market Validation",
    content: {
      metrics: [
        "400+ distributors mapped",
        "20+ engaged, 10+ willing to partner",
        "5 active partner (including major players Mahitaji Enterprises and SAM West Distributors)",
        "Retailers excited to use, ask for incorporation and assurance",
      ],
      feedback: "Strong demand, search UX and reliability critical",
    },
  },
  {
    id: 9,
    type: "business-model",
    title: "Business Model",
    content: {
      primary: "Small markup on products (validated by distributors)",
    },
  },
  {
    id: 10,
    type: "gtm",
    title: "Go-To-Market Strategy",
    content: {
      phases: [
        { phase: "Phase 1", description: "Partner with 50 Nairobi distributors" },
        { phase: "Phase 2", description: "Activate 500 dukas in high-density estates" },
        { phase: "Phase 3", description: "Launch AI commerce toolkit + low-data app" },
      ],
      channels: "Direct outreach, WhatsApp, market visits, referrals",
    },
  },
  {
    id: 11,
    type: "financials",
    title: "Financials (Estimates)",
    content: {
      year1: {
        retailers: "500 active retailers",
        gmv: "$250 GMV/mo per retailer = $125K GMV/mo",
        markup: "5% avg. markup = ~$6.25K revenue/mo",
        burn: "Monthly Burn: ~$2.5K (lean ops, 4 engineers)",
        breakeven: "Breakeven at ~200 active retailers",
      },
    },
  },
  {
    id: 12,
    type: "roadmap",
    title: "Roadmap",
    content: {
      milestones: [
        { period: "Q3", goal: "Incorporation + Angel Round" },
        { period: "Q4", goal: "Expand to 1,000 retailers" },
        { period: "Q1", goal: "Build WhatsApp / USSD interface" },
        { period: "Q2", goal: "Pilot embedded finance / working capital scoring" },
      ],
    },
  },
  {
    id: 13,
    type: "founders",
    title: "Founders",
    content: {
        founders: [
        {
            name: "Timothy Lidede",
            role: "Co-founder, CEO",
            image: "/images/ceo.jpg",
            links: [
            { platform: "GitHub", url: "https://github.com/timothylidede" },
            { platform: "LinkedIn", url: "https://www.linkedin.com/in/timlidede/" },
            { platform: "X", url: "https://x.com/timlidede" },
            ],
        },
        {
            name: "Davis Kipchirchir",
            role: "Co-founder, CTO",
            image: "/images/cto.jpg",
            links: [
            { platform: "GitHub", url: "https://github.com/DavisKoreal" },
            { platform: "LinkedIn", url: "https://www.linkedin.com/in/davis-kipchirchir-0416461b2/" },
            { platform: "X", url: "https://x.com/DavisKipchirch3" }, // Verify this URL
            ],
        },
        ],
    },
    },
    {
    id: 14,
    type: "ask",
    title: "The Ask",
    content: {
        seeking: "$50,000 angel investment",
        useOfFunds: [
        "Legal + Incorporation",
        "GTM Ops",
        "Product/Infra",
        "Runway + buffer",
        ],
        mission: "Mission-aligned partner to help us formalize and scale",
    },
    },
]

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case "cover":
        return (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center space-x-4 mb-4"
            >
              <h1 className="text-4xl sm:text-5xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-light">
                  vend
                </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-black">
                  ai
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg sm:text-xl text-gray-300 font-light"
            >
              {slide.subtitle}
            </motion.p>
          </div>
        )

      case "problem":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              {slide.content.points.map((point: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="flex items-start space-x-3 p-2 rounded-xl glass-effect"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xs">!</span>
                  </div>
                  <p className="text-lg text-gray-300 font-light">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case "solution":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="text-center p-2 rounded-xl glass-effect mb-3"
            >
              <p className="text-lg text-gray-300 font-light">{slide.content.description}</p>
            </motion.div>
            <div className="grid gap-2">
              {slide.content.features.map((feature: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="flex items-start space-x-3 p-2 rounded-xl glass-effect"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-lg text-gray-300 font-light">{feature}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case "why-now":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              {slide.content.points.map((point: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="p-2 rounded-xl glass-effect border-l-4 border-gradient-to-b from-purple-500 to-pink-500"
                >
                  <p className="text-lg text-gray-300 font-light">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case "market-size":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-2">
              {slide.content.stats.map((stat: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="text-center p-3 rounded-xl glass-effect"
                >
                  <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-lg text-gray-300 font-light">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case "competition":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="text-center p-2 rounded-xl glass-effect mb-3"
            >
              <p className="text-base text-gray-300 font-light mb-1">{slide.content.insight}</p>
              <p className="text-base font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {slide.content.positioning}
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-center text-white mb-2">Current Players:</h3>
                {slide.content.competitors.split(", ").map((competitor: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                    className="flex items-center space-x-3 p-2 rounded-xl glass-effect"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">•</span>
                    </div>
                    <p className="text-lg text-gray-300 font-light">{competitor}</p>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-center text-white mb-2">Key Differentiators:</h3>
                {slide.content.differentiators.map((diff: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                    className="flex items-center space-x-3 p-2 rounded-xl glass-effect"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">★</span>
                    </div>
                    <p className="text-lg text-gray-300 font-light">{diff}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )

      case "product":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="space-y-2">
                {["tech", "integrations", "roles"].map((key, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                    className="p-2 rounded-xl glass-effect"
                  >
                    <h3 className="text-base font-semibold text-purple-400 mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace("tech", "Technology Stack")}:
                    </h3>
                    <p className="text-lg text-gray-300 font-light">{slide.content[key]}</p>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-center text-white mb-2">Key Features:</h3>
                {slide.content.features.map((feature: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                    className="flex items-center space-x-3 p-2 rounded-xl glass-effect"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">★</span>
                    </div>
                    <p className="text-lg text-gray-300 font-light">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )

      case "validation":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              {slide.content.metrics.map((metric: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="flex items-center space-x-3 p-2 rounded-xl glass-effect"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-lg text-gray-300 font-light">{metric}</p>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="mt-3 p-2 rounded-xl glass-effect border-l-4 border-gradient-to-b from-purple-500 to-pink-500"
              >
                <h3 className="text-base font-semibold text-purple-400 mb-1">Key Insight:</h3>
                <p className="text-lg text-gray-300 font-light">{slide.content.feedback}</p>
              </motion.div>
            </div>
          </div>
        )

      case "business-model":
        return (
            <div className="space-y-4">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-3xl font-bold text-center text-white mb-4"
            >
                {slide.title}
            </motion.h2>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="p-2 rounded-xl glass-effect text-center"
            >
                <h3 className="text-base font-semibold text-purple-400 mb-1">Primary Revenue:</h3>
                <p className="text-lg text-gray-300 font-light">{slide.content.primary}</p>
            </motion.div>
            </div>
        )

      case "gtm":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              {slide.content.phases.map((phase: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="flex items-start space-x-3 p-2 rounded-xl glass-effect"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-purple-400 mb-1">{phase.phase}</h3>
                    <p className="text-lg text-gray-300 font-light">{phase.description}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="mt-3 p-2 rounded-xl glass-effect"
              >
                <h3 className="text-base font-semibold text-purple-400 mb-1">Channels:</h3>
                <p className="text-lg text-gray-300 font-light">{slide.content.channels}</p>
              </motion.div>
            </div>
          </div>
        )

      case "financials":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="p-2 rounded-xl glass-effect"
              >
                <h3 className="text-base font-semibold text-purple-400 mb-2">Year 1 Projections:</h3>
                <div className="space-y-2">
                  {Object.entries(slide.content.year1).slice(0, -1).map(([key, value]: [string, unknown], index: number) => (
                    <p key={index} className="text-lg text-gray-300 font-light">• {String(value)}</p>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="p-2 rounded-xl glass-effect text-center"
              >
                <h3 className="text-base font-semibold text-purple-400 mb-1">Breakeven Point:</h3>
                <p className="text-lg text-gray-300 font-light">{slide.content.year1.breakeven}</p>
              </motion.div>
            </div>
          </div>
        )

      case "roadmap":
        return (
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl font-bold text-center text-white mb-4"
            >
              {slide.title}
            </motion.h2>
            <div className="grid gap-2">
              {slide.content.milestones.map((milestone: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                  className="flex items-center space-x-3 p-2 rounded-xl glass-effect"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{milestone.period}</span>
                  </div>
                  <p className="text-lg text-gray-300 font-light">{milestone.goal}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

        case "founders":
        return (
            <div className="space-y-4">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-3xl font-bold text-center text-white mb-4"
            >
                {slide.title}
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-2">
                {slide.content.founders.map((founder: any, index: number) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
                    className="p-2 rounded-xl glass-effect text-center"
                >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                    <img
                        src={founder.image}
                        alt={founder.name}
                        className="w-full h-full rounded-full object-cover border-4 border-gradient-to-r from-purple-500 to-pink-500"
                    />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{founder.name}</h3>
                    <p className="text-lg text-gray-300 font-light mb-2">{founder.role}</p>
                    <div className="space-y-1">
                    {founder.links.map((link: any, linkIndex: number) => (
                        <div key={linkIndex}>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline text-sm"
                        >
                            {link.platform}
                        </a>
                        </div>
                    ))}
                    </div>
                </motion.div>
                ))}
            </div>
            </div>
        )

        case "ask":
        return (
            <div className="space-y-4">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-3xl font-bold text-center text-white mb-4"
            >
                {slide.title}
            </motion.h2>
            <div className="grid gap-2">
                <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="text-center"
                >
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {slide.content.seeking}
                </h3>
                </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="text-center"
                >
                <h3 className="text-base font-semibold text-purple-400 mb-2">Use of Funds:</h3>
                <ul className="space-y-1">
                    {slide.content.useOfFunds.map((fund: string, index: number) => (
                    <li key={index} className="text-lg text-gray-300 font-light">{fund}</li>
                    ))}
                </ul>
                </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="text-center"
                >
                <p className="text-lg text-gray-300 font-light">{slide.content.mission}</p>
                </motion.div>
            </div>
            </div>
        )
      default:
        return <div>Slide content not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="shooting-star"></div>
      <div className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-4 glass-effect">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Home className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <div className="text-xs sm:text-sm text-gray-400">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>
      <div className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="min-h-[60vh] flex items-center justify-center"
            >
              <div className="w-full">{renderSlideContent(slides[currentSlide])}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 glass-effect">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            variant="ghost"
            className="text-white hover:bg-white/10 disabled:opacity-50 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            variant="ghost"
            className="text-white hover:bg-white/10 disabled:opacity-50 text-xs sm:text-sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      <div
        className="fixed inset-0 z-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && currentSlide > 0) {
            prevSlide()
          } else if (e.key === "ArrowRight" && currentSlide < slides.length - 1) {
            nextSlide()
          }
        }}
        tabIndex={0}
      />
    </div>
  )
}