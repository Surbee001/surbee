"use client";

import { useEffect } from "react";

type ReplicaClientProps = {
  bodyHtml: string;
  css: string;
  bodyAttributes: Array<[string, string]>;
};

const STYLE_ELEMENT_ID = "cofounder-inline-style";

function applyBodyAttributes(attributes: Array<[string, string]>) {
  const previous = new Map<string, string | null>();

  attributes.forEach(([name, value]) => {
    if (name === "class") {
      previous.set(name, document.body.className || null);
      document.body.className = value;
    } else {
      previous.set(name, document.body.getAttribute(name));
      document.body.setAttribute(name, value);
    }
  });

  return previous;
}

function restoreBodyAttributes(previous: Map<string, string | null>) {
  previous.forEach((value, name) => {
    if (name === "class") {
      if (value === null) {
        document.body.removeAttribute("class");
      } else {
        document.body.className = value;
      }
    } else if (value === null) {
      document.body.removeAttribute(name);
    } else {
      document.body.setAttribute(name, value);
    }
  });
}

export default function ReplicaClient({ bodyHtml, css, bodyAttributes }: ReplicaClientProps) {
  useEffect(() => {
    let styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    let createdStyleElement = false;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ELEMENT_ID;
      createdStyleElement = true;
      document.head.appendChild(styleElement);
    }

    if (styleElement.textContent !== css) {
      styleElement.textContent = css;
    }

    const previousAttributes = applyBodyAttributes(bodyAttributes);

    return () => {
      if (createdStyleElement && styleElement?.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      restoreBodyAttributes(previousAttributes);
    };
  }, [css, bodyAttributes]);

  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
