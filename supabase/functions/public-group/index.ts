import { getSupabaseAdmin } from '../_shared/db.ts'
import { corsResponse, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse()
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  const url = new URL(req.url)
  const idParam = url.searchParams.get('id')
  if (!idParam) return jsonResponse({ error: 'Group id is required' }, 400)

  const groupId = parseInt(idParam, 10)
  if (!Number.isFinite(groupId) || groupId <= 0) {
    return jsonResponse({ error: 'Invalid group id' }, 400)
  }

  const supabase = getSupabaseAdmin()

  try {
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .select('id, name, teacherId, subject, customSubject, level, createdAt')
      .eq('id', groupId)
      .maybeSingle()
    if (gErr) throw gErr
    if (!group) return jsonResponse({ error: 'Group not found' }, 404)

    let teacherFullName = ''
    let teacherUsername = ''
    if (group.teacherId != null) {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('username, fullName')
        .eq('id', group.teacherId)
        .maybeSingle()
      if (teacher) {
        teacherFullName = teacher.fullName ?? ''
        teacherUsername = teacher.username ?? ''
      }
    }

    const [schedRes, studRes] = await Promise.all([
      supabase.from('group_schedules').select('*').eq('groupId', groupId).order('date').order('startTime'),
      supabase.from('group_students').select('*').eq('groupId', groupId).order('id'),
    ])
    if (schedRes.error) throw schedRes.error
    if (studRes.error) throw studRes.error

    const schedules = (schedRes.data ?? []).map((s) => ({ ...s, isTrialLesson: !!s.isTrialLesson }))
    const students = studRes.data ?? []

    const scheduleIds = schedules
      .map((s) => s.id)
      .filter((id): id is number => typeof id === 'number')

    let attendance: Array<{
      id?: number
      studentId: number
      scheduleId: number
      status: string
      createdAt?: string
    }> = []

    if (scheduleIds.length > 0) {
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .in('scheduleId', scheduleIds)
      if (attErr) throw attErr
      attendance = attData ?? []
    }

    return jsonResponse({
      group: {
        ...group,
        teacherFullName,
        teacherUsername,
        schedules,
        students,
      },
      attendance,
    })
  } catch (err) {
    console.error('Public group error:', err)
    return jsonResponse({ error: 'Failed to fetch group' }, 500)
  }
})
