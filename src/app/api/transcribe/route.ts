import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (not Edge) for file handling
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("[Transcribe] Received request");

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      console.error("[Transcribe] No audio file in request");
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log("[Transcribe] Audio file received:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Check if API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("[Transcribe] ELEVENLABS_API_KEY not configured");
      return NextResponse.json(
        { error: "Transcription service not configured" },
        { status: 500 }
      );
    }

    // Convert File to Buffer (ElevenLabs expects File or Buffer)
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[Transcribe] Sending to ElevenLabs...");

    // Import ElevenLabs dynamically to avoid Edge runtime issues
    const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Create a File-like object with proper name and type
    const audioFileForAPI = new File([buffer], audioFile.name, {
      type: audioFile.type || "audio/webm",
    });

    // Transcribe using ElevenLabs
    const transcription = await elevenlabs.speechToText.convert({
      file: audioFileForAPI,
      modelId: "scribe_v1",
      tagAudioEvents: false,
      languageCode: "eng",
      diarize: false,
    });

    // Handle different response types from ElevenLabs
    let text = "";
    let language = "eng";

    if ("text" in transcription) {
      text = transcription.text || "";
      language =
        (transcription as any).languageCode ||
        (transcription as any).language_code ||
        "eng";
    } else if ("transcripts" in transcription) {
      // Multi-channel response
      const transcript = (transcription as any).transcripts?.[0];
      text = transcript?.text || "";
      language = transcript?.languageCode || transcript?.language_code || "eng";
    }

    console.log("[Transcribe] Success:", {
      textLength: text.length,
      language: language,
    });

    return NextResponse.json({
      text: text,
      language: language,
    });
  } catch (error: any) {
    console.error("[Transcribe] Error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
