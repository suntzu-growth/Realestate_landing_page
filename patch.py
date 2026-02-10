import requests

url = "https://api.elevenlabs.io/v1/convai/agents/agent_5601kghqc0tvfsttyc17dq11w159"
headers = {
    "xi-api-key": "1a23532e95fd394ab2c658e4df0ce2c6ee2a8faf472b99e595adf34da6c30769",
    "Content-Type": "application/json"
}
data = {
    "conversation_config": {
        "llm_config": {
            "backup_llm_config": {
                "preference": "disabled"
            }
        }
    }
}

response = requests.patch(url, json=data, headers=headers)
print(response.json())
