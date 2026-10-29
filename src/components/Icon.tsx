const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  headphones: "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zm16 0h-3v6h2a1 1 0 0 0 1-1z",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21a2 2 0 0 1 2-2h13",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  plus: "M12 5v14M5 12h14",
  back: "M15 5l-7 7 7 7",
  play: "M8 5v14l11-7z",
  pause: "M8 5v14M16 5v14",
  prev: "M6 5v14M18 6l-9 6 9 6z",
  next: "M18 5v14M6 6l9 6-9 6z",
  repeat: "M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4",
  volume: "M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6",
  close: "M6 6l12 12M18 6 6 18",
  record: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  stop: "M7 7h10v10H7z",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  course: "M2 9l10-5 10 5-10 5-10-5zM6 11v5c3.5 2.5 8.5 2.5 12 0v-5M22 9v6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
  settings: "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6",
  news: "M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2zM17 9h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3",
} as const;

export type IconName = keyof typeof PATHS;

const FILLED: IconName[] = ["play", "record", "stop"];

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = "size-5" }: IconProps) {
  const isFilled = FILLED.includes(name);
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={isFilled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={isFilled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
