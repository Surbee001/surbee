import React from "react";
import { SurveySpec, QuestionBlock } from "../schemas";

type SurveyRendererProps = {
  spec: SurveySpec;
};

export default function SurveyRenderer({ spec }: SurveyRendererProps) {
  return (
    <div className="min-h-screen p-8">
      {spec.pages.map((page) => (
        <section key={page.id} className="mb-12">
          {page.title && <h2 className="text-2xl mb-4">{page.title}</h2>}
          {page.blocks.map((block) => {
            if (block.kind === "content") {
              return (
                <div
                  key={block.id}
                  className="mb-6"
                  dangerouslySetInnerHTML={{ __html: block.html || "" }}
                />
              );
            }

            return (
              <div key={block.id} className="mb-6">
                <label className="block font-medium mb-2">
                  {block.label}
                  {block.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderQuestion(block)}
                {block.helpText && (
                  <p className="text-sm text-muted-foreground mt-2">{block.helpText}</p>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function renderQuestion(block: QuestionBlock) {
  switch (block.type) {
    case "long_text":
      return (
        <textarea
          className="border px-3 py-2 w-full"
          rows={4}
          placeholder={block.helpText || ""}
        />
      );
    case "single_select":
      return (
        <select className="border px-3 py-2 w-full" defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          {(block.options || []).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      );
    case "multi_select":
      return (
        <div className="space-y-2">
          {(block.options || []).map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    case "rating":
      return (
        <input
          type="range"
          min={1}
          max={5}
          defaultValue={3}
          className="w-full"
        />
      );
    case "nps":
      return (
        <input
          type="range"
          min={0}
          max={10}
          defaultValue={7}
          className="w-full"
        />
      );
    case "email":
      return <input type="email" className="border px-3 py-2 w-full" placeholder="name@example.com" />;
    case "phone":
      return <input type="tel" className="border px-3 py-2 w-full" placeholder="(555) 555-5555" />;
    case "date":
      return <input type="date" className="border px-3 py-2 w-full" />;
    case "text":
    default:
      return <input type="text" className="border px-3 py-2 w-full" placeholder={block.helpText || ""} />;
  }
}
