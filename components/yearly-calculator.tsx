"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calculator, BarChart, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { SemesterCalculator } from "./semester-calculator"

type SemesterResult = {
  id: string
  name: string
  moyenne: number | null
  coefficient: number
}

export function YearlyCalculator() {
  const { toast } = useToast()
  const [academicYear, setAcademicYear] = useState("2025-2026")
  const [semesters, setSemesters] = useState<SemesterResult[]>([
    { id: "s1", name: "Semester 1", moyenne: 14.75, coefficient: 1 },
    { id: "s2", name: "Semester 2", moyenne: 15.25, coefficient: 1 },
  ])

  const [annualAverage, setAnnualAverage] = useState<number | null>(null)
  const [status, setStatus] = useState<"Admis" | "À rattraper" | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const updateSemester = (id: string, field: keyof SemesterResult, value: string | number) => {
    setSemesters(
      semesters.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            [field]: field === "name" ? value : Number(value),
          }
        }
        return s
      }),
    )
  }

  const calculateAnnualAverage = () => {
    let weightedSum = 0
    let totalCoefficient = 0
    let allSemestersCalculable = true

    for (const semester of semesters) {
      if (semester.moyenne === null) {
        allSemestersCalculable = false
        break
      }
      weightedSum += semester.moyenne * semester.coefficient
      totalCoefficient += semester.coefficient
    }

    if (allSemestersCalculable && totalCoefficient > 0) {
      const average = weightedSum / totalCoefficient
      setAnnualAverage(average)
      setStatus(average >= 10 ? "Admis" : "À rattraper")

      toast({
        title: "Calculation complete",
        description: `Annual average: ${average.toFixed(2)}/20`,
      })
    } else {
      setAnnualAverage(null)
      setStatus(null)

      toast({
        title: "Calculation incomplete",
        description: "Some semesters have missing grades",
        variant: "destructive",
      })
    }
  }

  const saveData = () => {
    try {
      const data = {
        academicYear,
        semesters,
        annualAverage,
        status,
      }
      localStorage.setItem("yearlyData", JSON.stringify(data))
      toast({
        title: "Data saved",
        description: "Your yearly data has been saved locally",
      })
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "There was a problem saving your data",
        variant: "destructive",
      })
    }
  }

  const loadData = () => {
    try {
      const savedData = localStorage.getItem("yearlyData")
      if (savedData) {
        const data = JSON.parse(savedData)
        setAcademicYear(data.academicYear)
        setSemesters(data.semesters)
        setAnnualAverage(data.annualAverage)
        setStatus(data.status)
        toast({
          title: "Data loaded",
          description: "Your yearly data has been loaded",
        })
      } else {
        toast({
          title: "No saved data",
          description: "No previously saved data was found",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "There was a problem loading your data",
        variant: "destructive",
      })
    }
  }

  const exportPdf = () => {
    toast({
      title: "Export feature",
      description: "PDF export would be implemented here in a production app",
    })
  }

  const getStatusColor = (status: "Admis" | "À rattraper" | null) => {
    if (status === "Admis") return "text-green-500"
    if (status === "À rattraper") return "text-red-500"
    return ""
  }

  const getAverageColor = (average: number | null) => {
    if (average === null) return ""
    if (average >= 16) return "text-green-500"
    if (average >= 14) return "text-blue-500"
    if (average >= 12) return "text-yellow-500"
    if (average >= 10) return "text-orange-500"
    return "text-red-500"
  }

  const getGradeStatus = (grade: number | null) => {
    if (grade === null) return null
    if (grade >= 16) return "Très Bien"
    if (grade >= 14) return "Bien"
    if (grade >= 12) return "Assez Bien"
    if (grade >= 10) return "Passable"
    return "À rattraper"
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 py-4">
          <Card className="bg-pink-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Academic Year</CardTitle>
              <CardDescription className="text-gray-800 font-medium">
                Enter your academic year information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="academic-year" className="text-gray-800 font-medium">
                    Academic Year
                  </Label>
                  <Input
                    id="academic-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2025-2026"
                    className="bg-white/80 text-gray-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semester Results</CardTitle>
              <CardDescription>Enter your semester averages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {semesters.map((semester) => (
                <div key={semester.id} className="p-3 bg-muted/30 rounded-lg grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={semester.name}
                      onChange={(e) => updateSemester(semester.id, "name", e.target.value)}
                      placeholder="Semester name"
                      className="bg-white/80 text-black"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={semester.moyenne === null ? "" : semester.moyenne}
                      onChange={(e) => updateSemester(semester.id, "moyenne", e.target.value)}
                      placeholder="Average"
                      min="0"
                      max="20"
                      step="0.01"
                      className="bg-white/80 text-black"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      value={semester.coefficient}
                      onChange={(e) => updateSemester(semester.id, "coefficient", e.target.value)}
                      placeholder="Coefficient"
                      min="0"
                      step="0.5"
                      className="bg-white/80 text-black"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                {semesters.length} semester{semesters.length !== 1 ? "s" : ""}
              </div>
              <Button onClick={calculateAnnualAverage} className="gap-1">
                <Calculator className="h-4 w-4" /> Calculate
              </Button>
            </CardFooter>
          </Card>

          {annualAverage !== null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Annual Results</CardTitle>
                  <CardDescription>Academic year {academicYear}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportPdf} className="gap-1">
                  <FileText className="h-4 w-4" /> Export
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className={`text-5xl font-bold ${getAverageColor(annualAverage)}`}>
                    {annualAverage.toFixed(2)}
                    <span className="text-xl">/20</span>
                  </div>
                  <Badge className="mt-2" variant={status === "Admis" ? "default" : "destructive"}>
                    {status}
                  </Badge>
                  <p className="text-sm mt-2">{getGradeStatus(annualAverage)}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Semester Comparison</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {semesters.map((semester) => (
                      <div key={semester.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{semester.name}</span>
                            <Badge variant="outline">Coef. {semester.coefficient}</Badge>
                          </div>
                          <span className={`font-bold ${getAverageColor(semester.moyenne)}`}>
                            {semester.moyenne !== null ? semester.moyenne.toFixed(2) : "N/A"}/20
                          </span>
                        </div>
                        <Progress
                          value={semester.moyenne !== null ? (semester.moyenne / 20) * 100 : 0}
                          className={
                            semester.moyenne !== null ? getAverageColor(semester.moyenne).replace("text-", "bg-") : ""
                          }
                        />
                      </div>
                    ))}

                    <div className="space-y-1 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Annual Average</span>
                        </div>
                        <span className={`font-bold ${getAverageColor(annualAverage)}`}>
                          {annualAverage.toFixed(2)}/20
                        </span>
                      </div>
                      <Progress
                        value={(annualAverage / 20) * 100}
                        className={getAverageColor(annualAverage).replace("text-", "bg-")}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                    <BarChart className="h-4 w-4" /> Visual Comparison
                  </h3>
                  <div className="h-40 flex items-end gap-4">
                    {semesters.map((semester) => (
                      <div key={semester.id} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full ${getAverageColor(semester.moyenne)}`}
                          style={{
                            height: `${((semester.moyenne || 0) / 20) * 100}%`,
                            backgroundColor: "currentColor",
                            opacity: 0.7,
                            borderRadius: "4px 4px 0 0",
                          }}
                        ></div>
                        <p className="text-xs mt-1 truncate w-full text-center">{semester.name}</p>
                        <p className="text-xs font-bold">{semester.moyenne?.toFixed(2) || "-"}</p>
                      </div>
                    ))}
                    {annualAverage !== null && (
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full ${getAverageColor(annualAverage)}`}
                          style={{
                            height: `${(annualAverage / 20) * 100}%`,
                            backgroundColor: "currentColor",
                            opacity: 0.7,
                            borderRadius: "4px 4px 0 0",
                          }}
                        ></div>
                        <p className="text-xs mt-1 truncate w-full text-center">Annual</p>
                        <p className="text-xs font-bold">{annualAverage.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          <div className="p-4 bg-muted rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              For detailed semester calculations with units and modules, use the calculator below. Results can be used
              in the overview tab.
            </p>
          </div>
          <SemesterCalculator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  )
}
