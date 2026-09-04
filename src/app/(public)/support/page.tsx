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
  title: 'Suporte',
  description: 'Orientações para os problemas mais comuns na liberação de computadores, sessões de uso e impressão.',
}

export default function Support() {
  return (
    <LegalPage
      badge="Central de ajuda"
      title="Suporte"
      description="O Sala Livre é uma plataforma para gestão de espaços tecnológicos compartilhados. Nesta página você encontra orientações para os problemas mais comuns."
    >
      <LegalSection title="1. Problemas para acessar um computador">
        <LegalSubsection title="Os dados informados não conferem">
          <LegalText>Confira se os dados solicitados foram informados corretamente, como:</LegalText>

          <LegalList
            items={[
              'CPF ou documento de identificação;',
              'data de nascimento, quando solicitada;',
              'número de registro profissional ou outro identificador, quando aplicável.',
            ]}
          />

          <LegalText>
            Os dados precisam corresponder às informações disponíveis nos sistemas integrados ao ambiente em que o Sala Livre está
            sendo utilizado.
          </LegalText>

          <LegalText>
            Se os dados estiverem corretos e o problema continuar, procure o atendimento responsável pelo local ou utilize os
            canais de suporte do Sala Livre.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Cadastro inativo ou acesso não autorizado">
          <LegalText>
            A situação cadastral identificada pelo sistema pode não permitir a liberação do computador naquele momento.
          </LegalText>

          <LegalText>
            Procure a organização responsável pelo ambiente para verificar a situação do seu cadastro e as regras de utilização
            aplicáveis.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Condição de acesso não atendida">
          <LegalText>
            Alguns ambientes podem possuir regras adicionais de utilização, definidas pela organização responsável e verificadas
            por meio de sistemas integrados.
          </LegalText>

          <LegalText>
            Caso seja exibida uma mensagem indicando que alguma condição de acesso não foi atendida, procure a organização
            responsável para obter mais informações.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Computador em manutenção">
          <LegalText>O equipamento está temporariamente indisponível para utilização.</LegalText>

          <LegalText>Utilize outro computador disponível ou solicite auxílio ao responsável pelo local.</LegalText>
        </LegalSubsection>

        <LegalSubsection title="Computador em uso">
          <LegalText>O equipamento já está sendo utilizado por outro usuário.</LegalText>

          <LegalText>Escolha outro computador disponível ou aguarde a liberação.</LegalText>
        </LegalSubsection>

        <LegalSubsection title="Já existe uma sessão ativa">
          <LegalText>O Sala Livre pode limitar o usuário a uma única sessão ativa por vez.</LegalText>

          <LegalText>
            Caso você já esteja utilizando outro computador, encerre a sessão anterior antes de iniciar uma nova utilização.
          </LegalText>

          <LegalText>
            Se você não estiver utilizando outro equipamento e a mensagem continuar aparecendo, procure o responsável pelo local
            ou entre em contato com o suporte.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Limite de uso atingido">
          <LegalText>O tempo de utilização pode ser definido de acordo com as regras de cada sala ou ambiente.</LegalText>

          <LegalText>
            Quando o limite disponível for totalmente consumido, uma nova sessão somente poderá ser iniciada quando houver nova
            disponibilidade de tempo, conforme as regras configuradas para o ambiente.
          </LegalText>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="2. Problemas durante a utilização">
        <LegalSubsection title="O computador foi bloqueado ou a sessão foi encerrada">
          <LegalText>A sessão poderá ser encerrada automaticamente quando:</LegalText>

          <LegalList
            items={[
              'o tempo disponível for totalmente utilizado;',
              'a sessão for encerrada pelo próprio usuário;',
              'ocorrer alguma condição administrativa ou operacional que impeça a continuidade do uso.',
            ]}
          />

          <LegalText>Caso a sessão tenha sido encerrada indevidamente, procure o responsável pelo ambiente.</LegalText>
        </LegalSubsection>

        <LegalSubsection title="O computador apresenta problema técnico">
          <LegalText>
            Se o equipamento apresentar travamentos, falhas de hardware, problemas de rede, periféricos defeituosos ou outra falha
            técnica, informe o responsável pelo local.
          </LegalText>

          <LegalText>Não tente abrir o equipamento ou realizar alterações físicas sem autorização.</LegalText>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. Impressão de documentos">
        <LegalText>
          Quando o recurso de impressão estiver disponível, o arquivo poderá ser enviado pelo computador utilizado e
          disponibilizado ao responsável pelo ambiente para realização da impressão.
        </LegalText>

        <LegalText>Caso o arquivo não apareça para impressão:</LegalText>

        <LegalList
          items={[
            'confirme se o envio foi concluído;',
            'procure o responsável pelo local;',
            'se necessário, realize novamente o envio.',
          ]}
        />

        <LegalText>
          Por segurança e privacidade, os arquivos enviados para impressão devem permanecer armazenados apenas pelo período
          necessário à execução do serviço, conforme as regras definidas para o ambiente.
        </LegalText>
      </LegalSection>

      <LegalSection title="4. Suporte para administradores e funcionários">
        <LegalText>Usuários autorizados podem solicitar suporte em casos relacionados a:</LegalText>

        <LegalList
          items={[
            'acesso ao painel administrativo;',
            'recuperação ou alteração de senha;',
            'cadastro e gerenciamento de salas;',
            'cadastro e gerenciamento de computadores;',
            'equipamentos em manutenção;',
            'vínculo de usuários responsáveis às salas;',
            'acompanhamento de sessões;',
            'problemas de autenticação;',
            'problemas de impressão;',
            'dificuldades de acesso às funcionalidades da plataforma.',
          ]}
        />

        <LegalText>Sempre que possível, informe:</LegalText>

        <LegalList
          items={[
            'seu nome;',
            'sala ou ambiente onde ocorreu o problema;',
            'identificação ou número do computador;',
            'data e horário aproximado;',
            'mensagem de erro exibida;',
            'descrição do que estava sendo feito no momento do erro.',
          ]}
        />

        <LegalText>Essas informações ajudam a equipe responsável a identificar o problema com mais rapidez.</LegalText>
      </LegalSection>

      <LegalSection title="5. Segurança">
        <LegalText>
          <LegalStrong>Nunca compartilhe sua senha ou credenciais de acesso.</LegalStrong>
        </LegalText>

        <LegalText>
          Administradores, funcionários ou integrantes da equipe de suporte não devem solicitar a senha pessoal do usuário.
        </LegalText>

        <LegalText>
          Em caso de suspeita de acesso indevido, informe imediatamente o responsável pelo ambiente ou o suporte do Sala Livre.
        </LegalText>
      </LegalSection>

      <LegalSection title="6. Contato">
        <LegalText>
          Para suporte relacionado ao Sala Livre, utilize os canais de atendimento disponibilizados no site oficial.
        </LegalText>

        <LegalContact description="Atendimento do Sala Livre:" />

        <LegalText>
          Consulte também a{' '}
          <Link href="/privacy" className="font-semibold text-rose-700 underline underline-offset-4">
            Política de Privacidade
          </Link>{' '}
          para entender como os dados são tratados na plataforma.
        </LegalText>
      </LegalSection>
    </LegalPage>
  )
}
