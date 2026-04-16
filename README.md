# AI-Powered Feature #

## Overview ##
This is a simple AI-powered caption generator where users can type in a description and pick a tone. Users can also pick between two different AI models. The AIs will output a caption with five hashtags.

## What is the feature? ##
Thid caption generator accepts a description and tone. Then the AI model generates a caption. The results are returned through REST API endpoint and displayed to the user.

## What API service did I use? ##
The two API services I used where Ollama and Google Gemini API for caption generation.

## How do you run it ##
Ollama only runs locally as it is just the free service. Ollama will not work when deployed.
To run locally:
1. Install dependencies - npm install
2. Set up your environmental variables in your `.env` file. With your Gemini API key.
3. Start the server - node server.js
4. The server is now running on `http://localhost:3000`
5. Run Ollama - `ollama run llama3.2` (Ollama must be installed first)
6. Everything should now be up and running on the localhost
7. To view the frontend now open the `index.html` file in your browser
