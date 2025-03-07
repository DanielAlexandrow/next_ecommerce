export const styles = {
  scrollArea: 'h-full w-64 bg-white border-r px-3 py-4',
  headerContainer: 'px-3 py-2',
  headerText: 'mb-2 px-4 text-lg font-semibold',
  navigationList: 'space-y-1',
  navigationItem: (isActive: boolean) => `flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:text-gray-900'
  }`,
  navigationIcon: 'h-5 w-5',
  navigationText: 'ml-3',
  overlay: 'fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
};