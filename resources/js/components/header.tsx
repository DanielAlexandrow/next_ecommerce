import { ReactNode } from 'react';
import { styles } from './header.styles';

export default function Header({ title, description }: { title: string; description: ReactNode }) {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
        </div>
    );
}
