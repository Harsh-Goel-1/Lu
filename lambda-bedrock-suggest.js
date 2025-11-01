const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { title, goal } = JSON.parse(event.body);
    
    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
    
    const prompt = `Write a compelling 2-3 sentence crowdfunding campaign description for: "${title}". Goal: ${goal} APT. Be concise, inspiring, and action-oriented.`;
    
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ description: result.content[0].text })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
