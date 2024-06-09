/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    async redirects() {
        return [
            {
            source: '/work',
            destination: '/',
            permanent: true,
            },
        ];
    },
};

export default nextConfig;