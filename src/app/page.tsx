'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Target, TrendingUp, MessageSquare, Shield, CheckCircle2, Rocket, Brain } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-white selection:text-black">
      <nav className="glass border-b-0 sticky top-0 z-50 backdrop-blur-2xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link className="flex items-center gap-2 font-bold text-xl tracking-tight" href="#">
            <img src="/logo.svg" alt="FocusAI Logo" className="h-48 w-auto invert" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/new">
              <Button className="bg-white text-black hover:bg-neutral-200 rounded-none h-10 px-6 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-40">
          <div className="container mx-auto px-4 text-center max-w-7xl">
            <div className="inline-block mb-6 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-mono">
              Consultancy-grade insights - No consultants needed
            </div>
            
            <h1 className="text-7xl md:text-9xl font-serif tracking-tight mb-10 leading-[0.95]">
              Test Decisions<br />
              <span className="font-serif font-bold italic">Before Launch</span>
            </h1>

            <p className="text-2xl md:text-3xl text-neutral-200 max-w-4xl mx-auto mb-16 leading-relaxed">
              Behavioral simulation, not surveys people lie on.<br />
              Built for founders, product teams, marketers, and policy makers.
            </p>

            <Link href="/dashboard/new">
              <Button className="h-16 px-12 text-xl bg-white text-black hover:bg-neutral-200 rounded-none font-bold shadow-2xl hover:shadow-white/20 transition-all">
                Start Focus Group Simulation
              </Button>
            </Link>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 mt-24">
              <img
                src="/dashboard-preview.png"
                alt="Focus Group Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                What Makes Us Different
              </h2>
              <p className="text-xl text-neutral-400">Stop guessing. Start testing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-6 rounded-xl shadow-lg">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Consultancy-grade insights</h3>
                <p className="text-neutral-300 text-lg leading-relaxed">Without the consultants. Strategic analysis at 1/100th the cost.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-6 rounded-xl shadow-lg">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Behavioral simulation</h3>
                <p className="text-neutral-300 text-lg leading-relaxed">Not surveys people lie on. Real decision-making under constraints.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-6 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Test before launch</h3>
                <p className="text-neutral-300 text-lg leading-relaxed">Validate decisions before money, time, or reputation is spent.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-6 rounded-xl shadow-lg">
                  <Rocket className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Built for teams</h3>
                <p className="text-neutral-300 text-lg leading-relaxed">Founders, product teams, marketers, and policy makers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20 bg-gradient-to-b from-transparent to-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                How It Works
              </h2>
              <p className="text-2xl text-neutral-400">(Simple, No BS)</p>
            </div>
            
            <div className="space-y-6">
              <div className="glass p-10 rounded-2xl flex gap-8 glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">Define the decision</h3>
                  <p className="text-neutral-300 text-xl leading-relaxed">Product idea, feature, price, message, campaign, or policy.</p>
                </div>
              </div>

              <div className="glass p-10 rounded-2xl flex gap-8 glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">Simulate your real audience</h3>
                  <p className="text-neutral-300 text-xl leading-relaxed">Focus AI generates synthetic users that behave like your target market.</p>
                </div>
              </div>

              <div className="glass p-10 rounded-2xl flex gap-8 glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">Watch the reactions live</h3>
                  <p className="text-neutral-300 text-xl leading-relaxed">See how people actually respond, argue, and decide.</p>
                </div>
              </div>

              <div className="glass p-10 rounded-2xl flex gap-8 glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">Get a clear verdict</h3>
                  <p className="text-neutral-300 text-xl leading-relaxed">What works. What fails. What to fix. What to kill.</p>
                </div>
              </div>

              <div className="glass p-10 rounded-2xl flex gap-8 glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">Launch with confidence</h3>
                  <p className="text-neutral-300 text-xl leading-relaxed">You have already seen it work in simulation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                Use Cases
              </h2>
              <p className="text-xl text-neutral-400">Pressure-test any decision where human reaction matters</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-8 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Product and Strategy</h3>
                <ul className="space-y-4 text-neutral-300 text-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Validate product ideas before writing code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Identify must-have vs nice-to-have features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Find pricing people will actually pay</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Benchmark against competitors</span>
                  </li>
                </ul>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-8 rounded-xl shadow-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Brand and Marketing</h3>
                <ul className="space-y-4 text-neutral-300 text-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Test messaging and value propositions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Simulate campaign performance before launch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Measure emotional response to branding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Discover real customer motivations</span>
                  </li>
                </ul>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <div className="h-16 w-16 bg-gradient-to-br from-white to-neutral-300 text-black flex items-center justify-center mb-8 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Public Sector and Advocacy</h3>
                <ul className="space-y-4 text-neutral-300 text-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Test policy framing before announcements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Simulate public and voter reactions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Pressure-test crisis or PR statements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-white" />
                    <span>Reduce backlash and reputational risk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20 bg-gradient-to-b from-white/5 to-transparent">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                How We Compare
              </h2>
              <p className="text-xl text-neutral-400">Minutes, not months. Insights, not guesses.</p>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden border-2 border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-white/20 bg-white/5">
                      <th className="text-left p-8 font-bold text-xl"></th>
                      <th className="text-center p-8 font-bold text-lg text-neutral-400">Traditional Focus Groups</th>
                      <th className="text-center p-8 font-bold text-lg text-neutral-400">Surveys and A/B Tests</th>
                      <th className="text-center p-8 font-bold text-xl bg-white/10">Focus AI</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-300 text-lg">
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Time to insight</td>
                      <td className="text-center p-8">Weeks to months</td>
                      <td className="text-center p-8">Days to weeks</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">Minutes</td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Cost</td>
                      <td className="text-center p-8">$$$$</td>
                      <td className="text-center p-8">$$$</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">$$</td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Scalability</td>
                      <td className="text-center p-8">Low</td>
                      <td className="text-center p-8">Medium</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">High</td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Behavioral realism</td>
                      <td className="text-center p-8">Medium</td>
                      <td className="text-center p-8">Low</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">High</td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Pre-launch decisions</td>
                      <td className="text-center p-8">Limited</td>
                      <td className="text-center p-8">Weak</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">Core use case</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold text-white">Iteration speed</td>
                      <td className="text-center p-8">Slow</td>
                      <td className="text-center p-8">Slow</td>
                      <td className="text-center p-8 bg-white/5 text-white font-bold text-xl">Instant</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                FAQs
              </h2>
              <p className="text-xl text-neutral-400">Everything you need to know</p>
            </div>
            
            <div className="space-y-6">
              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-bold mb-4">Is this replacing real users?</h3>
                <p className="text-neutral-300 text-xl leading-relaxed">No. It replaces guessing. Focus AI reduces risk early, before you spend on real-world tests, builds, or campaigns.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-bold mb-4">How accurate is it?</h3>
                <p className="text-neutral-300 text-xl leading-relaxed">We surface strong behavioral signals early so bad ideas die cheap and good ones get reinforced.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-bold mb-4">Is this just ChatGPT personas?</h3>
                <p className="text-neutral-300 text-xl leading-relaxed">No. Focus AI simulates decision-making under constraints like pricing tradeoffs, confusion, and competition.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-bold mb-4">Who is this for?</h3>
                <p className="text-neutral-300 text-xl leading-relaxed">Anyone making decisions where human reaction determines success: founders, PMs, marketers, consultants, and policy teams.</p>
              </div>

              <div className="glass p-10 rounded-2xl glass-hover border-2 border-white/10 hover:border-white/30 transition-all">
                <h3 className="text-2xl font-bold mb-4">Why not surveys or interviews?</h3>
                <p className="text-neutral-300 text-xl leading-relaxed">People say one thing and do another. Focus AI shows you how decisions actually play out.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t-2 border-white/20 bg-gradient-to-b from-white/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-8">
              Ready to stop guessing?
            </h2>
            <p className="text-2xl text-neutral-300 mb-12 max-w-2xl mx-auto">
              Test your next big decision in minutes, not months.
            </p>
            <Link href="/dashboard/new">
              <Button className="h-16 px-12 text-xl bg-white text-black hover:bg-neutral-200 rounded-none font-bold shadow-2xl hover:shadow-white/20 transition-all">
                Start Your First Focus Group
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t-2 border-white/20">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>2025 FocusAI Inc.</p>
          <nav className="flex gap-6">
            <Link className="hover:text-white transition-colors" href="#">Terms</Link>
            <Link className="hover:text-white transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-white transition-colors" href="#">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
