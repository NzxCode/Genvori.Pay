import * as projectService from '../services/projectService.js'

export async function getAll(req, res, next) {
  try {
    const projects = await projectService.getAll()
    res.status(200).json({ success: true, data: projects })
  } catch (error) {
    next(error)
  }
}

export async function create(req, res, next) {
  try {
    const result = await projectService.create(req.user.id, req.body)
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export async function getById(req, res, next) {
  try {
    const { projectId } = req.params
    const result = await projectService.getById(projectId, req.user.id)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export async function update(req, res, next) {
  try {
    const { projectId } = req.params
    const result = await projectService.update(projectId, req.user.id, req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export async function remove(req, res, next) {
  try {
    const { projectId } = req.params
    await projectService.remove(projectId, req.user.id)
    res.status(200).json({ success: true, message: 'Project removed successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getBudgetAlocation(req, res, next) {
  try {
    const { projectId } = req.params
    const result = await projectService.getBudgetAlocation(projectId, req.user.id)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}
