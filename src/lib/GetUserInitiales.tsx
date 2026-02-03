export function getUserInitials(user?: {
  name?: string;
  userName?: string;
  email?: string;
}): string {
  if (!user) return "?";

  // 1️⃣ Construire un nom complet prioritairement
  const full =
    `${user.name ?? ""} ${user.userName ?? ""}`.trim() ||
    user.email?.split("@")[0] ||
    "";

  if (!full) return "?";

  // 2️⃣ Nettoyer et découper
  const parts = full
    .normalize("NFD") // enlève les accents
    .replace(/[\u0300-\u036f]/g, "")
    .split(" ")
    .filter(Boolean);

  let initials = "";

  if (parts.length >= 2) {
    initials = parts[0][0] + parts[1][0];
  } else {
    initials = parts[0].slice(0, 2);
  }

  return initials.toUpperCase();
}
