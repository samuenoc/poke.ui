import settings from "@/lib/settings";

export async function getReports() {
    try {
      const response = await fetch(`${settings.URL}/api/request`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response (GET):", data) // Para depurar la estructura de datos

      return Array.isArray(data) ? data : data.results || data.data || []
    } catch (error) {
      console.error("Error fetching reports:", error)
      throw error
    }
  }

  export async function createReport(pokemonType, sampleSize = null) {
    try {
      // Preparar el body del request
      const requestBody = {
        pokemon_type: pokemonType,
      }

      // Solo incluir sample_size si se proporciona y es válido
      if (sampleSize !== null && sampleSize !== undefined && sampleSize > 0) {
        requestBody.sample_size = parseInt(sampleSize, 10)
      }

      const response = await fetch(`${settings.URL}/api/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response (POST):", data) // Para depurar la respuesta

      return data
    } catch (error) {
      console.error("Error creating report:", error)
      throw error
    }
  }

  export async function deleteReport(reportId) {
    try {
      const response = await fetch(`${settings.URL}/api/request/${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      // Verificar si la respuesta tiene contenido JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        console.log("API Response (DELETE):", data) // Para depurar la respuesta
        return data
      }

      // Si no hay contenido JSON, retornar un objeto indicando éxito
      return { success: true, message: "Report deleted successfully" }
    } catch (error) {
      console.error("Error deleting report:", error)
      throw error
    }
  }