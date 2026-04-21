package controllers

import (
	"backend/internal/services"
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type FirewallRule struct {
	Target  string `json:"target"`
	Prot    string `json:"prot"`
	Details string `json:"details"`
}

type FirewallActionReq struct {
	Action string `json:"action"` // "block" or "allow_port"
	IP     string `json:"ip,omitempty"`
	Port   string `json:"port,omitempty"`
}

func GetFirewallRules(c *gin.Context) {
	svc, err := services.NewFirewallService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Service Init Failed: " + err.Error()})
		return
	}

	out, err := svc.RunIptables(context.Background(), "-S")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read rules: " + err.Error()})
		return
	}

	rules := parseRules(out)

	c.JSON(http.StatusOK, gin.H{"success": true, "rules": rules})
}

func parseRules(raw string) []FirewallRule {
	var rules []FirewallRule
	lines := strings.Split(raw, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "-P") || strings.HasPrefix(line, "-N") {
			// Skip policies and chain creations
			continue
		}

		if strings.HasPrefix(line, "-A") {
			parts := strings.Fields(line)
			// typical iptables -S output:
			// -A INPUT -s 192.168.1.50/32 -j DROP
			// -A INPUT -p tcp -m tcp --dport 8080 -j ACCEPT

			rule := FirewallRule{
				Target:  "UNKNOWN",
				Prot:    "all",
				Details: line[3:],
			}

			for i, p := range parts {
				if p == "-j" && i+1 < len(parts) {
					rule.Target = parts[i+1]
				}
				if p == "-p" && i+1 < len(parts) {
					rule.Prot = parts[i+1]
				}
			}

			rules = append(rules, rule)
		}
	}
	return rules
}

func MutateFirewall(c *gin.Context) {
	var req FirewallActionReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action body"})
		return
	}

	svc, err := services.NewFirewallService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Service Init Failed: " + err.Error()})
		return
	}

	// WARNING: We should validate IPs and Ports strongly here to avoid OS injection.
	// We'll perform basic sanitation by restricting space characters.
	if strings.ContainsAny(req.IP, " \t\n;") || strings.ContainsAny(req.Port, " \t\n;") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid characters in parameters"})
		return
	}

	switch req.Action {
	case "block":
		if req.IP == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "IP required for block action"})
			return
		}
		// Appending rule: DROP traffic from IP
		_, err = svc.RunIptables(context.Background(), "-A", "INPUT", "-s", req.IP, "-j", "DROP")

	case "allow_port":
		if req.Port == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Port required for allow action"})
			return
		}
		// Appending rule: ACCEPT TCP routing on PORT
		_, err = svc.RunIptables(context.Background(), "-A", "INPUT", "-p", "tcp", "--dport", req.Port, "-j", "ACCEPT")

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown action type"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to apply firewall rule: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
