import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { styles } from './Footer.styles';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className={styles.quickLinks.title}>Quick Links</h3>
                        <ul className={styles.quickLinks.list}>
                            <li>
                                <Link href="/products" className={styles.quickLinks.link}>
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className={styles.quickLinks.link}>
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className={styles.quickLinks.link}>
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className={styles.quickLinks.title}>Company</h3>
                        <ul className={styles.quickLinks.list}>
                            <li>
                                <Link href="/about" className={styles.quickLinks.link}>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className={styles.quickLinks.link}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className={styles.quickLinks.link}>
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={styles.newsletter.container.initial}
                        whileInView={styles.newsletter.container.whileInView}
                        transition={styles.newsletter.container.transition}
                    >
                        <h3 className={styles.newsletter.title}>Newsletter</h3>
                        <p className={styles.newsletter.description}>
                            Subscribe to our newsletter for updates and exclusive offers.
                        </p>
                        <div className={styles.newsletter.form}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={styles.newsletter.input}
                            />
                            <motion.button
                                className={styles.newsletter.button.base}
                                whileHover={styles.newsletter.button.hover}
                                whileTap={styles.newsletter.button.tap}
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className={styles.copyright.container.base}
                    initial={styles.copyright.container.animation.initial}
                    whileInView={styles.copyright.container.animation.whileInView}
                    transition={styles.copyright.container.animation.transition}
                >
                    <p>&copy; 2024 Your Store. All rights reserved.</p>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;