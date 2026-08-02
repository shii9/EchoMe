# EchoMe

AI-powered phishing detection and cybersecurity analysis in your browser.

[View Repository](https://github.com/shii9/EchoMe) · GitHub Pages deployment is configured for [shii9.github.io/EchoMe](https://shii9.github.io/EchoMe/)

EchoMe helps users inspect suspicious emails, URLs, domains, IP addresses, and files. It combines deterministic threat signals with clear explanations, heat maps, recommendations, and learning tools so security decisions are easier to understand.

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Security and Privacy](#security-and-privacy)
- [Development](#development)
- [Deployment](#deployment)
- [Disclaimer](#disclaimer)

## About the Project

Phishing messages often combine urgency, impersonation, suspicious links, and requests for sensitive information. EchoMe analyzes these signals consistently and presents the result as a practical risk assessment rather than a simple yes/no answer.

The application is designed for education, personal safety checks, and security awareness. It does not replace professional incident response or reputation services.

## Key Features

- Email phishing analysis with threat scoring and categorized findings.
- URL, domain, IP address, file, and screenshot analysis.
- Interactive threat heat maps with risk explanations.
- SPF, DKIM, and DMARC header inspection.
- Suspicious URL highlighting and brand-impersonation detection.
- Security recommendations tailored to detected signals.
- Analysis history, statistics, trends, PDF/JSON/CSV exports, and sharing.
- Dark and light themes with a responsive professional interface.
- Security quizzes, achievements, and educational blog content.
- Local fallback guidance when the optional secure AI backend is unavailable.

## Technology Stack

- React 18 and TypeScript
- Vite 8
- React Router
- Tailwind CSS and Radix UI primitives
- Lucide icons and Framer Motion
- Supabase Edge Functions for optional protected AI requests
- GitHub Pages for static deployment

## Security and Privacy

- Analysis history and preferences are stored locally in the browser.
- API keys are not persisted by the client.
- The admin/blog administration surface has been removed from the client.
- The AI Edge Function validates payload size, message roles, CORS origins, and request rate.
- Provider secrets belong in server-side environment variables, never in `VITE_*` variables.
- Review [SECURITY.md](SECURITY.md) before enabling production integrations.

## Development

Requirements: Node.js 20.19.0 or newer.

```bash
npm ci
npm run dev
```

The development server runs at `http://localhost:8080`.

Useful verification commands:

```bash
npm run test:phishing
npx tsc --noEmit
npm run build
```

## Deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that builds the app and publishes the `gh-pages` branch.

To enable the live site:

1. Open the repository's **Settings → Pages**.
2. Set the source to **Deploy from a branch**.
3. Select the `gh-pages` branch and the `/ (root)` folder.

Manual deployment is also available:

```bash
npm run deploy
```

## Disclaimer

EchoMe is intended for authorized security awareness, education, and defensive analysis. Do not use it to access, test, or investigate systems without permission. Users are responsible for complying with applicable laws, policies, and terms of service.

## License

See the repository for licensing information.
