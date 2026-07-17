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

  const colors = [
    "bg-violet-400",
    "bg-pink-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-sky-400",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`${color} rounded-full flex items-center justify-center text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
