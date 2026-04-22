<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    /**
     * Retorna listagem de todas as categorias.
     * Inclui contagem de crachés e tarefas associadas.
     * Paginado: 15 categorias por página.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection Categorias paginadas
     */
    public function index()
    {
        return CategoryResource::collection(
            Category::with('badges')
                ->withCount('tasks')
                ->paginate(15)
        );
    }

    /**
     * Cria uma nova categoria.
     * Requer autorização (administrador).
     *
     * Dados esperados:
     *  - nome: string - Nome da categoria
     *  - cor: string - Cor hexadecimal (ex: #FF0000)
     *
     * @param StoreCategoryRequest $request Dados validados
     * @return \Illuminate\Http\JsonResponse Categoria criada, HTTP 201
     */
    public function store(StoreCategoryRequest $request)
    {
        // Verifica se utilizador tem permissão de criar categorias (admin)
        $this->authorize('create', Category::class);
        
        $category = Category::create($request->validated());
        return response()->json(new CategoryResource($category), 201);
    }

    /**
     * Retorna detalhes de uma categoria específica.
     * Inclui crachés e contagem de tarefas.
     *
     * @param string $id ID da categoria
     * @return CategoryResource Dados da categoria
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Se não existe
     */
    public function show(string $id)
    {
        return new CategoryResource(
            Category::with('badges')
                ->withCount('tasks')
                ->findOrFail($id)
        );
    }

    /**
     * Atualiza uma categoria existente.
     * Requer autorização (administrador).
     *
     * @param UpdateCategoryRequest $request Dados validados
     * @param string $id ID da categoria a atualizar
     * @return \Illuminate\Http\JsonResponse Categoria atualizada, HTTP 200
     */
    public function update(UpdateCategoryRequest $request, string $id)
    {
        $category = Category::findOrFail($id);

        // Verifica autorização
        $this->authorize('update', $category);
        
        $category->update($request->validated());
        return response()->json(new CategoryResource($category), 200);
    }

    /**
     * Remove uma categoria da base de dados.
     * Requer autorização (administrador).
     *
     * Nota: Cascade delete é definido nas migrações.
     *       - Tarefas dessa categoria são orphaned (category_id = null)
     *       - Crachés dessa categoria são deletadas
     *
     * @param string $id ID da categoria a deletar
     * @return \Illuminate\Http\Response HTTP 204 No Content
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        // Verifica autorização
        $this->authorize('delete', $category);

        $category->delete();
        return response()->noContent();
    }
}
