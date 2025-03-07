import { PropsWithChildren, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { styles } from './guest-layout.styles';

interface GuestLayoutProps {
    header?: string | null;
    description?: string | ReactNode | null;
}

export function GuestLayout({ description = null, header = null, children }: PropsWithChildren<GuestLayoutProps>) {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <Card className={styles.card}>
                    <CardHeader className={styles.header}>
                        <div>
                            <CardTitle>{header}</CardTitle>
                            <CardDescription className={styles.description}>{description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
