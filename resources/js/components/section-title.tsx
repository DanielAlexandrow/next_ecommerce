import React, { ReactNode } from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { styles } from './section-title.styles';

interface Props {
    className?: string;
    title: ReactNode;
    description: ReactNode;
}

export default function SectionTitle({ className, title, description }: Props) {
    return (
        <CardHeader className={className}>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
    );
}
