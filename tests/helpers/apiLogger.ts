import fs from 'fs';
import path from 'path';

export class ApiLogger {
    private static logDir = 'tests/logs';
    private static logFile = 'api_logs.md';

    static async logApiCall(
        endpoint: string,
        method: string,
        request: any,
        response: any,
        statusCode: number
    ) {
        const timestamp = new Date().toISOString();
        const logEntry = `
## API Call - ${timestamp}
### ${method} ${endpoint}

**Request:**
\`\`\`json
${JSON.stringify(request, null, 2)}
\`\`\`

**Response:** (Status: ${statusCode})
\`\`\`json
${JSON.stringify(response, null, 2)}
\`\`\`

---
`;

        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        // Append to log file
        fs.appendFileSync(
            path.join(this.logDir, this.logFile),
            logEntry
        );
    }

    static clearLogs() {
        if (fs.existsSync(path.join(this.logDir, this.logFile))) {
            fs.writeFileSync(path.join(this.logDir, this.logFile), '# API Test Logs\n');
        }
    }
} 