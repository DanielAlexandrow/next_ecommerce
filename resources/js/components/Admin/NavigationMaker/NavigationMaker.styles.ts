export const styles = {
  title: 'text-center',
  buttonContainer: 'flex space-x-4 mb-4',
  headerContainer: 'border rounded-lg p-2 m-1 max-w-[250px]',
  motionHeader: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  },
  headerControls: {
    container: 'flex justify-between items-center p-2',
    input: 'border rounded p-1 w-full mb-2',
    moveButton: 'text-lg hover:border hover:border-white rounded-sm cursor-pointer',
    addButton: 'place-content-center hover:border hover:border-white rounded-sm p-1 cursor-pointer',
    deleteButton: 'place-content-center hover:border hover:border-white rounded-sm p-1 cursor-pointer'
  },
  table: {
    header: 'bg-gray-800 text-white',
    cell: 'p-2'
  }
};