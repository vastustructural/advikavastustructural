/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://www.advikavastu.com',
    generateRobotsTxt: true,
    exclude: ['/admin', '/admin/*', '/api/*', '/thank-you', '/thank-you/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: '*',
                disallow: ['/admin', '/admin/*', '/api/*', '/thank-you', '/thank-you/*'],
            },
        ],
    },
};
