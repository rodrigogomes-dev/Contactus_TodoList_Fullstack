<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatsResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Get available years and months with user data
     */
    public function availableYearsAndMonths()
    {
        $now = now();

        // Get all years that have users
        $yearsWithData = User::distinct()
            ->select(DB::raw('YEAR(created_at) as year'))
            ->orderBy('year', 'desc')
            ->get()
            ->pluck('year')
            ->toArray();

        // For each year, get available months (up to current month if current year)
        $result = [];
        foreach ($yearsWithData as $year) {
            $monthsQuery = User::whereYear('created_at', $year)
                ->distinct()
                ->select(DB::raw('MONTH(created_at) as month'))
                ->orderBy('month', 'asc')
                ->get()
                ->pluck('month')
                ->toArray();

            // If it's the current year, only include months up to current month
            if ($year === $now->year) {
                $monthsQuery = array_filter($monthsQuery, function ($month) use ($now) {
                    return $month <= $now->month;
                });
                $monthsQuery = array_values($monthsQuery); // Re-index array
            }

            $result[$year] = $monthsQuery;
        }

        return response()->json($result, 200);
    }

    /**
     * Get user growth statistics for a given year
     * Shows monthly breakdown of new user registrations
     * 
     * @param Request $request - Query param: year
     */
    public function userGrowth(Request $request)
    {
        $year = $request->query('year');
        
        if (!$year || !is_numeric($year)) {
            return response()->json(['message' => 'Year parameter is required'], 400);
        }

        $now = now();
        $currentMonth = $now->month;

        // Query: group by month with user count
        $users = User::whereYear('created_at', $year)
                     ->whereMonth('created_at', '<=', $currentMonth)
                     ->groupBy(DB::raw('MONTH(created_at)'))
                     ->select(
                         DB::raw('MONTH(created_at) as month'),
                         DB::raw('COUNT(*) as count')
                     )
                     ->orderBy('month')
                     ->get();

        // Map to month names (Jan, Feb, Mar, etc)
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        $labels = [];
        $data = [];
        
        foreach ($users as $user) {
            $labels[] = $monthNames[$user->month - 1];
            $data[] = $user->count;
        }
        
        $response = [
            'period' => 'year',
            'year' => (int)$year,
            'labels' => $labels,
            'data' => $data,
        ];
        
        return response()->json(new StatsResource($response));
    }
}
