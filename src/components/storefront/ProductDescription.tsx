interface ProductDescriptionProps {
  description?: string | null;
}

type DescriptionBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

function parseDescription(description: string): DescriptionBlock[] {
  const normalizedDescription = description.replace(/\r\n?/g, '\n').trim();

  if (!normalizedDescription) {
    return [];
  }

  return normalizedDescription
    .split(/\n\s*\n+/)
    .flatMap((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const parsedBlocks: DescriptionBlock[] = [];
      let paragraphLines: string[] = [];
      let listItems: string[] = [];

      const flushParagraph = () => {
        if (paragraphLines.length > 0) {
          parsedBlocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
          paragraphLines = [];
        }
      };

      const flushList = () => {
        if (listItems.length > 0) {
          parsedBlocks.push({ type: 'list', items: listItems });
          listItems = [];
        }
      };

      lines.forEach((line) => {
        if (line.startsWith('- ')) {
          flushParagraph();
          const item = line.slice(2).trim();
          if (item) {
            listItems.push(item);
          }
        } else {
          flushList();
          paragraphLines.push(line);
        }
      });

      flushParagraph();
      flushList();
      return parsedBlocks;
    });
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const blocks = parseDescription(description ?? '');

  return (
    <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-stack-sm">
      {blocks.map((block, index) => {
        if (block.type === 'list') {
          return (
            <ul className="list-disc pl-6 space-y-1" key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={`paragraph-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
