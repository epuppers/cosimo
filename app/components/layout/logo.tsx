import styles from "./logo.module.css";

/**
 * LogoMark — small 6-sphere inverted triangle logo for the sidebar.
 *
 * Layout:
 *   ●  ○  ●    row 1: 3 spheres (dark, light, dark)
 *    ●  ●      row 2: 2 spheres (dark, dark)
 *     ●        row 3: 1 sphere  (dark)
 */
export function LogoMark() {
  return (
    <div className={styles.logoMark}>
      <div className={styles.logoSpheres}>
        <div className={`${styles.sphere} ${styles.sphereDark}`} />
        <div className={`${styles.sphere} ${styles.sphereLight}`} />
        <div className={`${styles.sphere} ${styles.sphereDark}`} />
        <div className={`${styles.sphere} ${styles.sphereDark}`} />
        <div className={`${styles.sphere} ${styles.sphereDark}`} />
        <div className={`${styles.sphere} ${styles.sphereDark}`} />
      </div>
    </div>
  );
}

/**
 * LogoFull — large 6-sphere inverted triangle logo for the login page.
 * Same pattern as LogoMark but 36px spheres with glow animation.
 *
 * Layout:
 *   ●  ○  ●    row 1: 3 spheres (dark, light, dark)
 *    ●  ●      row 2: 2 spheres (dark, dark)
 *     ●        row 3: 1 sphere  (dark)
 */
export function LogoFull() {
  return (
    <div className={styles.heroLogoMark}>
      <div className={styles.heroSpheres}>
        <div className={`${styles.heroSphere} ${styles.heroSphereDark}`} />
        <div className={`${styles.heroSphere} ${styles.heroSphereLight}`} />
        <div className={`${styles.heroSphere} ${styles.heroSphereDark}`} />
        <div className={`${styles.heroSphere} ${styles.heroSphereDark}`} />
        <div className={`${styles.heroSphere} ${styles.heroSphereDark}`} />
        <div className={`${styles.heroSphere} ${styles.heroSphereDark}`} />
      </div>
    </div>
  );
}
