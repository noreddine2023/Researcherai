import Link from 'next/link'
import { ArrowRight, Search, Brain, FolderOpen, Quote, PenTool } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ResearchFlow</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Research
          <br />
          Paper Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform how you work with academic papers. Search 200M+ papers, 
          get AI summaries, organize with smart collections, and write better with AI assistance.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/register" 
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold"
          >
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition border-2 border-gray-200 text-lg font-semibold"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for Research</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search className="w-8 h-8" />}
            title="Smart Search"
            description="Search across 200M+ papers from Semantic Scholar, OpenAlex, and Crossref with natural language queries"
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI Analysis"
            description="Get automatic summaries, extract key findings, methodology, and limitations from any paper"
          />
          <FeatureCard
            icon={<FolderOpen className="w-8 h-8" />}
            title="Smart Organization"
            description="Create collections, build literature matrices, and manage insights with Kanban boards"
          />
          <FeatureCard
            icon={<Quote className="w-8 h-8" />}
            title="Citation Management"
            description="Generate citations in 50+ styles including APA, MLA, Chicago. Export to BibTeX and RIS"
          />
          <FeatureCard
            icon={<PenTool className="w-8 h-8" />}
            title="AI Writing Assistant"
            description="Write with AI assistance, insert citations seamlessly, and export to multiple formats"
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="Research Dashboard"
            description="Track your progress with stats, visualizations, and insights across all your research"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Research?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join researchers who are saving weeks of work with ResearchFlow
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 ResearchFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
