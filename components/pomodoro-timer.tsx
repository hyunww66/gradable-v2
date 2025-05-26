"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Coffee, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "next-themes"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CalendarWidget } from "@/components/calendar-widget"
import { toast } from "react-hot-toast" // Import toast from react-hot-toast

type TimerMode = "work" | "break" | "longBreak"

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [cycles, setCycles] = useState(0)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const { theme } = useTheme()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/sounds/bell.mp3") // This would be a real sound file in a production app
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(timerRef.current as NodeJS.Timeout)

            // Play sound if enabled
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
            }

            // Handle session completion
            if (mode === "work") {
              const newCompletedSessions = completedSessions + 1
              setCompletedSessions(newCompletedSessions)
              setCycles(cycles + 1)

              // Determine if it's time for a long break
              if (newCompletedSessions % sessionsUntilLongBreak === 0) {
                setMode("longBreak")
                setMinutes(longBreakDuration)
              } else {
                setMode("break")
                setMinutes(breakDuration)
              }

              // Auto start break if enabled
              setIsActive(autoStartBreaks)
            } else {
              setMode("work")
              setMinutes(workDuration)

              // Auto start next pomodoro if enabled
              setIsActive(autoStartPomodoros)
            }

            setSeconds(0)
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [
    isActive,
    minutes,
    seconds,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    completedSessions,
    sessionsUntilLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    soundEnabled,
  ])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === "work") {
      setMinutes(workDuration)
    } else if (mode === "break") {
      setMinutes(breakDuration)
    } else {
      setMinutes(longBreakDuration)
    }
    setSeconds(0)
  }

  const skipToNext = () => {
    setIsActive(false)
    if (mode === "work") {
      setMode("break")
      setMinutes(breakDuration)
    } else {
      setMode("work")
      setMinutes(workDuration)
    }
    setSeconds(0)
  }

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    let totalSeconds
    if (mode === "work") {
      totalSeconds = workDuration * 60
    } else if (mode === "break") {
      totalSeconds = breakDuration * 60
    } else {
      totalSeconds = longBreakDuration * 60
    }

    const remainingSeconds = minutes * 60 + seconds
    return 100 - (remainingSeconds / totalSeconds) * 100
  }

  const getModeColor = () => {
    if (mode === "work") return "text-gray-800"
    if (mode === "break") return "text-blue-500"
    return "text-pink-300"
  }

  const getProgressColor = () => {
    if (mode === "work") return "bg-gray-800"
    if (mode === "break") return "bg-blue-500"
    return "bg-pink-300"
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200/50">
          <TabsTrigger value="timer" className="text-gray-800 text-xs md:text-sm">
            Timer
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-gray-800 text-xs md:text-sm">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-gray-800 text-xs md:text-sm">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-4 md:space-y-6 py-3 md:py-4">
          <Card className="bg-mint-100/70">
            <CardHeader className="text-center pb-1 md:pb-2 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className={`text-lg md:text-xl ${getModeColor()}`}>
                {mode === "work" ? "Focus Time" : mode === "break" ? "Short Break" : "Long Break"}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-700">
                {mode === "work" ? "Stay focused on your task" : "Take a break and recharge"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center my-4 md:my-6">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="4"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${mode === "work" ? "text-gray-800" : mode === "break" ? "text-blue-500" : "text-pink-300"} stroke-current`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * calculateProgress()) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-gray-800">{formatTime(minutes, seconds)}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                  <Button
                    onClick={toggleTimer}
                    variant="default"
                    size={isMobile ? "default" : "lg"}
                    className={`${isMobile ? "h-10 w-10" : "h-12 w-12"} rounded-full bg-gray-800 text-white hover:bg-gray-700`}
                  >
                    {isActive ? (
                      <Pause className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                    ) : (
                      <Play className={`${isMobile ? "h-4 w-4 ml-0.5" : "h-5 w-5 ml-0.5"}`} />
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size={isMobile ? "default" : "lg"}
                    className={`${isMobile ? "h-10 w-10" : "h-12 w-12"} rounded-full text-gray-800 border-gray-800 hover:bg-gray-100`}
                  >
                    <RotateCcw className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                  </Button>
                  <Button
                    onClick={skipToNext}
                    variant="outline"
                    size={isMobile ? "default" : "lg"}
                    className={`${isMobile ? "h-10 w-10" : "h-12 w-12"} rounded-full text-gray-800 border-gray-800 hover:bg-gray-100`}
                  >
                    {mode === "work" ? (
                      <Coffee className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                    ) : (
                      <Play className={`${isMobile ? "h-4 w-4 ml-0.5" : "h-5 w-5 ml-0.5"}`} />
                    )}
                  </Button>
                </div>

                <div className="w-full flex justify-between items-center text-xs md:text-sm text-gray-700">
                  <div>
                    <p>Sessions: {completedSessions}</p>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="h-7 w-7 md:h-8 md:w-8 rounded-full p-0 text-gray-800 hover:bg-gray-200/50"
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <VolumeX className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-mint-100/70">
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg text-gray-800">Session Progress</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1 text-gray-700">
                    <span>Current Session</span>
                    <span>{calculateProgress().toFixed(0)}%</span>
                  </div>
                  <Progress value={calculateProgress()} className={getProgressColor()} />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1 text-gray-700">
                    <span>Daily Goal</span>
                    <span>{completedSessions} / 8 sessions</span>
                  </div>
                  <Progress value={(completedSessions / 8) * 100} className="bg-green-500" />
                </div>

                <div className="grid grid-cols-8 gap-1 pt-1 md:pt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 md:h-3 rounded-full ${i < completedSessions ? "bg-green-500" : "bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 md:space-y-6 py-3 md:py-4">
          <CalendarWidget
            isExpanded={true}
            onTaskSelect={(task) => {
              // Optional: Start a pomodoro session for the selected task
              toast({
                title: "Task selected",
                description: `Ready to work on: ${task.title}`,
              })
            }}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 md:space-y-6 py-3 md:py-4">
          <Card className="bg-mint-100/70">
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg text-gray-800">Timer Settings</CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-700">
                Customize your timer durations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs md:text-sm text-gray-800 font-medium">
                    Focus Duration: {workDuration} min
                  </Label>
                </div>
                <Slider
                  value={[workDuration]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    setWorkDuration(value[0])
                    if (mode === "work" && !isActive) {
                      setMinutes(value[0])
                      setSeconds(0)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs md:text-sm text-gray-800 font-medium">
                    Short Break Duration: {breakDuration} min
                  </Label>
                </div>
                <Slider
                  value={[breakDuration]}
                  min={1}
                  max={15}
                  step={1}
                  onValueChange={(value) => {
                    setBreakDuration(value[0])
                    if (mode === "break" && !isActive) {
                      setMinutes(value[0])
                      setSeconds(0)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs md:text-sm text-gray-800 font-medium">
                    Long Break Duration: {longBreakDuration} min
                  </Label>
                </div>
                <Slider
                  value={[longBreakDuration]}
                  min={10}
                  max={30}
                  step={5}
                  onValueChange={(value) => {
                    setLongBreakDuration(value[0])
                    if (mode === "longBreak" && !isActive) {
                      setMinutes(value[0])
                      setSeconds(0)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs md:text-sm text-gray-800 font-medium">
                    Sessions until long break: {sessionsUntilLongBreak}
                  </Label>
                </div>
                <Slider
                  value={[sessionsUntilLongBreak]}
                  min={2}
                  max={6}
                  step={1}
                  onValueChange={(value) => {
                    setSessionsUntilLongBreak(value[0])
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-mint-100/70">
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg text-gray-800">Behavior Settings</CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-700">
                Customize how the timer behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6 pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="text-xs md:text-sm text-gray-800 font-medium">
                    Sound Notifications
                  </Label>
                  <p className="text-xs text-gray-600">Play a sound when timer ends</p>
                </div>
                <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-breaks" className="text-xs md:text-sm text-gray-800 font-medium">
                    Auto-start Breaks
                  </Label>
                  <p className="text-xs text-gray-600">Automatically start breaks after focus sessions</p>
                </div>
                <Switch id="auto-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-pomodoros" className="text-xs md:text-sm text-gray-800 font-medium">
                    Auto-start Pomodoros
                  </Label>
                  <p className="text-xs text-gray-600">Automatically start focus sessions after breaks</p>
                </div>
                <Switch id="auto-pomodoros" checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
