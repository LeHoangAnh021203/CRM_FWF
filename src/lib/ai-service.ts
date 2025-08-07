// AI Service - Automatic Configuration
export interface AIServiceConfig {
  service: 'stability' | 'replicate' | 'openai' | 'demo';
  apiKey: string;
  endpoint: string;
  isConfigured: boolean;
}

class AIService {
  private config: AIServiceConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AIServiceConfig {
    // Load from environment variables automatically
    const stabilityKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
    const replicateKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // Priority: Stability AI > Replicate > OpenAI > Demo
    if (stabilityKey) {
      return {
        service: 'stability',
        apiKey: stabilityKey,
        endpoint: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
        isConfigured: true
      };
    } else if (replicateKey) {
      return {
        service: 'replicate',
        apiKey: replicateKey,
        endpoint: 'https://api.replicate.com/v1/predictions',
        isConfigured: true
      };
    } else if (openaiKey) {
      return {
        service: 'openai',
        apiKey: openaiKey,
        endpoint: 'https://api.openai.com/v1/images/generations',
        isConfigured: true
      };
    }

    // Fallback to demo mode
    return {
      service: 'demo',
      apiKey: '',
      endpoint: '',
      isConfigured: false
    };
  }

  public async generateFoxPerson(imageBlob: Blob, prompt: string, strength: number): Promise<string> {
    try {
      if (!this.config.isConfigured) {
        throw new Error('No AI service configured');
      }

      console.log(`Using ${this.config.service} service`);

      switch (this.config.service) {
        case 'stability':
          return await this.generateWithStability(imageBlob, prompt, strength);
        case 'replicate':
          return await this.generateWithReplicate(imageBlob, prompt, strength);
        case 'openai':
          return await this.generateWithOpenAI(imageBlob, prompt, strength);
        default:
          throw new Error('Unsupported service');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }

  private async generateWithStability(imageBlob: Blob, prompt: string, strength: number): Promise<string> {
    const formData = new FormData();
    formData.append('init_image', imageBlob, 'input.jpg');
    
    // Include strength in the prompt text
    const strengthText = strength >= 0.8 ? "high transformation" : strength >= 0.5 ? "medium transformation" : "subtle transformation";
    const enhancedPrompt = `Transform this person into a beautiful fox person with ${strengthText}: ${prompt}, anthropomorphic fox, detailed orange fur, pointy fox ears, bushy fox tail, human-like body, high quality, detailed, professional photography`;
    formData.append('text_prompts[0][text]', enhancedPrompt);
    formData.append('text_prompts[0][weight]', '1');
    formData.append('text_prompts[1][text]', 'low quality, blurry, distorted, bad anatomy, deformed, ugly, bad proportions');
    formData.append('text_prompts[1][weight]', '-1');
    formData.append('cfg_scale', '7.5');
    formData.append('steps', '30');
    formData.append('samples', '1');
    formData.append('style_preset', 'photographic');

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability AI failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result.artifacts && result.artifacts.length > 0) {
      return `data:image/png;base64,${result.artifacts[0].base64}`;
    } else {
      throw new Error('No image generated');
    }
  }

  private async generateWithReplicate(imageBlob: Blob, prompt: string, strength: number): Promise<string> {
    // Convert blob to base64
    const base64 = await this.blobToBase64(imageBlob);
    
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          image: base64,
          prompt: `fox person: ${prompt}`,
          strength: strength
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate failed: ${response.status}`);
    }

    const result = await response.json();
    return result.output[0]; // Replicate returns image URLs
  }

  private async generateWithOpenAI(imageBlob: Blob, prompt: string, strength: number): Promise<string> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Transform this person into a fox person with strength ${strength}: ${prompt}`,
        n: 1,
        size: "1024x1024"
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data[0].url; // OpenAI returns image URLs
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public isConfigured(): boolean {
    return this.config.isConfigured;
  }

  public getServiceName(): string {
    return this.config.service;
  }
}

// Export singleton instance
export const aiService = new AIService();
