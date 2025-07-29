export async function callOpenAI(prompt) {
    const apiKey = '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';

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost",
            "X-Title": "Kp-Generator"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(data);
        throw new Error(data?.error?.message || "Ошибка OpenRouter API");
    }

    return data.choices[0].message.content;
}
