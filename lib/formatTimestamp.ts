export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const isSameYear = date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return time;
  }

  if (isSameYear) {
    const datePart = date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    return `${datePart}, ${time}`;
  }

  const fullDate = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${fullDate}, ${time}`;
}
