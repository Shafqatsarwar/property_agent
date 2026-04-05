// skills/index.js
// Skill system for Property Agent

class SkillRegistry {
  constructor() {
    this.skills = new Map();
    this.initializeSkills();
  }

  initializeSkills() {
    // Register all available skills
    this.registerSkill('propertySearch', require('./propertySearch'));
    this.registerSkill('propertyValuation', require('./propertyValuation'));
    this.registerSkill('agentFinder', require('./agentFinder'));
    this.registerSkill('marketAnalyzer', require('./marketAnalyzer'));
    this.registerSkill('bookingSystem', require('./bookingSystem'));
  }

  registerSkill(name, skillModule) {
    this.skills.set(name, skillModule);
    console.log(`Skill registered: ${name}`);
  }

  getSkill(name) {
    return this.skills.get(name);
  }

  async executeSkill(skillName, params) {
    const skill = this.getSkill(skillName);
    if (!skill) {
      throw new Error(`Skill '${skillName}' not found`);
    }

    try {
      return await skill.execute(params);
    } catch (error) {
      console.error(`Error executing skill ${skillName}:`, error);
      throw error;
    }
  }

  listSkills() {
    return Array.from(this.skills.keys());
  }

  getSkillInfo(skillName) {
    const skill = this.getSkill(skillName);
    if (!skill) return null;

    return {
      name: skillName,
      description: skill.description,
      parameters: skill.parameters
    };
  }
}

// Singleton instance
const skillRegistry = new SkillRegistry();
module.exports = skillRegistry;