import OpenAI from 'openai'

// Configuration constants
const MAX_FULL_TEXT_LENGTH = 4000
const AI_MODEL = 'gpt-3.5-turbo'
const SUMMARY_MAX_TOKENS = 1000
const WRITING_MAX_TOKENS = 500

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
    const truncatedText = fullText ? fullText.substring(0, MAX_FULL_TEXT_LENGTH) : content

    const prompt = `Analyze this research paper and provide:
1. A concise summary (2-3 sentences)
2. Key methodology used
3. Main findings
4. Limitations

Paper: ${title}
${abstract ? `\nAbstract: ${abstract}` : ''}
${fullText ? `\nFull text: ${truncatedText}` : ''}

Format your response as JSON with keys: summary, methodology, findings, limitations`

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
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
      max_tokens: SUMMARY_MAX_TOKENS,
    })

    const result = response.choices[0]?.message?.content

    if (!result) {
      throw new Error('No response from OpenAI')
    }

    try {
      return JSON.parse(result)
    } catch (parseError) {
      // Log parsing error for debugging
      console.error('Failed to parse OpenAI response as JSON:', parseError)
      console.error('Raw response:', result)
      
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
      model: AI_MODEL,
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
      max_tokens: WRITING_MAX_TOKENS,
    })

    return response.choices[0]?.message?.content || 'Unable to generate text'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Unable to generate text. Please check your OpenAI API key.'
  }
}
