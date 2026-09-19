"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

type Source = {
  state?: string;
  district?: string;
  category?: string;
  gi_status?: string;
  distance?: number;
  craft_name?: string;
  product?: string;
  description?: string;
};

type AIResponse = {
  success: boolean;
  answer: string;
  sources?: Source[];
};

export default function AIAssistant() {
  const [question, setQuestion] = useState(
    "Tell me about traditional handicrafts from Uttar Pradesh"
  );

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const result: AIResponse = await api.askAI(question, 5);

      setAnswer(result.answer || "");
      setSources(result.sources || []);
    } catch (error) {
      console.error("RAG error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not reach the RAG service."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="container tool-wrap">

        {/* Back */}
        <Link href="/" className="card-link">
          <ArrowLeft size={15} />
          Back home
        </Link>

        {/* Header */}
        <div className="tool-header">
          <div>
            <div className="section-kicker">
              HASTKATHA AI
            </div>

            <h1 className="section-title">
              Ask the craft archive.
            </h1>

            <p className="section-desc">
              Semantic retrieval finds relevant ODOP records first.
              The language model then answers from that evidence.
            </p>
          </div>

          <div className="ai-icon">
            <Bot size={25} />
          </div>
        </div>

        {/* Main Card */}
        <div className="tool-card">

          {/* Question */}
          <div className="field full">
            <label>Your question</label>

            <textarea
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about a craft, state, material or GI status..."
            />
          </div>

          {/* Ask Button */}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={ask}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Searching knowledge...
              </>
            ) : (
              <>
                <Send size={16} />
                Ask HASTKATHA
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div
              style={{
                color: "#a9523c",
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: 12,
                background: "#fff4f0",
                border: "1px solid #ead1c8",
              }}
            >
              {error}
            </div>
          )}

          {/* Result */}
          {answer && (
            <div className="result">

              {/* Result heading */}
              <div className="eyebrow">
                <Sparkles size={14} />
                Grounded answer
              </div>

              {/* Answer */}
              <div
                className="answer"
                style={{
                  marginTop: 15,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.75,
                }}
              >
                {answer}
              </div>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="sources">

                  <div className="section-kicker">
                    Retrieved sources
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    {sources.map((source, index) => (
                      <div
                        className="source"
                        key={index}
                      >
                        <strong>
                          {source.craft_name ||
                            source.product ||
                            "Craft record"}
                        </strong>

                        <small>
                          {[
                            source.district,
                            source.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}

                          {" · "}

                          {source.category ||
                            "Handicraft"}

                          {" · GI: "}

                          {source.gi_status || "—"}

                          {typeof source.distance ===
                            "number" && (
                            <>
                              {" · "}
                              similarity{" "}
                              {source.distance.toFixed(3)}
                            </>
                          )}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}