// ============================================
// Login Route — standalone authentication screen (outside _app layout)
// ============================================

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { LogoFull } from "~/components/layout/logo";
import { Lock } from "lucide-react";
import styles from "./login.module.css";

/** Generates floating particle elements for the hero background */
function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 10}s`,
        delay: `${Math.random() * 10}s`,
        size: `${1 + Math.random() * 2}px`,
      })),
    [count]
  );

  return (
    <div className={styles.particles}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

/** Google SSO icon */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="size-[18px]">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Microsoft SSO icon */
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" fill="none" className="size-[18px]">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/** Atlassian SSO icon */
function AtlassianIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="size-[18px]">
      <path
        d="M15.31 11.34l-1.37-1.37a.47.47 0 0 0-.67 0L9 14.24l-4.27-4.27a.47.47 0 0 0-.67 0l-1.37 1.37a.47.47 0 0 0 0 .67l5.97 5.97a.47.47 0 0 0 .67 0l5.97-5.97a.47.47 0 0 0 .01-.67zm0-6.32L13.94 3.65a.47.47 0 0 0-.67 0L9 7.92 4.73 3.65a.47.47 0 0 0-.67 0L2.69 5.02a.47.47 0 0 0 0 .67l5.97 5.97a.47.47 0 0 0 .67 0l5.97-5.97a.47.47 0 0 0 .01-.67z"
        fill="#2684FF"
      />
    </svg>
  );
}

/** Login route — SSO-only authentication screen with hero branding */
export default function LoginRoute() {
  const navigate = useNavigate();

  // Redirect to app on SSO button click (mock behavior)
  const handleSSO = () => {
    navigate("/chat");
  };

  return (
    <div className={styles.loginFrame}>
      {/* LEFT — Hero / Brand */}
      <div className={styles.loginHero}>
        <div className={styles.scanlines} />
        <Particles />

        <div className={styles.heroContent}>
          <LogoFull />
          <div className={styles.heroWordmark}>MEDICI</div>
          <div className={styles.heroTagline}>
            Applied Intelligence for Institutional Finance
          </div>
        </div>

        <div className={styles.heroFooter}>
          <div className={styles.heroFooterText}>
            Medici Intelligence Systems &middot; v2.1
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Panel */}
      <div className={styles.loginAuth}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authTitle}>Sign in</div>
            <div className={styles.authSubtitle}>
              Access your workspace to continue.
            </div>
          </div>

          {/* SSO Providers */}
          <div className={styles.ssoButtons}>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <GoogleIcon />
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <MicrosoftIcon />
              </span>
              Continue with Microsoft
            </button>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <AtlassianIcon />
              </span>
              Continue with Atlassian
            </button>
          </div>

          <div className={styles.authFooter}>
            <div className={styles.authFooterText}>
              Don&apos;t have an account?{" "}
              <a href="#" className={styles.authFooterLink}>
                Request access
              </a>
              <br />
              <a href="#" className={styles.authFooterLink}>
                Terms of Service
              </a>{" "}
              &middot;{" "}
              <a href="#" className={styles.authFooterLink}>
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className={styles.authBadge}>
          <Lock className="size-3" />
          Secured by Clerk
        </div>
      </div>
    </div>
  );
}
