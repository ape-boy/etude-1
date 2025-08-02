const vscode = require('vscode');
const { ApiService } = require('./apiService');
const { GitUtils } = require('./gitUtils');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

let currentReportContent = '';

/**
 * This method is called when your extension is activated
 */
function activate(context) {
    console.log('🚀 AI ChatOps Weekly Report Extension activation started!');
    logger.log('AI ChatOps Weekly Report Extension is now active!');

    try {
        // Initialize services
        const apiService = new ApiService();
        const gitUtils = new GitUtils();
        
        // Register commands
        const commands = [
            vscode.commands.registerCommand('aiChatOps.processWeeklyReport', async () => {
                try {
                    await processWeeklyReport(apiService, gitUtils);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to process weekly report: ${error.message}`);
                }
            }),

            vscode.commands.registerCommand('aiChatOps.refresh', () => {
                console.log('🔄 Refresh command executed');
                vscode.window.showInformationMessage('Weekly Report extension refreshed');
            })
        ];

        // Add all commands to context subscriptions
        commands.forEach((command) => {
            context.subscriptions.push(command);
        });
        
        logger.log('Weekly Report commands registered successfully');
        console.log('🎉 Extension activation completed successfully!');
        
    } catch (error) {
        logger.error('Error activating extension:', error);
        vscode.window.showErrorMessage(`Failed to activate AI ChatOps Weekly Report Extension: ${error.message}`);
    }
}

/**
 * Process Weekly Report (Generate or Apply Feedback)
 */
async function processWeeklyReport(apiService, gitUtils) {
    try {
        // Get user ID from git
        const userId = await gitUtils.getUserId();
        if (!userId) {
            vscode.window.showErrorMessage('Unable to extract user ID from git configuration');
            return;
        }

        let response;
        
        if (currentReportContent) {
            // Ask if user wants to provide feedback or generate new report
            const action = await vscode.window.showQuickPick([
                { label: 'Generate New Report', description: 'Create a fresh weekly report' },
                { label: 'Provide Feedback', description: 'Modify the existing report' }
            ], {
                placeHolder: 'Choose an action'
            });

            if (!action) return;

            if (action.label === 'Provide Feedback') {
                const feedback = await vscode.window.showInputBox({
                    prompt: 'Enter your feedback for the weekly report',
                    placeHolder: 'e.g., Please add more details about the project timeline...',
                    ignoreFocusOut: true
                });

                if (!feedback) return;

                vscode.window.showInformationMessage('Processing feedback...');
                response = await apiService.processWeeklyReport(userId, feedback, currentReportContent);
            } else {
                vscode.window.showInformationMessage('Generating new weekly report...');
                currentReportContent = '';
                response = await apiService.processWeeklyReport(userId);
            }
        } else {
            vscode.window.showInformationMessage('Generating weekly report...');
            response = await apiService.processWeeklyReport(userId);
        }
        
        logger.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
            // API 응답 데이터 구조 확인 및 처리
            let reportContent = '';
            if (typeof response.data === 'string') {
                reportContent = response.data;
            } else if (response.data.message) {
                reportContent = response.data.message;
            } else if (response.data.content) {
                reportContent = response.data.content;
            } else if (response.data.report) {
                reportContent = response.data.report;
            } else {
                logger.error('Unexpected response data structure:', response.data);
                vscode.window.showErrorMessage('보고서 데이터 형식이 올바르지 않습니다.');
                return;
            }
            
            currentReportContent = reportContent;
            
            // Automatically save the report
            try {
                await saveReport();
                vscode.window.showInformationMessage('주간 보고서가 성공적으로 처리되고 저장되었습니다!');
            } catch (saveError) {
                vscode.window.showErrorMessage(`보고서는 생성되었지만 저장에 실패했습니다: ${saveError.message}`);
            }
        } else {
            const errorMsg = response.errorMessage || response.message || 'Unknown error';
            logger.error('Report processing failed:', errorMsg);
            vscode.window.showErrorMessage(`보고서 처리 실패: ${errorMsg}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error processing weekly report: ${error.message}`);
    }
}

/**
 * Save Report to workspace
 */
async function saveReport() {
    if (!currentReportContent) {
        vscode.window.showWarningMessage('No report available to save. Please generate a report first.');
        return;
    }

    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // Create directory if it doesn't exist
        const reportDir = path.join(workspaceFolder.uri.fsPath, 'ai_chatops', 'weekly_reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Generate filename with current date and time
        const now = new Date();
        const dateString = now.toISOString().slice(2, 10).replace(/-/g, '');
        const timeString = now.toISOString().slice(11, 16).replace(/:/g, '');
        const filename = `weekly_report_${dateString}_${timeString}.md`;
        const filePath = path.join(reportDir, filename);

        // Write file
        fs.writeFileSync(filePath, currentReportContent, 'utf8');

        // Open the saved file
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, {
            preview: false,
            viewColumn: vscode.ViewColumn.One
        });

        vscode.window.showInformationMessage(`Report saved as: ${filename}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save report: ${error.message}`);
    }
}

/**
 * This method is called when your extension is deactivated
 */
function deactivate() {
    logger.log('AI ChatOps Weekly Report Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};