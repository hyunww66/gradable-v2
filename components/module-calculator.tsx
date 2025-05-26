"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Calculator, Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

type Module = {
  id: string
  name: string
  coefficient: number
  hasTD: boolean
  hasTP: boolean
}

type ModuleGrade = {
  emd: number | null
  td: number | null
  tp: number | null
}

type ModuleWithGrades = Module & {
  grades: ModuleGrade
  moyenne: number | null
}

// Function to calculate module average
const calculateModuleMoyenne = (
  module: Module,
  emd: number | null,
  td: number | null,
  tp: number | null,
): number | null => {
  const validEmd = emd !== null && !isNaN(Number(emd)) && Number(emd) >= 0 && Number(emd) <= 20

  if (!validEmd) return null // EMD must be valid

  // Validate TD if the module has TD
  const validTd = !module.hasTD || (td !== null && !isNaN(Number(td)) && Number(td) >= 0 && Number(td) <= 20)
  if (module.hasTD && !validTd) return null // TD must be valid if required

  // Validate TP if the module has TP
  const validTp = !module.hasTP || (tp !== null && !isNaN(Number(tp)) && Number(tp) >= 0 && Number(tp) <= 20)
  if (module.hasTP && !validTp) return null // TP must be valid if required

  // Current logic based on user's initial request
  if (module.hasTD) {
    // We already validated TD above
    return (Number(emd) * 2 + Number(td as number)) / 3 // Cast td as number because validation passed
  } else {
    // If no TD, EMD is the average
    return Number(emd)
  }
}

