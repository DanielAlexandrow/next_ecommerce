export const styles = {
  footer: 'bg-gray-800 text-white py-12',
  container: 'container mx-auto px-4',
  grid: 'grid grid-cols-1 md:grid-cols-3 gap-8',
  quickLinks: {
    title: 'text-lg font-semibold mb-4',
    list: 'space-y-2',
    link: 'text-gray-400 hover:text-white transition-colors'
  },
  newsletter: {
    container: {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.4 }
    },
    title: 'text-lg font-semibold mb-4',
    description: 'text-gray-400 mb-4',
    form: 'flex',
    input: 'flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none',
    button: {
      base: 'bg-primary-500 px-4 py-2 rounded-r-md',
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    }
  },
  copyright: {
    container: {
      base: 'mt-8 pt-8 border-t border-gray-700 text-center text-gray-400',
      animation: {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        transition: { duration: 0.5, delay: 0.6 }
      }
    }
  }
};