import type { D1Database, PagesFunction } from '@cloudflare/workers-types'

interface Env {
  DB: D1Database
}

interface Group {
  id?: number
  name: string
  teacherId: number | null
  subject: string
  customSubject?: string
  level: string
  createdAt?: string
  teacherFullName?: string
  teacherUsername?: string
  schedules?: GroupSchedule[]
  students?: GroupStudent[]
}

interface GroupSchedule {
  id?: number
  groupId?: number
  date: string
  startTime: string
  endTime: string
  isTrialLesson?: boolean
  comment?: string
  createdAt?: string
}

interface GroupStudent {
  id?: number
  groupId?: number
  fullName: string
  email?: string
  phone?: string
  createdAt?: string
}

interface AttendanceRecord {
  id?: number
  studentId: number
  scheduleId: number
  status: string
  createdAt?: string
}

type DbBoolean = number | string | boolean | null

type GroupScheduleDbRow = Omit<GroupSchedule, 'isTrialLesson'> & { isTrialLesson: DbBoolean }

const parseDbBoolean = (value: DbBoolean): boolean => {
  if (value === null) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  return value === '1'
}

const mapScheduleDbRowToApi = (row: GroupScheduleDbRow): GroupSchedule => ({
  ...row,
  isTrialLesson: parseDbBoolean(row.isTrialLesson),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')
    if (!idParam) {
      return new Response(JSON.stringify({ error: 'Group id is required' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const groupId = parseInt(idParam, 10)
    if (!Number.isFinite(groupId) || groupId <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid group id' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const groupResult = await env.DB.prepare(
      'SELECT id, name, teacherId, subject, customSubject, level, createdAt FROM groups WHERE id = ?'
    )
      .bind(groupId)
      .first<Group>()

    if (!groupResult) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: corsHeaders,
      })
    }

    const group = groupResult as Group
    group.teacherFullName = ''
    group.teacherUsername = ''

    if (group.teacherId != null) {
      const teacher = await env.DB.prepare(
        'SELECT username, fullName FROM teachers WHERE id = ?'
      )
        .bind(group.teacherId)
        .first<{ username: string; fullName: string }>()
      if (teacher) {
        group.teacherFullName = teacher.fullName ?? ''
        group.teacherUsername = teacher.username ?? ''
      }
    }

    const schedulesResult = await env.DB.prepare(
      'SELECT id, groupId, date, startTime, endTime, isTrialLesson, comment, createdAt FROM group_schedules WHERE groupId = ? ORDER BY date, startTime'
    )
      .bind(groupId)
      .all()

    group.schedules = ((schedulesResult.results || []) as GroupScheduleDbRow[]).map(
      mapScheduleDbRowToApi
    )

    const studentsResult = await env.DB.prepare(
      'SELECT id, groupId, fullName, email, phone, createdAt FROM group_students WHERE groupId = ? ORDER BY id'
    )
      .bind(groupId)
      .all()

    group.students = (studentsResult.results || []) as GroupStudent[]

    const scheduleIds = (group.schedules ?? [])
      .map((s) => s.id)
      .filter((id): id is number => typeof id === 'number')

    let attendance: AttendanceRecord[] = []
    if (scheduleIds.length > 0) {
      const placeholders = scheduleIds.map(() => '?').join(', ')
      const attResult = await env.DB.prepare(
        `SELECT id, studentId, scheduleId, status, createdAt FROM attendance WHERE scheduleId IN (${placeholders})`
      )
        .bind(...scheduleIds)
        .all()
      attendance = (attResult.results || []) as AttendanceRecord[]
    }

    return new Response(JSON.stringify({ group, attendance }), {
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error fetching public group:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch group' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}
