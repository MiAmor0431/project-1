export async function callOpenAI(prompt) {
    const apiKey = ""

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // можешь сменить на "gpt-4", если у тебя доступ
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(data);
        throw new Error(data?.error?.message || "Ошибка OpenAI API");
    }

    return data.choices[0].message.content;
}
