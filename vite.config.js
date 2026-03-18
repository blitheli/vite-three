import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { readdirSync } from 'fs'

// 自动发现所有子目录中的 html 文件作为多页面入口
// 新增演示页面只需添加 html + jsx 文件，无需修改此配置
function findHtmlEntries(dir, base = '') {
  const entries = {}
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules' || item.name === 'dist') continue
    const fullPath = resolve(dir, item.name)
    const relPath = base ? `${base}/${item.name}` : item.name
    if (item.isDirectory()) {
      Object.assign(entries, findHtmlEntries(fullPath, relPath))
    } else if (item.name.endsWith('.html')) {
      const name = relPath.replace(/\.html$/, '').replace(/[\\/]/g, '_')
      entries[name] = fullPath
    }
  }
  return entries
}

const htmlEntries = findHtmlEntries(resolve(__dirname))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
})
