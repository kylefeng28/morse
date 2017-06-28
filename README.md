## RESTful API
- `POST /send`: Begin sending a signal
  - Example: `{ "input": ".... . .-.. .-.. ---" }`
- `POST /encode`: Encode a string
  - Example: `{ "input": "hello" }`
- `POST /encode/send`: Encode a string and begin sending
  - Example: `{ "input": "hello" }`
- `POST /signal/on`: Set the signal state to on
- `POST /signal/off`: Set the signal state to off
