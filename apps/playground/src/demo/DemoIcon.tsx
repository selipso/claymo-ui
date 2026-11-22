const paths = {
  menu: "M4 6h16M4 12h16M4 18h16",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  settings: "M4 7h7m4 0h5M4 17h3m4 0h9M11 5v4m4-4v4M7 15v4m4-4v4",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-7h10v7",
  trash: "M3 6h18M8 6V3h8v3m3 0-1 15H6L5 6m5 4v7m4-7v7",
  plus: "M12 5v14M5 12h14",
  download: "M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5",
  send: "m3 3 19 9-19 9 4-9-4-9Zm4 9h15",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  search: "M21 21l-4.3-4.3m2.3-5.7a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z",
} as const;

export function DemoIcon(props: { name: keyof typeof paths; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d={paths[props.name]} />
    </svg>
  );
}
