import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, CheckCircle } from 'lucide-react';
import { getAllTasks, addTask, completeTask, getWorkers } from '../utils/firebase'; // Updated import to use `getAllTasks`

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
}

interface Worker {
  id: string;
  email: string;
  uid: string; // Make sure worker's uid is available
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerMap, setWorkerMap] = useState<{ [key: string]: string }>({}); // Map of uid to email
  const [newTask, setNewTask] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all tasks (no user-based filtering for the admin)
        const fetchedTasks = await getAllTasks(); // Updated to fetch all tasks
        const fetchedWorkers = await getWorkers();
        setTasks(fetchedTasks as Task[]);
        setWorkers(fetchedWorkers as Worker[]);

        // Create a map of uid to email for easier display
        const workerEmailMap = fetchedWorkers.reduce(
          (acc: { [key: string]: string }, worker: Worker) => {
            acc[worker.uid] = worker.email;
            return acc;
          },
          {}
        );
        setWorkerMap(workerEmailMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask || !assignTo) {
      setTaskError('Please fill out both fields');
      return;
    }

    setTaskLoading(true);
    setTaskError('');

    try {
      // Get the selected worker's uid and pass it to the addTask function
      const selectedWorker = workers.find((worker) => worker.id === assignTo);
      if (selectedWorker) {
        await addTask(newTask, selectedWorker.uid); // Assigning the correct UID
        setTasks((prevTasks) => [
          ...prevTasks,
          {
            id: new Date().toISOString(),
            title: newTask,
            assignedTo: selectedWorker.uid, // Use the correct uid
            completed: false,
          },
        ]);
        setNewTask('');
        setAssignTo('');
      } else {
        setTaskError('Invalid worker selected');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setTaskError('Failed to add task. Please try again.');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
      setTaskError('Failed to mark task as complete.');
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Admin Dashboard
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
            <h2 className="text-lg font-semibold mb-4">Assign New Task</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task title"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.email}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddTask}
                disabled={taskLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                {taskLoading ? 'Adding...' : 'Add Task'}
              </button>
            </div>

            {taskError && (
              <p className="text-red-500 text-sm mb-4">{taskError}</p>
            )}

            <h2 className="text-lg font-semibold mb-4">Task List</h2>
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-white p-4 rounded-md shadow"
                >
                  <div>
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Assigned to: {workerMap[task.assignedTo] || task.assignedTo}
                    </p>
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
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Mark as Complete
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

export default AdminDashboard;
