<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Badge;
use App\Http\Resources\BadgeResource;

class BadgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return BadgeResource::collection(Badge::with('category')->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:badges',
            'descricao' => 'nullable|string',
            'icon' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $badge = Badge::create($validated);
        return response()->json($badge, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new BadgeResource(Badge::with('category')->findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $badge = Badge::findOrFail($id);
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:badges,nome,' . $id,
            'descricao' => 'nullable|string',
            'icon' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $badge->update($validated);
        return response()->json($badge, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Badge::findOrFail($id)->delete();
        return response()->noContent();
    }
}
