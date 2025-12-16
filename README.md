# Focus AI

**Simulate decisions before you ship.**

Focus AI is a decision-simulation engine that lets teams test products, pricing, and messaging using AI-powered focus groups before launch.

---

## 🎬 See It In Action

![Focus AI Demo](./public/demo.gif)

_Watch AI agents debate your product decisions in real-time_

---

## Why Focus AI?

- **Focus groups are slow, expensive, and hard to repeat**
- **Surveys capture opinions, not behavior**
- **Teams only learn what failed AFTER launch**

**Focus AI moves this feedback before decisions are made.**

---

## What Makes This Different

- **Simulates behavior, not just answers** — Agents make tradeoffs like real users
- **Uses multiple AI agents with DIFFERENT psychographics** — Not one generic response
- **Agents DEBATE pricing, features, and tradeoffs** — See the reasoning, not just scores
- **Produces a clear build / fix / kill verdict** — Actionable insights, not data dumps

**This isn't a ChatGPT wrapper. It's a multi-agent decision engine.**

---

## How It Works

1. **Define the decision** (feature, price, message)
2. **Generate synthetic users** that match your target audience
3. **Run a live simulation** where agents react and debate
4. **Get a verdict** and breakdown of risks

![How it works](./public/how-it-works.gif)

---

## Use Cases

### Product & Strategy

- Validate ideas before writing code
- Identify must-have vs nice-to-have features
- Test willingness-to-pay

### Marketing

- Test messaging before campaigns
- Compare multiple ad angles
- Predict sentiment across personas

### Public / Policy _(coming soon)_

- Simulate policy reactions
- Test public messaging
- Identify unintended consequences

---

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript  
**AI:** Gemini 2.0 Flash, multi-agent orchestration  
**Backend:** Custom simulation engine, API routes  
**Infra:** Vercel, Edge Functions  
**DB:** Supabase (PostgreSQL)  
**Analysis:** Conjoint analysis, sentiment scoring, behavioral modeling

---

## Team

**Team of 2:**

- **Aarti** — Full-stack dev, AI orchestration
- **Taran** — Product design, simulation logic

Focused on decision simulation and agentic systems.

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key and Supabase credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
focus-ai/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/
│   │   ├── llm/         # AI orchestration
│   │   ├── simulation/  # Decision engine
│   │   └── analysis/    # Conjoint & pricing analysis
├── prisma/              # Database schema
└── public/              # Static assets
```

---

## Key Features

✅ Multi-agent AI simulation  
✅ Real-time decision debates  
✅ Conjoint analysis for feature prioritization  
✅ Pricing sensitivity testing  
✅ Persona-based behavioral modeling  
✅ Live analytics dashboard  
✅ Export reports (PDF/JSON)

---

## Roadmap

- [ ] Voice input for faster setup
- [ ] Integration with product analytics tools
- [ ] Public policy simulation mode
- [ ] Team collaboration features
- [ ] API for programmatic access

---

## License

MIT

---

## Acknowledgments

Built with ❤️ during WeMakeDevs Hackathon  
Powered by Google Gemini AI

---

**Ready to simulate your next big decision?** [Try Focus AI →](https://focus-ai-wemakedevs.vercel.app)
