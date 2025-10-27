export default function menuLabel(text: string) {
  return (
    <span
      style={{
        whiteSpace: "normal",
        display: "inline-block",
        lineHeight: 1.3,
        fontSize: 15,
        fontWeight: 700,
        marginLeft: 5,
      }}
    >
      {text}
    </span>
  );
}

