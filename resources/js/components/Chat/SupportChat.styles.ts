export const styles = {
    container: 'fixed bottom-4 right-4 z-50',
    chatButton: 'bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors',
    chatWindow: 'bg-white rounded-lg shadow-xl w-96 h-[32rem] flex flex-col',
    header: {
        container: 'p-4 border-b flex justify-between items-center',
        title: 'font-semibold',
        status: (isOnline: boolean) => `w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`
    },
    messageContainer: 'flex-1 overflow-y-auto p-4 space-y-4',
    message: {
        container: (isAgent: boolean) => `flex ${isAgent ? 'justify-start' : 'justify-end'}`,
        bubble: (isAgent: boolean) => `rounded-lg p-3 max-w-[70%] ${
            isAgent ? 'bg-gray-100' : 'bg-blue-500 text-white'
        }`,
        text: 'text-sm'
    },
    inputContainer: 'border-t p-4 flex gap-2',
    input: 'flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
    sendButton: 'bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2'
};