export function ModuleCalculator() {
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [moduleName, setModuleName] = useState("Biotechnology")
  const [modules, setModules] = useState<ModuleWithGrades[]>([
    {
      id: "mod1",
      name: "Molecular Biology",
      coefficient: 3,
      hasTD: true,
      hasTP: false,
      grades: { emd: 15, td: 14, tp: null },
      moyenne: null,
    },
    {
      id: "mod2",
      name: "Physiology",
      coefficient: 2,
      hasTD: true,
      hasTP: true,
      grades: { emd: 16, td: 13, tp: 17 },
      moyenne: null,
    },
  ])

  const addModule = () => {
    const newId = `mod${Date.now()}`
    setModules([
      ...modules,
      {
        id: newId,
        name: `Module ${modules.length + 1}`,
        coefficient: 1,
        hasTD: false,
        hasTP: false,
        grades: { emd: null, td: null, tp: null },
        moyenne: null,
      },
    ])
  }

  const removeModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
  }

  const updateModule = (
    id: string,
    field: keyof Module | "grades.emd" | "grades.td" | "grades.tp",
    value: string | number | boolean,
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id === id) {
          if (field === "grades.emd") {
            return {
              ...m,
              grades: {
                ...m.grades,
                emd: value === "" ? null : Number(value),
              },
            }
          } else if (field === "grades.td") {
            return {
              ...m,
              grades: {
                ...m.grades,
                td: value === "" ? null : Number(value),
              },
            }
          } else if (field === "grades.tp") {
            return {
              ...m,
              grades: {
                ...m.grades,
                tp: value === "" ? null : Number(value),
              },
            }
          } else {
            return {
              ...m,
              [field]: field === "coefficient" ? Number(value) : value,
            }
          }
        }
        return m
      }),
    )
  }

  const calculateGrades = () => {
    const updatedModules = modules.map((m) => {
      const moyenne = calculateModuleMoyenne(m, m.grades.emd, m.grades.td, m.grades.tp)
      return {
        ...m,
        moyenne,
      }
    })

    setModules(updatedModules)

    const validModules = updatedModules.filter((m) => m.moyenne !== null)
    if (validModules.length < updatedModules.length) {
      toast({
        title: "Missing grades",
        description: "Some modules have missing or invalid grades and couldn't be calculated.",
        variant: "destructive",
      })
    } else if (validModules.length > 0) {
      toast({
        title: "Calculation complete",
        description: "All module grades have been calculated successfully.",
      })
    }
  }

  const totalCoefficient = modules.reduce((sum, m) => sum + m.coefficient, 0)
  const validModules = modules.filter((m) => m.moyenne !== null)
  const weightedSum = validModules.reduce((sum, m) => sum + (m.moyenne as number) * m.coefficient, 0)
  const overallAverage = validModules.length > 0 ? weightedSum / totalCoefficient : null

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground"
    if (grade >= 16) return "text-green-500"
    if (grade >= 14) return "text-blue-500"
    if (grade >= 12) return "text-yellow-500"
    if (grade >= 10) return "text-orange-500"
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
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <Card className="bg-black">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4">
          <CardTitle className="text-base md:text-lg text-white">Unit Information</CardTitle>
          <CardDescription className="text-xs md:text-sm text-white/80">
            Enter the details for this unit
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
          <div className="grid gap-3 md:gap-4">
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="unit-name" className="text-xs md:text-sm text-white font-medium">
                Unit Name
              </Label>
              <Input
                id="unit-name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Mathematics Unit"
                className="bg-white/80 text-black"
              />
            </div>
            <div className="grid gap-1 md:gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs md:text-sm text-white font-medium">
                  Total Coefficient: {totalCoefficient}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20"
                      >
                        <Info className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs md:text-sm">
                        The total coefficient is the sum of all module coefficients. It's used to calculate the weighted
                        average.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-4 md:px-6 pt-3 md:pt-4">
          <div>
            <CardTitle className="text-base md:text-lg text-white">Modules</CardTitle>
            <CardDescription className="text-xs md:text-sm text-white/80">Add and manage your modules</CardDescription>
          </div>
          <Button
            onClick={addModule}
            size="sm"
            className="gap-1 bg-white text-black hover:bg-white/80 h-7 md:h-8 text-xs md:text-sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" /> Add Module
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6 pt-0">
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
              <div className="rounded-full bg-white/10 p-2 md:p-3 mb-2 md:mb-3">
                <Calculator className="h-5 w-5 md:h-6 md:w-6 text-white/80" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-white">No modules added</h3>
              <p className="text-xs md:text-sm text-white/70 max-w-sm mt-1">
                Add your first module to start calculating your grades
              </p>
            </div>
          ) : (
            modules.map((module) => (
              <Card key={module.id} className="overflow-hidden bg-gray-900 border-gray-700">
                <CardHeader className="bg-gray-800 py-2 md:py-3 px-3 md:px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2 md:mr-4">
                      <Input
                        value={module.name}
                        onChange={(e) => updateModule(module.id, "name", e.target.value)}
                        placeholder="Module name"
                        className="bg-white/80 text-black text-xs md:text-sm h-7 md:h-9"
                      />
                    </div>
                    <div className="w-16 md:w-20 mr-1 md:mr-2">
                      <Input
                        type="number"
                        value={module.coefficient}
                        onChange={(e) => updateModule(module.id, "coefficient", e.target.value)}
                        placeholder="Coef."
                        min="0"
                        step="0.5"
                        className="bg-white/80 text-black text-xs md:text-sm h-7 md:h-9"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeModule(module.id)}
                      className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Switch
                        id={`td-${module.id}`}
                        checked={module.hasTD}
                        onCheckedChange={(checked) => updateModule(module.id, "hasTD", checked)}
                      />
                      <Label htmlFor={`td-${module.id}`} className="text-xs md:text-sm text-white font-medium">
                        Has TD
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Switch
                        id={`tp-${module.id}`}
                        checked={module.hasTP}
                        onCheckedChange={(checked) => updateModule(module.id, "hasTP", checked)}
                      />
                      <Label htmlFor={`tp-${module.id}`} className="text-xs md:text-sm text-white font-medium">
                        Has TP
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div>
                      <Label className="block text-xs font-medium mb-1 text-white">EMD (Exam)</Label>
                      <Input
                        type="number"
                        value={module.grades.emd === null ? "" : module.grades.emd}
                        onChange={(e) => updateModule(module.id, "grades.emd", e.target.value)}
                        placeholder="0-20"
                        min="0"
                        max="20"
                        step="0.25"
                        className="bg-white/80 text-black text-xs md:text-sm h-7 md:h-9"
                      />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-1 text-white">TD (Practical)</Label>
                      <Input
                        type="number"
                        value={module.grades.td === null ? "" : module.grades.td}
                        onChange={(e) => updateModule(module.id, "grades.td", e.target.value)}
                        placeholder="0-20"
                        disabled={!module.hasTD}
                        min="0"
                        max="20"
                        step="0.25"
                        className="bg-white/80 text-black text-xs md:text-sm h-7 md:h-9"
                      />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-1 text-white">TP (Lab)</Label>
                      <Input
                        type="number"
                        value={module.grades.tp === null ? "" : module.grades.tp}
                        onChange={(e) => updateModule(module.id, "grades.tp", e.target.value)}
                        placeholder="0-20"
                        disabled={!module.hasTP}
                        min="0"
                        max="20"
                        step="0.25"
                        className="bg-white/80 text-black text-xs md:text-sm h-7 md:h-9"
                      />
                    </div>
                  </div>

                  {module.moyenne !== null && (
                    <div className="flex items-center justify-between mt-1 md:mt-2 p-2 bg-gray-800 rounded-md">
                      <p className="text-xs md:text-sm font-medium text-white">Module Average:</p>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className={`font-bold text-base md:text-lg ${getGradeColor(module.moyenne)}`}>
                          {module.moyenne.toFixed(2)}/20
                        </span>
                        {getGradeStatus(module.moyenne) && (
                          <Badge variant="outline" className="border-white/50 text-white text-xs">
                            {getGradeStatus(module.moyenne)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-800 p-3 md:p-4">
          <div className="text-xs md:text-sm text-white/70">
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </div>
          <Button
            onClick={calculateGrades}
            className="gap-1 bg-white text-black hover:bg-white/80 h-7 md:h-9 text-xs md:text-sm"
          >
            <Calculator className="h-3 w-3 md:h-4 md:w-4" /> Calculate
          </Button>
        </CardFooter>
      </Card>

      {overallAverage !== null && (
        <Card className="bg-black">
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-base md:text-lg text-white">Unit Results</CardTitle>
            <CardDescription className="text-xs md:text-sm text-white/80">
              Overall performance for {moduleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6 pt-0">
            <div className="flex flex-col items-center justify-center py-3 md:py-4">
              <div className={`text-4xl md:text-5xl font-bold ${getGradeColor(overallAverage)}`}>
                {overallAverage.toFixed(2)}
                <span className="text-lg md:text-xl">/20</span>
              </div>
              <Badge className="mt-2" variant="secondary">
                {getGradeStatus(overallAverage)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="py-2 px-3 md:px-4">
                  <CardTitle className="text-xs md:text-sm text-white">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3 md:px-4">
                  <div className="space-y-1.5 md:space-y-2">
                    {[
                      { range: "16-20", label: "Très Bien", color: "bg-green-500" },
                      { range: "14-16", label: "Bien", color: "bg-blue-500" },
                      { range: "12-14", label: "Assez Bien", color: "bg-yellow-500" },
                      { range: "10-12", label: "Passable", color: "bg-orange-500" },
                      { range: "0-10", label: "À rattraper", color: "bg-red-500" },
                    ].map((grade) => {
                      const count = validModules.filter((m) => {
                        if (grade.range === "16-20") return m.moyenne !== null && m.moyenne >= 16
                        if (grade.range === "14-16") return m.moyenne !== null && m.moyenne >= 14 && m.moyenne < 16
                        if (grade.range === "12-14") return m.moyenne !== null && m.moyenne >= 12 && m.moyenne < 14
                        if (grade.range === "10-12") return m.moyenne !== null && m.moyenne >= 10 && m.moyenne < 12
                        return m.moyenne !== null && m.moyenne < 10
                      }).length
                      const percentage = validModules.length > 0 ? (count / validModules.length) * 100 : 0

                      return (
                        <div key={grade.range} className="flex items-center gap-1 md:gap-2">
                          <div className="w-20 md:w-24 text-xs text-white">
                            {grade.range} ({grade.label})
                          </div>
                          <div className="flex-1 h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${grade.color}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                          <div className="w-6 md:w-8 text-xs text-right text-white">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="py-2 px-3 md:px-4">
                  <CardTitle className="text-xs md:text-sm text-white">Module Comparison</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3 md:px-4">
                  <div className="space-y-1.5 md:space-y-2">
                    {validModules.map((module) => (
                      <div key={module.id} className="flex items-center gap-1 md:gap-2">
                        <div className="w-20 md:w-24 truncate text-xs text-white">{module.name}</div>
                        <div className="flex-1 h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getGradeColor(module.moyenne).replace("text-", "bg-")}`}
                            style={{ width: `${((module.moyenne as number) / 20) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-10 md:w-12 text-xs text-right text-white">
                          {module.moyenne?.toFixed(1)}/20
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
