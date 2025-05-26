"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Calculator, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

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

type CalculatedModule = Module & {
  grades: ModuleGrade
  moyenne: number | null
}

type Unit = {
  id: string
  name: string
  coefficient: number
  modules: CalculatedModule[]
  moyenne: number | null
  isOpen: boolean
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
  if (module.hasTD && module.hasTP) {
    // If both TD and TP are present
    return Number(emd) * 0.6 + Number(td as number) * 0.2 + Number(tp as number) * 0.2
  } else if (module.hasTD) {
    // We already validated TD above
    return (Number(emd) * 2 + Number(td as number)) / 3 // Cast td as number because validation passed
  } else if (module.hasTP) {
    // If only TP is present
    return (Number(emd) * 2 + Number(tp as number)) / 3
  } else {
    // If no TD or TP, EMD is the average
    return Number(emd)
  }
}

// Function to calculate unit average
const calculateUnitMoyenne = (unit: Unit): number | null => {
  let weightedSum = 0
  let totalCoefficient = 0
  let allModulesCalculable = true

  for (const module of unit.modules) {
    if (module.moyenne === null) {
      allModulesCalculable = false
      break
    }
    weightedSum += module.moyenne * module.coefficient
    totalCoefficient += module.coefficient
  }

  return allModulesCalculable && totalCoefficient > 0 ? weightedSum / totalCoefficient : null
}

