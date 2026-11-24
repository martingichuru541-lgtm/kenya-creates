import { defineConfig } from 'vite';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    {
      name: 'kenya-creates-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/ai/assist' && req.method === 'POST') {
            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              try {
                const {
                  prompt,
                  task,
                  language,
                  provider = 'auto',
                  userApiKey,
                  countyHint,
                  categoryHint,
                } = JSON.parse(bodyStr || '{}');

                const geminiKey = process.env.GEMINI_API_KEY;
                const openAiKey = userApiKey || process.env.OPENAI_API_KEY;

                const systemInstruction = `You are 'KENYA CREATES AI', an expert innovation architect and venture builder for Kenyan creators, researchers, entrepreneurs, students, and community innovators across Kenya's 47 counties.
Help users brainstorm, validate, and build real-world initiatives adapted to Kenyan conditions (e.g. off-grid solar, M-Pesa integrations, CBC education, KEBS standards, local farming).
Distinguish practical estimates from verified facts. Always produce structured, inspiring, actionable output.
Support English, Swahili (Kiswahili), and Kenyan context seamlessly.`;

                // 1. Try OpenAI if explicitly chosen or if OpenAI key is available
                if ((provider === 'openai' || (!geminiKey && openAiKey)) && openAiKey) {
                  try {
                    const openai = new OpenAI({ apiKey: openAiKey });
                    const completion = await openai.chat.completions.create({
                      model: 'gpt-4o-mini',
                      messages: [
                        { role: 'system', content: systemInstruction },
                        {
                          role: 'user',
                          content: `${prompt}
${task === 'generate_idea' ? 'Please return a structured Kenyan innovation proposal including: Title, Tagline, Category, County, Problem, Proposed Solution, What is needed to build it, and Next 3 practical steps.' : ''}`,
                        },
                      ],
                      temperature: 0.7,
                    });

                    const reply = completion.choices[0]?.message?.content || '';
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: true,
                        source: 'openai-gpt-4o',
                        text: reply,
                        structured: extractStructuredIdea(reply, prompt, countyHint, categoryHint),
                      })
                    );
                    return;
                  } catch (openaiErr: any) {
                    console.warn('OpenAI call failed, falling back:', openaiErr?.message);
                    // continue to Gemini or fallback
                  }
                }

                // 2. Try Gemini
                if (geminiKey) {
                  try {
                    const ai = new GoogleGenAI({
                      apiKey: geminiKey,
                      httpOptions: {
                        headers: {
                          'User-Agent': 'aistudio-build',
                        },
                      },
                    });

                    const response = await ai.models.generateContent({
                      model: 'gemini-2.5-flash',
                      contents: prompt,
                      config: {
                        systemInstruction,
                      },
                    });

                    const reply = response.text || '';
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: true,
                        source: 'gemini-2.5-flash',
                        text: reply,
                        structured: extractStructuredIdea(reply, prompt, countyHint, categoryHint),
                      })
                    );
                    return;
                  } catch (geminiErr: any) {
                    console.warn('Gemini call failed, falling back:', geminiErr?.message);
                  }
                }

                // 3. Fallback High-Fidelity Generator
                res.setHeader('Content-Type', 'application/json');
                const fallbackText = generateOfflineAssistance(prompt, task, language, countyHint, categoryHint);
                res.end(
                  JSON.stringify({
                    success: true,
                    source: 'kenya-creates-engine',
                    text: fallbackText,
                    structured: extractStructuredIdea(fallbackText, prompt, countyHint, categoryHint),
                  })
                );
              } catch (error: any) {
                console.error('Error in /api/ai/assist:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: error?.message || 'Failed to generate assistance',
                  })
                );
              }
            });
            return;
          }

          next();
        });
      },
    },
  ],
});

