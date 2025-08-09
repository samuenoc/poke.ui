"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PokemonTypeSelector({ 
  pokemonTypes, 
  selectedType, 
  onTypeChange, 
  loading,
  sampleSize,
  onSampleSizeChange,
  sampleSizeError 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pokemon-type-select">Tipo de Pokémon</Label>
          <Select 
            value={selectedType} 
            onValueChange={onTypeChange}
            disabled={loading}
          >
            <SelectTrigger id="pokemon-type-select" className="w-full">
              <SelectValue placeholder="Selecciona un tipo de Pokémon" />
            </SelectTrigger>
            <SelectContent>
              {pokemonTypes.map((type) => (
                <SelectItem key={type.name} value={type.name}>
                  <span className="capitalize">{type.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sample-size-input">
            Número Máximo de Registros
            <span className="text-sm text-gray-500 ml-1 font-normal">(opcional)</span>
          </Label>
          <Input
            id="sample-size-input"
            type="number"
            min="1"
            step="1"
            placeholder="Ej: 10, 50, 100...(Deja vacío para obtener todos los registros disponibles)"
            value={sampleSize}
            onChange={onSampleSizeChange}
            disabled={loading}
            className={sampleSizeError ? "border-red-500 focus:border-red-500" : ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        {sampleSizeError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{sampleSizeError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}