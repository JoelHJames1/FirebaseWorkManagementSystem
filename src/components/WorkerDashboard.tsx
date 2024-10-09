import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle } from 'lucide-react';
import { getTasks, completeTask } from '../utils/firebase';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const WorkerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null); // Track which task is being completed

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          setLoading(true);
          // Fetch tasks assigned to the current logged-in worker
          const fetchedTasks = await getTasks(user.uid); // Filtering by assignedTo with user.uid
          setTasks(fetchedTasks as Task[]);
          setError(null);
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setError('Failed to load tasks. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTask(taskId); // Set the task that is being completed
      // Optimistically update the UI before the server confirms the task completion
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      await completeTask(taskId);
      setCompletingTask(null); // Reset completing task
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to mark task as complete.');
      setCompletingTask(null); // Reset on error as well
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Worker Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-white p-4 rounded-md shadow"
                >
                  <div>
                    <h3 className="text-lg font-medium">{task.title}</h3>
                  </div>
                  <div className="flex items-center">
                    {task.completed ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completingTask === task.id} // Disable button if task is being completed
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                          completingTask === task.id
                            ? 'bg-gray-400'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        {completingTask === task.id
                          ? 'Completing...'
                          : 'Complete Task'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
