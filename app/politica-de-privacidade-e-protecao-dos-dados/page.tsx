'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaShieldAlt, FaUserLock, FaDatabase, FaCheckCircle } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function PoliticaProtecaoDadosPage() {
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

      <div className={`${highContrast ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Política de Privacidade e Proteção de Dados</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          <h1 className={`text-4xl font-bold mb-6 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Política de Privacidade e Proteção de Dados
          </h1>

          {/* Introdução */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <p className={`leading-relaxed mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A Prefeitura Municipal de Itabaiana-PB, no exercício de suas atribuições legais e em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), apresenta sua Política de Privacidade e Proteção de Dados para o Portal da Transparência.
            </p>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Esta política tem como objetivo esclarecer como são coletados, utilizados, armazenados e protegidos os dados pessoais dos cidadãos que acessam este portal, garantindo transparência, segurança e respeito aos direitos fundamentais de privacidade.
            </p>
          </div>

          {/* O que é a LGPD */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className={`text-3xl ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
              <h2 className={`text-2xl font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
                O que é a LGPD?
              </h2>
            </div>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A Lei Geral de Proteção de Dados foi promulgada para proteger os direitos fundamentais de liberdade e de privacidade, e a livre formação da personalidade de cada indivíduo. A Lei disciplina o tratamento de dados pessoais dispostos em meio físico ou digital, feito por pessoa física ou jurídica de direito público ou privado.
            </p>
          </div>

          {/* Dados Coletados */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <FaDatabase className={`text-3xl ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
              <h2 className={`text-2xl font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
                Dados Coletados pelo Portal
              </h2>
            </div>
            
            <h3 className={`font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Dados de Navegação
            </h3>
            <p className={`leading-relaxed mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Durante a navegação neste portal, podem ser coletados automaticamente dados técnicos como endereço IP, tipo de navegador, páginas acessadas, data e hora de acesso, e dispositivo utilizado. Estes dados são utilizados exclusivamente para fins estatísticos, melhoria dos serviços e segurança do portal.
            </p>

            <h3 className={`font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Uso de Cookies
            </h3>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              O portal pode utilizar cookies para melhorar a experiência de navegação do usuário, registrar preferências e permitir análises estatísticas de acesso. Os cookies não coletam dados pessoais identificáveis e podem ser desativados nas configurações do navegador.
            </p>
          </div>

          {/* Finalidade do Tratamento */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Finalidade do Tratamento de Dados
            </h2>
            <p className={`leading-relaxed mb-3 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A Prefeitura Municipal de Itabaiana trata dados pessoais com as seguintes finalidades:
            </p>
            <ul className={`space-y-2 ml-6 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Cumprimento de obrigações legais e regulatórias impostas à Administração Pública;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Execução de políticas públicas previstas em leis e regulamentos;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Garantia da transparência e do controle social sobre a gestão pública;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Atendimento a pedidos de acesso à informação (Lei nº 12.527/2011 - LAI);</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Melhoria contínua dos serviços prestados aos cidadãos;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Prevenção de fraudes e proteção da segurança da informação.</span>
              </li>
            </ul>
          </div>

          {/* Princípios */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Princípios Norteadores
            </h2>
            <p className={`leading-relaxed mb-3 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              O tratamento de dados pessoais pela Prefeitura observa os seguintes princípios da LGPD:
            </p>
            <ul className={`space-y-2 ml-6 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              <li><strong>Finalidade:</strong> tratamento para propósitos legítimos, específicos e informados ao titular;</li>
              <li><strong>Adequação:</strong> compatibilidade com as finalidades informadas;</li>
              <li><strong>Necessidade:</strong> limitação ao mínimo necessário para a realização de suas finalidades;</li>
              <li><strong>Transparência:</strong> garantia de informações claras e acessíveis sobre o tratamento;</li>
              <li><strong>Segurança:</strong> utilização de medidas técnicas e administrativas para proteção dos dados;</li>
              <li><strong>Prevenção:</strong> adoção de medidas para prevenir danos aos titulares;</li>
              <li><strong>Não discriminação:</strong> impossibilidade de tratamento para fins discriminatórios;</li>
              <li><strong>Responsabilização:</strong> demonstração da adoção de medidas eficazes de proteção de dados.</li>
            </ul>
          </div>

          {/* Direitos dos Titulares */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <FaUserLock className={`text-3xl ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
              <h2 className={`text-2xl font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
                Direitos dos Titulares de Dados
              </h2>
            </div>
            <p className={`leading-relaxed mb-3 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Nos termos da LGPD, os cidadãos possuem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className={`space-y-2 ml-6 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Confirmação da existência de tratamento de seus dados;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Acesso aos dados pessoais;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Correção de dados incompletos, inexatos ou desatualizados;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Portabilidade dos dados, mediante requisição expressa;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Informação sobre o compartilhamento de dados com outras entidades públicas ou privadas;</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className={`mt-1 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <span>Informação sobre a possibilidade de não fornecer consentimento e as consequências da negativa.</span>
              </li>
            </ul>
          </div>

          {/* Segurança */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Medidas de Segurança
            </h2>
            <p className={`leading-relaxed mb-3 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A Prefeitura Municipal de Itabaiana adota medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão. Entre as medidas implementadas estão:
            </p>
            <ul className={`space-y-2 ml-6 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              <li>• Uso de criptografia para proteção de dados sensíveis;</li>
              <li>• Controle de acesso restrito aos dados pessoais;</li>
              <li>• Monitoramento contínuo de segurança da informação;</li>
              <li>• Capacitação regular dos servidores sobre proteção de dados;</li>
              <li>• Registro de todas as operações de tratamento de dados;</li>
              <li>• Protocolos de resposta a incidentes de segurança.</li>
            </ul>
          </div>

          {/* Compartilhamento */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Compartilhamento de Dados
            </h2>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Os dados pessoais coletados podem ser compartilhados dentro da Administração Pública Municipal para execução de políticas públicas e cumprimento de obrigações legais. O compartilhamento com entidades externas ocorre apenas quando necessário para o cumprimento de obrigações legais, execução de políticas públicas ou mediante determinação judicial, sempre observando os princípios da LGPD e da Lei de Acesso à Informação.
            </p>
          </div>

          {/* Retenção */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Retenção e Eliminação de Dados
            </h2>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Os dados pessoais são mantidos pelo período necessário para o cumprimento das finalidades para as quais foram coletados, ou conforme exigido por obrigações legais, regulatórias e contratuais. Após este período, os dados serão eliminados ou anonimizados, salvo nas hipóteses previstas em lei que autorizam sua conservação.
            </p>
          </div>

          {/* Transparência e LAI */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Transparência e Lei de Acesso à Informação
            </h2>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              O Portal da Transparência tem como objetivo garantir o acesso do cidadão às informações sobre a gestão pública municipal, em cumprimento à Lei nº 12.527/2011 (Lei de Acesso à Informação). A divulgação de informações é realizada de forma a conciliar a transparência pública com a proteção de dados pessoais, evitando a exposição desnecessária de informações que possam violar a privacidade dos indivíduos.
            </p>
          </div>

          {/* Contato */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Canal de Atendimento
            </h2>
            <p className={`leading-relaxed mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Para exercer seus direitos como titular de dados pessoais, esclarecer dúvidas ou registrar reclamações relacionadas à proteção de dados, entre em contato com o Encarregado pelo Tratamento de Dados Pessoais da Prefeitura Municipal de Itabaiana:
            </p>
            <div className={`${highContrast ? 'bg-black' : 'bg-gray-50'} rounded p-4`}>
              <p className={`font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
                Encarregado: Procurador-Geral Jhon Kennedy de Oliveira
              </p>
              <p className={highContrast ? 'text-yellow-300' : 'text-gray-700'}>
                E-mail: <a href="mailto:pgm@itabaiana.pb.gov.br" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline font-semibold`}>pgm@itabaiana.pb.gov.br</a>
              </p>
            </div>
          </div>

          {/* Atualização */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8 mt-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Atualização desta Política
            </h2>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Esta Política de Privacidade e Proteção de Dados pode ser atualizada periodicamente para refletir mudanças nas práticas de tratamento de dados ou em decorrência de alterações legislativas. As atualizações serão publicadas nesta página, sendo recomendável consulta regular para manter-se informado sobre como seus dados são protegidos.
            </p>
          </div>
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}