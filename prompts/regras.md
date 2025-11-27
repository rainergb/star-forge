# Regras do Projeto

## 1. Componentização
- **Tudo deve ser componentizado**
- Cada elemento da interface deve ser um componente reutilizável
- Componentes devem ser pequenos, focados e com responsabilidade única
- Evitar código duplicado através da componentização adequada
- **Cada arquivo deve ter no máximo 500 linhas**
- Ideal: arquivos com 200-300 linhas quando possível
- Arquivos muito grandes devem ser divididos em componentes menores

## 2. Tipagem
- **Tudo deve ser tipado**
- Utilizar TypeScript em todos os arquivos
- Definir interfaces e tipos para todas as props, states e funções
- Evitar uso de `any` - preferir tipos específicos ou `unknown` quando necessário
- **Todas as tipagens devem estar organizadas na pasta `types`**
- Exportar tipos e interfaces para reutilização

## 3. Comentários
- **Não insira comentários no código, caso não seja extremamente necessário**
- Caso tenha comentários nos códigos editados remova

## 4. Convenções de Nomenclatura de Arquivos
- **Componentes:** kebab-case com .tsx (`button.tsx`, `product-card.tsx`)
- **Hooks:** camelCase com 'use' (`useAuth.ts`, `useProductList.ts`)
- **Utils:** kebab-case (`formatters.ts`, `date-utils.ts`)
- **Tipos:** kebab-case com .types.ts (`product.types.ts`, `user.types.ts`)
- **Schemas:** kebab-case com .schema.ts (`product.schema.ts`, `login.schema.ts`)

<!-- ## 4. Schemas
- **Todos os arquivos de schema devem estar na pasta `@/schemas`**
- Schemas de validação (Zod, Yup, etc.) devem ser centralizados
- Facilita manutenção e reutilização de regras de validação

## 5. Imports Não Utilizados
- **Remover tudo que desrespeite o ts(6133)**
- Não manter imports, variáveis ou funções declaradas e não utilizadas
- Manter o código limpo e sem elementos desnecessários -->