const { z } = require('zod');
const Analysis = require('../models/Analysis');
const { getTHI } = require('../services/aiClient');


const BodySchema = z.object({
    response_text: z.string().min(1, 'response_text required'),
    optional_context: z.array(z.string()).optional().default([])
});


async function analyze(req, res) {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' });
    }
    const { response_text, optional_context } = parsed.data;
    const result = await getTHI({ response_text, optional_context });


    // persist (best-effort)
    try {
        if (process.env.MONGODB_URI) {
            await Analysis.create({ request: { response_text, optional_context }, result, meta: { mode: process.env.AI_MODE } });
        }
    } catch (e) { }


    res.json(result);
}


module.exports = { analyze };