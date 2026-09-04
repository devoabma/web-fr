import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LegalContact,
  LegalList,
  LegalPage,
  LegalSection,
  LegalStrong,
  LegalSubsection,
  LegalText,
} from '@/components/app/legal-page'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como o Sala Livre trata os dados pessoais de advogados, colaboradores e administradores da plataforma.',
}

export default function Privacy() {
  return (
    <LegalPage
      badge="Proteção de dados · LGPD"
      title="Política de Privacidade"
      description="O Sala Livre valoriza a privacidade e a proteção dos dados pessoais de seus usuários. Esta política explica, de forma clara e transparente, como os dados podem ser tratados na plataforma."
      updatedAt="Última atualização: 4 de setembro de 2026"
    >
      <LegalSection title="1. Sobre o Sala Livre">
        <LegalText>
          O Sala Livre é uma plataforma para gestão e utilização de espaços tecnológicos compartilhados, permitindo o controle de
          acesso a computadores, gerenciamento de salas e equipamentos, acompanhamento de sessões de uso e outras funcionalidades
          administrativas e operacionais.
        </LegalText>

        <LegalText>
          A plataforma pode ser disponibilizada diretamente pelo Sala Livre ou por organizações parceiras ou contratantes, que
          podem configurar regras próprias de acesso, integrações e utilização.
        </LegalText>
      </LegalSection>

      <LegalSection title="2. Dados pessoais tratados">
        <LegalText>
          De acordo com a forma de utilização e com as integrações configuradas pela organização responsável pelo ambiente,
          poderão ser tratados os seguintes dados:
        </LegalText>

        <LegalSubsection title="2.1. Dados dos usuários">
          <LegalList
            items={[
              'nome;',
              'CPF ou outro documento de identificação;',
              'data de nascimento, quando necessária para validação;',
              'e-mail;',
              'número de registro profissional ou identificador equivalente, quando aplicável;',
              'categoria ou perfil cadastral;',
              'situação cadastral e informações necessárias para verificar a elegibilidade de acesso ao serviço;',
              'registros de utilização dos computadores;',
              'data e horário de início e encerramento das sessões;',
              'sala e computador utilizados.',
            ]}
          />

          <LegalText>
            Os dados informados no momento do acesso poderão ser conferidos com bases cadastrais ou sistemas externos integrados à
            plataforma para validação da identidade e das condições de utilização do serviço.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="2.2. Dados de administradores e funcionários autorizados">
          <LegalText>Para usuários responsáveis pela administração dos ambientes, poderão ser tratados:</LegalText>

          <LegalList
            items={[
              'nome;',
              'CPF ou outro identificador;',
              'e-mail;',
              'foto de perfil, quando cadastrada;',
              'perfil e nível de acesso;',
              'salas ou ambientes aos quais o usuário está vinculado;',
              'informações necessárias à autenticação e à segurança da conta.',
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="2.3. Dados dos equipamentos">
          <LegalText>O Sala Livre também poderá registrar informações técnicas e operacionais dos equipamentos, como:</LegalText>

          <LegalList
            items={[
              'identificação do computador;',
              'endereço MAC ou outro identificador técnico;',
              'sala ou ambiente ao qual o equipamento pertence;',
              'situação de uso;',
              'situação de manutenção;',
              'histórico de sessões realizadas no equipamento.',
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="2.4. Arquivos enviados para impressão">
          <LegalText>
            Quando o recurso de impressão estiver disponível e for utilizado, o Sala Livre poderá processar temporariamente
            arquivos enviados pelo usuário, juntamente com informações necessárias para identificar a sessão e o equipamento de
            origem.
          </LegalText>

          <LegalText>
            Esses arquivos devem permanecer armazenados apenas pelo período necessário à prestação do serviço de impressão, de
            acordo com as regras de retenção configuradas para o ambiente.
          </LegalText>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. Finalidades do tratamento">
        <LegalText>Os dados pessoais poderão ser utilizados para:</LegalText>

        <LegalList
          items={[
            'identificar e autenticar usuários;',
            'conferir dados cadastrais em sistemas integrados;',
            'verificar a elegibilidade para utilização dos recursos disponibilizados;',
            'controlar o tempo de uso dos computadores;',
            'impedir utilizações simultâneas ou incompatíveis com as regras do ambiente;',
            'registrar e encerrar sessões de utilização;',
            'identificar computadores e salas disponíveis;',
            'administrar salas e equipamentos;',
            'gerenciar equipamentos em manutenção;',
            'viabilizar serviços de impressão;',
            'prestar suporte técnico e operacional;',
            'proteger a segurança e a integridade da plataforma;',
            'prevenir uso indevido ou não autorizado;',
            'gerar informações administrativas, estatísticas e operacionais relacionadas à utilização do serviço;',
            'cumprir obrigações legais e regulatórias aplicáveis.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Compartilhamento e integrações">
        <LegalText>
          Para viabilizar o funcionamento do Sala Livre, determinados dados poderão ser processados por fornecedores, prestadores
          de serviço ou sistemas integrados utilizados na operação da plataforma.
        </LegalText>

        <LegalText>Isso pode incluir, conforme aplicável:</LegalText>

        <LegalList
          items={[
            'serviços de hospedagem e infraestrutura;',
            'bancos de dados;',
            'serviços de armazenamento de arquivos;',
            'serviços de envio de e-mails;',
            'sistemas de autenticação e validação cadastral;',
            'sistemas corporativos integrados pela organização responsável pelo ambiente.',
          ]}
        />

        <LegalText>
          O acesso e o compartilhamento devem ser limitados ao necessário para a execução das respectivas atividades e
          finalidades.
        </LegalText>
      </LegalSection>

      <LegalSection title="5. Responsabilidade pelo tratamento">
        <LegalText>
          Dependendo da forma de contratação e utilização do Sala Livre, a organização que disponibiliza o ambiente aos usuários
          poderá atuar como responsável pelas decisões relacionadas ao tratamento de determinados dados pessoais, enquanto o Sala
          Livre poderá atuar como fornecedor de tecnologia e operador de dados, conforme aplicável.
        </LegalText>

        <LegalText>
          As responsabilidades específicas poderão variar de acordo com a configuração, as integrações e a relação existente entre
          o Sala Livre e a organização responsável pelo ambiente.
        </LegalText>
      </LegalSection>

      <LegalSection title="6. Armazenamento e retenção">
        <LegalText>
          Os dados pessoais serão mantidos pelo período necessário para atender às finalidades descritas nesta Política e às
          obrigações legais ou regulatórias aplicáveis.
        </LegalText>

        <LegalText>
          Arquivos temporários destinados à impressão deverão ser eliminados após o período necessário para a execução desse
          serviço, conforme a política de retenção definida para o ambiente.
        </LegalText>
      </LegalSection>

      <LegalSection title="7. Segurança da informação">
        <LegalText>
          O Sala Livre adota medidas técnicas e administrativas destinadas a proteger os dados contra acessos não autorizados,
          perda, alteração, divulgação ou destruição indevida.
        </LegalText>

        <LegalText>Entre as medidas que podem ser utilizadas estão:</LegalText>

        <LegalList
          items={[
            'autenticação de usuários;',
            'controle de perfis e permissões;',
            'proteção de credenciais de acesso;',
            'uso de tokens de autenticação;',
            'controle de acesso às funcionalidades administrativas;',
            'registro de utilização dos equipamentos;',
            'limitação de acesso conforme o perfil do usuário.',
          ]}
        />

        <LegalText>
          Apesar da adoção de medidas de segurança, nenhum sistema informatizado é totalmente imune a incidentes. Em caso de
          ocorrência relevante, serão adotadas as providências cabíveis nos termos da legislação aplicável.
        </LegalText>
      </LegalSection>

      <LegalSection title="8. Direitos dos titulares">
        <LegalText>
          Nos termos da <LegalStrong>Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)</LegalStrong>, o titular
          poderá exercer os direitos previstos na legislação, quando aplicáveis.
        </LegalText>

        <LegalText>Entre eles, podem estar:</LegalText>

        <LegalList
          items={[
            'confirmação da existência de tratamento;',
            'acesso aos dados pessoais;',
            'correção de dados incompletos, inexatos ou desatualizados;',
            'informações sobre o compartilhamento de dados;',
            'solicitação de eliminação, anonimização ou bloqueio, quando legalmente cabível;',
            'demais direitos previstos na LGPD.',
          ]}
        />

        <LegalText>
          As solicitações deverão ser encaminhadas pelos canais de atendimento disponibilizados pelo Sala Livre ou pela
          organização responsável pelo ambiente, conforme o caso.
        </LegalText>
      </LegalSection>

      <LegalSection title="9. Atualizações desta Política">
        <LegalText>
          Esta Política de Privacidade poderá ser atualizada para refletir mudanças na plataforma, em seus serviços, nas
          integrações utilizadas ou na legislação aplicável.
        </LegalText>

        <LegalText>A versão mais recente permanecerá disponível no endereço oficial do Sala Livre.</LegalText>
      </LegalSection>

      <LegalSection title="10. Contato">
        <LegalText>
          Para dúvidas sobre privacidade, tratamento de dados pessoais ou funcionamento da plataforma, utilize os canais de
          atendimento disponibilizados pelo Sala Livre.
        </LegalText>

        <LegalContact description="Solicitações de titulares e dúvidas sobre esta política:" />

        <LegalText>
          Consulte também a{' '}
          <Link href="/support" className="font-semibold text-rose-700 underline underline-offset-4">
            página de suporte
          </Link>{' '}
          para as orientações de atendimento.
        </LegalText>
      </LegalSection>
    </LegalPage>
  )
}
