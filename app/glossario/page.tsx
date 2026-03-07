'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

export default function GlossarioPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-gray-50'}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <Header 
        highContrast={highContrast}
        fontSize={fontSize}
        adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast}
        setFontSize={setFontSize}
      />

      {/* Breadcrumb */}
      <div className={`${highContrast ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Glossário</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Título */}
          <h1 className={`text-4xl font-bold mb-6 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Glossário
          </h1>

          {/* Descrição */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Para auxiliar a navegação e o entendimento das informações presentes no Portal da Transparência da Prefeitura Municipal de Itabaiana-PB, este glossário explica os principais termos técnicos utilizados na administração pública.
            </p>
          </div>

          {/* Seção A-D */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b-2 ${highContrast ? 'text-yellow-300 border-yellow-300' : 'text-blue-600 border-blue-600'}`}>
              A – D
            </h2>
            
            <dl className="space-y-4">
              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Accountability:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Termo em inglês que se refere ao conjunto de mecanismos pelos quais os gestores públicos prestam contas de seus atos, respondem por suas decisões e são responsabilizados por elas. A transparência é um pilar da accountability.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Aditivo (ou Termo Aditivo):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Instrumento utilizado para formalizar alterações em um contrato já existente, como mudança de prazo, valor ou objeto, desde que previsto em lei e no edital de licitação.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Alienação de Bens:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Toda transferência de propriedade de bens ou direitos do município para terceiros, realizada de forma onerosa (venda) ou gratuita (doação), geralmente mediante autorização legislativa e processo licitatório.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Arrecadação:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  O ato de recolher aos cofres públicos os tributos (impostos, taxas e contribuições) e outras receitas devidas ao município.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Contrato Administrativo:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Acordo firmado entre a Prefeitura e um particular (pessoa física ou jurídica) para a prestação de um serviço, execução de uma obra, fornecimento de um bem ou outra finalidade de interesse público, seguindo as normas da Lei de Licitações.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Crédito Adicional:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Autorização para a realização de despesas não previstas ou insuficientemente dotadas na Lei Orçamentária Anual (LOA). Pode ser Suplementar, Especial ou Extraordinário.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Despesa Corrente:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Gastos de manutenção dos serviços públicos, como salários de servidores, contas de água e luz, compra de material de consumo e outros custeios que não resultam em um aumento do patrimônio do município.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Despesa de Capital:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Gastos que contribuem para o aumento do patrimônio público, como a construção de escolas, hospitais, a compra de equipamentos e a realização de grandes obras.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Despesa Empenhada:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Primeiro estágio da despesa pública. É o ato que reserva o valor do orçamento para um fim específico, criando a obrigação de pagamento para a Prefeitura. Consultar uma despesa empenhada significa que o governo se comprometeu a realizar aquele gasto.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Despesa Liquidada:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Segundo estágio da despesa. Ocorre quando a Prefeitura verifica que o serviço contratado foi efetivamente prestado ou que o material foi entregue conforme o acordo. É a etapa de verificação do direito do credor.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Despesa Paga:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Último estágio da despesa, quando a Prefeitura efetivamente transfere o dinheiro para o fornecedor ou prestador do serviço, quitando a obrigação.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Diárias:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Valor pago ao servidor público para cobrir despesas com alimentação, hospedagem e locomoção quando ele precisa se deslocar temporariamente da sua cidade de lotação a serviço.
                </dd>
              </div>
            </dl>
          </div>

          {/* Seção E-L */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b-2 ${highContrast ? 'text-yellow-300 border-yellow-300' : 'text-blue-600 border-blue-600'}`}>
              E – L
            </h2>
            
            <dl className="space-y-4">
              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Edital:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Instrumento que estabelece todas as regras de uma licitação ou concurso público, como o objeto, os prazos, os critérios de participação e de julgamento.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Empenho (ou Nota de Empenho):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Ver "Despesa Empenhada".
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Execução Orçamentária:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Utilização dos recursos financeiros conforme previsto na Lei Orçamentária Anual (LOA), envolvendo as etapas de empenho, liquidação e pagamento das despesas.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Fonte de Recursos:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Origem do dinheiro que financia as despesas públicas. Indica se o recurso é próprio do município (impostos), transferido pelo estado ou pela União.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>FPM (Fundo de Participação dos Municípios):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Principal fonte de receita para muitos municípios brasileiros. É uma transferência constitucional de recursos arrecadados pela União (Imposto de Renda e IPI) para as prefeituras.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>FUNDEB (Fundo de Manutenção e Desenvolvimento da Educação Básica):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Fundo especial composto por recursos de diferentes fontes de impostos (federais, estaduais e municipais) destinado ao financiamento da educação básica pública.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Lei de Diretrizes Orçamentárias (LDO):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Lei que estabelece as metas e prioridades da administração para o ano seguinte e orienta a elaboração da Lei Orçamentária Anual (LOA).
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Lei Orçamentária Anual (LOA):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Lei que estima as receitas e fixa as despesas do governo para o período de um ano. É o orçamento propriamente dito, que detalha onde e como o dinheiro público será gasto.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Licitação:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Processo administrativo obrigatório para as compras, obras e serviços contratados pelo governo. Seu objetivo é garantir a isonomia (tratamento igual para todos) e selecionar a proposta mais vantajosa para a administração pública.
                </dd>
              </div>
            </dl>
          </div>

          {/* Seção M-R */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b-2 ${highContrast ? 'text-yellow-300 border-yellow-300' : 'text-blue-600 border-blue-600'}`}>
              M – R
            </h2>
            
            <dl className="space-y-4">
              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Modalidades de Licitação:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Tipos de licitação previstos em lei, como Concorrência, Tomada de Preços, Convite, Concurso, Leilão e Pregão (Eletrônico ou Presencial). A escolha da modalidade depende do valor e da natureza do que está sendo contratado.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Ordem Cronológica de Pagamentos:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Obrigatoriedade de a administração pública pagar suas despesas seguindo a ordem das datas de vencimento das obrigações, garantindo impessoalidade e moralidade.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Plano Plurianual (PPA):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Instrumento de planejamento estratégico de médio prazo que define as diretrizes, objetivos e metas da administração pública para um período de quatro anos.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Recursos Próprios:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Receitas arrecadadas diretamente pelo município, como IPTU, ISS e ITBI.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Receita Corrente Líquida (RCL):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Somatório das receitas tributárias, de contribuições, patrimoniais, industriais, agropecuárias, de serviços e transferências correntes, deduzidos alguns valores previstos em lei. É a base de cálculo para limites importantes da Lei de Responsabilidade Fiscal, como os gastos com pessoal.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Relatório de Gestão Fiscal (RGF):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Publicação obrigatória ao final de cada quadrimestre, que apresenta um balanço sobre o cumprimento das metas fiscais e dos limites estabelecidos pela Lei de Responsabilidade Fiscal.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Relatório Resumido da Execução Orçamentária (RREO):</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Publicação obrigatória a cada bimestre que apresenta informações sobre a execução do orçamento, comparando a receita arrecadada com a despesa realizada no período.
                </dd>
              </div>
            </dl>
          </div>

          {/* Seção S-V */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b-2 ${highContrast ? 'text-yellow-300 border-yellow-300' : 'text-blue-600 border-blue-600'}`}>
              S – V
            </h2>
            
            <dl className="space-y-4">
              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Servidor Público:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Qualquer pessoa que exerce cargo, emprego ou função pública na administração direta ou indireta, de forma temporária ou permanente.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Transferências Constitucionais:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Repasse de recursos de uma esfera de governo para outra (da União para o Município, por exemplo), determinado pela Constituição Federal, como o FPM e uma parte do ICMS.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Transferências Voluntárias:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Repasse de recursos de uma esfera para outra mediante a celebração de convênios ou contratos, que não decorrem de uma obrigação constitucional ou legal.
                </dd>
              </div>

              <div>
                <dt className={`font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>Unidade Gestora:</dt>
                <dd className={`ml-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Órgão ou entidade da administração pública (como uma secretaria municipal ou um fundo) que tem a responsabilidade de gerenciar e executar parte do orçamento.
                </dd>
              </div>
            </dl>
          </div>

        </div>
      </main>
    </div>
  )
}