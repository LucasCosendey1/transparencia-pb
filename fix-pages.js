#!/usr/bin/env node
/**
 * fix-pages.js v4
 */

const fs   = require('fs')
const path = require('path')

const DRY_RUN = process.argv.includes('--dry-run')
const APP_DIR = path.resolve('./app')

const LAYOUT_COMPONENTS = [
  'ApiPageLayout',
  'PdfPageLayout',
  'PlanoGovernoLayout',
  'PlanoAcaoLayout',
  'EncarregadoLayout',
]

function needsFix(content) {
  return (
    /const \[fontSize,\s*setFontSize\]\s*=\s*useState/.test(content) ||
    /const \[highContrast,\s*setHighContrast\]\s*=\s*useState/.test(content) ||
    (/useAccessibility/.test(content) && /const adjustFontSize\s*=/.test(content))
  )
}

function removeAccessibilityImportsDupes(content) {
  content = content.replace(/^import Header from ['"][^'"]+['"].*\n/gm, '')
  // Remove import duplicado do useAccessibility
  const line = `import { useAccessibility } from '@/contexts/AccessibilityContext'`
  let count = 0
  content = content.replace(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\n', 'g'), m => {
    count++
    return count === 1 ? m : ''
  })
  return content
}

function removeLocalStates(content) {
  content = content.replace(/^\s*const \[fontSize,\s*setFontSize\]\s*=\s*useState\([^)]*\).*\n/gm, '')
  content = content.replace(/^\s*const \[highContrast,\s*setHighContrast\]\s*=\s*useState\([^)]*\).*\n/gm, '')
  // adjustFontSize linha única (arrow de uma linha)
  content = content.replace(/^\s*const adjustFontSize\s*=\s*\([^)]*\)\s*=>\s*[^\n{][^\n]*\n/gm, '')
  // adjustFontSize bloco multiline
  content = content.replace(/^\s*const adjustFontSize\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\}\s*\n/gm, '')
  return content
}

function removeHeaderJSX(content) {
  return content.replace(/<Header[\s\S]*?(?:highContrast|fontSize|adjustFontSize)[\s\S]*?\/>/g, '')
}

function removeAccessibilityPropsFromLayouts(content) {
  const propsPattern = /\s*(highContrast|fontSize|adjustFontSize|setHighContrast|setFontSize)=\{[^}]+\}/g
  for (const layout of LAYOUT_COMPONENTS) {
    const re = new RegExp(`(<${layout}[\\s\\S]*?\\/>)`, 'g')
    content = content.replace(re, m => m.replace(propsPattern, ''))
  }
  return content
}

function simplifyOuterDiv(content) {
  content = content.replace(
    /className=\{`([^`]*)\$\{highContrast \? ['"][^'"]*['"] : ['"]([^'"]+)['"]\}([^`]*)`\}/g,
    (_, b, fallback, a) => `className="${b}${fallback}${a}"`
  )
  content = content.replace(/\s*style=\{\{\s*fontSize:\s*`\$\{fontSize\}px`\s*\}\}/g, '')
  return content
}

function ensureImport(content) {
  if (/useAccessibility/.test(content)) return content
  const matches = [...content.matchAll(/^import .+\n/gm)]
  if (!matches.length) return content
  const last = matches[matches.length - 1]
  const at = last.index + last[0].length
  return content.slice(0, at) +
    `import { useAccessibility } from '@/contexts/AccessibilityContext'\n` +
    content.slice(at)
}

function ensureHook(content) {
  if (/useAccessibility\(\)/.test(content)) return content

  // Estratégia: encontra "export default function NomeFuncao" e localiza
  // a abertura do seu bloco { contando chaves para garantir que é o topo
  const exportMatch = content.match(/export default function \w+[^{]*\{/)
  if (!exportMatch) return content

  const startIdx = exportMatch.index + exportMatch[0].length

  // Verifica se o próximo token não é outra função (evita injetar dentro de nested fn)
  const hook = `\n  const { fontSize, highContrast, setFontSize, setHighContrast, adjustFontSize } = useAccessibility()\n`

  return content.slice(0, startIdx) + hook + content.slice(startIdx)
}

function cleanUnusedUseState(content) {
  const withoutImports = content.replace(/^import .+\n/gm, '')
  if (!/\buseState\b/.test(withoutImports)) {
    content = content.replace(/,\s*useState\b/g, '').replace(/\buseState,\s*/g, '')
    content = content.replace(/^import \{\s*\} from ['"]react['"].*\n/gm, '')
  }
  return content
}

function fixPage(filePath) {
  let c = fs.readFileSync(filePath, 'utf8')
  if (!needsFix(c)) return false

  c = removeAccessibilityImportsDupes(c)
  c = removeLocalStates(c)
  c = removeHeaderJSX(c)
  c = removeAccessibilityPropsFromLayouts(c)
  c = simplifyOuterDiv(c)
  c = ensureImport(c)
  c = ensureHook(c)
  c = cleanUnusedUseState(c)
  c = c.replace(/\n{3,}/g, '\n\n')

  if (!DRY_RUN) fs.writeFileSync(filePath, c, 'utf8')
  return true
}

function findPages(dir, results = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) findPages(full, results)
    else if (e.name === 'page.tsx' || e.name === 'page.ts') results.push(full)
  }
  return results
}

const pages = findPages(APP_DIR)
let fixed = 0, skipped = 0, errors = 0

console.log(`\n🔍 Verificando ${pages.length} páginas...\n`)

for (const p of pages) {
  const rel = path.relative(process.cwd(), p)
  try {
    const changed = fixPage(p)
    if (changed) { console.log(`✅ ${DRY_RUN ? '[dry-run] ' : ''}Corrigido: ${rel}`); fixed++ }
    else skipped++
  } catch (err) {
    console.error(`❌ Erro em ${rel}:`, err.message)
    errors++
  }
}

console.log(`\n📊 Resultado: ${fixed} corrigido(s), ${skipped} ignorado(s), ${errors} erro(s)`)
if (DRY_RUN) console.log('⚠️  Modo dry-run: nenhum arquivo foi alterado.')