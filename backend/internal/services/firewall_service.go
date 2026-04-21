package services

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

type FirewallService struct {
	DockerClient *client.Client
}

func NewFirewallService() (*FirewallService, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &FirewallService{DockerClient: cli}, nil
}

// RunIptables executes an iptables command dynamically on the host networking stack
// using a privileged ephemeral Alpine container via the Docker Daemon socket mount.
func (s *FirewallService) RunIptables(ctx context.Context, cmdArgs ...string) (string, error) {
	// 1. Prepare image if not exists
	_, _, err := s.DockerClient.ImageInspectWithRaw(ctx, "alpine:latest")
	if err != nil {
		reader, err := s.DockerClient.ImagePull(ctx, "docker.io/library/alpine:latest", types.ImagePullOptions{})
		if err != nil {
			return "", err
		}
		io.Copy(os.Stdout, reader)
		reader.Close()
	}

	// 2. Assemble shell command wrapper to ensure iptables is installed
	fullCmd := append([]string{"apk", "add", "--no-cache", "iptables", "&&", "iptables"}, cmdArgs...)
	shellCmd := []string{"/bin/sh", "-c", strings.Join(fullCmd, " ")}

	// 3. Configure a privileged, host-network container
	config := &container.Config{
		Image: "alpine:latest",
		Cmd:   shellCmd,
	}

	hostConfig := &container.HostConfig{
		NetworkMode: "host",
		Privileged:  true,
		AutoRemove:  false, // We remove it manually to capture logs first
	}

	resp, err := s.DockerClient.ContainerCreate(ctx, config, hostConfig, nil, nil, "")
	if err != nil {
		return "", fmt.Errorf("failed to create firewall container: %v", err)
	}

	defer s.DockerClient.ContainerRemove(context.Background(), resp.ID, types.ContainerRemoveOptions{Force: true})

	// 4. Run it
	if err := s.DockerClient.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", fmt.Errorf("failed to start firewall container: %v", err)
	}

	statusCh, errCh := s.DockerClient.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return "", err
		}
	case <-statusCh:
	}

	// 5. Read output
	out, err := s.DockerClient.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return "", err
	}
	defer out.Close()

	// docker multiplexes stdout and stderr, use stdcopy
	stdout := new(strings.Builder)
	stderr := new(strings.Builder)
	stdcopy.StdCopy(stdout, stderr, out)

	if stderr.Len() > 0 && !strings.Contains(stderr.String(), "fetch http") {
		// Ignore alpine apk fetch logs in stderr
		return stdout.String(), fmt.Errorf("iptables error: %s", stderr.String())
	}

	return stdout.String(), nil
}
