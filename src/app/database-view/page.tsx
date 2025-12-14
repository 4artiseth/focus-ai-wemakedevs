'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  demographics: string | null;
  researchGoal: string;
  panelSize: number;
  createdAt: string;
  updatedAt: string;
  details: {
    problem: string | null;
    customQuestions: string | null;
    priceExpected: number | null;
    priceMin: number | null;
    priceMax: number | null;
    pricingModel: string | null;
    coreFeatures: string | null;
    premiumFeatures: string | null;
    futureFeatures: string | null;
    conjointFeatures: string | null;
    competitors: string | null;
    personaConstraints: string | null;
    toneFormality: number | null;
    toneSkepticism: number | null;
    analysisDepth: string | null;
  } | null;
  settings: {
    tone: number;
    skepticism: number;
    detailLevel: number;
    analysisDepth: string;
  } | null;
  personas: Array<{
    id: string;
    name: string;
    age: number;
    occupation: string;
    income: string | null;
    location: string | null;
    bio: string;
    traits: string | null;
  }>;
  sessions: Array<{
    id: string;
    status: string;
    createdAt: string;
    responses: Array<{
      id: string;
      question: string;
      answer: string;
      reasoning: string | null;
      metadata: string | null;
      persona: {
        name: string;
      };
    }>;
    messages: Array<{
      id: string;
      sender: string;
      content: string;
      createdAt: string;
    }>;
    insights: Array<{
      id: string;
      type: string;
      content: string;
      confidence: number;
      citations: string | null;
    }>;
  }>;
}

