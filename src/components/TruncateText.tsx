import React from 'react';

interface TruncateTextProps {
  text: string | undefined; // Accepter undefined
  limit: number;
  type?: 'words' | 'characters';
  ellipsis?: string;
  className?: string;
  showTooltip?: boolean;
}

const TruncateText: React.FC<TruncateTextProps> = ({
  text,
  limit,
  type = 'words',
  ellipsis = '...',
  className = '',
  showTooltip = false
}) => {
  // Retourner null si le texte est undefined ou empty
  if (!text) return null;

  let truncatedText = text;
  let isTruncated = false;

  if (type === 'words') {
    const words = text.split(' ');
    if (words.length > limit) {
      truncatedText = words.slice(0, limit).join(' ') + ellipsis;
      isTruncated = true;
    }
  } else {
    if (text.length > limit) {
      truncatedText = text.substring(0, limit) + ellipsis;
      isTruncated = true;
    }
  }

  const content = <span className={className}>{truncatedText}</span>;

  if (showTooltip && isTruncated) {
    return <span title={text}>{content}</span>;
  }

  return content;
};

export default TruncateText;