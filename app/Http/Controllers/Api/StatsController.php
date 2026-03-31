<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Stats\GetUsersGrowthRequest;
use App\Http\Resources\StatsResource;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function userGrowth(GetUsersGrowthRequest $request)
    {
        $period = $request->validated()['period']; // 'year' ou 'month'
        $year = $request->validated()['year'];
        $month = $request->validated()['month'] ?? null;
        
        $now = now();
        
        if ($period === 'year') {
            return $this->getYearData($year, $now);
        }
        
        if ($period === 'month') {
            return $this->getMonthData($year, $month, $now);
        }
    }
    
    private function getYearData($year, $now)
    {
        // Obtém o mês atual
        $currentMonth = $now->month;
        
        // Query: agrupa por mês (1-12) apenas até mês atual
        $users = User::whereYear('created_at', $year)
                     ->whereMonth('created_at', '<=', $currentMonth)
                     ->groupBy(DB::raw('MONTH(created_at)'))
                     ->select(
                         DB::raw('MONTH(created_at) as month'),
                         DB::raw('COUNT(*) as count')
                     )
                     ->orderBy('month')
                     ->get();
        
        // Mapear para labels (Jan, Feb, Mar, etc)
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        $labels = [];
        $data = [];
        
        foreach ($users as $user) {
            $labels[] = $monthNames[$user->month - 1];
            $data[] = $user->count;
        }
        
        return response()->json(new StatsResource([
            'period' => 'year',
            'year' => $year,
            'current_month' => $currentMonth,
            'labels' => $labels,
            'data' => $data,
        ]));
    }
    
    private function getMonthData($year, $month, $now)
    {
        // Cria data para obter dias do mês
        $date = Carbon::createFromDate($year, $month, 1);
        $daysInMonth = $date->daysInMonth; // 28, 29, 30 ou 31
        $currentDay = $now->day;
        
        // Se estamos em mês futuro, retornar vazio
        if ($year === $now->year && $month > $now->month) {
            return response()->json(new StatsResource([
                'period' => 'month',
                'year' => $year,
                'month' => $month,
                'days_in_month' => $daysInMonth,
                'current_day' => $currentDay,
                'total_weeks' => ceil($daysInMonth / 7),
                'labels' => [],
                'data' => [],
            ]));
        }
        
        // Query: agrupa por semana dentro do mês
        $users = User::whereYear('created_at', $year)
                     ->whereMonth('created_at', $month)
                     ->groupBy(DB::raw('FLOOR((DAY(created_at) - 1) / 7) + 1'))
                     ->select(
                         DB::raw('FLOOR((DAY(created_at) - 1) / 7) + 1 as week'),
                         DB::raw('COUNT(*) as count')
                     )
                     ->orderBy('week')
                     ->get();
        
        // Calcular semanas totais
        $totalWeeks = ceil($daysInMonth / 7);
        
        // Mapear para labels
        $labels = [];
        $data = [];
        
        foreach ($users as $user) {
            $labels[] = "Week {$user->week}";
            $data[] = $user->count;
        }
        
        return response()->json(new StatsResource([
            'period' => 'month',
            'year' => $year,
            'month' => $month,
            'days_in_month' => $daysInMonth,
            'current_day' => $currentDay,
            'total_weeks' => $totalWeeks,
            'labels' => $labels,
            'data' => $data,
        ]));
    }
}
