import { Sidebar } from '@/components/layout/sidebar';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: October 2026
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-400">
            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                1. Information We Collect
              </h2>
              <p>
                NEXUS Analytics collects institutional student performance data
                provided by authorized educational institutions. This includes
                academic records, attendance data, LMS engagement metrics, and
                assessment scores. All data is processed in accordance with
                applicable data protection regulations.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                2. How We Use Information
              </h2>
              <p>
                Data is used exclusively for generating risk analytics, success
                scores, student segmentation, intervention simulations, and
                resource optimization reports. No data is sold, shared with
                third parties for marketing purposes, or used beyond the scope
                of institutional decision support.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                3. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including
                encryption at rest and in transit, role-based access controls,
                and regular security audits. Access to student data is
                restricted to authorized institutional personnel only.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                4. Data Retention
              </h2>
              <p>
                Student data is retained for the duration of the institutional
                contract and for a period of 12 months following termination,
                after which all data is securely deleted.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-neutral-200">
                5. Contact
              </h2>
              <p>
                For privacy-related inquiries, contact the institutional data
                protection officer or reach us at privacy@nexus-analytics.edu.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
