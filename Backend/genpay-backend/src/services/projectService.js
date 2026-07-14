import { supabase } from '../config/supabase.js'

function handleSupabaseError(error) {
  if (!error) return null;
  
  // PGRST116: The result contains 0 rows (for .single())
  if (error.code === 'PGRST116') {
    const err = new Error('Project not found');
    err.statusCode = 404;
    return err;
  }
  
  const err = new Error(error.message);
  err.statusCode = error.status || 500;
  return err;
}

export async function getAll(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)

  const handledError = handleSupabaseError(error);
  if (handledError) throw handledError;
  
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

  const handledError = handleSupabaseError(error);
  if (handledError) throw handledError;
  
  return project
}

export async function getById(projectId, userId) {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  const handledPErr = handleSupabaseError(pErr);
  if (handledPErr) throw handledPErr;

  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .eq('project_id', projectId)

  const handledPayErr = handleSupabaseError(payErr);
  if (handledPayErr) throw handledPayErr;

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

  const handledError = handleSupabaseError(error);
  if (handledError) throw handledError;
  
  return updatedProject
}

export async function remove(projectId, userId) {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'deleted' }) // Using status instead of deleted_at as per schema
    .eq('id', projectId)
    .eq('user_id', userId)

  const handledError = handleSupabaseError(error);
  if (handledError) throw handledError;
  
  return { success: true }
}

export async function getBudgetAlocation(projectId, userId) {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('budget')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  const handledPErr = handleSupabaseError(pErr);
  if (handledPErr) throw handledPErr;

  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('amount')
    .eq('project_id', projectId)
    .eq('status', 'success')

  const handledPayErr = handleSupabaseError(payErr);
  if (handledPayErr) throw handledPayErr;

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

