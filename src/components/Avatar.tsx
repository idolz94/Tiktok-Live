"use client";

export default function Avatar({
  uri,
  username,
  size = 42,
}: {
  uri?: string;
  username: string;
  size?: number;
}) {
  const firstChar = username?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (uri) {
    return (
      <img
        src={uri}
        alt={username}
        className="shrink-0 bg-blue-100 object-cover"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <div
      className="inline-flex shrink-0 items-center justify-center bg-blue-100 font-black text-blue-600"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {firstChar}
    </div>
  );
}
