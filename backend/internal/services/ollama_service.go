package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type OllamaService struct {
	BaseURL string
}

func NewOllamaService() *OllamaService {
	// host.docker.internal is available if launched via docker-compose with extra_hosts
	// If run locally via `go run main.go`, localhost works too.
	baseURL := os.Getenv("OLLAMA_URI")
	if baseURL == "" {
		baseURL = "http://localhost:11434"
	}
	return &OllamaService{BaseURL: baseURL}
}

type GenerateRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type GenerateResponse struct {
	Response string `json:"response"`
}

func (s *OllamaService) GenerateDockerfile(fileList, model, previousError string) (string, error) {
	prompt := fmt.Sprintf(`You are an expert DevOps engineer and a system Dockerfile generator.
I have a project with the following file structure.
%s
`, fileList)

	if previousError != "" {
		prompt += fmt.Sprintf(`
WARNING: We previously tried to build an image for this project, but it failed with the following error log:
<error>
%s
</error>

Please rewrite the Dockerfile to specifically address and mitigate this error. If a requirement file is missing in the file list, do NOT try to install it. If a build step is failing, bypass it or mock it gracefully so the container can still launch.
`, previousError)
	}

	prompt += `
Analyze this structure and return ONLY a valid raw Dockerfile. 
CRITICAL: Ensure the application inside the container binds to 0.0.0.0 (not 127.0.0.1 or localhost).
CRITICAL: Match the EXPOSE port exactly to what the application listens on.
Do not use markdown blocks like ` + "```docker" + `. Do not provide any conversational text, explanations, or formatting. Output only the exact text content of the Dockerfile.
`

	reqBody := GenerateRequest{
		Model:  model,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, _ := json.Marshal(reqBody)
	resp, err := http.Post(s.BaseURL+"/api/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// Use fallback localhost if host.docker.internal fails (when running directly `go run`)
		if s.BaseURL != "http://localhost:11434" {
			resp, err = http.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(jsonData))
		}
		if err != nil {
			return "", fmt.Errorf("failed to reach local ollama: %v", err)
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ollama API returned status %d: %s", resp.StatusCode, string(b))
	}

	var parsed GenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return "", err
	}

	// Remove markdown codeblock tags if the model fails to follow strict instructions
	cleanData := parsed.Response
	for _, wrapper := range []string{"```docker", "```Dockerfile", "```bash", "```"} {
		if len(cleanData) > len(wrapper) && cleanData[:len(wrapper)] == wrapper {
			cleanData = cleanData[len(wrapper):]
		}
		if len(cleanData) > 3 && cleanData[len(cleanData)-3:] == "```" {
			cleanData = cleanData[:len(cleanData)-3]
		}
	}

	for _, wrapper := range []string{"```"} {
		cleanData = strings.ReplaceAll(cleanData, wrapper, "")
	}

	return strings.TrimSpace(cleanData), nil
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type ChatResponse struct {
	Message Message `json:"message"`
}

func (s *OllamaService) Chat(msgs []Message) (string, error) {
	// Enforce system string at the start implicitly
	systemMsg := Message{
		Role:    "system",
		Content: "You are the 0ops2Ops AI Assistant, a specialized AI for DevSecOps, Infrastructure, and deployment debugging. Keep responses helpful and technical.",
	}
	
	finalMsgs := append([]Message{systemMsg}, msgs...)

	reqBody := ChatRequest{
		Model:    "qwen2.5:3b", // Switched to a blazing fast model based on user specs
		Messages: finalMsgs,
		Stream:   false,
	}

	jsonData, _ := json.Marshal(reqBody)
	resp, err := http.Post(s.BaseURL+"/api/chat", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		if s.BaseURL != "http://localhost:11434" {
			resp, err = http.Post("http://localhost:11434/api/chat", "application/json", bytes.NewBuffer(jsonData))
		}
		if err != nil {
			return "", fmt.Errorf("failed to reach local ollama: %v", err)
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ollama chat API Error: %s", string(b))
	}

	var parsed ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return "", err
	}

	return parsed.Message.Content, nil
}
