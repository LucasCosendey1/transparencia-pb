'use client'

import { useState } from 'react'
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa'

export default function AdvancedTextEditor() {
  const [isOpen, setIsOpen] = useState(false)

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const fonts = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS'
  ]

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px']

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080'
  ]

  return (
    <>
      <div
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-white shadow-2xl rounded-r-lg border-r-4 border-blue-600 w-80 max-h-[90vh] overflow-y-auto">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h3 className="font-bold text-lg">Editor de Texto Avançado</h3>
            <p className="text-xs opacity-90">Selecione o texto na página para editar</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Desfazer/Refazer */}
            <div className="flex gap-2">
              <button
                onClick={() => applyFormat('undo')}
                className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center gap-2 text-gray-800 font-medium"
                title="Desfazer"
              >
                <FaUndo /> Desfazer
              </button>
              <button
                onClick={() => applyFormat('redo')}
                className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center gap-2 text-gray-800 font-medium"
                title="Refazer"
              >
                <FaRedo /> Refazer
              </button>
            </div>

            {/* Formatação de texto */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">FORMATAÇÃO</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => applyFormat('bold')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Negrito"
                >
                  <FaBold className="mx-auto" />
                </button>
                <button
                  onClick={() => applyFormat('italic')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Itálico"
                >
                  <FaItalic className="mx-auto" />
                </button>
                <button
                  onClick={() => applyFormat('underline')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Sublinhado"
                >
                  <FaUnderline className="mx-auto" />
                </button>
                <button
                  onClick={() => applyFormat('strikeThrough')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Tachado"
                >
                  <FaStrikethrough className="mx-auto" />
                </button>
              </div>
            </div>

            {/* Fonte */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">FONTE</label>
              <select
                onChange={(e) => applyFormat('fontName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="text-gray-800">Selecione uma fonte</option>
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }} className="text-gray-800">
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamanho */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">TAMANHO</label>
              <select
                onChange={(e) => applyFormat('fontSize', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="text-gray-800">Selecione o tamanho</option>
                {fontSizes.map(size => (
                  <option key={size} value={size} className="text-gray-800">{size}</option>
                ))}
              </select>
            </div>

            {/* Cor do texto */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">COR DO TEXTO</label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => applyFormat('foreColor', color)}
                    className="w-10 h-10 rounded border-2 border-gray-300 hover:border-blue-500 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Cor de fundo */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">COR DE FUNDO</label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={`bg-${color}`}
                    onClick={() => applyFormat('backColor', color)}
                    className="w-10 h-10 rounded border-2 border-gray-300 hover:border-blue-500 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Alinhamento */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">ALINHAMENTO</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyFormat('justifyLeft')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Alinhar à esquerda"
                >
                  <FaAlignLeft className="mx-auto" />
                </button>
                <button
                  onClick={() => applyFormat('justifyCenter')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Centralizar"
                >
                  <FaAlignCenter className="mx-auto" />
                </button>
                <button
                  onClick={() => applyFormat('justifyRight')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition text-gray-800"
                  title="Alinhar à direita"
                >
                  <FaAlignRight className="mx-auto" />
                </button>
              </div>
            </div>

            {/* Listas */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">LISTAS</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyFormat('insertUnorderedList')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition flex items-center justify-center gap-2 text-gray-800 font-medium"
                  title="Lista com marcadores"
                >
                  <FaListUl /> Marcadores
                </button>
                <button
                  onClick={() => applyFormat('insertOrderedList')}
                  className="p-3 bg-gray-100 hover:bg-blue-100 rounded transition flex items-center justify-center gap-2 text-gray-800 font-medium"
                  title="Lista numerada"
                >
                  <FaListOl /> Numerada
                </button>
              </div>
            </div>

            {/* Link */}
            <div className="border-t pt-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">LINK</label>
              <button
                onClick={() => {
                  const url = prompt('Digite a URL:')
                  if (url) applyFormat('createLink', url)
                }}
                className="w-full p-3 bg-blue-600 text-white hover:bg-blue-700 rounded transition flex items-center justify-center gap-2 font-medium"
              >
                <FaLink /> Inserir Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white p-4 rounded-r-lg shadow-lg hover:bg-blue-700 transition"
        title={isOpen ? 'Fechar editor' : 'Abrir editor'}
      >
        {isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
      </button>
    </>
  )
}