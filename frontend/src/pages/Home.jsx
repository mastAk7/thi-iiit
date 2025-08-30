import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { analyze } from '../lib/api';
import { useAnalysisStore } from '../store/useAnalysisStore';
import '../styles/form.css';
import Results from './Results.jsx';
import { useEffect, useRef } from 'react';
import FloatingTextarea from '../components/FloatingTextarea.jsx';


export default function Home() {
    const nav = useNavigate();
    const { setLoading, setResult, result } = useAnalysisStore();
    const resultsRef = useRef(null);

    useEffect(() => {
        if (result && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // make focusable and focus for accessibility
            resultsRef.current.setAttribute('tabindex', '-1');
            resultsRef.current.focus();
        }
    }, [result]);
    const [text, setText] = useState('In 2023, Google bought OpenAI for $50B.');
    const [context, setContext] = useState('OpenAI remains independent…');


    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await analyze({ response_text: text, optional_context: context ? [context] : [] });
            setResult(data);
        } catch (err) {
            // Frontend fallback if backend is down
            setResult({
                thi: 0.62,
                label: 'hallucination',
                threshold: 0.5,
                weights: { contradiction: 0.35, lack_support: 0.30, instability: 0.15, speculative: 0.10, numeric: 0.10 },
                per_claim: [
                    {
                        claim: text,
                        scores: { contradiction: 0.81, lack_support: 0.72, instability: 0.18, speculative: 0.05, numeric: 0.0, thi_claim: 0.69 },
                        evidence: { text: context },
                        highlights: { speculative_spans: [], numeric_flags: [] }
                    }
                ]
            });
            // keep results inline
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="analyze-page min-h-[60vh]">
            <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl bg-[rgba(12,8,12,0.35)] border border-[rgba(255,90,163,0.04)] p-8 rounded-xl shadow-soft-pink">
                <div className="mb-10">
                    <h1 className="text-2xl text-white font-extrabold">Detect Hallucination Risk</h1>
                    <p className="text-[rgba(201,182,200,0.9)] mt-2">Paste the AI response and optional context. We'll run quick explainable checks and return a Hallucination Probability.</p>
                </div>

                <div className="mb-6">
                    <FloatingTextarea id="ai-response" label="AI Response Text" value={text} onChange={e => setText(e.target.value)} rows={8} placeholder=" " />
                </div>

                <div className="mb-6">
                    <FloatingTextarea id="context" label="Optional Context (top passages)" value={context} onChange={e => setContext(e.target.value)} rows={4} placeholder=" " />
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#ff5aa3] to-[#ff2d8a] text-white hover:scale-[1.01] active:scale-[0.995] shadow-lg transition-transform">Analyze</button>
                    <span className="text-[rgba(201,182,200,0.85)]">This demo uses mock mode until the AI API is connected.</span>
                </div>
            </form>
                {/* Inline results panel */}
                <div className="w-full max-w-3xl mx-auto mt-8" ref={resultsRef}>
                    <Results />
                </div>
        </div>
    );
}