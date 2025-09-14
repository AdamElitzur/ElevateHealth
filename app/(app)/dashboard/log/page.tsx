'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDailyLogs } from '@/app/actions/daily-log';
import DailyLogForm from './daily-log-form';

interface DailyLogFormProps {
  onSuccess?: () => void;
}

export default function DailyLogPage() {
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getDailyLogs>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Load logs
  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const todayLogs = await getDailyLogs(today, today);
      setLogs(todayLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs();
  }, []);

  const handleNewEntry = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadLogs();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Log - {format(new Date(), "MMMM d, yyyy")}</h1>
        <Button onClick={handleNewEntry} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Entry'}
        </Button>
      </div>
      
      <div className="space-y-8">
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
            <DailyLogForm onSuccess={handleFormSuccess} />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading entries...</div>
        ) : logs.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Today's Entries</h2>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {log.product_name || 'Custom Entry'}
                        {log.meal_category && ` • ${log.meal_category}`}
                        {log.meal_time && (
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(`2000-01-01T${log.meal_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </h3>
                      {log.sugar_intake_grams && (
                        <p className="text-sm text-gray-600">
                          Sugar: {log.sugar_intake_grams}g
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No entries yet. Click 'Add Entry' to log your first meal or note.
          </p>
        )}
      </div>
    </div>
  );
}
