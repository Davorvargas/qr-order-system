#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// Add stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());
class PuppeteerMCPServer {
    server;
    browser = null;
    page = null;
    baseUrl = 'http://localhost:3002';
    constructor() {
        this.server = new Server({
            name: 'mcp-puppeteer-server',
            version: '1.0.0',
        });
        this.setupToolHandlers();
        // Cleanup on exit
        process.on('SIGINT', () => this.cleanup());
        process.on('SIGTERM', () => this.cleanup());
    }
    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteerExtra.launch({
                headless: false, // Set to false to see the browser
                defaultViewport: { width: 1920, height: 1080 },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1920, height: 1080 });
            // Set user agent to avoid detection
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        }
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'screenshot',
                        description: 'Take a screenshot of the current page',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                path: {
                                    type: 'string',
                                    description: 'Path to save the screenshot (optional)',
                                },
                                fullPage: {
                                    type: 'boolean',
                                    description: 'Whether to take a full page screenshot',
                                    default: true,
                                },
                            },
                        },
                    },
                    {
                        name: 'navigate',
                        description: 'Navigate to a specific URL or route',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    description: 'Full URL or relative path to navigate to',
                                },
                            },
                            required: ['url'],
                        },
                    },
                    {
                        name: 'wait_for_element',
                        description: 'Wait for an element to appear on the page',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                selector: {
                                    type: 'string',
                                    description: 'CSS selector to wait for',
                                },
                                timeout: {
                                    type: 'number',
                                    description: 'Timeout in milliseconds',
                                    default: 30000,
                                },
                            },
                            required: ['selector'],
                        },
                    },
                    {
                        name: 'click',
                        description: 'Click on an element',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                selector: {
                                    type: 'string',
                                    description: 'CSS selector of element to click',
                                },
                            },
                            required: ['selector'],
                        },
                    },
                    {
                        name: 'type_text',
                        description: 'Type text into an input field',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                selector: {
                                    type: 'string',
                                    description: 'CSS selector of input field',
                                },
                                text: {
                                    type: 'string',
                                    description: 'Text to type',
                                },
                                clear: {
                                    type: 'boolean',
                                    description: 'Clear field before typing',
                                    default: true,
                                },
                            },
                            required: ['selector', 'text'],
                        },
                    },
                    {
                        name: 'get_page_content',
                        description: 'Get the current page HTML or text content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['html', 'text'],
                                    description: 'Type of content to retrieve',
                                    default: 'html',
                                },
                                selector: {
                                    type: 'string',
                                    description: 'CSS selector to get content from (optional)',
                                },
                            },
                        },
                    },
                    {
                        name: 'go_to_dashboard',
                        description: 'Navigate to the admin dashboard',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'test_dashboard_filters',
                        description: 'Test the dashboard date filters',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filter: {
                                    type: 'string',
                                    enum: ['today', 'yesterday', 'week', 'month', 'custom'],
                                    description: 'Date filter to test',
                                },
                                customFromDate: {
                                    type: 'string',
                                    description: 'Custom from date (YYYY-MM-DD) for custom filter',
                                },
                                customToDate: {
                                    type: 'string',
                                    description: 'Custom to date (YYYY-MM-DD) for custom filter',
                                },
                            },
                            required: ['filter'],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                await this.initBrowser();
                switch (name) {
                    case 'screenshot':
                        return await this.handleScreenshot(args);
                    case 'navigate':
                        return await this.handleNavigate(args);
                    case 'wait_for_element':
                        return await this.handleWaitForElement(args);
                    case 'click':
                        return await this.handleClick(args);
                    case 'type_text':
                        return await this.handleTypeText(args);
                    case 'get_page_content':
                        return await this.handleGetPageContent(args);
                    case 'go_to_dashboard':
                        return await this.handleGoToDashboard(args);
                    case 'test_dashboard_filters':
                        return await this.handleTestDashboardFilters(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    async handleScreenshot(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const path = args.path || `screenshot-${Date.now()}.png`;
        const fullPage = args.fullPage !== false;
        await this.page.screenshot({
            path,
            fullPage,
            type: 'png',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Screenshot saved to: ${path}`,
                },
            ],
        };
    }
    async handleNavigate(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const url = args.url.startsWith('http') ? args.url : `${this.baseUrl}${args.url}`;
        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const currentUrl = this.page.url();
        const title = await this.page.title();
        return {
            content: [
                {
                    type: 'text',
                    text: `Navigated to: ${currentUrl}\nPage title: ${title}`,
                },
            ],
        };
    }
    async handleWaitForElement(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const { selector, timeout = 30000 } = args;
        await this.page.waitForSelector(selector, { timeout });
        return {
            content: [
                {
                    type: 'text',
                    text: `Element found: ${selector}`,
                },
            ],
        };
    }
    async handleClick(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const { selector } = args;
        await this.page.click(selector);
        await this.page.waitForTimeout(1000); // Wait for any animations
        return {
            content: [
                {
                    type: 'text',
                    text: `Clicked element: ${selector}`,
                },
            ],
        };
    }
    async handleTypeText(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const { selector, text, clear = true } = args;
        if (clear) {
            await this.page.click(selector, { clickCount: 3 });
        }
        await this.page.type(selector, text);
        return {
            content: [
                {
                    type: 'text',
                    text: `Typed "${text}" into element: ${selector}`,
                },
            ],
        };
    }
    async handleGetPageContent(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const { type = 'html', selector } = args;
        let content;
        if (selector) {
            const element = await this.page.$(selector);
            if (!element)
                throw new Error(`Element not found: ${selector}`);
            if (type === 'text') {
                content = await element.evaluate(el => el.textContent || '');
            }
            else {
                content = await element.evaluate(el => el.innerHTML);
            }
        }
        else {
            if (type === 'text') {
                content = await this.page.evaluate(() => document.body.textContent || '');
            }
            else {
                content = await this.page.content();
            }
        }
        return {
            content: [
                {
                    type: 'text',
                    text: content,
                },
            ],
        };
    }
    async handleGoToDashboard(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        // Navigate to the dashboard
        await this.page.goto(`${this.baseUrl}/admin/dashboard`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        // Wait for the dashboard to load
        await this.page.waitForSelector('h1', { timeout: 10000 });
        const title = await this.page.title();
        const dashboardHeading = await this.page.$eval('h1', el => el.textContent);
        return {
            content: [
                {
                    type: 'text',
                    text: `Navigated to dashboard\nPage title: ${title}\nDashboard heading: ${dashboardHeading}`,
                },
            ],
        };
    }
    async handleTestDashboardFilters(args) {
        if (!this.page)
            throw new Error('Browser not initialized');
        const { filter, customFromDate, customToDate } = args;
        // First make sure we're on the dashboard
        const currentUrl = this.page.url();
        if (!currentUrl.includes('/admin/dashboard')) {
            await this.handleGoToDashboard({});
        }
        // Wait for the filter dropdown to be available
        await this.page.waitForSelector('select[data-testid="date-filter"], select', { timeout: 10000 });
        // Find and click the date filter dropdown
        const filterSelector = 'select';
        await this.page.select(filterSelector, filter);
        // If custom filter, fill in the date inputs
        if (filter === 'custom') {
            if (!customFromDate || !customToDate) {
                throw new Error('Custom dates required for custom filter');
            }
            await this.page.waitForSelector('input[type="date"]', { timeout: 5000 });
            const dateInputs = await this.page.$$('input[type="date"]');
            if (dateInputs.length >= 2) {
                await dateInputs[0].type(customFromDate);
                await dateInputs[1].type(customToDate);
            }
        }
        // Wait for the dashboard to update
        await this.page.waitForTimeout(2000);
        // Take a screenshot of the result
        const screenshotPath = `dashboard-filter-${filter}-${Date.now()}.png`;
        await this.page.screenshot({
            path: screenshotPath,
            fullPage: true,
            type: 'png',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Dashboard filter "${filter}" tested successfully.\nScreenshot saved to: ${screenshotPath}`,
                },
            ],
        };
    }
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        process.exit(0);
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('MCP Puppeteer Server running on stdio');
    }
}
const server = new PuppeteerMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map