"use client"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Clock,
  Calculator,
  BookOpen,
  GraduationCap,
  Bell,
  Calendar,
  ChevronLeft,
  X,
  Settings,
  Menu,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { ModuleCalculator } from "@/components/module-calculator"
import { SemesterCalculator } from "@/components/semester-calculator"
import { YearlyCalculator } from "@/components/yearly-calculator"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CalendarWidget } from "@/components/calendar-widget"

type ExpandedCard = "none" | "pomodoro" | "module" | "semester" | "yearly"

export default function Home() {
  const [expandedCard, setExpandedCard] = useState<ExpandedCard>("none")
  const [userName, setUserName] = useState("Student")
  const mainRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isDesktop = !isMobile

  // Scroll to top when expanding a card
  useEffect(() => {
    if (expandedCard !== "none" && mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [expandedCard])

  const expandCard = (card: ExpandedCard) => {
    setExpandedCard(card)
  }

  const closeCard = () => {
    setExpandedCard("none")
  }

  return (
    <div className="flex flex-col min-h-screen bg-mint-100">
      <header className="border-b bg-mint-100 sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-gray-800" />
            <h1 className="text-lg font-semibold text-gray-800">Gradable</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-800">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="py-4 space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={userName} />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userName}</p>
                        <p className="text-sm text-muted-foreground">Student</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" /> Settings
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Bell className="h-4 w-4" /> Notifications
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Calendar className="h-4 w-4" /> Calendar
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="text-gray-800">
                  <Settings className="h-5 w-5" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userName} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="flex-1 container px-4 py-4 md:px-6 md:py-8 overflow-auto">
        <AnimatePresence mode="wait">
          {expandedCard === "none" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard onCardExpand={expandCard} userName={userName} isMobile={isMobile} />
            </motion.div>
          ) : (
            <motion.div
              key={expandedCard}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-xl shadow-lg overflow-hidden"
            >
              <ExpandedView type={expandedCard} onClose={closeCard} isDesktop={isDesktop} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t py-3 md:py-4 bg-mint-100">
        <div className="container px-4 md:px-6 text-center text-xs md:text-sm text-gray-700">
          <p>© {new Date().getFullYear()} Gradable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function Dashboard({
  onCardExpand,
  userName,
  isMobile,
}: {
  onCardExpand: (card: ExpandedCard) => void
  userName: string
  isMobile: boolean
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">Welcome, {userName}</h2>
          <p className="text-sm md:text-base text-gray-600">Track your academic progress and boost your productivity</p>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-gray-800">
              <Calendar className="h-4 w-4" />
              <span>May 17, 2025</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-gray-800">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Pomodoro Card */}
        <motion.div
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl border bg-mint-200 shadow-sm transition-all hover:shadow-md"
          onClick={() => onCardExpand("pomodoro")}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-800">Pomodoro Timer</h3>
                  <p className="text-xs md:text-sm text-gray-700">Focus and break timer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-800">25</p>
                <p className="text-xs text-gray-700">minutes</p>
              </div>
            </div>
            <div className="mt-3 md:mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/4 rounded-full bg-gray-700"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </motion.div>

        {/* Module Calculator Card */}
        <motion.div
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl border bg-blue-400 shadow-sm transition-all hover:shadow-md"
          onClick={() => onCardExpand("module")}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                  <Calculator className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-800">Module Calculator</h3>
                  <p className="text-xs md:text-sm text-gray-800">Track individual course grades</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-800">15.5</p>
                <p className="text-xs text-gray-800">average</p>
              </div>
            </div>
            <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-white/50 p-1.5 md:p-2">
                <p className="font-medium text-gray-800">EMD</p>
                <p className="text-gray-800 font-medium">Exams</p>
              </div>
              <div className="rounded-md bg-white/50 p-1.5 md:p-2">
                <p className="font-medium text-gray-800">TD</p>
                <p className="text-gray-800 font-medium">Practicals</p>
              </div>
              <div className="rounded-md bg-white/50 p-1.5 md:p-2">
                <p className="font-medium text-gray-800">TP</p>
                <p className="text-gray-800 font-medium">Labs</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </motion.div>

        {/* Semester Calculator Card */}
        <motion.div
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl border bg-yellow-300 shadow-sm transition-all hover:shadow-md"
          onClick={() => onCardExpand("semester")}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-800">Semester Calculator</h3>
                  <p className="text-xs md:text-sm text-gray-800">Compute semester performance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-800">14.75</p>
                <p className="text-xs text-gray-800">semester avg</p>
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center justify-between text-xs md:text-sm">
              <div className="space-y-0.5 md:space-y-1">
                <p className="font-medium text-gray-800">Units: 5</p>
                <p className="font-medium text-gray-800">Modules: 12</p>
              </div>
              <div className="space-y-0.5 md:space-y-1 text-right">
                <p className="font-medium text-gray-800">Credits: 30</p>
                <p className="font-semibold text-gray-900">Status: Passing</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </motion.div>

        {/* Yearly Calculator Card */}
        <motion.div
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl border bg-pink-200 shadow-sm transition-all hover:shadow-md"
          onClick={() => onCardExpand("yearly")}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-800 text-white">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-800">Yearly Calculator</h3>
                  <p className="text-xs md:text-sm text-gray-800">Track annual academic progress</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-800">15.0</p>
                <p className="text-xs text-gray-800">yearly avg</p>
              </div>
            </div>
            <div className="mt-3 md:mt-4 h-8 md:h-10 w-full overflow-hidden rounded-lg bg-gray-200/40">
              <div className="flex h-full">
                <div className="h-full w-1/2 bg-gray-300/50 text-xs text-gray-800 font-medium flex items-center justify-center">
                  Semester 1: 14.75
                </div>
                <div className="h-full w-1/2 bg-gray-300/70 text-xs text-gray-800 font-medium flex items-center justify-center">
                  Semester 2: 15.25
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </motion.div>
      </div>

      <CalendarWidget />
    </div>
  )
}

function ExpandedView({
  type,
  onClose,
  isDesktop,
}: {
  type: ExpandedCard
  onClose: () => void
  isDesktop: boolean
}) {
  const getTitle = () => {
    switch (type) {
      case "pomodoro":
        return "Pomodoro Timer"
      case "module":
        return "Module Calculator"
      case "semester":
        return "Semester Calculator"
      case "yearly":
        return "Yearly Calculator"
      default:
        return ""
    }
  }

  const getIcon = () => {
    switch (type) {
      case "pomodoro":
        return <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
      case "module":
        return <Calculator className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
      case "semester":
        return <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
      case "yearly":
        return <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
      default:
        return null
    }
  }

  const getContent = () => {
    switch (type) {
      case "pomodoro":
        return <PomodoroTimer />
      case "module":
        return <ModuleCalculator />
      case "semester":
        return <SemesterCalculator />
      case "yearly":
        return <YearlyCalculator />
      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "pomodoro":
        return "bg-mint-200"
      case "module":
        return "bg-blue-400"
      case "semester":
        return "bg-yellow-300"
      case "yearly":
        return "bg-pink-200"
      default:
        return "bg-card"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className={`border-b p-3 md:p-4 flex items-center justify-between ${getBackgroundColor()}`}>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-800 hover:bg-gray-200/20">
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="text-base md:text-xl font-semibold text-gray-800">{getTitle()}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-800 hover:bg-gray-200/20">
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
      <div className={`flex-1 overflow-auto p-3 ${isDesktop ? "md:p-6" : "md:p-4"} ${getBackgroundColor()}`}>
        {getContent()}
      </div>
    </div>
  )
}
