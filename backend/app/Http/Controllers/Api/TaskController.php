<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Retorna listagem de tarefas do utilizador.
     * Por padrão: apenas tarefas do utilizador autenticado.
     * Opcionalmente: filtra por user_id (se houver permissão).
     *
     * Segurança:
     *  - Se user_id é fornecido, valida se é ID do utilizador autenticado
     *  - Retorna 403 se tentar aceder tarefas de outro utilizador
     *  - Se sem user_id, retorna apenas tarefas do utilizador atual
     *
     * Paginamento: 15 tarefas por página
     *
     * @param Request $request Pode incluir filtro user_id
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection Tarefas paginadas
     */
    public function index(Request $request)
    {
        $query = Task::with('user', 'category');
        
        // Verifica se utilizador tentou filtrar por user_id
        if ($request->has('user_id')) {
            // Segurança: só permite aceder às suas próprias tarefas
            if ($request->user_id != $request->user()->id) {
                abort(403, 'Não autorizado');
            }
            $query->where('user_id', $request->user_id);
        } else {
            // Se nenhum user_id especificado, retorna apenas tarefas do utilizador atual
            $query->where('user_id', $request->user()->id);
        }
        
        return TaskResource::collection($query->paginate(15));
    }

    /**
     * Cria uma nova tarefa para o utilizador autenticado.
     * Valida dados com StoreTaskRequest.
     * Autoré é automaticamente definido como utilizador autenticado.
     *
     * Fluxo:
     *  1. Valida dados de entrada
     *  2. Atribui user_id do utilizador autenticado
     *  3. Cria tarefa na BD
     *  4. Carrega relações (user, category)
     *  5. Retorna tarefa criada com HTTP 201
     *
     * Nota: Observers processam eventos (ex: emitir badges)
     *
     * @param StoreTaskRequest $request Dados validados
     * @return \Illuminate\Http\JsonResponse Tarefa criada, HTTP 201
     */
    public function store(StoreTaskRequest $request)
    {
        $data = $request->validated();
        // Autoré é sempre o utilizador autenticado (segurança)
        $data['user_id'] = $request->user()->id;
        
        \Log::info('A criar tarefa com dados:', $data);
        
        $task = Task::create($data);
        
        \Log::info('Tarefa criada:', ['id' => $task->id, 'task' => $task->toArray()]);
        
        // Carrega relações para resposta
        $task->load('user', 'category');
        
        return response()->json(['data' => new TaskResource($task)], 201);
    }

    /**
     * Retorna detalhes de uma tarefa específica.
     * Só permite aceder se tarefa pertence ao utilizador autenticado.
     *
     * Segurança: Retorna 403 se tarefa pertence a outro utilizador
     *
     * @param Request $request Pedido com utilizador autenticado
     * @param string $id ID da tarefa a mostrar
     * @return TaskResource Dados da tarefa
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Se tarefa não existe
     */
    public function show(Request $request, string $id)
    {
        $task = Task::with('user', 'category')->findOrFail($id);
        
        // Segurança: valida propriedade da tarefa
        if ($task->user_id !== (int) $request->user()->id) {
            abort(403, 'Não autorizado');
        }
        
        return new TaskResource($task);
    }

    /**
     * Atualiza uma tarefa existente.
     * Só o proprietário pode atualizar.
     *
     * Autorização: Usa Laravel Gate 'update' da tarefa
     * Validação: UpdateTaskRequest valida dados de entrada
     *
     * @param UpdateTaskRequest $request Dados validados a atualizar
     * @param string $id ID da tarefa
     * @return \Illuminate\Http\JsonResponse Tarefa atualizada, HTTP 200
     */
    public function update(UpdateTaskRequest $request, string $id)
    {
        $task = Task::with('user', 'category')->findOrFail($id);

        // Verifica autorização usando Laravel Policies
        $this->authorize('update', $task);
        
        $task->update($request->validated());
        return response()->json(new TaskResource($task->load('user', 'category')), 200);
    }

    /**
     * Remove uma tarefa da base de dados.
     * Só o proprietário pode deletar.
     *
     * Autorização: Usa Laravel Gate 'delete' da tarefa
     * Resposta: HTTP 204 No Content (sem corpo de resposta)
     *
     * @param Request $request Pedido com utilizador autenticado
     * @param string $id ID da tarefa a deletar
     * @return \Illuminate\Http\Response HTTP 204 No Content
     */
    public function destroy(Request $request, string $id)
    {
        $task = Task::findOrFail($id);
        
        // Verifica autorização
        $this->authorize('delete', $task);
        
        $task->delete();
        return response()->noContent();
    }
}