export function SemesterCalculator() {
  const { toast } = useToast()
  const [semesterName, setSemesterName] = useState("Semester 1")
  const [units, setUnits] = useState<Unit[]>([
    {
      id: "unit1",
      name: "Unit 1",
      coefficient: 6,
      moyenne: null,
      isOpen: true,
      modules: [
        {
          id: "mod1",
          name: "Biotechnologie Pharmaceutique",
          coefficient: 3,
          hasTD: true,
          hasTP: true,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
        {
          id: "mod2",
          name: "Production des Enzymes",
          coefficient: 3,
          hasTD: true,
          hasTP: true,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
      ],
    },
    {
      id: "unit2",
      name: "Unit 2",
      coefficient: 3,
      moyenne: null,
      isOpen: true,
      modules: [
        {
          id: "mod3",
          name: "Physiologie Bactérienne",
          coefficient: 3,
          hasTD: true,
          hasTP: true,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
      ],
    },
    {
      id: "unit3",
      name: "Unit 3",
      coefficient: 5,
      moyenne: null,
      isOpen: true,
      modules: [
        {
          id: "mod4",
          name: "Clonage",
          coefficient: 3,
          hasTD: true,
          hasTP: true,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
        {
          id: "mod5",
          name: "Transposons",
          coefficient: 2,
          hasTD: true,
          hasTP: false,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
      ],
    },
    {
      id: "unit4",
      name: "Unit 4",
      coefficient: 2,
      moyenne: null,
      isOpen: true,
      modules: [
        {
          id: "mod6",
          name: "Sequencage ADN",
          coefficient: 2,
          hasTD: true,
          hasTP: false,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
      ],
    },
    {
      id: "unit5",
      name: "Unit 5",
      coefficient: 1,
      moyenne: null,
      isOpen: true,
      modules: [
        {
          id: "mod7",
          name: "Legislation",
          coefficient: 1,
          hasTD: true,
          hasTP: false,
          grades: { emd: null, td: null, tp: null },
          moyenne: null,
        },
      ],
    },
  ])

  const [semesterAverage, setSemesterAverage] = useState<number | null>(null)

  const addUnit = () => {
    const newId = `unit${Date.now()}`
    setUnits([
      ...units,
      {
        id: newId,
        name: `Unit ${units.length + 1}`,
        coefficient: 1,
        moyenne: null,
        isOpen: true,
        modules: [],
      },
    ])
  }

  const removeUnit = (unitId: string) => {
    setUnits(units.filter((u) => u.id !== unitId))
  }

  const toggleUnitCollapse = (unitId: string) => {
    setUnits(
      units.map((u) => {
        if (u.id === unitId) {
          return { ...u, isOpen: !u.isOpen }
        }
        return u
      }),
    )
  }

  const updateUnit = (unitId: string, field: keyof Unit, value: string | number) => {
    setUnits(
      units.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            [field]: field === "coefficient" ? Number(value) : value,
          }
        }
        return u
      }),
    )
  }

  const addModule = (unitId: string) => {
    setUnits(
      units.map((u) => {
        if (u.id === unitId) {
          const newId = `mod${Date.now()}`
          return {
            ...u,
            modules: [
              ...u.modules,
              {
                id: newId,
                name: `Module ${u.modules.length + 1}`,
                coefficient: 1,
                hasTD: false,
                hasTP: false,
                grades: { emd: null, td: null, tp: null },
                moyenne: null,
              },
            ],
          }
        }
        return u
      }),
    )
  }

  const removeModule = (unitId: string, moduleId: string) => {
    setUnits(
      units.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            modules: u.modules.filter((m) => m.id !== moduleId),
          }
        }
        return u
      }),
    )
  }

  const updateModule = (
    unitId: string,
    moduleId: string,
    field: keyof Module | "grades.emd" | "grades.td" | "grades.tp",
    value: string | number | boolean,
  ) => {
    const updatedUnits = units.map((u) => {
      if (u.id === unitId) {
        return {
          ...u,
          modules: u.modules.map((m) => {
            if (m.id === moduleId) {
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
        }
      }
      return u
    })

    setUnits(updatedUnits)

    // Auto-save when grade data is entered
    if (field.startsWith("grades.") && value !== "") {
      setTimeout(() => {
        try {
          const data = {
            semesterName,
            units: updatedUnits,
            semesterAverage,
            lastModified: new Date().toISOString(),
          }
          localStorage.setItem("semesterData", JSON.stringify(data))
        } catch (error) {
          console.error("Auto-save failed:", error)
        }
      }, 500)
    }
  }

  const calculateGrades = () => {
    // First calculate module averages
    const unitsWithModuleAverages = units.map((unit) => {
      const updatedModules = unit.modules.map((module) => {
        const moyenne = calculateModuleMoyenne(module, module.grades.emd, module.grades.td, module.grades.tp)
        return { ...module, moyenne }
      })

      return { ...unit, modules: updatedModules }
    })

    // Then calculate unit averages
    const unitsWithAverages = unitsWithModuleAverages.map((unit) => {
      const moyenne = calculateUnitMoyenne(unit)
      return { ...unit, moyenne }
    })

    setUnits(unitsWithAverages)

    // Calculate semester average
    let weightedSum = 0
    let totalCoefficient = 0
    let allUnitsCalculable = true

    for (const unit of unitsWithAverages) {
      if (unit.moyenne === null) {
        allUnitsCalculable = false
        break
      }
      weightedSum += unit.moyenne * unit.coefficient
      totalCoefficient += unit.coefficient
    }

    const semesterMoyenne = allUnitsCalculable && totalCoefficient > 0 ? weightedSum / totalCoefficient : null

    setSemesterAverage(semesterMoyenne)

    if (semesterMoyenne !== null) {
      saveData()
      toast({
        title: "Calculation complete",
        description: `Semester average: ${semesterMoyenne.toFixed(2)}/20`,
      })
    } else {
      toast({
        title: "Calculation incomplete",
        description: "Some units or modules have missing grades",
        variant: "destructive",
      })
    }
  }

  const saveData = () => {
    try {
      const data = {
        semesterName,
        units,
        semesterAverage,
        calculationTimestamp: new Date().toISOString(),
        totalCoefficient,
        totalModules,
        completedModules: units.reduce((sum, u) => sum + u.modules.filter((m) => m.moyenne !== null).length, 0),
        unitAverages: units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          coefficient: unit.coefficient,
          moyenne: unit.moyenne,
          moduleCount: unit.modules.length,
          completedModules: unit.modules.filter((m) => m.moyenne !== null).length,
        })),
        moduleResults: units.flatMap((unit) =>
          unit.modules.map((module) => ({
            unitId: unit.id,
            unitName: unit.name,
            moduleId: module.id,
            moduleName: module.name,
            coefficient: module.coefficient,
            grades: module.grades,
            moyenne: module.moyenne,
            hasTD: module.hasTD,
            hasTP: module.hasTP,
            status: getGradeStatus(module.moyenne),
          })),
        ),
        gradeDistribution: {
          tresBien: units.reduce(
            (sum, u) => sum + u.modules.filter((m) => m.moyenne !== null && m.moyenne >= 16).length,
            0,
          ),
          bien: units.reduce(
            (sum, u) => sum + u.modules.filter((m) => m.moyenne !== null && m.moyenne >= 14 && m.moyenne < 16).length,
            0,
          ),
          assezBien: units.reduce(
            (sum, u) => sum + u.modules.filter((m) => m.moyenne !== null && m.moyenne >= 12 && m.moyenne < 14).length,
            0,
          ),
          passable: units.reduce(
            (sum, u) => sum + u.modules.filter((m) => m.moyenne !== null && m.moyenne >= 10 && m.moyenne < 12).length,
            0,
          ),
          aRattraper: units.reduce(
            (sum, u) => sum + u.modules.filter((m) => m.moyenne !== null && m.moyenne < 10).length,
            0,
          ),
        },
        semesterStatus: semesterAverage !== null ? (semesterAverage >= 10 ? "Admis" : "À rattraper") : null,
      }
      localStorage.setItem("semesterData", JSON.stringify(data))
      localStorage.setItem("lastSemesterUpdate", new Date().toISOString())
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error saving data",
        description: "There was a problem saving your data",
        variant: "destructive",
      })
    }
  }

  const loadData = () => {
    try {
      const savedData = localStorage.getItem("semesterData")
      if (savedData) {
        const data = JSON.parse(savedData)
        setSemesterName(data.semesterName || "Semester 1")
        setUnits(data.units || [])
        setSemesterAverage(data.semesterAverage || null)

        const lastUpdate = data.calculationTimestamp
          ? new Date(data.calculationTimestamp).toLocaleDateString()
          : "Unknown"
        toast({
          title: "Data loaded successfully",
          description: `Semester data from ${lastUpdate} has been restored`,
        })
      } else {
        toast({
          title: "No saved data",
          description: "No previously saved data was found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error loading data",
        description: "There was a problem loading your data",
        variant: "destructive",
      })
    }
  }

  const totalCoefficient = units.reduce((sum, u) => sum + u.coefficient, 0)
  const totalModules = units.reduce((sum, u) => sum + u.modules.length, 0)

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("semesterData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setSemesterName(data.semesterName || "Semester 1")
        setUnits(data.units || [])
        setSemesterAverage(data.semesterAverage || null)

        // Show restoration notification if there's calculated data
        if (data.semesterAverage !== null) {
          const lastUpdate = data.calculationTimestamp
            ? new Date(data.calculationTimestamp).toLocaleDateString()
            : "Unknown"
          setTimeout(() => {
            toast({
              title: "Previous session restored",
              description: `Calculations from ${lastUpdate} have been loaded`,
            })
          }, 1000)
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      }
    }
  }, [])

  const clearAllData = () => {
    try {
      localStorage.removeItem("semesterData")
      localStorage.removeItem("lastSemesterUpdate")
      setSemesterName("Semester 1")
      setUnits([
        // Reset to initial state with the predefined course structure
        {
          id: "unit1",
          name: "Unit 1",
          coefficient: 6,
          moyenne: null,
          isOpen: true,
          modules: [
            {
              id: "mod1",
              name: "Biotechnologie Pharmaceutique",
              coefficient: 3,
              hasTD: true,
              hasTP: true,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
            {
              id: "mod2",
              name: "Production des Enzymes",
              coefficient: 3,
              hasTD: true,
              hasTP: true,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
          ],
        },
        {
          id: "unit2",
          name: "Unit 2",
          coefficient: 3,
          moyenne: null,
          isOpen: true,
          modules: [
            {
              id: "mod3",
              name: "Physiologie Bactérienne",
              coefficient: 3,
              hasTD: true,
              hasTP: true,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
          ],
        },
        {
          id: "unit3",
          name: "Unit 3",
          coefficient: 5,
          moyenne: null,
          isOpen: true,
          modules: [
            {
              id: "mod4",
              name: "Clonage",
              coefficient: 3,
              hasTD: true,
              hasTP: true,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
            {
              id: "mod5",
              name: "Transposons",
              coefficient: 2,
              hasTD: true,
              hasTP: false,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
          ],
        },
        {
          id: "unit4",
          name: "Unit 4",
          coefficient: 2,
          moyenne: null,
          isOpen: true,
          modules: [
            {
              id: "mod6",
              name: "Sequencage ADN",
              coefficient: 2,
              hasTD: true,
              hasTP: false,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
          ],
        },
        {
          id: "unit5",
          name: "Unit 5",
          coefficient: 1,
          moyenne: null,
          isOpen: true,
          modules: [
            {
              id: "mod7",
              name: "Legislation",
              coefficient: 1,
              hasTD: true,
              hasTP: false,
              grades: { emd: null, td: null, tp: null },
              moyenne: null,
            },
          ],
        },
      ])
      setSemesterAverage(null)
      toast({
        title: "Data cleared",
        description: "All semester data has been reset",
      })
    } catch (error) {
      toast({
        title: "Error clearing data",
        description: "There was a problem clearing your data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-white">Semester Information</CardTitle>
          <CardDescription className="text-white/80">Enter the details for this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="semester-name" className="text-white font-medium">
                Semester Name
              </Label>
              <Input
                id="semester-name"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                placeholder="e.g. Fall 2025"
                className="bg-white/80 text-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Total Units</Label>
                <p className="text-2xl font-bold text-white">{units.length}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-white font-medium">Total Modules</Label>
                <p className="text-2xl font-bold text-white">{totalModules}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <Label className="text-white font-medium">Total Coefficient</Label>
                <p className="text-2xl font-bold text-white">{totalCoefficient}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-white">Units</CardTitle>
            <CardDescription className="text-white/80">Manage your academic units</CardDescription>
          </div>
          <Button onClick={addUnit} size="sm" className="gap-1 bg-white text-black hover:bg-white/80">
            <Plus className="h-4 w-4" /> Add Unit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {units.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-white/10 p-3 mb-3">
                <BookOpen className="h-6 w-6 text-white/80" />
              </div>
              <h3 className="text-lg font-medium text-white">No units added</h3>
              <p className="text-sm text-white/70 max-w-sm mt-1">
                Add your first unit to start organizing your semester
              </p>
            </div>
          ) : (
            units.map((unit) => (
              <Collapsible
                key={unit.id}
                open={unit.isOpen}
                onOpenChange={() => toggleUnitCollapse(unit.id)}
                className="border border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <Input
                        value={unit.name}
                        onChange={(e) => updateUnit(unit.id, "name", e.target.value)}
                        placeholder="Unit name"
                        className="bg-white/80 text-black"
                      />
                    </div>
                    <div className="w-20 mr-2">
                      <Input
                        type="number"
                        value={unit.coefficient}
                        onChange={(e) => updateUnit(unit.id, "coefficient", e.target.value)}
                        placeholder="Coef."
                        min="0"
                        step="0.5"
                        className="bg-white/80 text-black"
                      />
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                        {unit.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUnit(unit.id)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {unit.moyenne !== null && (
                    <div className="mt-2 p-2 bg-gray-700 rounded-md flex items-center justify-between">
                      <p className="text-sm font-medium text-white">Unit Average:</p>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getGradeColor(unit.moyenne)}`}>{unit.moyenne.toFixed(2)}/20</span>
                        {getGradeStatus(unit.moyenne) && (
                          <Badge variant="outline" className="border-white/50 text-white">
                            {getGradeStatus(unit.moyenne)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <CollapsibleContent className="bg-gray-900">
                  <div className="p-3 space-y-3">
                    {unit.modules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <p className="text-sm text-white/70">No modules added to this unit yet</p>
                      </div>
                    ) : (
                      unit.modules.map((module) => (
                        <Card key={module.id} className="bg-gray-800 border-gray-700">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Input
                                  value={module.name}
                                  onChange={(e) => updateModule(unit.id, module.id, "name", e.target.value)}
                                  placeholder="Module name"
                                  className="bg-white/80 text-black"
                                />
                              </div>
                              <div className="w-20 ml-2">
                                <Input
                                  type="number"
                                  value={module.coefficient}
                                  onChange={(e) => updateModule(unit.id, module.id, "coefficient", e.target.value)}
                                  placeholder="Coef."
                                  min="0"
                                  step="0.5"
                                  className="bg-white/80 text-black"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeModule(unit.id, module.id)}
                                className="h-8 w-8 ml-1 text-white hover:bg-white/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-3 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`td-${module.id}`}
                                  checked={module.hasTD}
                                  onCheckedChange={(checked) => updateModule(unit.id, module.id, "hasTD", checked)}
                                />
                                <Label htmlFor={`td-${module.id}`} className="text-white font-medium">
                                  Has TD
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`tp-${module.id}`}
                                  checked={module.hasTP}
                                  onCheckedChange={(checked) => updateModule(unit.id, module.id, "hasTP", checked)}
                                />
                                <Label htmlFor={`tp-${module.id}`} className="text-white font-medium">
                                  Has TP
                                </Label>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="block text-xs font-medium mb-1 text-white">EMD</Label>
                                <Input
                                  type="number"
                                  value={module.grades.emd === null ? "" : module.grades.emd}
                                  onChange={(e) => updateModule(unit.id, module.id, "grades.emd", e.target.value)}
                                  placeholder="0-20"
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  className="bg-white/80 text-black"
                                />
                              </div>
                              <div>
                                <Label className="block text-xs font-medium mb-1 text-white">TD</Label>
                                <Input
                                  type="number"
                                  value={module.grades.td === null ? "" : module.grades.td}
                                  onChange={(e) => updateModule(unit.id, module.id, "grades.td", e.target.value)}
                                  placeholder="0-20"
                                  disabled={!module.hasTD}
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  className="bg-white/80 text-black"
                                />
                              </div>
                              <div>
                                <Label className="block text-xs font-medium mb-1 text-white">TP</Label>
                                <Input
                                  type="number"
                                  value={module.grades.tp === null ? "" : module.grades.tp}
                                  onChange={(e) => updateModule(unit.id, module.id, "grades.tp", e.target.value)}
                                  placeholder="0-20"
                                  disabled={!module.hasTP}
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  className="bg-white/80 text-black"
                                />
                              </div>
                            </div>

                            {module.moyenne !== null && (
                              <div className="mt-2 p-2 bg-gray-700 rounded-md text-center">
                                <p className="text-sm font-medium text-white">
                                  Module Average:{" "}
                                  <span className={`font-bold ${getGradeColor(module.moyenne)}`}>
                                    {module.moyenne.toFixed(2)}/20
                                  </span>
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}

                    <Button
                      variant="outline"
                      onClick={() => addModule(unit.id)}
                      className="w-full flex items-center justify-center gap-1 text-white border-white/50 hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" /> Add Module
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-800 p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="text-white border-white/50 hover:bg-white/20"
            >
              Load Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              className="text-white border-white/50 hover:bg-white/20"
            >
              Clear All
            </Button>
          </div>
          <div className="text-sm text-white/70">Total coefficient: {totalCoefficient}</div>
          <Button onClick={calculateGrades} className="gap-1 bg-white text-black hover:bg-white/80">
            <Calculator className="h-4 w-4" /> Calculate
          </Button>
        </CardFooter>
      </Card>

      {semesterAverage !== null && (
        <Card className="bg-black">
          <CardHeader>
            <CardTitle className="text-white">Semester Results</CardTitle>
            <CardDescription className="text-white/80">Overall performance for {semesterName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-5xl font-bold ${getGradeColor(semesterAverage)}`}>
                {semesterAverage.toFixed(2)}
                <span className="text-xl">/20</span>
              </div>
              <Badge className="mt-2" variant="secondary">
                {getGradeStatus(semesterAverage)}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Unit Performance</h3>
              <div className="space-y-3">
                {units.map((unit) => (
                  <div key={unit.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{unit.name}</span>
                        <Badge variant="outline" className="border-white/50 text-white">
                          Coef. {unit.coefficient}
                        </Badge>
                      </div>
                      <span className={`font-bold ${getGradeColor(unit.moyenne)}`}>
                        {unit.moyenne !== null ? unit.moyenne.toFixed(2) : "N/A"}/20
                      </span>
                    </div>
                    <Progress
                      value={unit.moyenne !== null ? (unit.moyenne / 20) * 100 : 0}
                      className={unit.moyenne !== null ? getGradeColor(unit.moyenne).replace("text-", "bg-") : ""}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Module Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Unit</th>
                      <th className="text-left py-2">Module</th>
                      <th className="text-center py-2">Coef.</th>
                      <th className="text-center py-2">Grade</th>
                      <th className="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.flatMap((unit) =>
                      unit.modules.map((module) => (
                        <tr key={module.id} className="border-b border-gray-800">
                          <td className="py-2">{unit.name}</td>
                          <td className="py-2">{module.name}</td>
                          <td className="text-center py-2">{module.coefficient}</td>
                          <td className={`text-center py-2 ${getGradeColor(module.moyenne)}`}>
                            {module.moyenne !== null ? module.moyenne.toFixed(2) : "-"}
                          </td>
                          <td className="text-center py-2">
                            {module.moyenne !== null ? (
                              <Badge
                                variant="outline"
                                className={`border-${getGradeColor(module.moyenne).replace("text-", "")} text-white`}
                              >
                                {getGradeStatus(module.moyenne)}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
