import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Privacy Policy - RWA Staff Tracker",
  description: "Privacy Policy for Kushal RWA Staff Tracker mobile application",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: February 28, 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Kushal Heights Cooperative Housing Society (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the
              RWA Staff Tracker mobile application (the &quot;App&quot;). This Privacy Policy explains how we
              collect, use, store, and protect your personal information when you use our App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1 Personal Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Name, employee code, and department</li>
              <li>Phone number and email address</li>
              <li>Role and contractor information</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.2 Location Data</h3>
            <p className="text-gray-700 leading-relaxed">
              With your explicit consent, we collect location data (GPS coordinates) during your
              active shift to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Verify check-in and check-out at the campus (geofencing)</li>
              <li>Track patrol routes for security personnel</li>
              <li>Monitor staff presence on campus during shifts</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              Location tracking only occurs during active shifts and requires your explicit consent.
              You can revoke consent at any time from the Profile screen in the App.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.3 Camera and Photos</h3>
            <p className="text-gray-700 leading-relaxed">
              The App uses your device camera for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Check-in selfie verification (optional)</li>
              <li>Task completion photo evidence (before/after cleaning photos)</li>
              <li>QR code scanning for attendance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Manage staff attendance, shifts, and task assignments</li>
              <li>Verify campus presence via geofencing</li>
              <li>Generate reports for society administration</li>
              <li>Ensure campus safety and security</li>
              <li>Communicate work-related information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Data Storage and Security</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>All data is stored securely on encrypted cloud servers (AWS)</li>
              <li>Data transmission uses HTTPS/TLS encryption</li>
              <li>Access to staff data is restricted to authorized society administrators only</li>
              <li>Authentication is handled via JWT tokens stored securely on your device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Location data is automatically deleted after 90 days.</strong> Other personal
              data is retained for the duration of your employment with the society. Upon
              termination of employment, your data will be removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do <strong>not</strong> sell, trade, or share your personal data with third parties.
              Your data is only accessible to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Society administrators and supervisors (for staff management)</li>
              <li>Cloud service provider (AWS) for data hosting only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Grant or revoke location tracking consent</strong> at any time via the App</li>
              <li><strong>Access your data</strong> through the App&apos;s Profile and Reports sections</li>
              <li><strong>Request deletion</strong> of your data by contacting the society office</li>
              <li><strong>Opt out</strong> of optional features like check-in selfies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              This App is not intended for use by individuals under the age of 18. We do not
              knowingly collect personal data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on
              this page with an updated &quot;Last updated&quot; date. Continued use of the App after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact:
            </p>
            <div className="mt-2 text-gray-700">
              <p><strong>Kushal Heights Cooperative Housing Society</strong></p>
              <p>Navi Mumbai, Maharashtra, India</p>
              <p>Email: admin@kushalheights.in</p>
            </div>
          </section>
        </div>

        <hr className="my-8 border-gray-200" />
        <p className="text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Kushal Heights Cooperative Housing Society. All rights reserved.
        </p>
      </div>
    </div>
  );
}
