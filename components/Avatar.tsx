export default function Avatar({
  name,
  photoURL,
  size = 36,
}: {
  name: string;
  photoURL?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const palettes = [
    { bg: "var(--terracotta)", fg: "white" },
    { bg: "var(--olive-dark)", fg: "white" },
    { bg: "var(--warm-brown)", fg: "white" },
    { bg: "var(--slate)", fg: "white" },
    { bg: "var(--chocolate)", fg: "white" },
  ];
  const palette = palettes[name.charCodeAt(0) % palettes.length];

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: palette.bg, color: palette.fg }}
    >
      {initials}
    </div>
  );
}
