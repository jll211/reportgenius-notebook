import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Upload file function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing upload request");
    const payload = await req.json();
    console.log("Received payload for file:", payload.name);

    if (!payload.content || !payload.name || !payload.type || !payload.userId) {
      console.error("Missing required fields in payload");
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Convert base64 to Uint8Array
    const base64Data = payload.content.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log("File details:", {
      name: payload.name,
      size: payload.size,
      type: payload.type,
      userId: payload.userId
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // File size validation (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (payload.size > MAX_FILE_SIZE) {
      console.error("File too large:", payload.size);
      return new Response(
        JSON.stringify({ error: 'File size must be less than 50MB' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = payload.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${payload.userId}/${fileName}`;

    console.log("Uploading file to storage:", filePath);

    // Upload to storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, binaryData, {
        contentType: payload.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("File uploaded to storage successfully");

    // Create database record
    const { error: dbError } = await supabase
      .from('attachments')
      .insert({
        file_name: payload.name,
        file_type: payload.type.toUpperCase(),
        file_size: payload.size,
        file_path: filePath,
        metadata: {
          originalName: payload.name,
          uploadedBy: payload.userId,
          uploadedAt: new Date().toISOString()
        }
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("File metadata saved to database");

    return new Response(
      JSON.stringify({ 
        message: 'File uploaded successfully',
        filePath,
        fileName: payload.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});