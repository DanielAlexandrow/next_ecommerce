import { ReactNode } from 'react';
import { styles } from './container.styles';

export default function Container({
    withNoHorizontalPadding = false,
    children,
}: {
    withNoHorizontalPadding?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={styles.container(withNoHorizontalPadding)}>
            {children}
        </div>
    );
}
