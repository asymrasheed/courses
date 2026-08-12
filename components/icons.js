function base(props) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
  };
}

export function IconGrid(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconLayers(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 3.5 8 12 12.5 20.5 8Z" />
      <path d="M3.5 12 12 16.5 20.5 12" />
      <path d="M3.5 16 12 20.5 20.5 16" />
    </svg>
  );
}

export function IconBook(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.2C4 4.3 4.7 4 6 4h5.5v16H6c-1.3 0-2-.3-2-1.2Z" />
      <path d="M20 5.2c0-.9-.7-1.2-2-1.2h-5.5v16H18c1.3 0 2-.3 2-1.2Z" />
    </svg>
  );
}

export function IconHelp(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4c.2-1.2 1.2-2 2.4-2 1.4 0 2.5 1 2.5 2.2 0 1.6-2.1 1.8-2.4 3.4" />
      <circle cx="12" cy="16.6" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg {...base(props)}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15.5 16 20 12l-4.5-4" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V4.8c0-.5.4-.8.9-.8h4.2c.5 0 .9.3.9.8v1.7" />
      <path d="M6.5 6.5 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.5" />
    </svg>
  );
}

export function IconEdit(props) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 4.5 19 9l-9.5 9.5-5 1 1-5Z" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19 19l-4-4" />
    </svg>
  );
}

export function IconArrowRight(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16" />
      <path d="M13 6l7 6-7 6" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base(props)}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}
