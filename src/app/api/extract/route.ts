import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { input } = await req.json();

        if (!input) {
            return NextResponse.json({ error: "input is required" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        let contentToAnalyze = input;

        // If input is a URL, scrape it first
        if (input.startsWith("http://") || input.startsWith("https://") || input.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/)) {
            try {
                const urlToScrape = input.startsWith("http") ? input : `https://${input}`;
                const jinaUrl = `https://r.jina.ai/${urlToScrape}`;
                const jinaRes = await fetch(jinaUrl, {
                    headers: { Accept: "text/plain" },
                    signal: AbortSignal.timeout(10000),
                });
                if (jinaRes.ok) {
                    const text = await jinaRes.text();
                    contentToAnalyze = `Source URL: ${urlToScrape}\n\n${text.slice(0, 15000)}`;
                }
            } catch (err) {
                console.error("Jina scrape failed, using raw input as text", err);
            }
        }

        const prompt = `You are an expert VC analyst. Extract company details from the provided text into a structured JSON response. 
    Map the industry to one of: "B2B SaaS", "Fintech", "AI/ML", "HealthTech", "EdTech", "CleanTech", "Consumer", "DeepTech", "Marketplace".
    Map the stage to one of: "Pre-Seed", "Seed", "Series A", "Series B+".
    Make reasonable inferences for missing fields (e.g. employeeCount defaults to 1, foundedYear defaults to current year).

    Text to analyze:
    ${contentToAnalyze}`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        domain: { type: Type.STRING },
                        industry: { type: Type.STRING },
                        stage: { type: Type.STRING },
                        location: { type: Type.STRING },
                        foundedYear: { type: Type.INTEGER },
                        employeeCount: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                        founders: { type: Type.ARRAY, items: { type: Type.STRING } },
                        lastFundingAmount: { type: Type.STRING },
                        traction: { type: Type.STRING },
                        signalTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                },
            }
        });

        const parsed = JSON.parse(response.text ?? "{}");
        return NextResponse.json(parsed);

    } catch (err) {
        console.error("Extract API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
