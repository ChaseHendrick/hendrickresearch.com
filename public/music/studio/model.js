import { PLAN_SCHEMA, validatePlan } from './music.js';

export function modelEndpoint(value) {
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Enter an HTTPS server URL or http://localhost URL including /v1.'); }
  if (url.username || url.password || url.search || url.hash || !(['https:'].includes(url.protocol) || url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('Use HTTPS for cloud models, or HTTP on localhost. URL credentials, query strings and fragments are not allowed.');
  url.pathname = `${url.pathname.replace(/\/$/, '')}/chat/completions`;
  return url;
}
export async function modelPlan({ endpoint, model, key = '', strict = true, prompt, settings, signal }) {
  const url = modelEndpoint(endpoint);
  if (!model.trim()) throw new Error('Enter the model name loaded in your server.');
  const body = { model: model.trim(), stream: false, messages: [
    { role: 'system', content: `Design original ambient musical landscapes. Return only a JSON arrangement plan matching this schema: ${JSON.stringify(PLAN_SCHEMA)}. Four progression degrees and eight motif degrees are integers 0 through 6. Omit drums unless explicitly requested. Enable at least one part. Use restrained energy and space for guitar. Do not use em dashes. Do not claim to synthesize audio or control hardware menus.` },
    { role: 'user', content: `Ambient, ${settings.bars} bars, ${settings.bpm} BPM, root pitch class ${settings.root}, ${settings.mode}, seed ${settings.seed}. ${prompt.slice(0, 1800)}` },
  ], response_format: strict ? { type: 'json_schema', json_schema: { name: 'ambient_plan', strict: true, schema: PLAN_SCHEMA } } : { type: 'json_object' } };
  if (url.port === '11434') { body.reasoning_effort = 'none'; body.max_tokens = 1800; }
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers.Authorization = `Bearer ${key}`;
  let response;
  try { response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), mode: 'cors', credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer', signal }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('The model server could not be reached. Check that it is running and allows this studio origin in CORS. Your browser may also request Local Network Access permission. Cloud servers need CORS support; otherwise use the native Mac app or a trusted local model server.');
  }
  if (!response.ok) throw new Error(`Model server returned HTTP ${response.status}. Check the model, key and JSON-schema support; try disabling schema constraints.`);
  const text = await response.text();
  if (text.length > 1_000_000) throw new Error('Model response exceeded the size limit.');
  let object;
  try { object = JSON.parse(text); } catch { throw new Error('The server response was not JSON.'); }
  const choice = object.choices?.[0];
  if (choice?.message?.refusal) throw new Error('The model declined this musical direction. Try another prompt.');
  if (choice?.finish_reason === 'length') throw new Error('The model response was incomplete. Try a shorter direction.');
  let plan;
  try { plan = JSON.parse(choice?.message?.content); } catch { throw new Error('The model did not return a valid JSON plan. Try a model with structured-output support.'); }
  return validatePlan(plan);
}
