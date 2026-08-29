import { Router } from 'express'
import { z } from 'zod'

const formSchema = z.record(z.string(), z.string())
const responseSchema = z.object({ form: formSchema })
type SurveyResponse = { form: Record<string, string>; submittedAt: string }
const responses = new Map<string, SurveyResponse>()

export function createSurveyRouter(): Router {
  const router = Router()
  router.post('/consultation-links', (_req, res) => {
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    res.status(201).json({ success: true, data: { token } })
  })
  router.get('/consultation-links/:token/response', (req, res) => {
    const response = responses.get(req.params.token)
    if (!response) { res.status(404).json({ success: false, code: 'SURVEY_RESPONSE_NOT_FOUND', error: '아직 제출된 설문 응답이 없습니다.' }); return }
    res.json({ success: true, data: response })
  })
  router.post('/consultation-links/:token/response', (req, res) => {
    const parsed = responseSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ success: false, code: 'INVALID_SURVEY_RESPONSE', error: '설문 응답 형식이 올바르지 않습니다.' }); return }
    const response = { form: parsed.data.form, submittedAt: new Date().toISOString() }
    responses.set(req.params.token, response)
    res.status(201).json({ success: true, data: response })
  })
  return router
}
