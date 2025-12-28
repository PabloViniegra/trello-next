'use client'

import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useState } from 'react'
import { ContentEditable } from '../editor-ui/content-editable'

type TCardDescriptionPluginsProps = {
  placeholder: string
}

/**
 * Plugins for card description editor.
 * Includes rich text editing capabilities.
 */
export function CardDescriptionPlugins({
  placeholder,
}: TCardDescriptionPluginsProps) {
  const [_floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className='relative bg-background overflow-hidden rounded-lg border shadow-sm'>
      <RichTextPlugin
        contentEditable={
          <div ref={onRef}>
            <ContentEditable
              placeholder={placeholder}
              className='ContentEditable__root relative block min-h-32 overflow-auto px-4 py-3 focus:outline-none'
              placeholderClassName='text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-4 py-3 text-ellipsis select-none'
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  )
}
