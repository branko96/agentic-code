export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold text-center">
            Next.js + NestJS Boilerplate
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400">
            Full-stack monorepo with AI agents, testing, and automation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-3xl">
            <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Frontend</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Next.js 14 with App Router, TypeScript, and Tailwind CSS
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Backend</h2>
              <p className="text-gray-600 dark:text-gray-400">
                NestJS with MongoDB, Mongoose, and TypeScript
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Testing</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Playwright E2E testing with full automation
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
              <h2 className="text-xl font-semibold mb-2">AI Agents</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Specialized agents for development, testing, and code review
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
