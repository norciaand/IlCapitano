const { readFileSync, writeFileSync } = require("fs")
const { DATA_PATH } = require("./configs")

const loadData = () => {
    try {
        const data = readFileSync(DATA_PATH)
        return JSON.parse(data)
    } catch (_) {
        // Error loading data
        return {}
    }
}

const saveData = (data) => {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

/* 
    This function is a wrapper around the OpenAI Chat API 
    that allows you to use custom functions in the assistant's 
    responses.

    The function takes an object with the following properties:
    - openai: an instance of the OpenAI API
    - messages: an array of messages that will be sent to the assistant
    - model: the name of the model to use (default: "gpt-3.5-turbo")
    - prompt: the initial prompt to send to the assistant
    - functions: an array of custom functions that the assistant can call

    The function returns a Promise that resolves with the assistant's response.
*/
const completionWithFunctions = async (options) => {
    const {
        openai,
        messages,
        model = "gpt-3.5-turbo",
        prompt,
        functions
    } = options

    const tools = functions.map(({ definition }) => ({
        type: "function",
        function: definition
    }))

    // Add the prompt to the list of messages
    messages.push({
        role: "user",
        content: prompt
    })

    const firstCompletion = await openai.chat.completions.create({
        model,
        messages,
        tools
    })

    const firstMessage = firstCompletion.choices[0].message
    const { tool_calls } = firstMessage

    // Add the message to the list of messages
    messages.push(firstMessage)

    if (tool_calls) {
        // The assistant has requested one or more tool calls
        for (const toolCall of tool_calls) {
            const functionName = toolCall.function.name
            const functionArguments = JSON.parse(toolCall.function.arguments)

            const targetFunction = functions.find(({ definition }) => definition.name === functionName)
            if (!targetFunction) {
                throw new Error(`Function ${functionName} not found`)
            }

            const functionHandler = await targetFunction.handler
            const result = functionHandler(functionArguments)

            // Add the result to the list of messages
            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            })
        }

        const secondCompletion = await openai.chat.completions.create({
            model,
            messages,
        })

        const secondMessage = secondCompletion.choices[0].message

        // Add the message to the list of messages
        messages.push(secondMessage)

        return secondMessage.content
    } else {
        // The assistant has not requested any tool calls
        return firstMessage.content
    }
}

// Put here other utility functions that can be used in the whole project

module.exports = {
    loadData,
    saveData,
    completionWithFunctions
}