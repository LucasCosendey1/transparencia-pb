'use client'

import { useState, useEffect, useRef } from 'react'
import {

  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaUndo, FaRedo,
  FaChevronRight, FaChevronLeft
} from 'react-icons/fa'

export default function AdvancedTextEditor() {
  const [isOpen, setIsOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [manualSize, setManualSize] = useState('')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [])

  if (isAdmin === null || !isAdmin) return null

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const applyFontSize = (size: string) => {
    // execCommand fontSize só aceita 1-7, usamos workaround via span
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (range.collapsed) return
    document.execCommand('fontSize', false, '7')
    const spans = document.querySelectorAll('font[size="7"]')
    spans.forEach(span => {
      (span as HTMLElement).removeAttribute('size');
      (span as HTMLElement).style.fontSize = size
    })
  }

  const fonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
    'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino Linotype',
    'Garamond', 'Book Antiqua', 'Tahoma', 'Lucida Sans', 'Century Gothic',
    'Franklin Gothic Medium', 'Gill Sans', 'Candara', 'Calibri',
    'Segoe UI', 'Optima', 'Futura', 'Baskerville', 'Helvetica',
  ]

  const fontSizes = ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '42px', '48px', '64px', '72px']

  const colors = [
    '#000000', '#1a1a1a', '#333333', '#555555', '#777777',
    '#999999', '#bbbbbb', '#dddddd', '#f5f5f5', '#FFFFFF',
    '#FF0000', '#FF4444', '#FF8800', '#FFAA00', '#FFDD00',
    '#FFFF00', '#AAFF00', '#00FF00', '#00FF88', '#00FFDD',
    '#00FFFF', '#00AAFF', '#0055FF', '#0000FF', '#5500FF',
    '#AA00FF', '#FF00FF', '#FF00AA', '#FF0055', '#FF0022',
    '#8B0000', '#8B4513', '#2E8B57', '#191970', '#4B0082',
    '#800000', '#FF6347', '#FFD700', '#ADFF2F', '#7FFFD4',
  ]

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ opacity: isOpen ? (hovered ? 1 : 0.5) : 1, transition: 'transform 0.3s, opacity 0.3s' }}
      >
        <div className="bg-white shadow-2xl rounded-r-lg border-r-4 border-blue-600 w-80 max-h-[90vh] overflow-y-auto">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h3 className="font-bold text-lg">Editor de Texto</h3>
            <p className="text-xs opacity-90">Selecione o texto para editar</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Desfazer/Refazer */}
            <div className="flex gap-2">
              <button onClick={() => applyFormat('undo')}
                className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center gap-2 text-black font-medium text-sm">
                <FaUndo size={11} /> Desfazer
              </button>
              <button onClick={() => applyFormat('redo')}
                className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center gap-2 text-black font-medium text-sm">
                <FaRedo size={11} /> Refazer
              </button>
            </div>

            {/* Formatação */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">FORMATAÇÃO</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { cmd: 'bold', icon: <FaBold />, title: 'Negrito' },
                  { cmd: 'italic', icon: <FaItalic />, title: 'Itálico' },
                  { cmd: 'underline', icon: <FaUnderline />, title: 'Sublinhado' },
                  { cmd: 'strikeThrough', icon: <FaStrikethrough />, title: 'Tachado' },
                ].map(({ cmd, icon, title }) => (
                  <button key={cmd} onClick={() => applyFormat(cmd)}
                    className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-black" title={title}>
                    <span className="flex justify-center">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonte */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">FONTE</label>
              <select onChange={e => applyFormat('fontName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Selecione uma fonte</option>
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>
            </div>

            {/* Tamanho */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">TAMANHO</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min={6}
                  max={200}
                  value={manualSize}
                  onChange={e => setManualSize(e.target.value)}
                  placeholder="Ex: 18"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center text-sm text-black">px</span>
                <button
                  onClick={() => { if (manualSize) applyFontSize(`${manualSize}px`) }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                >
                  Aplicar
                </button>
              </div>
              <select onChange={e => applyFontSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tamanhos pré-definidos</option>
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Cor do texto */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">COR DO TEXTO</label>
              <div className="grid grid-cols-8 gap-1">
                {colors.map(color => (
                  <button key={color} onClick={() => applyFormat('foreColor', color)}
                    className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="color" onChange={e => applyFormat('foreColor', e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer" title="Cor personalizada" />
                <span className="text-xs text-black flex items-center">Cor personalizada</span>
              </div>
            </div>

            {/* Cor de fundo */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">COR DE FUNDO</label>
              <div className="grid grid-cols-8 gap-1">
                {colors.map(color => (
                  <button key={`bg-${color}`} onClick={() => applyFormat('backColor', color)}
                    className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="color" onChange={e => applyFormat('backColor', e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer" title="Cor personalizada" />
                <span className="text-xs text-black flex items-center">Cor personalizada</span>
              </div>
            </div>

            {/* Alinhamento */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">ALINHAMENTO</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { cmd: 'justifyLeft', icon: <FaAlignLeft />, title: 'Esquerda' },
                  { cmd: 'justifyCenter', icon: <FaAlignCenter />, title: 'Centro' },
                  { cmd: 'justifyRight', icon: <FaAlignRight />, title: 'Direita' },
                ].map(({ cmd, icon, title }) => (
                  <button key={cmd} onClick={() => applyFormat(cmd)}
                    className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-black" title={title}>
                    <span className="flex justify-center">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listas */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-black mb-2 block tracking-wider">LISTAS</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyFormat('insertUnorderedList')}
                  className="p-2 bg-gray-100 hover:bg-blue-100 rounded transition flex items-center justify-center gap-2 text-black text-sm">
                  <FaListUl size={11} /> Marcadores
                </button>
                <button onClick={() => applyFormat('insertOrderedList')}
                  className="p-2 bg-gray-100 hover:bg-blue-100 rounded transition flex items-center justify-center gap-2 text-black text-sm">
                  <FaListOl size={11} /> Numerada
                </button>
              </div>
            </div>

            {/* Link */}
            <div className="border-t pt-3">
              <button onClick={() => { const url = prompt('URL:'); if (url) applyFormat('createLink', url) }}
                className="w-full p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition flex items-center justify-center gap-2 text-sm font-medium">
                <FaLink size={11} /> Inserir Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão toggle — menor quando aberto */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white rounded-r-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'p-2' : 'p-4'
        }`}
        style={{ opacity: isOpen && !hovered ? 0.5 : 1, transition: 'padding 0.3s, opacity 0.3s' }}
        title={isOpen ? 'Fechar editor' : 'Abrir editor'}
      >
        {isOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={20} />}
      </button>
    </>
  )
}