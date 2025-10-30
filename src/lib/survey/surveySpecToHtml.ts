import { SurveySpec, QuestionBlock } from "@/schemas";

export function surveySpecToHtml(spec: SurveySpec): string {
  // Provide robust defaults for all theme properties
  const theme = spec.theme || {};
  const accent = theme.accent || "#2563eb";
  const bg = theme.bg || "#0f172a";
  const font = theme.font || '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const layoutClass = theme.layout === "cardless-typeform" ? "typeform" : "full-bleed";

  // Ensure we have pages array
  if (!spec.pages || !Array.isArray(spec.pages) || spec.pages.length === 0) {
    console.error("Invalid survey spec: missing or empty pages array", spec);
    return generateErrorHtml("Invalid survey specification: no pages found");
  }

  const pagesHtml = spec.pages
    .map((page, pageIndex) => {
      if (!page || !page.blocks || !Array.isArray(page.blocks)) {
        console.warn(`Page ${pageIndex} has invalid blocks:`, page);
        return `<section class="survey-page" data-page-index="${pageIndex}">
          <div class="survey-page-body">
            <div class="text-yellow-400">Page ${pageIndex + 1}: Invalid page structure</div>
          </div>
        </section>`;
      }

      const blocks = page.blocks
        .map((block) => {
          try {
            if (block.kind === "content") {
              return `
                <div class="survey-content" data-block="${escapeHtml(block.id)}">
                  ${escapeHtml(block.html)}
                </div>
              `;
            }
            return renderQuestionBlock(block, pageIndex + 1);
          } catch (error) {
            console.error("Error rendering block:", block, error);
            return `<div class="text-red-400">Error rendering question: ${escapeHtml(block?.id || 'unknown')}</div>`;
          }
        })
        .join("\n");

      const title = page.title ? `<h2 class="survey-page-title">${escapeHtml(page.title)}</h2>` : "";

      return `
        <section class="survey-page" data-page-index="${pageIndex}">
          ${title}
          <div class="survey-page-body">
            ${blocks}
          </div>
        </section>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Survey Preview</title>
    <style>
      :root {
        color-scheme: dark;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: ${font};
        background: ${bg};
        color: #f8fafc;
        display: flex;
        justify-content: center;
        padding: 48px 16px;
      }
      .survey-shell {
        width: 100%;
        max-width: 920px;
        background: rgba(15, 23, 42, 0.95);
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        overflow: hidden;
        box-shadow: 0 30px 120px rgba(15, 23, 42, 0.45);
      }
      .survey-header {
        padding: 28px 36px 24px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .survey-logo {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: ${accent};
        display: grid;
        place-items: center;
        font-weight: 600;
        font-size: 20px;
        letter-spacing: 0.08em;
      }
      .survey-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 14px;
        color: rgba(226, 232, 240, 0.74);
      }
      .survey-content-area {
        padding: 28px 36px 40px;
        background: rgba(15, 23, 42, 0.88);
      }
      .survey-page + .survey-page {
        margin-top: 32px;
        padding-top: 32px;
        border-top: 1px solid rgba(148, 163, 184, 0.1);
      }
      .survey-page-title {
        margin: 0 0 24px;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .survey-page-body {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .survey-question {
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 18px;
        padding: 20px 22px 24px;
        display: grid;
        gap: 16px;
      }
      .survey-question-label {
        font-size: 18px;
        font-weight: 500;
      }
      .survey-option-list {
        display: grid;
        gap: 12px;
      }
      .survey-option {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(100, 116, 139, 0.12);
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .survey-option:hover {
        border-color: rgba(148, 163, 184, 0.38);
        background: rgba(100, 116, 139, 0.18);
      }
      .survey-chip-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .survey-chip {
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.16);
        border: 1px solid rgba(37, 99, 235, 0.3);
        transition: background 0.2s ease;
      }
      .survey-chip:hover {
        background: rgba(37, 99, 235, 0.25);
      }
      .survey-help {
        font-size: 13px;
        color: rgba(226, 232, 240, 0.7);
      }
      .survey-input {
        width: 100%;
        border-radius: 14px;
        padding: 12px 16px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: rgba(15, 23, 42, 0.7);
        color: inherit;
        font-size: 16px;
      }
      textarea.survey-input {
        min-height: 120px;
        resize: vertical;
      }
      .survey-rating {
        display: flex;
        gap: 12px;
        justify-content: space-between;
      }
      .survey-rating input[type="radio"] {
        display: none;
      }
      .survey-rating label {
        width: 100%;
        padding: 14px 0;
        text-align: center;
        border-radius: 14px;
        background: rgba(30, 41, 59, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.22);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .survey-rating label:hover {
        border-color: ${accent};
        color: ${accent};
      }
      .layout.typeform .survey-shell {
        max-width: 640px;
        border-radius: 24px;
        overflow: hidden;
        border: none;
      }
      .layout.typeform .survey-content-area {
        padding: 64px 48px;
        background: transparent;
      }
      .layout.typeform .survey-question {
        background: rgba(15, 23, 42, 0.78);
        border-radius: 32px;
        padding: 32px;
      }
      @media (max-width: 768px) {
        body {
          padding: 32px 12px;
        }
        .survey-content-area {
          padding: 24px;
        }
        .layout.typeform .survey-content-area {
          padding: 32px 24px;
        }
        .survey-question {
          border-radius: 16px;
        }
      }
    </style>
  </head>
  <body class="layout ${layoutClass}">
    <main class="survey-shell">
      <header class="survey-header">
        <div class="survey-logo">SV</div>
        <div class="survey-meta">
          <span>Version: ${escapeHtml(spec.version)}</span>
          <span>Total pages: ${spec.pages.length}</span>
          ${spec.logic && spec.logic.length ? `<span>Logic rules: ${spec.logic.length}</span>` : ""}
        </div>
      </header>
      <div class="survey-content-area">
        ${pagesHtml}
      </div>
    </main>
  </body>
</html>`;
}

function renderQuestionBlock(block: QuestionBlock, pageIndex: number): string {
  // Provide safe defaults for all required fields
  const id = block.id || `question-${pageIndex}-${Date.now()}`;
  const label = block.label || 'Untitled Question';
  const type = block.type || 'text';
  const required = block.required || false;
  const helpText = block.helpText || '';
  const options = block.options || [];

  const requiredTag = required ? '<span class="text-[13px] uppercase tracking-wide text-sky-300">Required</span>' : '';
  const help = helpText ? `<p class="survey-help">${escapeHtml(helpText)}</p>` : '';

  switch (type) {
    case "long_text":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <textarea class="survey-input" placeholder="${escapeHtml(helpText || "Share your thoughts...")}"></textarea>
        ${help}
      `);
    case "single_select":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <div class="survey-option-list">
          ${options.map((opt, idx) => `
            <label class="survey-option">
              <input type="radio" name="${escapeHtml(id)}" value="${escapeHtml(opt)}" ${required && idx === 0 ? 'required' : ''} />
              <span>${escapeHtml(opt)}</span>
            </label>
          `).join("\n")}
        </div>
        ${help}
      `);
    case "multi_select":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <div class="survey-option-list">
          ${options.map((opt) => `
            <label class="survey-option">
              <input type="checkbox" name="${escapeHtml(id)}" value="${escapeHtml(opt)}" />
              <span>${escapeHtml(opt)}</span>
            </label>
          `).join("\n")}
        </div>
        ${help}
      `);
    case "rating":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <div class="survey-rating">
          ${Array.from({ length: 5 }).map((_, i) => `
            <label>
              <input type="radio" name="${escapeHtml(id)}" value="${i + 1}" ${required && i === 0 ? 'required' : ''} />
              <span>${i + 1}</span>
            </label>
          `).join("\n")}
        </div>
        ${help}
      `);
    case "nps":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <div class="survey-chip-group">
          ${Array.from({ length: 11 }).map((_, i) => `
            <button type="button" class="survey-chip" data-value="${i}">${i}</button>
          `).join("\n")}
        </div>
        ${help}
      `);
    case "email":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <input class="survey-input" type="email" placeholder="name@example.com" ${required ? 'required' : ''} />
        ${help}
      `);
    case "phone":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <input class="survey-input" type="tel" placeholder="(555) 000-0000" ${required ? 'required' : ''} />
        ${help}
      `);
    case "date":
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <input class="survey-input" type="date" ${required ? 'required' : ''} />
        ${help}
      `);
    case "text":
    default:
      return wrapQuestion({ id, label, type, required }, pageIndex, requiredTag, `
        <input class="survey-input" type="text" placeholder="${escapeHtml(helpText || "Your response")}" ${required ? 'required' : ''} />
        ${help}
      `);
  }
}

function wrapQuestion(block: {id: string, label: string, type: string, required: boolean}, pageIndex: number, requiredTag: string, body: string): string {
  return `
    <article class="survey-question" data-page="${pageIndex}" data-question-id="${escapeHtml(block.id)}">
      <header>
        <div class="flex items-center justify-between">
          <p class="survey-question-label">${escapeHtml(block.label)}</p>
          ${requiredTag}
        </div>
      </header>
      ${body}
    </article>
  `;
}

function generateErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Survey Error</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, sans-serif;
        background: #0f172a;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .error-container {
        text-align: center;
        max-width: 500px;
      }
      .error-title {
        font-size: 24px;
        font-weight: 600;
        color: #ef4444;
        margin-bottom: 16px;
      }
      .error-message {
        color: #94a3b8;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="error-container">
      <h1 class="error-title">Survey Generation Error</h1>
      <p class="error-message">${escapeHtml(message)}</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
