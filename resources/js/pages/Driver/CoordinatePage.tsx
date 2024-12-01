import React from 'react';
import CoordinateForm from '@/components/Driver/CoordinateForm';
import { AdminLayout } from '@/layouts/app-layout';

const CoordinatePage: React.FC = () => {
    return (
        <div className="p-4">
            <CoordinateForm />
        </div>
    );
};

CoordinatePage.layout = (page: any) => <AdminLayout children={page} />;

export default CoordinatePage; 