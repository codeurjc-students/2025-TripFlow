import styles from "@styles/components/shared/Footer.module.css";
import { NavLink } from "react-router";

import { GithubIcon, LinkedinIcon } from "lucide-react";

import Button from "@components/shared/Button";
import Divider from "@components/shared/Divider";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.left}>
                    <Button style={["inline"]} label="TripFlow" to="/" />
                    <p className={styles.description}>
                        TripFlow es un planificador de viajes inteligente para crear itinerarios personalizados y optimizar rutas.
                    </p>
                </div>
                <div className={styles.right}>
                    <span className={styles.author}>
                        Creado por <span className={styles.authorName}>CuB1z</span>
                    </span>
                    <div className={styles.socials}>
                        <Button
                            style={["tool"]}
                            to="https://github.com/CuB1z"
                            target="_blank"
                            rel="noopener noreferrer"
                            ariaLabel="Check out CuB1z on GitHub"
                        ><GithubIcon /></Button>
                        <Button
                            style={["tool"]}
                            to="https://www.linkedin.com/in/cub1z/"
                            target="_blank"
                            rel="noopener noreferrer"
                            ariaLabel="Check out CuB1z on LinkedIn"
                        ><LinkedinIcon /></Button>
                    </div>
                </div>
            </div>
            <Divider maxWidth="100%" />
            <div className={styles.footer_bottom}>
                <p className={styles.copyright}>
                    ©2026 TripFlow.
                    <br />
                    Todos los derechos reservados.
                </p>
                <nav className={styles.legalLinks} aria-label="Enlaces legales">
                    <NavLink to="/help" className={styles.legalLink}>Ayuda</NavLink>
                    <span className={styles.separator}>•</span>
                    <NavLink to="/privacy" className={styles.legalLink}>Privacidad</NavLink>
                </nav>
            </div>
        </footer>
    );
}
