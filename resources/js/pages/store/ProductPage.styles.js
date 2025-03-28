 export const styles = {
  container: "container mx-auto px-4 py-8",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-8",
  content: {
    wrapper: "flex flex-col gap-6",
    header: {
      container: "space-y-2",
      title: "text-3xl font-bold",
      description: "text-gray-600"
    },
    details: {
      container: "space-y-6",
      section: "space-y-2",
      label: "text-sm font-medium text-gray-700"
    },
    price: {
      amount: "text-2xl font-bold"
    },
    addToCart: {
      button: "w-full mt-4"
    }
  }
};