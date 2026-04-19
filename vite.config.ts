import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
  const defaultBase =
    isGithubActions && repository ? `/${repository}/` : '/'

  return {
    base: process.env.VITE_BASE_PATH || defaultBase,
    plugins: [react(), tailwindcss()],
  }
})
