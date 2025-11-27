/***************************************************
 * Next.js config with proxy rewrites to the .NET backend
 * For dev, target http://localhost:5297 so antiforgery cookies work over HTTP
 ***************************************************/

/** @type {import('next').NextConfig} */
const nextConfig = {
 async rewrites() {
 return [
 {
 source: '/backend/:path*',
 destination: 'http://localhost:5297/:path*',
 },
 {
 source: '/chathub',
 destination: 'http://localhost:5297/chathub',
 },
 {
 source: '/notificationhub',
 destination: 'http://localhost:5297/notificationhub',
 },
 ]
 },
}

export default nextConfig
