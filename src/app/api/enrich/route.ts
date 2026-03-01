"use server"
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import dbConnect from "@/lib/db";
import CompanyEnrichment from "@/models/CompanyEnrichment";
import { ACTIVE_MODEL, API_KEY } from "@/lib/server-const";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const INVESTMENT_THESIS = `
We are an early-stage VC fund focused on:
1. B2B SaaS, AI/ML, Fintech, HealthTech companies in India and Southeast Asia
2. Seed to Series A stage companies with clear product-market fit signals
3. Founders solving genuine pain points in large, underserved markets (1B+ population addressable)
4. Businesses with strong unit economics potential: high gross margins (>60%), low CAC, high LTV
5. Technology-first solutions with defensible moats (data, network effects, regulatory advantages)
6. Companies addressing financial inclusion, healthcare access, climate transition, or the creator economy
7. Strong founding teams with domain expertise and execution capabilities
`;

export async function POST(req: NextRequest) {
  try {
    const { companyId, domain, companyName, description } = await req.json();

    if (!domain || !companyId) {
      return NextResponse.json({ error: "companyId and domain are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    // Step 1: Fetch website content via Jina Reader
    let websiteContent = "";
    try {
      const jinaUrl = `https://r.jina.ai/${domain.startsWith("http") ? domain : `https://${domain}`}`;
      const jinaRes = await fetch(jinaUrl, {
        headers: { Accept: "text/plain" },
        signal: AbortSignal.timeout(10000),
      });
      if (jinaRes.ok) {
        const text = await jinaRes.text();
        websiteContent = text.slice(0, 6000); // limit context
      }
    } catch {
      // Jina fetch failed, proceed with description only
      websiteContent = description ?? "";
    }

    // Step 2: LLM enrichment
    const prompt = `You are an expert VC analyst. Analyze this company and provide structured enrichment data.

Company: ${companyName ?? "Unknown"}
Domain: ${domain}
Description: ${description ?? "N/A"}
Website Content:
${websiteContent || "(website content unavailable)"}

Investment Thesis:
${INVESTMENT_THESIS}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with exactly these fields:
{
  "summary": "2-3 sentence sharp investor summary of what the company does and why it matters",
  "keywords": ["array", "of", "5-8", "descriptive", "keywords"],
  "signals": ["array of 3-5 positive investor signals like traction metrics, moats, team backgrounds"],
  "thesisScore": <integer 0-100 scoring fit with the investment thesis>,
  "thesisJustification": "2-3 sentence explanation of the thesis score — what aligns and what concerns remain"
}`;

    const response = await ai.models.generateContent({
      model: ACTIVE_MODEL,
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} },
        ]
      }
    });

    const rawText = response.text ?? "";

    // Parse the JSON response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: rawText },
        { status: 500 }
      );
    }

    // Step 3: Save to DB
    await dbConnect();
    const enrichmentData = {
      companyId,
      summary: parsed.summary ?? "",
      keywords: parsed.keywords ?? [],
      signals: parsed.signals ?? [],
      thesisScore: typeof parsed.thesisScore === "number" ? parsed.thesisScore : 0,
      thesisJustification: parsed.thesisJustification ?? "",
      enrichedAt: new Date(),
    };

    await CompanyEnrichment.create(enrichmentData);

    return NextResponse.json(enrichmentData);
  } catch (err) {
    if (err?.status === "RESOURCE_EXHAUSTED") {
      return NextResponse.json({ error: "Resource exhausted" }, { status: 429 });
    }
    console.error("Enrich API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
