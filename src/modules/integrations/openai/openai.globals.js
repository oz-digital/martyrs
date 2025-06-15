// openai.globals.js
import OpenAI from 'openai';

/**
 * Global OpenAI client singleton
 */
class OpenAIGlobal {
  constructor() {
    if (OpenAIGlobal.instance) {
      return OpenAIGlobal.instance;
    }

    this.client = new OpenAI({
      organization: process.env.OPENAI_ORG_KEY,
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Default models
    this.models = {
      chat: 'gpt-3.5-turbo',
      vision: 'gpt-4-vision-preview',
      embedding: 'text-embedding-ada-002'
    };
    
    OpenAIGlobal.instance = this;
  }

  /**
   * Generate completions with retry logic for handling JSON parsing errors
   * @param {string} prompt - The prompt text
   * @param {Object} options - Additional options
   * @returns {Promise<Object|string>} - Parsed JSON response or raw content
   */
  async createChatCompletion(prompt, options = {}) {
    const {
      model = this.models.chat,
      maxRetries = 3,
      temperature = 0.7,
      parseJSON = true,
      systemPrompt = '',
    } = options;

    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const messages = [];
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: prompt });
        
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          response_format: parseJSON ? { type: 'json_object' } : undefined
        });

        const content = response.choices[0].message.content;
        
        if (parseJSON) {
          return JSON.parse(content);
        }
        
        return content;
      } catch (err) {
        attempt++;
        
        if (err instanceof SyntaxError && attempt < maxRetries) {
          console.error(`Invalid JSON in OpenAI response (attempt ${attempt}/${maxRetries}): ${err.message}`);
        } else if (attempt >= maxRetries) {
          console.error(`Max retries (${maxRetries}) reached for OpenAI completion: ${err.message}`);
          throw err;
        } else {
          console.error(`OpenAI API error (attempt ${attempt}/${maxRetries}): ${err.message}`);
          
          // If we hit rate limits, add exponential backoff
          if (err.status === 429) {
            const waitTime = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Get direct access to OpenAI client instance
   * @returns {OpenAI} - OpenAI client instance
   */
  getClient() {
    return this.client;
  }
  
  /**
   * Set default model for specific API
   * @param {string} type - API type ('chat', 'vision', 'embedding')
   * @param {string} modelId - Model identifier
   */
  setDefaultModel(type, modelId) {
    if (this.models[type]) {
      this.models[type] = modelId;
    }
  }
}

// Export singleton instance
const openaiGlobal = new OpenAIGlobal();

export default openaiGlobal;