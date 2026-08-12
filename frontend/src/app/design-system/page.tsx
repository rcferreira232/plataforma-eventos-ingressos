"use client";

import * as React from "react";
import { Mail, Lock, Search, Plus, Eye } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Toast } from "@/components/ui/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect, SelectOption } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "CLIENT";
  status: "ACTIVE" | "PENDING";
}

const demoUsers: DemoUser[] = [
  {
    id: "1",
    name: "Rodrigo Ferreira",
    email: "rodrigo@exemplo.com",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Camila Rocha",
    email: "camila@exemplo.com",
    role: "ORGANIZER",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Lucas Mendes",
    email: "lucas@exemplo.com",
    role: "CLIENT",
    status: "PENDING",
  },
];

const selectOptions: readonly SelectOption[] = [
  { label: "Administrador", value: "ADMIN" },
  { label: "Organizador de Eventos", value: "ORGANIZER" },
  { label: "Cliente", value: "CLIENT" },
];

export default function TestePage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [isLoadingTable, setIsLoadingTable] = React.useState(false);
  const [activeToast, setActiveToast] = React.useState<
    "success" | "error" | null
  >(null);

  const columns: ColumnDef<DemoUser>[] = [
    {
      header: "Usuário",
      accessorKey: (row) => (
        <div className='flex items-center gap-3'>
          <Avatar size='sm'>
            <AvatarFallback name={row.name} />
          </Avatar>
          <div>
            <p className='font-medium text-foreground'>{row.name}</p>
            <p className='text-xs text-muted-foreground'>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Perfil",
      accessorKey: (row) => (
        <Badge variant={row.role === "ADMIN" ? "default" : "secondary"}>
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "warning"}>
          {row.status === "ACTIVE" ? "Ativo" : "Pendente"}
        </Badge>
      ),
    },
  ];

  return (
    <Container size='xl' className='py-10 space-y-12'>
      {/* 1. Page Header */}
      <PageHeader
        title='Design System - Componentes Base'
        description='Demonstração interativa de todos os componentes padronizados do projeto.'
        actions={
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setIsDrawerOpen(true)}>
              Abrir Drawer
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className='size-4 mr-1' />
              Abrir Modal
            </Button>
          </div>
        }
      />

      {/* 2. Seção de Tipografia */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <Heading variant='h3'>
          1. Tipografia e Textos (`Heading` & `Text`)
        </Heading>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border border-border'>
          <div className='space-y-2'>
            <Heading variant='h1'>Heading H1</Heading>
            <Heading variant='h2'>Heading H2</Heading>
            <Heading variant='h3'>Heading H3</Heading>
            <Heading variant='h4'>Heading H4</Heading>
            <Heading variant='h5'>Heading H5</Heading>
            <Heading variant='h6'>Heading H6</Heading>
          </div>
          <div className='space-y-3'>
            <Text variant='lead'>
              {/* eslint-disable-next-line */}
              Text variant="lead": Texto em destaque para resumos de artigos e
              introduções.
              {/* eslint-enable-next-line */}
            </Text>
            <Text variant='default'>
              {/* eslint-disable-next-line */}
              Text variant="default": Texto padrão de corpo com ótimo
              espaçamento de linha e legibilidade.
              {/* eslint-enable-next-line */}
            </Text>
            <Text variant='large'>
              {/* eslint-disable-next-line */}
              Text variant="large": Texto ligeiramente maior e semi-negrito.
              {/* eslint-enable-next-line */}
            </Text>
            <Text variant='muted'>
              {/* eslint-disable-next-line */}
              Text variant="muted": Texto secundário ou explicativo.
              {/* eslint-enable-next-line */}
            </Text>
            <Text variant='small'>
              {/* eslint-disable-next-line */}
              Text variant="small": Texto pequeno de nota de rodapé ou detalhe.
              {/* eslint-enable-next-line */}
            </Text>
            <Text variant='xs'>
              {/* eslint-disable-next-line */}
              Text variant="xs": Texto extra pequeno de auxílio.
            </Text>
          </div>
        </div>
      </Section>

      {/* 3. Seção de Feedback e Badges */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <Heading variant='h3'>
          2. Badges, Spinners e Toast (`Badge`, `LoadingSpinner`, `Toast`)
        </Heading>

        <div className='flex flex-wrap items-center gap-3 bg-card p-6 rounded-xl border border-border'>
          <Badge variant='default'>Default</Badge>
          <Badge variant='secondary'>Secondary</Badge>
          <Badge variant='outline'>Outline</Badge>
          <Badge variant='success'>Success</Badge>
          <Badge variant='warning'>Warning</Badge>
          <Badge variant='destructive'>Destructive</Badge>
        </div>

        <div className='flex items-center gap-6 bg-card p-6 rounded-xl border border-border'>
          <Text variant='muted'>Spinners:</Text>
          <LoadingSpinner size='sm' />
          <LoadingSpinner size='md' />
          <LoadingSpinner size='lg' />
          <LoadingSpinner size='xl' />
        </div>

        <div className='space-y-3'>
          <div className='flex gap-3'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setActiveToast("success")}
            >
              Simular Toast de Sucesso
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => setActiveToast("error")}
            >
              Simular Toast de Erro
            </Button>
          </div>

          {activeToast === "success" && (
            <Toast
              type='success'
              title='Operação realizada com sucesso!'
              description='Os dados foram atualizados no banco de dados.'
              onClose={() => setActiveToast(null)}
            />
          )}

          {activeToast === "error" && (
            <Toast
              type='error'
              title='Erro ao processar requisição'
              description='Não foi possível conectar ao servidor. Tente novamente.'
              onClose={() => setActiveToast(null)}
            />
          )}
        </div>
      </Section>

      {/* 4. Seção de Avatares */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <Heading variant='h3'>
          3. Avatares (`Avatar` & `AvatarFallback`)
        </Heading>
        <div className='flex items-center gap-4 bg-card p-6 rounded-xl border border-border'>
          <Avatar size='sm'>
            <AvatarFallback name='Rodrigo Ferreira' />
          </Avatar>
          <Avatar size='md'>
            <AvatarFallback name='Camila Rocha' />
          </Avatar>
          <Avatar size='lg'>
            <AvatarFallback name='Lucas Mendes' />
          </Avatar>
          <Avatar size='xl'>
            <AvatarFallback name='Eventos App' />
          </Avatar>
        </div>
      </Section>

      {/* 5. Seção de Formulários */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <div className='flex items-center justify-between'>
          <Heading variant='h3'>4. Formulários e Inputs</Heading>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowError((prev) => !prev)}
          >
            {showError ? "Remover Erros" : "Simular Erros de Validação"}
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border border-border'>
          <FormInput
            label='E-mail de Acesso'
            placeholder='digite@email.com'
            leftIcon={<Mail className='size-4' />}
            required
            helperText='Nunca compartilharemos seu e-mail.'
            error={showError ? "Endereço de e-mail inválido" : undefined}
          />

          <FormInput
            label='Senha'
            type='password'
            placeholder='••••••••'
            leftIcon={<Lock className='size-4' />}
            rightIcon={<Eye className='size-4 cursor-pointer' />}
            required
            error={
              showError
                ? "A senha precisa ter pelo menos 6 caracteres"
                : undefined
            }
          />

          <FormSelect
            label='Tipo de Conta'
            options={selectOptions}
            placeholder='Selecione o perfil'
            required
            error={showError ? "Selecione uma opção válida" : undefined}
          />

          <div className='space-y-1.5'>
            <Text variant='small'>FormErrorMessage Standalone:</Text>
            <FormErrorMessage
              message={
                showError ? "Exemplo de FormErrorMessage isolado" : undefined
              }
            />
          </div>

          <div className='md:col-span-2'>
            <FormTextarea
              label='Observações / Bio'
              placeholder='Fale um pouco sobre você...'
              helperText='Limite de 500 caracteres.'
              error={showError ? "Este campo é obrigatório" : undefined}
            />
          </div>
        </div>
      </Section>

      {/* 6. Seção de Cards */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <Heading variant='h3'>5. Cards (`Card` Suite)</Heading>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Ingresso VIP</CardTitle>
              <CardDescription>
                Acesso total ao evento e camarote.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-foreground'>R$ 250,00</p>
              <Text variant='muted' className='mt-2'>
                Inclui consumação e brinde exclusivo.
              </Text>
            </CardContent>
            <CardFooter>
              <Button className='w-full'>Comprar Ingresso</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingresso Pista</CardTitle>
              <CardDescription>Acesso à área geral do show.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-foreground'>R$ 100,00</p>
              <Text variant='muted' className='mt-2'>
                Entrada no horário regular.
              </Text>
            </CardContent>
            <CardFooter>
              <Button variant='outline' className='w-full'>
                Comprar Ingresso
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estoque Esgotado</CardTitle>
              <CardDescription>Lote finalizado.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-muted-foreground'>
                R$ 0,00
              </p>
              <Text variant='muted' className='mt-2'>
                Aguarde o próximo lote.
              </Text>
            </CardContent>
            <CardFooter>
              <Button disabled className='w-full'>
                Esgotado
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* 7. Seção de Data Table */}
      <Section spacing='sm' className='space-y-4 border-b border-border pb-8'>
        <div className='flex items-center justify-between'>
          <Heading variant='h3'>6. Data Table (`DataTable`)</Heading>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsLoadingTable((prev) => !prev)}
          >
            {isLoadingTable ? "Mostrar Dados" : "Simular Loading"}
          </Button>
        </div>
        <DataTable
          data={demoUsers}
          columns={columns}
          isLoading={isLoadingTable}
          keyExtractor={(user) => user.id}
        />
      </Section>

      {/* Overlays: Modal e Drawer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Modal de Confirmação'
        description='Esta é uma demonstração do componente Modal padronizado com suporte a fechar com ESC.'
        footer={
          <>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
          </>
        }
      >
        <div className='space-y-4 py-2'>
          <Text>
            O modal trava o scroll da página enquanto está aberto e pode conter
            formulários ou conteúdos arbitrários.
          </Text>
          <FormInput
            label='Nome no Cartão'
            placeholder='Como impresso no cartão'
          />
        </div>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title='Painel Lateral (Drawer)'
        description='Painel deslizante off-canvas ideal para filtros e menus.'
      >
        <div className='space-y-6 py-4'>
          <Text variant='muted'>
            Você pode colocar filtros de busca ou detalhes do item selecionado
            aqui.
          </Text>
          <FormInput
            label='Filtro rápido'
            placeholder='Digite palavras chave...'
            leftIcon={<Search className='size-4' />}
          />
          <FormSelect label='Status' options={selectOptions} />
          <Button
            className='w-full mt-4'
            onClick={() => setIsDrawerOpen(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </Drawer>
    </Container>
  );
}
