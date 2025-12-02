import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function summarizePaper(
  title: string,
  abstract?: string,
  fullText?: string
): Promise<{
  summary: string
  methodology?: string
  findings?: string
  limitations?: string
}> {
  if (!openai) {
    return {
      summary: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
      methodology: 'N/A',
      findings: 'N/A',
      limitations: 'N/A',
    }
  }

  try {
    const content = fullText || abstract || title

    const prompt = `Analyze this research paper and provide:
1. A concise summary (2-3 sentences)
2. Key methodology used
3. Main findings
4. Limitations

Paper: ${title}
${abstract ? `\nAbstract: ${abstract}` : ''}
${fullText ? `\nFull text: ${fullText.substring(0, 4000)}` : ''}

Format your response as JSON with keys: summary, methodology, findings, limitations`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant that analyzes academic papers. Provide clear, concise analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const result = response.choices[0]?.message?.content

    if (!result) {
      throw new Error('No response from OpenAI')
    }

    try {
      return JSON.parse(result)
    } catch {
      // If JSON parsing fails, return a basic structure
      return {
        summary: result,
        methodology: 'Unable to extract',
        findings: 'Unable to extract',
        limitations: 'Unable to extract',
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return {
      summary: 'Unable to generate summary. Please check your OpenAI API key.',
      methodology: 'N/A',
      findings: 'N/A',
      limitations: 'N/A',
    }
  }
}

export async function generateWritingAssistance(
  context: string,
  instruction: string
): Promise<string> {
  if (!openai) {
    return 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an academic writing assistant. Help users write clear, professional academic content.',
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nInstruction: ${instruction}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || 'Unable to generate text'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Unable to generate text. Please check your OpenAI API key.'
  }
}
