import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: Request) {
  try {
    const { taskId, updates, language } = await request.json()

    const taskPath = path.join(process.cwd(), 'data/kanban/tasks', language, `${taskId}.mdx`)

    const fileContent = readFileSync(taskPath, 'utf-8')
    const { data, content } = matter(fileContent)

    const updatedData = {
      ...data,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const newContent = matter.stringify(content, updatedData)
    writeFileSync(taskPath, newContent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
