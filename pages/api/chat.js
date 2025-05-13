import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, user } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are FamilyGPT, a friendly assistant for a family. Respond kindly and clearly.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message.content.trim();
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Sorry, I had trouble responding.' });
  }
}
