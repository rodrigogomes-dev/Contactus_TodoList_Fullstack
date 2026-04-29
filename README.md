# TODO List - Contactus Full Stack

**Plataforma de Gestão de Tarefas com Gamificação**

Autor: **Rodrigo Gomes**

---

## 📝 Visão Geral

O **TODO List - Contactus** é uma aplicação completa de gestão de tarefas com um sistema inovador de gamificação baseado em badges. Desenvolvida para oferecer uma experiência fluida e motivadora, a plataforma utiliza **Laravel 13** no Backend e **Angular 21** no Frontend, garantindo performance e segurança com autenticação via **Laravel Sanctum**.

### Funcionalidades Principais:
- **Gestão de Tarefas:** CRUD completo com estados, prioridades e categorias.
- **Gamificação:** Sistema automático de atribuição de badges por milestones.
- **Dashboard Admin:** Estatísticas visuais e métricas de crescimento.
- **Segurança:** Proteção de dados e autenticação robusta.

---

## 🛠️ Stack Tecnológico (Versões Exatas)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Backend API** | PHP | `8.3` |
| | Laravel Framework | `13.0` |
| | Laravel Sanctum | `4.3` |
| | Laravel Tinker | `3.0` |
| | PHPUnit | `12.5.12` |
| **Frontend SPA** | Angular | `21.2.0` |
| | TypeScript | `5.9.2` |
| | Chart.js | `4.5.1` |
| | Three.js | `0.183.2` |
| | Vanta.js | `0.5.24` |
| **Database** | MySQL | `8.0` |

---

## 📁 Estrutura do Projeto

```
Projeto_TodoList_Contactus_Fullstack/
├── backend/              # Laravel API (PHP 8.3 / Laravel 13)
├── frontend/             # Angular SPA (Angular 21)
├── DOCKER_README.md      # Guia detalhado de Docker
├── docker-compose.yml    # Orquestração de containers
└── Docs/                 # Documentação adicional
```

---

## 🔐 Segurança & Boas Práticas

- **Sanctum Auth:** Autenticação via tokens Bearer.
- **Princípio de Menor Privilégio:** Utilizadores de base de dados restritos.
- **OWASP Compliance:** Proteção contra SQL Injection e CSRF.
- **Dashboard Admin:** Estatísticas em tempo real com Chart.js.

---

## 🏆 Sistema de Gamificação

A aplicação motiva os utilizadores através de conquistas automáticas:
- **Iniciante:** 1 tarefa concluída.
- **Intermédio:** 10 tarefas concluídas.
- **Avançado:** 50 tarefas concluídas.
- **Especialista:** 100 tarefas concluídas.

---

## 🚀 Instruções de Execução

Escolha um dos métodos abaixo para rodar o projeto.

### Opção A: Usando Docker (Recomendado)

A forma mais rápida de iniciar todo o ecossistema (Backend, Frontend e Base de Dados).

#### 1. Pré-requisitos e Instalação (Linux)
Se ainda não tem o Docker instalado, execute:
```bash
sudo apt update && sudo apt install docker.io docker-compose-v2 -y
sudo usermod -aG docker $USER  # Requer logout para aplicar
```

#### 2. Iniciar os containers
```bash
sudo docker compose up -d --build
```

#### 3. Configurar Ambiente e Base de Dados
Se for a primeira vez, execute:
```bash
# Criar tabelas, dados iniciais e crachés
sudo docker compose exec backend php artisan migrate:fresh --seed

# Criar link para imagens (Avatars e Badges)
sudo docker compose exec backend php artisan storage:link --force
```

#### 4. Aceder à aplicação
- **Frontend (UI):** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:8000/api](http://localhost:8000/api)
- **MySQL:** `localhost:3307`

#### 5. Credenciais de Teste
- **Test User:** `testuser@example.com` / `password123` (Possui tarefas e crachés)
- **Test Admin:** `admin@example.com` / `password123` (Gestão de estatísticas)

*Para detalhes avançados, veja o [DOCKER_README.md](./DOCKER_README.md).*

---

### Opção B: Configuração Manual

Caso prefira rodar os serviços localmente sem Docker.

#### 1. Pré-Requisitos
- **PHP 8.3+**, **MySQL 8.0+**, **Composer**.
- **Node.js 20+** e **npm 10+**.

#### 2. Setup do Backend

1. **Instalar Dependências:**
   ```bash
   cd backend
   composer install
   ```

2. **Configurar Base de Dados:**
   ```bash
   # Criar a base de dados
   sudo mysql -e "CREATE DATABASE db_todolist_contactus;"

   # Criar utilizador administrativo e dar permissões
   sudo mysql -e "CREATE USER 'admin'@'localhost' IDENTIFIED BY 'xpt0_c0mpl3x0#';"
   sudo mysql -e "GRANT ALL PRIVILEGES ON db_todolist_contactus.* TO 'admin'@'localhost';"
   sudo mysql -e "FLUSH PRIVILEGES;"
   ```

3. **Configurar Ambiente (.env):**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Abra o ficheiro `.env` e substitua o bloco de conexão por:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=db_todolist_contactus
   DB_USERNAME=admin
   DB_PASSWORD=xpt0_c0mpl3x0#
   ```

4. **Migrar e Popular:**
   ```bash
   php artisan migrate:fresh --seed
   php artisan storage:link
   php artisan serve
   ```

#### 3. Setup do Frontend
```bash
cd frontend/frontend
npm install
npx ng serve
```

---

## 👨‍💻 Autor
**Rodrigo Gomes**

---

## 📄 Licença
Propriedade privada - Contactus

---
