<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Task::with('user', 'category');
        
        // Security: Only show tasks belonging to the authenticated user
        if ($request->has('user_id')) {
            if ($request->user_id != $request->user()->id) {
                abort(403, 'Unauthorized');
            }
            $query->where('user_id', $request->user_id);
        } else {
            // If no user_id specified, return only current user's tasks
            $query->where('user_id', $request->user()->id);
        }
        
        return $query->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'required|in:baixa,média,alta',
            'data_vencimento' => 'nullable|date',
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'estado' => 'required|in:pendente,concluído',
        ]);
        $task = Task::create($validated);
        return response()->json($task->load('user', 'category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $task = Task::with('user', 'category')->findOrFail($id);
        
        // Security: Only show task if it belongs to the authenticated user
        if ($task->user_id !== (int) $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        
        return $task;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $task = Task::with('user', 'category')->findOrFail($id);
        
        // Segurança: Só permita atualizar se a tarefa pertence ao user autenticado
        if ($task->user_id !== (int) $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'required|in:baixa,média,alta',
            'data_vencimento' => 'nullable|date',
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'estado' => 'required|in:pendente,concluído',
        ]);
        $task->update($validated);
        return response()->json($task->load('user', 'category'), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $task = Task::findOrFail($id);
        
        // Segurança: Só permite apagar se a tarefa pertence ao user autenticado
        if ($task->user_id !== (int) $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        
        $task->delete();
        return response()->noContent();
    }
}
