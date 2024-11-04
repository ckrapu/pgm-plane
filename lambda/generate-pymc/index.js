const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: ''
        };
    }

    try {
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const body = JSON.parse(event.body);
        const { state } = body;

        const prompt = `Give me a PyMC model that implements your best guess at a probabilistic model for a graphical model specification from this JSON dict. 
* Use PyMC v5
* Use synthetic data placeholders; simulate the data in the beginning of the script
- Return ONLY the code with no commentary

Here is the JSON. Use the parents and variable names to inform the structuring of the code:
${JSON.stringify(state, null, 2)}`;

        const message = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: JSON.stringify({
                code: message.content[0].text
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to generate PyMC code'
            })
        };
    }
};
