export const styles = {
  nav: 'bg-white shadow-lg',
  container: 'container mx-auto px-4 py-2',
  wrapper: 'flex items-center justify-between',
  brand: {
    container: 'flex items-center',
    text: 'text-xl font-bold text-gray-800 ml-2'
  },
  cartButton: 'relative',
  cartIcon: 'w-6 h-6 text-gray-600',
  cartBadge: 'absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center',
  motionBadge: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 }
  },
  buttonMotion: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 }
  }
};