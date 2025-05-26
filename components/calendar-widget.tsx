"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

type Task = {
  id: string
  title: string
  description?: string
  date: string
  time: string
  duration?: number
  priority: "low" | "medium" | "high"
  completed: boolean
}

type CalendarWidgetProps = {
  isExpanded?: boolean
  onTaskSelect?: (task: Task) => void
}

export function CalendarWidget({ isExpanded = false, onTaskSelect }: CalendarWidgetProps) {
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Mathematics Final Exam",
      description: "Advanced Calculus final examination",
      date: "2025-05-25",
      time: "09:00",
      duration: 180,
      priority: "high",
      completed: false,
    },
    {
      id: "2",
      title: "Programming Project",
      description: "Web Development project submission",
      date: "2025-06-05",
      time: "23:59",
      duration: 60,
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      title: "Physics Lab Report",
      description: "Quantum Mechanics lab report due",
      date: "2025-06-15",
      time: "17:00",
      duration: 30,
      priority: "medium",
      completed: false,
    },
  ])
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 60,
    priority: "medium",
  })

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => task.date === date)
  }

  const getTodaysTasks = () => {
    const today = formatDate(new Date())
    return tasks.filter((task) => task.date === today).slice(0, 3)
  }

  const getUpcomingTasks = () => {
    const today = formatDate(new Date())
    return tasks
      .filter((task) => task.date >= today && !task.completed)
      .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
      .slice(0, 3)
  }

  const addTask = () => {
    if (!newTask.title || !newTask.date || !newTask.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title!,
      description: newTask.description || "",
      date: newTask.date!,
      time: newTask.time!,
      duration: newTask.duration || 60,
      priority: newTask.priority || "medium",
      completed: false,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 60,
      priority: "medium",
    })
    setShowAddTask(false)
    saveTasksToStorage([...tasks, task])

    toast({
      title: "Task added",
      description: `${task.title} has been scheduled for ${new Date(task.date).toLocaleDateString()}`,
    })
  }

  const updateTask = () => {
    if (!editingTask || !editingTask.title || !editingTask.date || !editingTask.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedTasks = tasks.map((task) => (task.id === editingTask.id ? editingTask : task))
    setTasks(updatedTasks)
    setEditingTask(null)
    saveTasksToStorage(updatedTasks)

    toast({
      title: "Task updated",
      description: `${editingTask.title} has been updated`,
    })
  }

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)

    toast({
      title: "Task deleted",
      description: "The task has been removed from your calendar",
    })
  }

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)

    const task = updatedTasks.find((t) => t.id === taskId)
    if (task) {
      toast({
        title: task.completed ? "Task completed" : "Task reopened",
        description: `${task.title} has been ${task.completed ? "marked as complete" : "reopened"}`,
      })
    }
  }

  const saveTasksToStorage = (tasksToSave: Task[]) => {
    try {
      localStorage.setItem("calendarTasks", JSON.stringify(tasksToSave))
    } catch (error) {
      console.error("Failed to save tasks:", error)
    }
  }

  const loadTasksFromStorage = () => {
    try {
      const savedTasks = localStorage.getItem("calendarTasks")
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDaysUntil = (date: string) => {
    const today = new Date()
    const taskDate = new Date(date)
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  useEffect(() => {
    loadTasksFromStorage()
  }, [])

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 md:h-12"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateString = formatDate(date)
      const dayTasks = getTasksForDate(dateString)
      const isToday = dateString === formatDate(new Date())
      const isSelected = dateString === formatDate(selectedDate)

      days.push(
        <div
          key={day}
          className={`h-8 md:h-12 p-1 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
            isToday ? "bg-blue-100 dark:bg-blue-900" : ""
          } ${isSelected ? "bg-blue-200 dark:bg-blue-800" : ""} hover:bg-gray-100 dark:hover:bg-gray-800`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">{day}</div>
          {dayTasks.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {dayTasks.slice(0, isMobile ? 1 : 2).map((task) => (
                <div
                  key={task.id}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${getPriorityColor(task.priority)}`}
                  title={task.title}
                ></div>
              ))}
              {dayTasks.length > (isMobile ? 1 : 2) && (
                <div className="text-xs text-gray-500">+{dayTasks.length - (isMobile ? 1 : 2)}</div>
              )}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  if (!isExpanded) {
    // Compact view for dashboard
    return (
      <Card className="bg-card">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4">
          <CardTitle className="text-base md:text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3 px-4 md:px-6 pb-4 md:pb-6 pt-0">
          {getTodaysTasks().length === 0 ? (
            <div className="text-center py-4 md:py-6">
              <Calendar className="h-8 w-8 md:h-10 md:w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">No tasks scheduled for today</p>
              <Button size="sm" onClick={() => setShowAddTask(true)} className="mt-2 gap-1 text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            getTodaysTasks().map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b pb-2 md:pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                onClick={() => onTaskSelect?.(task)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base text-gray-800 dark:text-gray-200">{task.title}</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {task.time} • {task.duration}min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTaskCompletion(task.id)
                    }}
                    className="h-6 w-6 md:h-8 md:w-8 p-0"
                  >
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {getUpcomingTasks().length > 0 && (
            <div className="pt-2 md:pt-3 border-t">
              <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upcoming</h4>
              {getUpcomingTasks()
                .slice(0, 2)
                .map((task) => {
                  const daysUntil = getDaysUntil(task.date)
                  return (
                    <div key={task.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(task.date).toLocaleDateString()} • {daysUntil} days
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          daysUntil <= 3 ? "border-red-500 text-red-500" : "border-gray-500 text-gray-500"
                        }`}
                      >
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full calendar view
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Calendar Header */}
      <Card className="bg-card">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-gray-800 dark:text-gray-200" />
              <CardTitle className="text-lg md:text-xl text-gray-800 dark:text-gray-200">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button size="sm" onClick={() => setShowAddTask(true)} className="gap-1 text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="h-8 md:h-10 flex items-center justify-center">
                <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendarGrid()}</div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      {getTasksForDate(formatDate(selectedDate)).length > 0 && (
        <Card className="bg-card">
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-gray-200">
              Tasks for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 md:px-6 pb-4 md:pb-6 pt-0">
            {getTasksForDate(formatDate(selectedDate)).map((task) => (
              <div
                key={task.id}
                className={`p-3 md:p-4 border rounded-lg ${
                  task.completed ? "bg-gray-50 dark:bg-gray-800 opacity-75" : "bg-white dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-medium text-sm md:text-base ${
                          task.completed ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    {task.description && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
                      <span>🕐 {task.time}</span>
                      <span>⏱️ {task.duration}min</span>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingTask(task)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Task Modal */}
      {(showAddTask || editingTask) && (
        <Card className="bg-card">
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-gray-200">
              {editingTask ? "Edit Task" : "Add New Task"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6 pt-0">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="task-title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="task-title"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, title: e.target.value })
                      : setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="task-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="task-description"
                  value={editingTask ? editingTask.description : newTask.description}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, description: e.target.value })
                      : setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-date" className="text-sm font-medium">
                    Date *
                  </Label>
                  <Input
                    id="task-date"
                    type="date"
                    value={editingTask ? editingTask.date : newTask.date}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, date: e.target.value })
                        : setNewTask({ ...newTask, date: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="task-time" className="text-sm font-medium">
                    Time *
                  </Label>
                  <Input
                    id="task-time"
                    type="time"
                    value={editingTask ? editingTask.time : newTask.time}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, time: e.target.value })
                        : setNewTask({ ...newTask, time: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-duration" className="text-sm font-medium">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="task-duration"
                    type="number"
                    value={editingTask ? editingTask.duration : newTask.duration}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, duration: Number(e.target.value) })
                        : setNewTask({ ...newTask, duration: Number(e.target.value) })
                    }
                    placeholder="60"
                    min="1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="task-priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <select
                    id="task-priority"
                    value={editingTask ? editingTask.priority : newTask.priority}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, priority: e.target.value as "low" | "medium" | "high" })
                        : setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTask(false)
                  setEditingTask(null)
                  setNewTask({
                    title: "",
                    description: "",
                    date: new Date().toISOString().split("T")[0],
                    time: "09:00",
                    duration: 60,
                    priority: "medium",
                  })
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingTask ? updateTask : addTask}>{editingTask ? "Update Task" : "Add Task"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
