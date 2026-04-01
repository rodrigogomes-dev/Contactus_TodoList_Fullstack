/**
 * Task API Response Types
 * These types represent the exact structure returned by the Laravel backend
 * with snake_case field names and backend value enums
 */
export interface TaskApiResponse {
  id: number;
  titulo: string;
  descricao: string;
  estado: 'concluída' | 'pendente'; // Backend uses "concluída" with tilde
  prioridade: 'alta' | 'média' | 'baixa'; // Backend uses "média" with accent
  data_vencimento: string; // ISO format: "2026-04-05"
  user_id: number;
  category_id: number | null;
  created_at: string; // ISO: "2026-04-01T09:00:00.000000Z"
  updated_at: string;
}

/**
 * Paginated API Response wrapper
 * Structure returned by all GET /api/tasks* endpoints
 */
export interface TasksPaginatedResponse {
  data: TaskApiResponse[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/**
 * Frontend Task Signal Type
 * Normalized to camelCase and frontend value conventions
 * This is the type stored in the tarefas signal
 */
export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  estado: 'concluido' | 'pendente'; // Frontend uses "concluido" without tilde
  prioridade: 'alta' | 'media' | 'baixa'; // Frontend uses "media" without accent
  dataVencimento: string; // ISO format (kept as string for simplicity)
  userId: number;
  categoryId: number | null;
  createdAt: string; // ISO format
  updatedAt: string;
}

/**
 * Task Creation Request DTO
 * Sent to POST /api/tasks
 */
export interface CreateTaskRequest {
  titulo: string;
  descricao: string;
  estado?: 'concluída' | 'pendente';
  prioridade?: 'alta' | 'média' | 'baixa';
  data_vencimento?: string; // ISO format
  category_id: number;
}

/**
 * Task Update Request DTO
 * Sent to PUT /api/tasks/{id}
 */
export interface UpdateTaskRequest {
  titulo?: string;
  descricao?: string;
  estado?: 'concluída' | 'pendente';
  prioridade?: 'alta' | 'média' | 'baixa';
  data_vencimento?: string; // ISO format
  category_id?: number | null;
}

/**
 * Enum for task states (frontend normalized)
 */
export enum TaskState {
  COMPLETED = 'concluido',
  PENDING = 'pendente',
}

/**
 * Enum for task states (API format)
 */
export enum TaskStateApi {
  COMPLETED = 'concluída',
  PENDING = 'pendente',
}

/**
 * Enum for task priority (frontend normalized)
 */
export enum TaskPriority {
  HIGH = 'alta',
  MEDIUM = 'media',
  LOW = 'baixa',
}

/**
 * Enum for task priority (API format)
 */
export enum TaskPriorityApi {
  HIGH = 'alta',
  MEDIUM = 'média',
  LOW = 'baixa',
}

/**
 * Mappers: Convert between API responses and frontend signals
 */

/**
 * Convert API response to frontend Tarefa signal
 * - Converts snake_case fields to camelCase
 * - Normalizes estado: "concluída" → "concluido"
 * - Normalizes prioridade: "média" → "media"
 */
export function mapApiTaskToFrontend(apiTask: TaskApiResponse): Tarefa {
  return {
    id: apiTask.id,
    titulo: apiTask.titulo,
    descricao: apiTask.descricao,
    estado: normalizeApiState(apiTask.estado),
    prioridade: normalizeApiPriority(apiTask.prioridade),
    dataVencimento: apiTask.data_vencimento,
    userId: apiTask.user_id,
    categoryId: apiTask.category_id,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
  };
}

/**
 * Convert array of API responses to frontend Tarefas
 */
export function mapApiTasksToFrontend(apiTasks: TaskApiResponse[]): Tarefa[] {
  return apiTasks.map(mapApiTaskToFrontend);
}

/**
 * Convert frontend Tarefa to API request format
 * - Used for create/update operations
 * - Converts camelCase back to snake_case
 * - Normalizes prioridade: "media" → "média"
 */
export function mapFrontendTaskToApi(task: Partial<Tarefa>): Partial<TaskApiResponse> {
  const apiTask: Partial<TaskApiResponse> = {};

  if (task.titulo !== undefined) apiTask.titulo = task.titulo;
  if (task.descricao !== undefined) apiTask.descricao = task.descricao;
  
  if (task.estado !== undefined) {
    apiTask.estado = task.estado === TaskState.COMPLETED ? TaskStateApi.COMPLETED : TaskStateApi.PENDING;
  }
  
  if (task.prioridade !== undefined) {
    apiTask.prioridade = denormalizeApiPriority(task.prioridade);
  }
  
  if (task.dataVencimento !== undefined) apiTask.data_vencimento = task.dataVencimento;
  if (task.categoryId !== undefined) apiTask.category_id = task.categoryId;

  return apiTask;
}

/**
 * Convert frontend priority "media" to API priority "média"
 */
function denormalizeApiPriority(frontendPriority: string): 'alta' | 'média' | 'baixa' {
  switch (frontendPriority) {
    case TaskPriority.MEDIUM:
      return TaskPriorityApi.MEDIUM;
    case TaskPriority.HIGH:
      return TaskPriorityApi.HIGH;
    case TaskPriority.LOW:
      return TaskPriorityApi.LOW;
    default:
      return TaskPriorityApi.MEDIUM;
  }
}

/**
 * Convert API priority "média" to frontend priority "media"
 */
function normalizeApiPriority(apiPriority: string): 'alta' | 'media' | 'baixa' {
  switch (apiPriority) {
    case TaskPriorityApi.MEDIUM:
      return TaskPriority.MEDIUM;
    case TaskPriorityApi.HIGH:
      return TaskPriority.HIGH;
    case TaskPriorityApi.LOW:
      return TaskPriority.LOW;
    default:
      return TaskPriority.MEDIUM;
  }
}

/**
 * Convert API state variants to frontend normalized state.
 * Accepts historical backend variants like "concluido" and "concluida".
 */
function normalizeApiState(apiState: string): 'concluido' | 'pendente' {
  const normalized = apiState
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized === 'concluida' || normalized === 'concluido') {
    return TaskState.COMPLETED;
  }

  return TaskState.PENDING;
}
