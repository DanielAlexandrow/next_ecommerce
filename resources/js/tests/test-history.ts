export interface TestResult {
    testName: string;
    status: 'passed' | 'failed';
    error?: string;
    timestamp: number;
}

let testHistory: TestResult[] = [];

export const initTestHistory = () => {
    testHistory = [];
};

export const addTestResult = (result: TestResult) => {
    testHistory.push(result);
};

export const getTestHistory = () => {
    return [...testHistory];
};

export const clearTestHistory = () => {
    testHistory = [];
};
