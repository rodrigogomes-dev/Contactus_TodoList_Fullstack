<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;

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
        
        return TaskResource::collection($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        
        \Log::info('Creating task with data:', $data);
        
        $task = Task::create($data);
        
        \Log::info('Task created:', ['id' => $task->id, 'task' => $task->toArray()]);
        
        $task->load('user', 'category');
        
        return response()->json(['data' => new TaskResource($task)], 201);
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
        
        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, string $id)
    {
        $task = Task::with('user', 'category')->findOrFail($id);
        
        // Segurança: Só permita atualizar se a tarefa pertence ao user autenticado
        if ($task->user_id !== (int) $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        
        $task->update($request->validated());
        return response()->json(new TaskResource($task->load('user', 'category')), 200);
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
