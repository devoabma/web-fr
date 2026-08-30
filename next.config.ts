import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fniwexxypbvxitmmamup.supabase.co',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // O navegador revalida o worker a cada visita, mas alguns CDNs guardam `/sw.js` mesmo assim
        // e o app fica preso numa versão antiga do cache depois de um deploy.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          // Permite o worker controlar a raiz do site mesmo se algum dia ele sair de `/`.
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
