// app/api/restaurant-hours/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Define TypeScript type for a row
type RestaurantHour = {
    id: string;
    day_of_week: number; // 0 = Sunday, 6 = Saturday
    is_open: boolean;
    open_time: string; // HH:MM:SS
    close_time: string;
};

export async function GET() {
    const { data, error } = await supabase.from('restaurant_hours').select('*');
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    // Expect body: { hours: RestaurantHour[] }
    try {
        const { hours } = await req.json();
        if (!Array.isArray(hours)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Delete all existing records first
        const { error: deleteError } = await supabase
            .from('restaurant_hours')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError && deleteError.code !== 'PGRST116') {
            console.error('Delete error:', deleteError);
            // Continue anyway
        }

        // Prepare data - remove IDs and ensure proper format
        const hoursToInsert = hours.map(({ id, ...rest }) => ({
            day_of_week: rest.day_of_week,
            is_open: rest.is_open,
            open_time: rest.open_time,
            close_time: rest.close_time
        }));

        // Insert all records
        const { data, error } = await supabase
            .from('restaurant_hours')
            .insert(hoursToInsert)
            .select();

        if (error) {
            console.error('Insert error:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('POST error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
