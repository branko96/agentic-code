const withNextIntl = require('next-intl/plugin')('./src/i18n/get-messages.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withNextIntl(nextConfig);
