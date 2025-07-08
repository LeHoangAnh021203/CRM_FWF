"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

const initialTasks = [
  {
    id: 1,
    title: "Review customer feedback",
    priority: "high" as const,
    completed: false,
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Update product inventory",
    priority: "medium" as const,
    completed: true,
    dueDate: "Yesterday",
  },
  {
    id: 3,
    title: "Prepare monthly report",
    priority: "high" as const,
    completed: false,
    dueDate: "Tomorrow",
  },
  {
    id: 4,
    title: "Contact new suppliers",
    priority: "low" as const,
    completed: false,
    dueDate: "Next week",
  },
  {
    id: 5,
    title: "Team meeting preparation",
    priority: "medium" as const,
    completed: true,
    dueDate: "Today",
  },
]

export function TasksWidget() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask,
        priority: "medium" as const,
        completed: false,
        dueDate: "Today",
      }
      setTasks([...tasks, task])
      setNewTask("")
      setShowAddTask(false)
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
        <p className="text-sm text-gray-600">Your upcoming and completed tasks</p>
      </CardHeader>
      <CardContent>
        {showAddTask ? (
          <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <Input
              placeholder="Enter new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Button size="sm" onClick={addTask}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddTask(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowAddTask(true)} className="w-full mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        )}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {task.title}
                </p>
                <p className="text-sm text-gray-500">{task.dueDate}</p>
              </div>
              <Badge
                variant={
                  task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                }
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Completed: {tasks.filter((t) => t.completed).length}</span>
            <span>Remaining: {tasks.filter((t) => !t.completed).length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
