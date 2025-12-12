import { NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: Request) {
  try {
    const task = await request.json()

    const taskId = `task-${Date.now()}`
    const taskPath = path.join(process.cwd(), 'data/kanban/tasks', task.language, `${taskId}.mdx`)

    const frontmatter = {
      title: task.title || 'New Task',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      tags: task.tags || [],
      language: task.language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: task.order || 0,
      boardId: task.boardId || 'default',
    }

    if (task.dueDate) {
      frontmatter['dueDate'] = task.dueDate
    }

    const content = matter.stringify(task.content || '', frontmatter)
    writeFileSync(taskPath, content)

    return NextResponse.json({ success: true, taskId })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
