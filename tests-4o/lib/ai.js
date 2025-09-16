(function () {
  // tests-4o/lib/ai.js
  // Minimal OpenAI 4o analysis using fetch. Works over file:// (no CORS server roundtrip),
  // assuming the browser allows cross-origin HTTPS requests from local files.
  // The API key is provided explicitly by the user (stored in localStorage by index.html).

  const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
  const MODEL = "gpt-4o-mini"; // Small, fast 4o-family model. Change to "gpt-4o" if desired.

  async function analyzeWith4o(apiKey, markdown) {
    if (!apiKey) throw new Error("Missing OpenAI API key");
    if (!markdown) throw new Error("No markdown provided");

    const system =
      "You are an assistant that reads extracted Markdown text and returns a concise analysis: key points (bulleted), any dates, entities, and a one-paragraph summary. Keep it short.";
    const user = `Analyze the following Markdown. Return:\n- Key points\n- Entities (people/orgs/places)\n- Dates\n- One-paragraph summary\n\n---\n${markdown.slice(
      0,
      12000
    )}`; // safety cap

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const choice = data.choices && data.choices[0];
    const content = choice && choice.message && choice.message.content;
    return content || "";
  }

  window.TuskAI = { analyzeWith4o };
})();
