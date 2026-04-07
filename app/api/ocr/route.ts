import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  // Convert file → base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  try {
    const response = await client.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Extract items from this receipt.

Return JSON in this format:
{
  "items": [
    { "name": "Item name", "price": 0.00 }
  ]
}

Only include actual purchased items. Ignore totals, VAT, etc.
              `,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64}`,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const text = response.output_text;

    return new Response(text, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("OCR failed", { status: 500 });
  }
}