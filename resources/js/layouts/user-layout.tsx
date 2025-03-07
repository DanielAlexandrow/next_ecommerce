import React, { PropsWithChildren } from 'react';
import { Aside } from '@/layouts/partials/aside/aside';
import { Head } from '@inertiajs/react';
import ResponsiveNavbar from '@/layouts/partials/responsive-navbar';
import { styles } from './user-layout.styles';
import { cn } from '@/lib/utils';

interface Props {
    title?: string;
}

export function UserLayout({ title, children }: PropsWithChildren<Props>) {
    return (
        <div>
            <ResponsiveNavbar />
            <Head title={title} />
            <div className={styles.container.flex}>
                <Aside />
                <main className={styles.main}>
                    <div className={cn(styles.content.default, styles.content.sm)}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