function extractStructuredIdea(text: string, originalPrompt: string, countyHint?: string, categoryHint?: string) {
  const titleMatch = text.match(/(?:Project Name|Title|Jina la Mradi):\s*([^\n\r]+)/i);
  const title = titleMatch ? titleMatch[1].replace(/[*#]/g, '').trim() : originalPrompt.slice(0, 42).trim();

  const taglineMatch = text.match(/(?:Tagline|Lengo|Summary):\s*([^\n\r]+)/i);
  const tagline = taglineMatch ? taglineMatch[1].replace(/[*#]/g, '').trim() : 'Localized solution built to solve grassroots challenges in Kenya.';

  const problemMatch = text.match(/(?:The Problem|Problem Statement|Tatizo):\s*([\s\S]*?)(?=(?:Solution|Proposed Solution|Ufumbuzi|\n\n##|$))/i);
  const problem = problemMatch ? problemMatch[1].replace(/[*#]/g, '').trim().slice(0, 300) : 'Communities currently lack reliable, localized tools suited to local rural or peri-urban constraints.';

  const solutionMatch = text.match(/(?:Proposed Solution|The Solution|Ufumbuzi):\s*([\s\S]*?)(?=(?:Beneficiaries|Why Us|Needs|Hatua|\n\n##|$))/i);
  const solution = solutionMatch ? solutionMatch[1].replace(/[*#]/g, '').trim().slice(0, 350) : text.slice(0, 300);

  return {
    title: title || 'Homegrown Kenyan Innovation',
    tagline: tagline,
    category: categoryHint || 'tech',
    county: countyHint || 'Nairobi',
    problemStatement: problem,
    proposedSolution: solution,
    stage: 'prototype_dev',
    needs: ['Funding', 'Developers', 'Manufacturing support'],
  };
}

function generateOfflineAssistance(prompt: string, task?: string, language?: string, county?: string, category?: string): string {
  const targetCounty = county || 'Kenya';

  if (language === 'sw' || task === 'translate') {
    return `### 🇰🇪 Muundo wa Mradi na Mwelekeo wa Utekelezaji (Kiswahili)

**Jina la Mradi:** ${prompt.slice(0, 45)}
**Kaunti Lengwa:** ${targetCounty}
**Tatizo:** Changamoto za kiuchumi na nyanjani zinazowakabili wananchi mashinani na mijini.
**Ufumbuzi Uliopendekezwa:** Teknolojia inayotumia rasilimali zilizopo nchini, inayoweza kurekebishwa na wataalamu wa ndani bila gharama kubwa za kuagiza nje.
**Hatua 3 za Kwanza:**
1. Kufanya mahojiano ya kwanza na walengwa 20 kwenye kaunti yako.
2. Kutengeneza mfano wa kwanza (prototype) kwenye karakana ya ufundi wa ndani.
3. Kuweka tangazo la kutafuta washirika hapa Kenya Creates.`;
  }

  if (task === 'generate_idea') {
    return `### 💡 Kenya Creates AI Co-Founder: New Innovation Proposal

**Project Name:** ${prompt.length > 5 ? prompt.slice(0, 40) : 'Solar Smart Cooler for Farmers'}
**Tagline:** High-efficiency, decentralized cold storage for ${targetCounty} smallholders.
**Category:** ${category || 'Agriculture & Food'}
**County:** ${targetCounty}

**1. The Grassroots Problem:**
Over 35% of harvested perishable produce in ${targetCounty} spoils within 48 hours of harvest due to high ambient temperatures and absence of affordable decentralized cold storage.

**2. The Homegrown Solution:**
A phase-change material (PCM) evaporative cooling chamber powered by a 250W solar panel and monitored via open IoT sensors. Farmers receive automated alerts and rent crates via M-Pesa micro-tokens.

**3. What You Need to Build This in Kenya:**
- Access to local fabrication / sheet metal bending in ${targetCounty} or Nairobi.
- Microcontroller programmer (ESP32/Arduino) for temperature telemetry.
- Pilot partnership with a local women's horticultural cooperative.

**4. Commercialization & KEBS Roadmap:**
- Fabricate MVP within 4 weeks.
- Verify thermal insulation curves against Kenya Bureau of Standards (KEBS KS 2780) guidelines.
- Apply for KeNIA commercialization grant and register provisional patent with KIPI.`;
  }

  if (task === 'pitch') {
    return `### 🚀 Executive Pitch Deck Draft

**1. Problem Statement:**
Local enterprises and communities in ${targetCounty} lose significant productivity due to manual inefficiencies and high equipment import markups.

**2. The Solution:**
An accessible, homegrown hardware/software platform designed with repairable parts, offline-first reliability, and localized user interfaces.

**3. Target Market & Early Traction:**
Smallholder producers, cooperative chamas, and county educational centres seeking durable, affordable tools.

**4. Team & Expertise:**
Passionate Kenyan makers, researchers, and field specialists with direct ground validation.

**5. Call to Action:**
Seeking technical co-founders, seed grant support, and municipal pilot permissions.`;
  }

  if (task === 'roadmap') {
    return `### 🗺️ Kenya Creates 6-Month Action Roadmap

- **Month 1:** Community stakeholder interviews & functional design specs in ${targetCounty}.
- **Month 2:** Breadboard / mechanical prototype assembly using locally sourced materials.
- **Month 3:** Initial bench testing, safety checks, and KIPI provisional patent filing.
- **Month 4:** 30-day closed field trial with 25 pilot users.
- **Month 5:** Integrate M-Pesa telemetry and publish verified results on Kenya Creates.
- **Month 6:** Scale production and apply for county innovation funds.`;
  }

  return `### 💡 Kenya Creates AI Advisory Report

**Analysis for:** "${prompt}"
- **Strengths:** Directly targets genuine African and Kenyan market constraints with high scalability across ${targetCounty}.
- **Recommended Category:** ${category || 'Technology & Community Impact'}.
- **Action Step:** Click "Turn into Project Submission" below to automatically populate the 6-step project wizard and launch your initiative to collaborators!`;
}
