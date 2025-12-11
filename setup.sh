#!/bin/bash
set -e

# 1. Update & Install Dependencies
echo "🔄 Updating system..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    echo "✅ Docker already installed."
fi

# 3. Validation
echo "🔍 Verifying installation..."
sudo docker --version
sudo docker compose version

echo "✨ Setup Complete! You can now clone your repo and run: docker compose up -d"
