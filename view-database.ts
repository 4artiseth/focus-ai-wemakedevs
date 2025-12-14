import { prisma } from './src/lib/prisma';

async function viewDatabase() {
  console.log('='.repeat(80));
  console.log('DATABASE CONTENTS VIEWER');
  console.log('='.repeat(80));
  console.log();

  try {
    // Get all Projects with their related data
    const projects = await prisma.project.findMany({
      include: {
        details: true,
        settings: true,
        personas: true,
        sessions: {
          include: {
            responses: {
              include: {
                persona: true,
              },
            },
            messages: true,
            insights: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (projects.length === 0) {
      console.log('No projects found in the database.');
      return;
    }

    console.log(`Found ${projects.length} project(s)\n`);

    projects.forEach((project, index) => {
      console.log('='.repeat(80));
      console.log(`PROJECT ${index + 1}: ${project.name}`);
      console.log('='.repeat(80));
      console.log();

      // Basic Project Info
      console.log('📋 BASIC INFORMATION:');
      console.log(`  ID: ${project.id}`);
      console.log(`  Name: ${project.name}`);
      console.log(`  Description: ${project.description}`);
      console.log(`  Category: ${project.category}`);
      console.log(`  Audience: ${project.audience}`);
      console.log(`  Demographics: ${project.demographics || 'N/A'}`);
      console.log(`  Research Goal: ${project.researchGoal}`);
      console.log(`  Panel Size: ${project.panelSize}`);
      console.log(`  Created: ${project.createdAt.toLocaleString()}`);
      console.log(`  Updated: ${project.updatedAt.toLocaleString()}`);
      console.log();

      // Project Details (from form)
      if (project.details) {
        console.log('📝 FORM DETAILS:');
        console.log(`  Problem: ${project.details.problem || 'N/A'}`);
        console.log(`  Custom Questions: ${project.details.customQuestions || 'N/A'}`);
        console.log();
        console.log('💰 PRICING:');
        console.log(`  Expected Price: ${project.details.priceExpected ? `$${project.details.priceExpected}` : 'N/A'}`);
        console.log(`  Min Price: ${project.details.priceMin ? `$${project.details.priceMin}` : 'N/A'}`);
        console.log(`  Max Price: ${project.details.priceMax ? `$${project.details.priceMax}` : 'N/A'}`);
        console.log(`  Pricing Model: ${project.details.pricingModel || 'N/A'}`);
        console.log();
        console.log('🎯 FEATURES:');
        console.log(`  Core Features: ${project.details.coreFeatures || 'N/A'}`);
        console.log(`  Premium Features: ${project.details.premiumFeatures || 'N/A'}`);
        console.log(`  Future Features: ${project.details.futureFeatures || 'N/A'}`);
        console.log(`  Conjoint Features: ${project.details.conjointFeatures || 'N/A'}`);
        console.log();
        console.log('🔍 ADVANCED:');
        console.log(`  Competitors: ${project.details.competitors || 'N/A'}`);
        console.log(`  Persona Constraints: ${project.details.personaConstraints || 'N/A'}`);
        console.log(`  Tone Formality: ${project.details.toneFormality || 'N/A'}`);
        console.log(`  Tone Skepticism: ${project.details.toneSkepticism || 'N/A'}`);
        console.log(`  Analysis Depth: ${project.details.analysisDepth || 'N/A'}`);
        console.log();
      }

      // Settings
      if (project.settings) {
        console.log('⚙️  SETTINGS:');
        console.log(`  Tone: ${project.settings.tone}`);
        console.log(`  Skepticism: ${project.settings.skepticism}`);
        console.log(`  Detail Level: ${project.settings.detailLevel}`);
        console.log(`  Analysis Depth: ${project.settings.analysisDepth}`);
        console.log();
      }

      // Personas
      if (project.personas.length > 0) {
        console.log(`👥 PERSONAS (${project.personas.length}):`);
        project.personas.forEach((persona, pIndex) => {
          console.log(`  ${pIndex + 1}. ${persona.name}`);
          console.log(`     Age: ${persona.age}, Occupation: ${persona.occupation}`);
          console.log(`     Income: ${persona.income || 'N/A'}, Location: ${persona.location || 'N/A'}`);
          console.log(`     Bio: ${persona.bio.substring(0, 100)}${persona.bio.length > 100 ? '...' : ''}`);
          if (persona.traits) {
            console.log(`     Traits: ${persona.traits}`);
          }
        });
        console.log();
      }

      // Sessions
      if (project.sessions.length > 0) {
        console.log(`💬 SESSIONS (${project.sessions.length}):`);
        project.sessions.forEach((session, sIndex) => {
          console.log(`  ${sIndex + 1}. Session ${session.id.substring(0, 8)}...`);
          console.log(`     Status: ${session.status}`);
          console.log(`     Created: ${session.createdAt.toLocaleString()}`);
          console.log(`     Responses: ${session.responses.length}`);
          console.log(`     Messages: ${session.messages.length}`);
          console.log(`     Insights: ${session.insights.length}`);
          console.log();

          // Show some responses
          if (session.responses.length > 0) {
            console.log(`     📝 RESPONSES (showing first 5 of ${session.responses.length}):`);
            session.responses.slice(0, 5).forEach((response, rIndex) => {
              console.log(`       ${rIndex + 1}. [${response.persona.name}]`);
              console.log(`          Q: ${response.question.substring(0, 80)}${response.question.length > 80 ? '...' : ''}`);
              console.log(`          A: ${response.answer.substring(0, 100)}${response.answer.length > 100 ? '...' : ''}`);
              if (response.reasoning) {
                console.log(`          Reasoning: ${response.reasoning.substring(0, 80)}${response.reasoning.length > 80 ? '...' : ''}`);
              }
            });
            if (session.responses.length > 5) {
              console.log(`       ... and ${session.responses.length - 5} more responses`);
            }
            console.log();
          }

          // Show some messages
          if (session.messages.length > 0) {
            console.log(`     💬 MESSAGES (showing first 5 of ${session.messages.length}):`);
            session.messages.slice(0, 5).forEach((message, mIndex) => {
              console.log(`       ${mIndex + 1}. [${message.sender}] ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`);
            });
            if (session.messages.length > 5) {
              console.log(`       ... and ${session.messages.length - 5} more messages`);
            }
            console.log();
          }

          // Show insights
          if (session.insights.length > 0) {
            console.log(`     💡 INSIGHTS (${session.insights.length}):`);
            session.insights.forEach((insight, iIndex) => {
              console.log(`       ${iIndex + 1}. [${insight.type}] Confidence: ${insight.confidence}`);
              console.log(`          ${insight.content.substring(0, 120)}${insight.content.length > 120 ? '...' : ''}`);
            });
            console.log();
          }
        });
      } else {
        console.log('💬 No sessions found for this project.');
        console.log();
      }

      console.log();
    });

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    const totalSessions = projects.reduce((sum, p) => sum + p.sessions.length, 0);
    const totalPersonas = projects.reduce((sum, p) => sum + p.personas.length, 0);
    const totalResponses = projects.reduce((sum, p) => 
      sum + p.sessions.reduce((sSum, s) => sSum + s.responses.length, 0), 0
    );
    const totalMessages = projects.reduce((sum, p) => 
      sum + p.sessions.reduce((sSum, s) => sSum + s.messages.length, 0), 0
    );
    const totalInsights = projects.reduce((sum, p) => 
      sum + p.sessions.reduce((sSum, s) => sSum + s.insights.length, 0), 0
    );

    console.log(`Total Projects: ${projects.length}`);
    console.log(`Total Sessions: ${totalSessions}`);
    console.log(`Total Personas: ${totalPersonas}`);
    console.log(`Total Responses: ${totalResponses}`);
    console.log(`Total Messages: ${totalMessages}`);
    console.log(`Total Insights: ${totalInsights}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error viewing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewDatabase();


