import React, { useState, useRef, useEffect } from 'react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  ShoppingBag,
  Gift,
  HelpCircle,
  Loader2,
  DollarSign,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from 'lucide-react';

interface BuyerAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsCatalog: Product[];
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  isDarkMode: boolean;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export const BuyerAssistantModal: React.FC<BuyerAssistantModalProps> = ({
  isOpen,
  onClose,
  productsCatalog,
  currency,
  onSelectProduct,
  isDarkMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'مرحباً بك في سوق أور! أنا مستشارك الذكي للمبيعات واختيار الهدايا. أقدر أساعدك في اختيار أنسب هدية أو منتج حسب ميزانيتك، والمناسبة، مع توضيح الأسعار بالدينار العراقي IQD والدولار. شنو الهدية أو المنتج اللي تبحث عنه اليوم؟',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: promptToSend.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/buyer-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend.trim(),
          history: messages,
          occasion,
          budget,
          productsCatalog,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...nextHistory, { role: 'assistant', content: data.reply }]);
      } else if (data.error) {
        setMessages([
          ...nextHistory,
          { role: 'assistant', content: data.error },
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...nextHistory,
        {
          role: 'assistant',
          content:
            'نعتذر، محرك المساعد الذكي يواجه ضغطاً لحظياً. تفضل بمشاهدة الكتالوج أدناه مع أسعار الدينار العراقي والدفع عند الاستلام.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'هدية عيد ميلاد رجالية 🎁', prompt: 'ابحث عن هدية عيد ميلاد فاخرة لشاب بميزانية 40,000 د.ع' },
    { label: 'عناية بالبشرة للبنات ✨', prompt: 'ما هو أفضل سيروم أو روتين عناية بالبشرة متوفر في المتجر؟' },
    { label: 'سماعات أو ساعة ذكية 🎧', prompt: 'أريد ترشيح سماعات رياضية أو ساعة ذكية ذات بطارية قوية' },
    { label: 'هدية زواج للمنزل 🏠', prompt: 'شنو تقترح هدية منزلية أو مطبخية أنيقة للعروسين؟' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh] border ${
          isDarkMode
            ? 'bg-[#141519] border-amber-500/30 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkMode
              ? 'bg-[#18191f] border-amber-500/20'
              : 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-200/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 font-black">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">مستشار المبيعات واختيار الهدايا</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مساعدة ذكية لاختيار أنسب المنتجات بحسب الميزانية والمناسبة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode
                ? 'bg-[#22242b] hover:bg-[#2c2f38] text-slate-400 hover:text-white'
                : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Bar: Occasion & Budget */}
        <div
          className={`px-4 py-2.5 border-b text-xs flex flex-wrap items-center gap-2 shrink-0 ${
            isDarkMode ? 'bg-[#111215] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="font-bold text-amber-500 flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" />
            تخصيص البحث:
          </span>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className={`px-2.5 py-1 rounded-lg border text-xs outline-none focus:border-amber-500 ${
              isDarkMode
                ? 'bg-[#1c1d24] border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="">كل المناسبات</option>
            <option value="عيد ميلاد">عيد ميلاد</option>
            <option value="هدية زواج أو خطوبة">هدية زواج أو خطوبة</option>
            <option value="تخرج أو نجاح">تخرج أو نجاح</option>
            <option value="استخدام شخصي يومي">استخدام شخصي يومي</option>
          </select>

          <input
            type="number"
            placeholder="الميزانية (د.ع)... مثلاً 35000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={`px-2.5 py-1 rounded-lg border text-xs w-44 outline-none focus:border-amber-500 ${
              isDarkMode
                ? 'bg-[#1c1d24] border-slate-700 text-slate-200 placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm min-h-[320px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 items-start ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : isDarkMode
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/20'
                    : 'bg-slate-900 text-amber-400'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-xs sm:text-sm ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : isDarkMode
                    ? 'bg-[#1a1c23] border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center animate-spin">
                <Loader2 className="w-4 h-4 text-amber-400" />
              </div>
              <span>جاري تحليل كتالوج سوق أور واقتراح أفضل الهدايا...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isDarkMode ? 'bg-[#121316] border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip.prompt)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                isDarkMode
                  ? 'bg-[#1c1d24] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-500/50'
                  : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 hover:border-amber-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className={`p-3 sm:p-4 border-t flex items-center gap-2 shrink-0 ${
            isDarkMode ? 'bg-[#18191f] border-amber-500/20' : 'bg-white border-slate-200'
          }`}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب استفسارك أو طلبك هنا... مثلاً: اقترح هدية لصديق يحب التقنية"
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all ${
              isDarkMode
                ? 'bg-[#101114] border-slate-700 focus:border-amber-500 text-white placeholder:text-slate-500'
                : 'bg-slate-100 border-slate-300 focus:border-amber-500 text-slate-900 placeholder:text-slate-500'
            }`}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-500/20"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
