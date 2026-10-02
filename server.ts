import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI on server with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Buyer Assistant AI Endpoint
app.post('/api/buyer-assistant', async (req, res) => {
  try {
    const { message, history = [], occasion, budget, category, productsCatalog = [] } = req.body;

    const catalogSummary = productsCatalog.slice(0, 10).map((p: any) => ({
      id: p.id,
      title: p.title,
      category: p.categoryNameAr,
      priceIQD: p.price,
      vendor: p.vendor?.name,
      governorate: p.vendor?.governorateNameAr,
      inStock: p.inStock,
    }));

    const systemInstruction = `
أنت المساعد الذكي للمبيعات واختيار الهدايا في متجر "سوق أور" (UR Store)، منصة التجارة الإلكترونية العراقية الفاخرة ذات النموذج الخالي من المخزون (Dropshipping/B2B2C).
تتحدث باللهجة العراقية البيضاء المحترفة الدافئة والمشجعة، أو بالعربية الفصحى البسيطة حسب راحة الزبون.
مهمتك:
1. مساعدة الزبون في اختيار أنسب المنتجات والهدايا بحسب الميزانية (بالدينار العراقي IQD مع إمكانية ذكر ما يعادلها بالدولار التقديري: 1$ ≈ 1,320 د.ع)، والمناسبة (عيد ميلاد، زواج، تخرج، استخدام يومي)، والشخص المستلم.
2. توجيه الزبون فوراً لكيفية الطلب والدفع نقداً عند الاستلام (COD) مع شحن سريع لكافة محافظات العراق الـ 18.
3. الإجابة بدقة عن مواصفات المنتجات المتوفرة في المتجر.
قائمة عينة من منتجات المتجر الحالية:
${JSON.stringify(catalogSummary, null, 2)}

قواعد الرد:
- كن ودوداً، مختصراً، وراقياً (Matte Charcoal & Gold Spirit).
- إذا اقترحت منتجاً معيناً، اذكر سعره بالدينار العراقي، واذكر اسم المنتج بدقة ليتمكن الزبون من إضافته للسلة مباشرة.
- شجع الزبون على فحص الطرد قبل الدفع للكابتن لضمان راحة البال.
`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `سؤال أو طلب الزبون: ${message || 'ساعدني في اختيار أفضل هدية'}${
              occasion ? ` | المناسبة: ${occasion}` : ''
            }${budget ? ` | الميزانية: ${budget} د.ع` : ''}${category ? ` | التصنيف: ${category}` : ''}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'أهلاً بك في سوق أور! كيف أقدر أساعدك اليوم في اختيار طلبك؟';
    res.json({ reply });
  } catch (error: any) {
    console.error('Buyer Assistant AI Error:', error);
    res.status(500).json({
      error: 'عذراً، حدث خطأ مؤقت في محرك المساعد الذكي. يمكنك تصفح المنتجات مباشرة ومراسلتنا على الواتساب.',
      details: error.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UR Store server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
