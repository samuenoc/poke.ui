"use client"

import { useState, useEffect } from "react"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

import PokemonTypeSelector from "@/components/pokemon-type-selector"
import ReportsTable from "@/components/reports-table"
import { getPokemonTypes } from "@/services/pokemon-service"
import { getReports, createReport, deleteReport } from "@/services/report-service"

export default function PokemonReportsPage() {
  const [pokemonTypes, setPokemonTypes] = useState([]) // Inicializar como array vacío
  const [reports, setReports] = useState([]) // Inicializar como array vacío
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [creatingReport, setCreatingReport] = useState(false)
  const [error, setError] = useState(null)
  const [selectedType, setSelectedType] = useState("")
  const [sampleSize, setSampleSize] = useState("")
  const [sampleSizeError, setSampleSizeError] = useState("")

  // Cargar los tipos de Pokémon
  useEffect(() => {
    const loadPokemonTypes = async () => {
      try {
        setLoadingTypes(true)
        setError(null)
        const types = await getPokemonTypes()
        
        // Validar que types sea un array válido
        if (Array.isArray(types)) {
          setPokemonTypes(types)
        } else {
          console.warn("getPokemonTypes no devolvió un array:", types)
          setPokemonTypes([])
        }
        
        setLoadingTypes(false)
      } catch (error) {
        console.error("Error loading Pokemon types:", error)
        setError("Error al cargar los tipos de Pokémon. Por favor, intenta de nuevo más tarde.")
        setPokemonTypes([]) // Asegurar que sea un array vacío en caso de error
        setLoadingTypes(false)
      }
    }

    loadPokemonTypes()
  }, [])

  // Función para cargar los reportes
  const loadReports = async () => {
    try {
      setLoadingReports(true)
      setError(null)
      const reportData = await getReports()
      setReports(reportData)
      setLoadingReports(false)
      return reportData
    } catch (error) {
      console.error("Error loading reports:", error)
      setError("Error al cargar los reportes. Por favor, intenta de nuevo más tarde.")
      setLoadingReports(false)
      throw error
    }
  }

  // Función para refrescar la tabla
  const handleRefreshTable = async () => {
    try {
      await loadReports()
      return true
    } catch (error) {
      throw error
    }
  }

  // Función para validar el sample size
  const validateSampleSize = (value) => {
    // Si está vacío, es válido (opcional)
    if (!value || value.trim() === "") {
      setSampleSizeError("")
      return true
    }

    // Verificar que sea un número
    const num = Number(value)
    
    if (isNaN(num)) {
      setSampleSizeError("Debe ser un número válido")
      return false
    }

    // Verificar que sea un entero
    if (!Number.isInteger(num)) {
      setSampleSizeError("Debe ser un número entero")
      return false
    }

    // Verificar que sea positivo y mayor que 0
    if (num <= 0) {
      setSampleSizeError("Debe ser un número mayor que 0")
      return false
    }

    // Verificar que no sea demasiado grande (opcional, puedes ajustar este límite)
    if (num > 10000) {
      setSampleSizeError("El número máximo permitido es 10,000")
      return false
    }

    setSampleSizeError("")
    return true
  }

  // Manejar cambios en el sample size
  const handleSampleSizeChange = (e) => {
    const value = e.target.value
    setSampleSize(value)
    validateSampleSize(value)
  }
  
  useEffect(() => {
    loadReports()
  }, [])

  // Función para capturar todos los Pokémon del tipo seleccionado
  const catchThemAll = async () => {
    if (!selectedType) return

    // Validar sample size antes de proceder
    if (!validateSampleSize(sampleSize)) {
      toast.error("Por favor, corrige el número máximo de registros antes de continuar.")
      return
    }

    try {
      setCreatingReport(true)

      // Preparar el sample size (convertir a número si no está vacío)
      const parsedSampleSize = sampleSize && sampleSize.trim() !== "" 
        ? parseInt(sampleSize, 10) 
        : null

      // Crear un nuevo reporte usando la API
      await createReport(selectedType, parsedSampleSize)

      // Mostrar notificación de éxito
      const message = parsedSampleSize 
        ? `Se ha generado un nuevo reporte para el tipo ${selectedType} con máximo ${parsedSampleSize} registros.`
        : `Se ha generado un nuevo reporte para el tipo ${selectedType}.`
      
      toast.success(message)

      // Refrescar la tabla para mostrar el nuevo reporte
      await loadReports()

      setCreatingReport(false)
    } catch (error) {
      console.error("Error creating report:", error)

      // Mostrar notificación de error
      toast.error("No se pudo crear el reporte. Por favor, intenta de nuevo.")

      setCreatingReport(false)
    }
  }

  // Función para descargar el CSV
  const handleDownloadCSV = (url) => {
    window.open(url, "_blank")
  }

  // Función para eliminar un reporte
  const handleDeleteReport = async (reportId) => {
    try {
      await deleteReport(reportId)
      // La actualización de la UI se maneja en el componente ReportsTable
      return true
    } catch (error) {
      console.error("Error deleting report:", error)
      throw error
    }
  }

  const isLoading = loadingTypes || loadingReports

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">
            Pokémon Reports Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 items-center">
            <div className="lg:col-span-3">
              <PokemonTypeSelector
                pokemonTypes={pokemonTypes}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                loading={loadingTypes}
                sampleSize={sampleSize}
                onSampleSizeChange={handleSampleSizeChange}
                sampleSizeError={sampleSizeError}
              />
            </div>
            <div>
              <Button
                onClick={catchThemAll}
                disabled={!selectedType || isLoading || creatingReport || sampleSizeError}
                className="w-full h-10 sm:h-11 font-bold text-sm sm:text-base lg:mt-0"
                size="default"
              >
                {creatingReport ? "Creating..." : isLoading ? "Loading..." : "Catch them all!"}
              </Button>
            </div>
          </div>


          <div className="w-full overflow-hidden">
            <ReportsTable
              reports={reports}
              loading={loadingReports}
              onRefresh={handleRefreshTable}
              onDownload={handleDownloadCSV}
              onDelete={handleDeleteReport}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}