import express from 'express';

import Freelancer from '../models/Freelancer.js';
import { generateGeminiJson, getGeminiApiKey } from '../utils/gemini.js';

const router = express.Router();

const SYSTEM_PROMPT = `You are a project scoping assistant for a freelancer marketplace. Given a client's project description and a list of available freelancers (name, title, skills, category, hourlyRate), return ONLY raw JSON - no markdown:
{ requiredSkills: string[], recommendedStack: string[], budgetRange: {min,max}, reasoning: string, suggestedFreelancers: string[] }`;

function normalizeName(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function safeParseScope(rawContent) {
  try {
    return JSON.parse(rawContent);
  } catch (_error) {
    const cleaned = rawContent.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned);
  }
}

router.post('/scope', async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Project description is required.' });
    }

    const freelancers = await Freelancer.find().lean();

    if (!freelancers.length) {
      return res.status(400).json({ message: 'No freelancers available for scoping yet.' });
    }

    const catalog = freelancers.map((freelancer) => ({
      name: freelancer.name,
      title: freelancer.title,
      skills: freelancer.skills,
      category: freelancer.category,
      hourlyRate: freelancer.hourlyRate,
    }));

    const rawContent = await generateGeminiJson({
      apiKey: getGeminiApiKey(),
      systemInstruction: SYSTEM_PROMPT,
      prompt: JSON.stringify({
        description,
        freelancers: catalog,
        instruction: 'Choose the strongest freelancer matches from the provided list by name only.',
      }),
    });

    const parsed = safeParseScope(rawContent);

    const freelancerMap = new Map(
      freelancers.map((freelancer) => [normalizeName(freelancer.name), freelancer]),
    );

    const suggestedFreelancers = (parsed.suggestedFreelancers ?? [])
      .map((name) => freelancerMap.get(normalizeName(name)))
      .filter(Boolean)
      .slice(0, 3);

    return res.json({
      requiredSkills: parsed.requiredSkills ?? [],
      recommendedStack: parsed.recommendedStack ?? [],
      budgetRange: {
        min: Number(parsed.budgetRange?.min ?? 0),
        max: Number(parsed.budgetRange?.max ?? 0),
      },
      reasoning: parsed.reasoning ?? '',
      suggestedFreelancers,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
