export function nextAnnouncementIndex(current: number, count: number) {
  if (count <= 1) return 0;
  return (current + 1) % count;
}
