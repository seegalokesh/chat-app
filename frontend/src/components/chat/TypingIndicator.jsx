export default function TypingIndicator({ typing }) {
  const names = Object.values(typing);
  if (names.length === 0) return null;

  const text = names.length === 1
    ? `${names[0]} is typing…`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing…`
    : 'Several people are typing…';

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span /><span /><span />
      </span>
      <span className="typing-text">{text}</span>
    </div>
  );
}