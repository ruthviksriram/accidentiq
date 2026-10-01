// ==============================================================================
// Supabase Edge Function: analyze-accident
// Project: AccidentIQ
// Purpose: Multimodal accident evidence analysis using Google Gemini Vision API
// Security: Server-side boundary. GEMINI_API_KEY is read exclusively from Supabase secrets.
// ==============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  case_id?: string;
}

interface GeminiObservedEvidence {
  text: string;
  confidence: "high" | "medium" | "low";
}

interface GeminiReconstructionElement {
  label: string;
  description: string;
  position: string;
}

interface GeminiSceneReconstruction {
  available: boolean;
  description: string;
  elements: GeminiReconstructionElement[];
  limitations: string;
}

interface GeminiAnalysisOutput {
  summary: string;
  observed_evidence: GeminiObservedEvidence[];
  reported_information: string[];
  possible_sequence_of_events: string[];
  possible_contributing_factors: string[];
  evidence_limitations: string[];
  possible_scene_reconstruction: GeminiSceneReconstruction;
}

// Convert Uint8Array to base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Call Google Gemini REST API with fallback model options and exponential backoff on HTTP 503
async function callGeminiVision(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  images: Array<{ mimeType: string; base64Data: string }>
): Promise<GeminiAnalysisOutput> {
  let cleanKey = (apiKey || "").trim().replace(/^["']|["']$/g, "").trim();
  if (cleanKey.includes("=")) {
    cleanKey = cleanKey.substring(cleanKey.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "").trim();
  }

  // Model priority:
  // 1. gemini-3.8-flash
  // 2. gemini-3.7-flash
  // 3. gemini-3.6-flash
  // 4. gemini-3.5-flash
  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
  ];
  
  const maxRetriesPerModel = 2; // Up to 2 retries (3 total attempts) on HTTP 503
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 1000ms, 2000ms
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        console.warn(`Model ${model} received 503. Retrying attempt ${attempt}/${maxRetriesPerModel} after ${backoffMs}ms backoff...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        const contentsParts: Array<Record<string, unknown>> = [];

        // Attach image parts
        for (const img of images) {
          contentsParts.push({
            inline_data: {
              mime_type: img.mimeType,
              data: img.base64Data,
            },
          });
        }

        // Attach text prompt part
        contentsParts.push({
          text: userPrompt,
        });

        const payload = {
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: contentsParts,
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
            topP: 0.9,
          },
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 503) {
          const errorText = await response.text();
          console.warn(`Model ${model} returned 503 Service Unavailable (attempt ${attempt + 1}/${maxRetriesPerModel + 1}):`, errorText);
          lastError = new Error(`Gemini ${model} is temporarily unavailable (503): ${errorText.slice(0, 300)}`);
          if (attempt < maxRetriesPerModel) {
            continue; // Retry this model with exponential backoff
          }
          break; // Exhausted 503 retries for this model, fall back to next model
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} returned error status ${response.status}:`, errorText);
          lastError = new Error(`Gemini ${model} call failed (${response.status}): ${errorText.slice(0, 300)}`);
          break; // Move to next fallback model immediately on non-503 status
        }

        const responseJson = await response.json();
        const candidateText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          lastError = new Error(`Gemini ${model} returned empty response content.`);
          break;
        }

        // Clean up markdown fences if model included them
        let cleanedJsonText = candidateText.trim();
        if (cleanedJsonText.startsWith("```json")) {
          cleanedJsonText = cleanedJsonText.slice(7);
        } else if (cleanedJsonText.startsWith("```")) {
          cleanedJsonText = cleanedJsonText.slice(3);
        }
        if (cleanedJsonText.endsWith("```")) {
          cleanedJsonText = cleanedJsonText.slice(0, -3);
        }
        cleanedJsonText = cleanedJsonText.trim();

        const parsed: GeminiAnalysisOutput = JSON.parse(cleanedJsonText);
        console.log(`Successfully generated analysis using model: ${model}`);
        return parsed;
      } catch (err: unknown) {
        console.warn(`Attempt with ${model} (attempt ${attempt + 1}) encountered error:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetriesPerModel) {
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model attempts failed.");
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Authenticate user from Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment variables are missing on the server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client with user token for RLS checks
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for backend operations
    const adminClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : userClient;

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please log in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request body
    const body: RequestBody = await req.json().catch(() => ({}));
    const caseId = body.case_id;

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: "case_id is required for evidence analysis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Query accident_cases to verify existence and assigned officer
    const { data: caseRecord, error: caseErr } = await userClient
      .from("accident_cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseErr || !caseRecord) {
      return new Response(
        JSON.stringify({ error: "Accident case not found or not assigned to your account." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (caseRecord.assigned_officer_id && caseRecord.assigned_officer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied. Only the assigned officer may run case analysis." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Query evidence for this case
    const { data: evidenceRows, error: evErr } = await userClient
      .from("evidence")
      .select("*")
      .eq("case_id", caseId);

    if (evErr) {
      console.error("Error reading evidence rows:", evErr);
      return new Response(
        JSON.stringify({ error: "Unable to retrieve evidence records for this case." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const photoEvidence = (evidenceRows || []).filter((e) => e.evidence_type === "photo");
    const nonPhotoEvidence = (evidenceRows || []).filter((e) => e.evidence_type !== "photo");

    // Guard requirement: "If there is no uploaded image: show: 'Upload at least one accident photo before running AI analysis.'"
    if (photoEvidence.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Upload at least one accident photo before running AI analysis.",
          code: "NO_PHOTOS_UPLOADED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Verify Gemini API Key
    const rawGeminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    let geminiApiKey = rawGeminiApiKey.trim().replace(/^["']|["']$/g, "").trim();
    if (geminiApiKey.includes("=")) {
      geminiApiKey = geminiApiKey.substring(geminiApiKey.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "").trim();
    }

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY is not configured in Supabase secrets.");
      return new Response(
        JSON.stringify({
          error: "Gemini API key is not configured on the server. Please configure the GEMINI_API_KEY secret in Supabase.",
          code: "MISSING_GEMINI_KEY",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Download image files from Supabase Storage (accident-evidence bucket)
    const imagePayloads: Array<{ mimeType: string; base64Data: string }> = [];

    for (const photo of photoEvidence) {
      try {
        const { data: fileBlob, error: downloadError } = await adminClient.storage
          .from("accident-evidence")
          .download(photo.file_path);

        if (downloadError || !fileBlob) {
          console.warn(`Could not download photo file ${photo.file_path}:`, downloadError);
          continue;
        }

        const arrayBuffer = await fileBlob.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));
        const mimeType = photo.mime_type || fileBlob.type || "image/jpeg";

        imagePayloads.push({
          mimeType,
          base64Data: base64,
        });
      } catch (dlErr) {
        console.warn(`Error processing file ${photo.file_name}:`, dlErr);
      }
    }

    if (imagePayloads.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Upload at least one accident photo before running AI analysis.",
          code: "NO_PHOTOS_RETRIEVABLE",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Compose System Instruction with strict AI Safety & Wording rules
    const systemInstruction = `You are an expert AI forensic accident investigation assistant built to support police officers and crash investigators.

CRITICAL AI SAFETY & WORDING RULES:
1. The AI must NOT determine legal fault or make definitive claims about who caused the accident.
2. Never output statements such as:
   - "Driver X caused the accident."
   - "Driver X is legally responsible."
   - Exact vehicle speed unless directly supported by evidence.
   - Exact reaction time unless directly supported by evidence.
3. Categorize findings into the four formal police evidentiary pillars:
   - OBSERVED: directly visible in the supplied evidence
   - REPORTED: information provided by the officer/user/case description
   - INFERRED: AI interpretation based on the available evidence
   - UNKNOWN: cannot be established from the available evidence
4. Use cautious, evidence-grounded wording:
   - "The available evidence appears consistent with..."
   - "Possible contributing factor..."
   - "Possible sequence..."
   - "Insufficient evidence to determine..."
   - "This cannot be established from the supplied evidence."
5. The scene reconstruction must be explicitly labeled:
   "Possible Scene Reconstruction"
6. Include this exact disclaimer in the reconstruction:
   "Evidence-based visualization — not a definitive forensic or legal reconstruction."
7. The reconstruction must be evidence-grounded and should NOT claim definitive positions, speeds, trajectories, or legal fault when the evidence cannot establish them.
8. Do NOT invent measurements, exact vehicle speeds, exact trajectories, or positions that cannot be established from the evidence.
9. For "possible_scene_reconstruction":
   - If the photographic evidence is sufficient to infer the physical arrangement of vehicles, impact zones, or scene objects:
     "available": true,
     "description": "Evidence-grounded description of the physical configuration and kinematic arrangement observed from photos.",
     "elements": [
       {
         "label": "Vehicle A",
         "description": "Sedan with front-end deformation",
         "position": "Northbound lane, angled towards center"
       },
       {
         "label": "Vehicle B",
         "description": "SUV with passenger-side impact damage",
         "position": "Intersection center-right, facing west"
       },
       {
         "label": "Area of Impact",
         "description": "Probable collision contact zone indicated by fluid/debris concentration",
         "position": "Intersection quadrant"
       }
     ],
     "limitations": "Forensic boundaries detailing what cannot be definitively established (e.g. exact speeds, pre-braking paths)."
   - If the evidence is insufficient to determine spatial positions:
     "available": false,
     "description": "Detailed explanation of why the evidence is insufficient to model physical scene arrangement (e.g. only isolated close-up damage photos without roadway landmarks).",
     "elements": [],
     "limitations": "Description of missing evidentiary elements required for reconstruction."

REQUIRED JSON OUTPUT FORMAT:
You MUST respond with a single, valid JSON object with this exact shape:
{
  "summary": "short evidence-based summary",
  "observed_evidence": [
    {
      "text": "description of directly visible evidence item (e.g. front-quarter crush deformation, tire scrub, final rest)",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "reported_information": [
    "facts or claims documented in the case narrative or initial officer log"
  ],
  "possible_sequence_of_events": [
    "step-by-step possible chronological sequence based on visible damage and roadway geometry"
  ],
  "possible_contributing_factors": [
    "possible environmental, mechanical, or kinematic factors consistent with evidence"
  ],
  "evidence_limitations": [
    "factors that cannot be determined from available evidence (e.g. speed, exact pre-braking trajectory, blind angles)"
  ],
  "possible_scene_reconstruction": {
    "available": true,
    "description": "evidence-grounded overview of the spatial arrangement and impact configuration",
    "elements": [
      {
        "label": "Vehicle A",
        "description": "sedan with front-end deformation",
        "position": "resting in northbound lane"
      }
    ],
    "limitations": "exact speeds, pre-braking trajectories, and exact contact millisecond cannot be established from photographs alone"
  }
}`;

    // 8. Compose user prompt with Case Metadata
    const userPrompt = `ACCIDENT CASE DOSSIER FOR MULTIMODAL EVIDENCE ANALYSIS:

Case Number: ${caseRecord.case_number || caseRecord.id}
Case Title: ${caseRecord.title || "Collision Investigation"}
Accident Type: ${caseRecord.accident_type || "Vehicle Collision"}
Location: ${caseRecord.location || "Unspecified Sector"}
Incident Date: ${caseRecord.incident_date || "Unspecified Date"}
Investigator Log / Narrative:
${caseRecord.description || "No narrative log provided."}

EVIDENCE ATTACHMENTS:
- Photographic Scene Evidence: ${imagePayloads.length} photo(s) attached for visual analysis.
${
  nonPhotoEvidence.length > 0
    ? `- Non-Image Files: ${nonPhotoEvidence.length} video/audio file(s) exist in case record. (NOTE: Video and audio files are excluded from this MVP multimodal vision pass; only photographic scene evidence was evaluated).`
    : ""
}

TASK:
Examine the supplied accident scene photographs in conjunction with the officer's case particulars.
Generate the structured analysis JSON adhering strictly to the safety guidelines, four evidentiary pillars, and output schema.`;

    // 9. Call Gemini Vision API
    const analysisOutput = await callGeminiVision(
      geminiApiKey,
      systemInstruction,
      userPrompt,
      imagePayloads
    );

    // Ensure possible_scene_reconstruction conforms to required structure
    if (!analysisOutput.possible_scene_reconstruction) {
      analysisOutput.possible_scene_reconstruction = {
        available: false,
        description: "Insufficient photographic evidence to determine physical scene reconstruction.",
        elements: [],
        limitations: "Evidence-based visualization — not a definitive forensic or legal reconstruction. Exact trajectories, speeds, and positions cannot be established without additional forensic telemetry or scene measurements."
      };
    } else {
      const recon = analysisOutput.possible_scene_reconstruction as any;
      if (typeof recon.available !== "boolean") {
        recon.available = Array.isArray(recon.elements) && recon.elements.length > 0;
      }
      if (!Array.isArray(recon.elements)) {
        if (Array.isArray(recon.participants)) {
          recon.elements = recon.participants.map((p: any) => ({
            label: p.label || "Vehicle",
            description: p.type || p.movement || "Collision participant",
            position: p.position || "Position not established"
          }));
        } else {
          recon.elements = [];
        }
      }
      if (!recon.description) {
        recon.description = recon.available
          ? "Spatial layout reconstructed from available photographic evidence."
          : "Insufficient evidence to establish spatial scene configuration.";
      }
      if (!recon.limitations) {
        recon.limitations = "Evidence-based visualization — not a definitive forensic or legal reconstruction. Speeds, trajectories, and positions cannot be definitively established from the supplied evidence.";
      }
    }

    // If case has non-image files, make sure evidence limitations notes it
    if (nonPhotoEvidence.length > 0) {
      const exclusionNote =
        "Non-image recordings (dashcam/CCTV video or audio statements) attached to this case were excluded from this multimodal vision analysis; only photographic scene evidence was evaluated.";
      if (!analysisOutput.evidence_limitations.includes(exclusionNote)) {
        analysisOutput.evidence_limitations.push(exclusionNote);
      }
    }

    // 10. Persist analysis results to public.analysis_results
    const { data: savedRecord, error: saveErr } = await adminClient
      .from("analysis_results")
      .insert({
        case_id: caseId,
        analyzed_by: user.id,
        result: analysisOutput,
      })
      .select()
      .single();

    if (saveErr) {
      console.warn("Could not save to analysis_results table (table might not exist yet):", saveErr);
    }

    // 11. Update case status in accident_cases
    await adminClient
      .from("accident_cases")
      .update({
        status: "Analysis Complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    // 12. Return structured JSON result
    return new Response(
      JSON.stringify({
        success: true,
        data: analysisOutput,
        analysis_id: savedRecord?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("Unhandled error in analyze-accident edge function:", err);
    return new Response(
      JSON.stringify({
        error: "Unable to analyze this evidence right now. Please try again.",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
