import { Configuration, OpenAIApi } from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Метод не поддерживается" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.pdf) return res.status(400).json({ error: "Ошибка загрузки файла" });

    const pdfPath = files.pdf[0].filepath;
    const pdfData = fs.createReadStream(pdfPath);

    try {
      const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

      // 1. Загружаем PDF в OpenAI
      const fileUpload = await openai.createFile(pdfData, "file");
      const fileId = fileUpload.data.id;

      // 2. GPT анализирует файл
      const response = await openai.createChatCompletion({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Проанализируй этот документ и дай краткий вывод." },
          { role: "user", content: fileId }
        ],
      });

      res.status(200).json({ result: response.data.choices[0].message.content.trim() });
    } catch (error) {
      console.error("Ошибка OpenAI:", error);
      res.status(500).json({ error: "Ошибка анализа PDF" });
    }
  });
}
