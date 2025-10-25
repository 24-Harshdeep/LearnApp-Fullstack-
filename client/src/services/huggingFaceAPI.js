import axios from 'axios'

const LOCAL_HF_API_URL = 'http://localhost:3001/generate'

export const huggingFaceAPI = {
  generateTheory: async (prompt) => {
    try {
      const response = await axios.post(
        LOCAL_HF_API_URL,
        { prompt },
        { headers: { 'Content-Type': 'application/json' } }
      )
      // The response from the local server is an array with generated_text
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        return response.data[0].generated_text
      }
      // Some models return { generated_text: ... }
      if (response.data.generated_text) {
        return response.data.generated_text
      }
      return ''
    } catch (error) {
      console.error('Local Hugging Face API error:', error)
      return ''
    }
  }
}
