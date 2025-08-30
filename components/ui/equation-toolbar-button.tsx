'use client';

import * as React from 'react';

import { insertInlineEquation } from '@platejs/math';
import { FunctionSquareIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor);
      }}
      tooltip="Mark as equation"
    >
              <FunctionSquareIcon />
    </ToolbarButton>
  );
}
