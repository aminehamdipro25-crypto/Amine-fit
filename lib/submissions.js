import fs from 'fs/promises'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'submissions.json')

export async function getSubmissions() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function saveSubmission(data) {
  const list = await getSubmissions()
  const entry = {
    id: `AF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    ...data,
  }
  list.unshift(entry)
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8')
  return entry
}

export async function updateStatus(id, status) {
  const list = await getSubmissions()
  const idx = list.findIndex(s => s.id === id)
  if (idx !== -1) {
    list[idx].status = status
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8')
    return list[idx]
  }
  return null
}
