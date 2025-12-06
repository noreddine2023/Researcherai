'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Insight, InsightTodo, InsightComment } from '@/types'
import { MessageCircle, ListTodo, MoreVertical, X } from 'lucide-react'

interface InsightCardProps {
  insight: Insight
  onUpdate: (id: string, data: Partial<Insight>) => void
}

export function InsightCard({ insight, onUpdate }: InsightCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [newTodo, setNewTodo] = useState('')
  const [newComment, setNewComment] = useState('')

  const typeColors = {
    finding: 'bg-blue-100 text-blue-700',
    methodology: 'bg-purple-100 text-purple-700',
    limitation: 'bg-amber-100 text-amber-700',
    idea: 'bg-emerald-100 text-emerald-700',
  }

  const handleAddTodo = () => {
    if (!newTodo.trim()) return
    const todo: InsightTodo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
    }
    onUpdate(insight.id, {
      todos: [...(insight.todos || []), todo]
    })
    setNewTodo('')
  }

  const handleToggleTodo = (todoId: string) => {
    const updatedTodos = insight.todos?.map(t =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    )
    onUpdate(insight.id, { todos: updatedTodos })
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: InsightComment = {
      id: Date.now().toString(),
      user: 'You',
      content: newComment,
      timestamp: 'Just now',
    }
    onUpdate(insight.id, {
      comments: [...(insight.comments || []), comment]
    })
    setNewComment('')
  }

  return (
    <Card className="hover:shadow-lg transition cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold mb-2">
              {insight.title}
            </CardTitle>
            <Badge className={`${typeColors[insight.type]} text-xs`}>
              {insight.type}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {insight.content}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ListTodo className="w-3 h-3" />
            <span>{insight.todos?.filter(t => t.completed).length || 0}/{insight.todos?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{insight.comments?.length || 0}</span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-4 pt-3 border-t">
            {/* Todos */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">To-dos</h4>
              {insight.todos?.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <span className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.text}
                  </span>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a todo..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" onClick={handleAddTodo}>Add</Button>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Comments</h4>
              {insight.comments?.map((comment) => (
                <div key={comment.id} className="bg-muted p-2 rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{comment.user}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" onClick={handleAddComment}>Add</Button>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </CardContent>
    </Card>
  )
}
