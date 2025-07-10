"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  date: string
}

interface ChatHistorySidebarProps {
  chatSessions: ChatSession[]
  currentSessionId: string
  onLoadSession: (sessionId: string) => void
  onNewChat: () => void
  isMinimized: boolean
  setIsMinimized: (minimized: boolean) => void
}

export function ChatHistorySidebar({
  chatSessions,
  currentSessionId,
  onLoadSession,
  onNewChat,
  isMinimized,
  setIsMinimized,
}: ChatHistorySidebarProps) {
  const categorizeChats = (sessions: ChatSession[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayChats = sessions.filter((session) => new Date(session.date) >= today)
    const yesterdayChats = sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= yesterday && sessionDate < today
    })
    const last7DaysChats = sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= sevenDaysAgo && sessionDate < yesterday
    })
    const olderChats = sessions.filter((session) => new Date(session.date) < sevenDaysAgo)

    return { todayChats, yesterdayChats, last7DaysChats, olderChats }
  }

  const { todayChats, yesterdayChats, last7DaysChats, olderChats } = categorizeChats(chatSessions)

  const handleSessionLoad = (sessionId: string) => {
    onLoadSession(sessionId)
    // Auto-minimize on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsMinimized(true)
    }
  }

  const handleNewChat = () => {
    onNewChat()
    // Auto-minimize on mobile after creating new chat
    if (window.innerWidth < 768) {
      setIsMinimized(true)
    }
  }

  const renderChatSection = (sectionChats: ChatSession[], title: string, startIndex: number) => {
    if (sectionChats.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">{title}</h3>
        <div className="space-y-2">
          {sectionChats.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (startIndex + index) * 0.05 }}
              className={`glass-effect rounded-xl p-3 hover-glow cursor-pointer hover:bg-white/5 transition-all duration-300 ${
                currentSessionId === session.id ? "border border-purple-500/30 bg-purple-500/10" : ""
              }`}
              onClick={() => handleSessionLoad(session.id)}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMinimized(true)}
          />
        )}
      </AnimatePresence>

      {/* Minimized State */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ x: -60 }}
            animate={{ x: 0 }}
            exit={{ x: -60 }}
            className="fixed left-0 top-0 bottom-0 z-30 w-12 sm:w-16 glass-effect border-r border-white/10 flex flex-col items-center py-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="hover:bg-white/10 rounded-xl mb-4 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNewChat} 
              className="hover:bg-white/10 rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Sidebar */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-30 w-64 sm:w-72 md:w-80 glass-effect border-r border-white/10"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-white/10">
                <h2 className="text-xl sm:text-lg font-semibold text-gradient">Chat History</h2>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleNewChat} 
                      className="hover:bg-white/10 rounded-xl h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="hover:bg-white/10 rounded-xl h-8 w-8 sm:h-10 sm:w-10"
                  >
                    {/* Show X on mobile, ChevronLeft on desktop */}
                    <X className="h-3 w-3 sm:h-4 sm:w-4 md:hidden" />
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 hidden md:block" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain">
                {chatSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-400 h-full flex flex-col items-center justify-center space-y-3"
                  >
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                    <p className="text-xs mt-1">Start a conversation to see your chat history</p>
                  </motion.div>
                ) : (
                  <>
                    {renderChatSection(todayChats, "Today", 0)}
                    {renderChatSection(yesterdayChats, "Yesterday", todayChats.length)}
                    {renderChatSection(last7DaysChats, "Last 7 Days", todayChats.length + yesterdayChats.length)}
                    {renderChatSection(
                      olderChats,
                      "Earlier",
                      todayChats.length + yesterdayChats.length + last7DaysChats.length,
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-white/10 p-3 sm:p-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNewChat}
                    className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-xl h-10 sm:h-12 text-sm sm:text-base"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    New Chat
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}