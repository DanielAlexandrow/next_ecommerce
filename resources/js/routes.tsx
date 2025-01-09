import DriverCoordinatesPage from '@/pages/Driver/DriverCoordinatesPage';
import FinancePage from '@/pages/Admin/Finance/FinancePage';
// Other imports...

const routes = [
    // Existing routes...
    {
        path: '/driver/coordinates',
        component: DriverCoordinatesPage,
        name: 'DriverCoordinates',
        // Add any necessary route guards or layout wrappers
    },
    {
        path: '/admin/finance',
        element: <FinancePage />,
        name: 'admin.finance',
    },
    // ...
];

export default routes; 