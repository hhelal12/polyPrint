"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "guidelines" | "specifications" | "payments" | "account";
}

const FAQS: FAQItem[] = [
  {
    category: "guidelines",
    question: "What are the standard binding requirements for final IT graduation projects?",
    answer: "Final graduation projects must be bound using standard thermal soft-covers or wire binding as prescribed by the department regulations. Please double-check your specific course delivery log guidelines before submitting the final file layout."
  },
  {
    category: "specifications",
    question: "What document formats are accepted to prevent layout shifting?",
    answer: "We strictly recommend uploading files in PDF format. Uploading raw Word (.docx) or PowerPoint (.pptx) files often results in font substitution and broken margins when opened on the Copy Centre's production machines."
  },
  {
    category: "payments",
    question: "Can I pay using cash at the counter, or is it strictly electronic?",
    answer: "The Copy Center only accepts cash for now."
  },
  {
    category: "guidelines",
    question: "How far in advance should I submit a high-volume printing order?",
    answer: "While standard lecture notes take 1–2 hours, heavy project submission weeks cause high volume. For graduation dissertations or bulk materials, we highly recommend submitting your order at least 24 hours in advance."
  },
  {
    category: "specifications",
    question: "Does PolyPrint support large-scale architectural or engineering blueprint prints?",
    answer: "Yes, our plotters support wide-format printing for A4, A3, and A2 dimensions. Make sure your PDF page setup properties match the exact target sheet canvas layout before sending it to the queue."
  },
  {
    category: "account",
    question: "My order status says 'Pending Approval'. What does this mean?",
    answer: "Orders containing heavy color ink usage or unusual paper options require structural verification by a staff member to prevent accidental balance charges. You will get a system badge update once it passes review."
  }
];

const CATEGORIES = [
  { id: "all",            label: "All" },
  { id: "guidelines",     label: "Guidelines" },
  { id: "specifications", label: "Specifications" },
  { id: "payments",       label: "Fees & Payment" },
  { id: "account",        label: "Orders" },
];

export default function MostFrequentQuestionsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setOpenFaq(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ── Header ── */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D284A] tracking-tight">
            PolyPrint <span className="text-[#3CCFD0]">FAQ Bank</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Review the most frequent inquiries sent to the Bahrain Polytechnic Copy Centre
            regarding project configurations, sizing guidelines, and payment setups.
          </p>
        </div>

        {/* ── Search ── */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenFaq(null); }}
              placeholder="Search questions (e.g., binding, PDF)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#3CCFD0] focus:ring-1 focus:ring-[#3CCFD0] transition-all shadow-sm text-gray-700"
            />
            <span className="absolute left-3 top-3 text-gray-400 text-xs">🔍</span>
          </div>
        </div>

        {/* ── Category tabs — horizontal scroll on mobile ── */}
        <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#0D284A] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FAQ accordion ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen ? "bg-gray-50/40 ring-1 ring-[#3CCFD0]/20" : "bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex justify-between items-start gap-3 transition-colors focus:outline-none"
                  >
                    <span className="text-xs font-bold text-[#0D284A] leading-relaxed">
                      {faq.question}
                    </span>
                    <span className={`text-xs text-gray-400 transition-transform duration-200 shrink-0 mt-0.5 ${
                      isOpen ? "rotate-180 text-[#3CCFD0]" : ""
                    }`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-50/60 pt-3">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-gray-400 font-medium">
              No questions match your criteria. Try another search phrase! 📋
            </div>
          )}
        </div>

        {/* ── Footer notice ── */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-gray-400 font-medium px-4">
          Can't find what you need? Visit the desk counter on campus directly during regular hours
          <span className="font-semibold text-gray-500"> (8:00 AM – 4:00 PM)</span>.
        </div>

      </div>
    </div>
  );
}