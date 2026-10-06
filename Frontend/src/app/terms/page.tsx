import { Sidebar } from '@/components/layout/sidebar';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: October 2026
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-400">
            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the NEXUS Analytics platform, you agree
                to be bound by these Terms and Conditions. Use of this platform
                is restricted to authorized institutional personnel with valid
                credentials.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                2. Platform Purpose
              </h2>
              <p>
                NEXUS provides decision support tools for student risk
                analytics, performance monitoring, intervention simulation, and
                resource allocation optimization. All outputs are advisory and
                should be used in conjunction with professional academic
                judgment.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                3. Limitations of Liability
              </h2>
              <p>
                The analytics, simulations, and recommendations provided by
                NEXUS are based on statistical models and should not be
                considered as definitive assessments. The platform providers are
                not liable for decisions made based on platform outputs.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                4. Intellectual Property
              </h2>
              <p>
                All algorithms, interfaces, and analytical methodologies within
                NEXUS are proprietary. Unauthorized reproduction, distribution,
                or reverse engineering is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                5. Modifications
              </h2>
              <p>
                We reserve the right to modify these terms at any time.
                Continued use of the platform after changes constitutes
                acceptance of the revised terms.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
