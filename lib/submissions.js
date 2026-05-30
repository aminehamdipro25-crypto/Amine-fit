import fs from 'fs/promises'
import path from 'path'

// On Vercel, process.cwd() is read-only. /tmp is the only writable dir.
const FILE = path.join('/tmp', 'submissions.json')

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
