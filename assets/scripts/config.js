export const siteConfig = {
  siteTitle: "Chenscholar",
  footerText: "© 2025 ChenchunHei. All rights reserved.",
  avatarPath: "/avatar.webp",
  fontPath: "/fonts/ubuntu-sans-mono-medium.woff",
  fontTimeoutMs: 10_000,
  pages: [
    { id: "home", label: "/home", href: "/home/", markdown: "/content/home.md", title: "Home" },
    { id: "contact", label: "/contact", href: "/contact/", markdown: "/content/contact.md", title: "Contact" },
    { id: "status", label: "/status", href: "/status/", markdown: "/content/status.md", title: "Status" },
    { id: "ssh", label: "/ssh", href: "/ssh/", markdown: "/content/ssh.md", title: "SSH" }
  ]
};
