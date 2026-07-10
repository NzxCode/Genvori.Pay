import { supabase } from '../config/supabase.js'

export async function getAll() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')

  if (error) throw error
  return data
}

export async function create(userId, data) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: data.name,
      budget: data.budget || 0,
      status: data.status || 'active'
    })
    .select()
    .single()

  if (error) throw error
  return project
}

export async function getById(projectId, userId) {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (pErr) throw pErr

  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .eq('project_id', projectId)

  if (payErr) throw payErr

  return { project, payments }
}

export async function update(projectId, userId, data) {
  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return updatedProject
}

export async function remove(projectId, userId) {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'deleted' }) // Using status instead of deleted_at as per schema
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

export async function getBudgetAlocation(projectId, userId) {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('budget')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (pErr) throw pErr

  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('amount')
    .eq('project_id', projectId)
    .eq('status', 'success')

  if (payErr) throw payErr

  const totalUsed = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const totalBudget = parseFloat(project.budget)
  const remaining = totalBudget - totalUsed

  return {
    total_budget: totalBudget,
    used: totalUsed,
    remaining: remaining,
    percentage: totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0
  }
}

