import { NextResponse } from 'next/server'
import { unlinkSync } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { taskId, language } = await request.json()

    const taskPath = path.join(process.cwd(), 'data/kanban/tasks', language, `${taskId}.mdx`)

    unlinkSync(taskPath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
