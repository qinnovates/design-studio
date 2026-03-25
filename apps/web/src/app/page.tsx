import Link from 'next/link';

const templates = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Hero section, features, pricing, and footer',
    category: 'Marketing',
    thumbnail: null,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Sidebar navigation, charts, and data tables',
    category: 'App',
    thumbnail: null,
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Tab bar, cards, and list views',
    category: 'Mobile',
    thumbnail: null,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Project gallery, about section, and contact form',
    category: 'Personal',
    thumbnail: null,
  },
  {
    id: 'e-commerce',
    name: 'E-Commerce',
    description: 'Product grid, cart, and checkout flow',
    category: 'Commerce',
    thumbnail: null,
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Article layout, sidebar, and newsletter signup',
    category: 'Content',
    thumbnail: null,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg" />
          <h1 className="text-xl font-semibold">Design Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm text-gray-500 hover:text-gray-700">Sign In</button>
          <button className="text-sm bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:opacity-90">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-8 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-4">
          Design apps without design skills
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          Pick a template, customize with AI, export real code. Open source. Bring your own AI.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90">
            Start from Template
          </button>
          <button className="border px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
            Blank Canvas
          </button>
        </div>
      </section>

      {/* Template Gallery */}
      <section className="px-8 pb-16 max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-6">Start from a template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/editor/${template.id}`}
              className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{template.category}</span>
              </div>
              <div className="p-4">
                <h4 className="font-medium group-hover:text-[var(--accent)] transition-colors">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
