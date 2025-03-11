import { Configuration, OpenAIApi } from "openai";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Метод не поддерживается" });

  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp"; // Временная папка для загрузки
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err || !files.pdf) {
      return res.status(400).json({ error: "Ошибка загрузки файла" });
    }

    const pdfPath = files.pdf.filepath;
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    try {
      const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

      // 1. GPT анализирует текст файла
      const response = await openai.createChatCompletion({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Ты анализируешь PDF. Дай краткое описание содержимого." },
          { role: "user", content: pdfBase64 }
        ],
      });

      res.status(200).json({ result: response.data.choices[0].message.content.trim() });
    } catch (error) {
      console.error("Ошибка OpenAI:", error);
      res.status(500).json({ error: "Ошибка анализа PDF" });
    }
  });
}
