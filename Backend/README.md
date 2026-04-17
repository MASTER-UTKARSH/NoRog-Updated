# NoRog Backend

Minimal Express backend for symptom-based disease prediction.

## Run

```bash
npm install
npm start
```

Server runs on:

```bash
http://localhost:5000
```

## API

`POST /predict`

Request body:

```json
{
  "symptoms": ["fever", "fatigue"]
}
```

Success response:

```json
{
  "prediction": ["Flu"],
  "reason": ["fever", "fatigue"]
}
```

Validation error:

```json
{
  "error": "Symptoms are required and must be a non-empty array."
}
```
