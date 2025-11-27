/***************************************************
 * Next.js config with proxy rewrites to the .NET backend
 ***************************************************/

/** @type {import('next').NextConfig} */
const nextConfig = {
 async rewrites() {
 return [
 {
 source: '/backend/:path*',
 destination: 'https://localhost:7217/:path*',
 },
 {
 source: '/chathub',
 destination: 'https://localhost:7217/chathub',
 },
 {
 source: '/notificationhub',
 destination: 'https://localhost:7217/notificationhub',
 },
 ]
 },
}

export default nextConfig