export default function DatabaseViewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/database/view');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Database Viewer</h1>
            <p className="text-gray-600">View all form submissions and stored data</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No projects found in the database.</p>
              <Link href="/dashboard/new">
                <Button className="mt-4">Create Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="bg-gray-100">
                  <CardTitle>Project {index + 1}: {project.name}</CardTitle>
                  <CardDescription>
                    Created: {new Date(project.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-gray-600 mt-1">{project.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Audience:</span>
                        <p className="text-gray-600 mt-1">{project.audience}</p>
                      </div>
                      <div>
                        <span className="font-medium">Research Goal:</span>
                        <p className="text-gray-600 mt-1">{project.researchGoal}</p>
                      </div>
                      <div>
                        <span className="font-medium">Panel Size:</span>
                        <p className="text-gray-600 mt-1">{project.panelSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Details */}
                  {project.details && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Form Details</h3>
                      <div className="space-y-4">
                        {project.details.problem && (
                          <div>
                            <span className="font-medium">Problem:</span>
                            <p className="text-gray-600 mt-1">{project.details.problem}</p>
                          </div>
                        )}
                        {project.details.customQuestions && (
                          <div>
                            <span className="font-medium">Custom Questions:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {project.details.customQuestions}
                            </pre>
                          </div>
                        )}
                        {(project.details.priceExpected || project.details.priceMin || project.details.priceMax) && (
                          <div>
                            <span className="font-medium">Pricing:</span>
                            <div className="text-gray-600 mt-1 space-y-1">
                              {project.details.priceExpected && (
                                <p>Expected: ${project.details.priceExpected}</p>
                              )}
                              {project.details.priceMin && (
                                <p>Min: ${project.details.priceMin}</p>
                              )}
                              {project.details.priceMax && (
                                <p>Max: ${project.details.priceMax}</p>
                              )}
                              {project.details.pricingModel && (
                                <p>Model: {project.details.pricingModel}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {(project.details.coreFeatures || project.details.premiumFeatures || project.details.futureFeatures) && (
                          <div>
                            <span className="font-medium">Features:</span>
                            <div className="text-gray-600 mt-1 space-y-1">
                              {project.details.coreFeatures && (
                                <p><strong>Core:</strong> {project.details.coreFeatures}</p>
                              )}
                              {project.details.premiumFeatures && (
                                <p><strong>Premium:</strong> {project.details.premiumFeatures}</p>
                              )}
                              {project.details.futureFeatures && (
                                <p><strong>Future:</strong> {project.details.futureFeatures}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {project.details.competitors && (
                          <div>
                            <span className="font-medium">Competitors:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {project.details.competitors}
                            </pre>
                          </div>
                        )}
                        {project.details.personaConstraints && (
                          <div>
                            <span className="font-medium">Persona Constraints:</span>
                            <p className="text-gray-600 mt-1">{project.details.personaConstraints}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personas */}
                  {project.personas.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        Personas ({project.personas.length})
                      </h3>
                      <div className="space-y-3">
                        {project.personas.map((persona) => (
                          <div key={persona.id} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">{persona.name}</div>
                            <div className="text-sm text-gray-600">
                              Age: {persona.age}, {persona.occupation}
                              {persona.income && `, Income: ${persona.income}`}
                              {persona.location && `, Location: ${persona.location}`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{persona.bio}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sessions */}
                  {project.sessions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        Sessions ({project.sessions.length})
                      </h3>
                      <div className="space-y-4">
                        {project.sessions.map((session) => (
                          <div key={session.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-medium">Session {session.id.substring(0, 8)}...</span>
                                <span className="ml-2 text-sm text-gray-500">({session.status})</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(session.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium">Responses:</span> {session.responses.length}
                              </div>
                              <div>
                                <span className="font-medium">Messages:</span> {session.messages.length}
                              </div>
                              <div>
                                <span className="font-medium">Insights:</span> {session.insights.length}
                              </div>
                            </div>

                            {/* Full Transcript (All Messages) */}
                            {session.messages.length > 0 && (
                              <details className="mt-3 border rounded-lg p-3">
                                <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2">
                                  📝 Full Transcript ({session.messages.length} messages)
                                </summary>
                                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto bg-gray-50 p-3 rounded">
                                  {session.messages.map((message, idx) => (
                                    <div key={message.id} className="border-b border-gray-200 pb-2 last:border-0">
                                      <div className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-700 min-w-[100px]">
                                          {message.sender}:
                                        </span>
                                        <span className="text-gray-700 flex-1 whitespace-pre-wrap">
                                          {message.content}
                                        </span>
                                        <span className="text-xs text-gray-400 min-w-[80px] text-right">
                                          {new Date(message.createdAt || session.createdAt).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            {/* All Responses */}
                            {session.responses.length > 0 && (
                              <details className="mt-3 border rounded-lg p-3">
                                <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2">
                                  💬 All Responses ({session.responses.length})
                                </summary>
                                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                                  {session.responses.map((response) => (
                                    <div key={response.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                                      <div className="font-medium text-blue-600 mb-2">{response.persona.name}</div>
                                      <div className="text-gray-700 mb-2">
                                        <strong className="text-gray-800">Question:</strong>
                                        <div className="mt-1 ml-2 whitespace-pre-wrap">{response.question}</div>
                                      </div>
                                      <div className="text-gray-700 mb-2">
                                        <strong className="text-gray-800">Answer:</strong>
                                        <div className="mt-1 ml-2 whitespace-pre-wrap">{response.answer}</div>
                                      </div>
                                      {response.reasoning && (
                                        <div className="text-gray-600 text-sm mt-2 italic bg-white p-2 rounded border-l-2 border-blue-300">
                                          <strong>Reasoning:</strong>
                                          <div className="mt-1 ml-2 whitespace-pre-wrap">{response.reasoning}</div>
                                        </div>
                                      )}
                                      {response.metadata && (
                                        <details className="mt-2">
                                          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                            View Metadata
                                          </summary>
                                          <pre className="text-xs mt-1 bg-white p-2 rounded overflow-x-auto">
                                            {typeof response.metadata === 'string' 
                                              ? response.metadata 
                                              : JSON.stringify(response.metadata, null, 2)}
                                          </pre>
                                        </details>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            {/* All Insights */}
                            {session.insights.length > 0 && (
                              <details className="mt-3 border rounded-lg p-3">
                                <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2">
                                  💡 All Insights ({session.insights.length})
                                </summary>
                                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                                  {session.insights.map((insight) => (
                                    <div key={insight.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                                      <div className="flex items-start justify-between mb-2">
                                        <span className="font-semibold text-blue-800 capitalize">
                                          {insight.type}
                                        </span>
                                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                                          Confidence: {(insight.confidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="text-gray-700 whitespace-pre-wrap">
                                        {insight.content}
                                      </div>
                                      {insight.citations && (
                                        <details className="mt-2">
                                          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                                            View Citations
                                          </summary>
                                          <pre className="text-xs mt-1 bg-white p-2 rounded overflow-x-auto">
                                            {typeof insight.citations === 'string' 
                                              ? insight.citations 
                                              : JSON.stringify(insight.citations, null, 2)}
                                          </pre>
                                        </details>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {projects.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.sessions.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.personas.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Personas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => 
                      sum + p.sessions.reduce((sSum, s) => sSum + s.responses.length, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Responses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => 
                      sum + p.sessions.reduce((sSum, s) => sSum + s.messages.length, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


