import { getCookie } from 'monolith-ts-api';
import { CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import React, { ReactElement } from 'react';
import { en_US } from '@lyku/strings';

import { Link } from './Link';

export let language = getCookie('lang');
let pb: CompactedPhrasebook | undefined;
if (language) pb = getPhrasebook(language);
else {
  for (language of navigator.languages) {
    pb = getPhrasebook(language);
    if (pb) break;
  }
}
if (!pb) pb = en_US;

type Rule = [RegExp, (match: RegExpExecArray) => React.ReactNode];

const rules: Rule[] = [
  // Header rules
  [/^#{6}\s?(.+)/gm, (match) => <h6 key={match.index}>{match[1]}</h6>],
  [/^#{5}\s?(.+)/gm, (match) => <h5 key={match.index}>{match[1]}</h5>],
  [/^#{4}\s?(.+)/gm, (match) => <h4 key={match.index}>{match[1]}</h4>],
  [/^#{3}\s?(.+)/gm, (match) => <h3 key={match.index}>{match[1]}</h3>],
  [/^#{2}\s?(.+)/gm, (match) => <h2 key={match.index}>{match[1]}</h2>],
  [/^#{1}\s?(.+)/gm, (match) => <h1 key={match.index}>{match[1]}</h1>],

  // Bold and italics rules
  [/\*\*(.+?)\*\*/g, (match) => <strong key={match.index}>{match[1]}</strong>],
  [/\*(.+?)\*/g, (match) => <em key={match.index}>{match[1]}</em>],
  [/__(.+?)__/g, (match) => <strong key={match.index}>{match[1]}</strong>],
  [/(.+?)_/g, (match) => <em key={match.index}>{match[1]}</em>],

  // Link rules
  [
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match) => (
      <Link href={match[2]} key={match.index}>
        {match[1]}
      </Link>
    ),
  ],
  [
    /\[([^\][]+)\][^(]/g,
    (match) => (
      <Link href={match[1]} key={match.index}>
        {match[1]}
      </Link>
    ),
  ],

  // Highlight rule
  [
    /`(.+?)`/g,
    (match) => (
      <span
        style={{
          backgroundColor: 'grey',
          color: 'black',
          textDecoration: 'none',
          borderRadius: '3px',
          padding: '0 2px',
        }}
        key={match.index}
      >
        {match[1]}
      </span>
    ),
  ],

  // List rules
  [
    /^\+(.+)/gm,
    (match) => (
      <ul key={match.index}>
        <li>{match[1]}</li>
      </ul>
    ),
  ],
  [
    /^\*(.+)/gm,
    (match) => (
      <ul key={match.index}>
        <li>{match[1]}</li>
      </ul>
    ),
  ],

  // Image rule
  [
    /!\[([^\]]+)\]\(([^)]+)\s"([^"]+)"\)/g,
    (match) => (
      <img src={match[2]} alt={match[1]} title={match[3]} key={match.index} />
    ),
  ],
];

const convertTextToComponents = (text: string): React.ReactNode[] => {
  const components: React.ReactNode[] = [];
  let lastIndex = 0;

  // Add raw text before each match as a separate text node
  const addTextComponent = (textSegment: string, key: number) => {
    if (textSegment) {
      components.push(<span key={`text-${key}`}>{textSegment}</span>);
    }
  };

  rules.forEach(([regex, componentFn]) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addTextComponent(text.slice(lastIndex, match.index), lastIndex);
      components.push(componentFn(match));
      lastIndex = regex.lastIndex;
    }
    regex.lastIndex = 0; // Reset lastIndex after each rule
  });

  // Add any remaining text after the last match
  addTextComponent(text.slice(lastIndex), lastIndex);

  return components;
};

const hydrate = (book: CompactedPhrasebook) =>
  Object.fromEntries(
    Object.entries(book).map(([k, v]) => [
      k,
      typeof v === 'string' ? v : convertTextToComponents(v.md),
    ]),
  );
export type HydratedPhrasebook = {
  [K in keyof CompactedPhrasebook]: CompactedPhrasebook[K] extends string
    ? CompactedPhrasebook[K]
    : Array<string | ReactElement>;
};

export const phrasebook = hydrate(pb) as HydratedPhrasebook;
