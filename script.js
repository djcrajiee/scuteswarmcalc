// Initialize the Playing Field
document.addEventListener("DOMContentLoaded", () => {
  const playingField = document.getElementById("playingField");
  playingField.innerHTML = ""; // Clear any existing tokens
  updatePlayingFieldIndicator(); // Update the field indicator to reflect no tokens
});

// Play Land Button Logic
document.getElementById("playLandButton").addEventListener("click", () => {
  const sixOrMoreLands = document.getElementById("sixOrMoreLands").checked;
  const tokenDoublers = parseInt(document.getElementById("tokenDoublers").value) || 0;

  const tokenContainer = document.getElementById("tokens");
  tokenContainer.innerHTML = ""; // Clear previous tokens

  if (!sixOrMoreLands) {
    // Generate Insect Tokens
    let totalTokens = 1; // Base 1 token per land drop
    if (tokenDoublers > 0) totalTokens *= Math.pow(2, tokenDoublers); // Apply doublers
    generateTokens("insect_token.jpeg", "Insect", totalTokens);
  } else {
    // Generate Scute Swarm Tokens
    const scuteSwarmCount = Array.from(document.querySelectorAll("#playingField .token-wrapper"))
      .filter((token) => token.dataset.type === "Scute Swarm")
      .reduce((sum, token) => sum + parseInt(token.dataset.quantity), 0);

    // If no Scute Swarms are in play, generate at least 1 token
    let totalTokens = scuteSwarmCount > 0 ? scuteSwarmCount : 1;

    if (tokenDoublers > 0) totalTokens *= Math.pow(2, tokenDoublers); // Apply doublers
    generateTokens("scute_swarm.jpeg", "Scute Swarm", totalTokens);
  }
});

// Generate Tokens
function generateTokens(imageSrc, type, quantity) {
  if (quantity === 0) return; // Prevent generating tokens with quantity 0
  const tokenContainer = document.getElementById("tokens");

  const tokenDiv = document.createElement("div");
  tokenDiv.className = "token-wrapper";
  tokenDiv.dataset.type = type;
  tokenDiv.dataset.quantity = quantity;
  tokenDiv.dataset.sickness = "true"; // Mark with summoning sickness
  tokenDiv.innerHTML = `
    <div class="token">
      <img src="${imageSrc}" alt="${type}" class="token-image">
      <span class="quantity-indicator">x${quantity}</span>
    </div>
  `;

  // Add Remove Button
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove Token";
  removeButton.className = "remove-btn";
  removeButton.addEventListener("click", () => {
    removeTokenFromStack(tokenDiv);
  });

  tokenDiv.appendChild(removeButton);
  tokenContainer.appendChild(tokenDiv);
}

// Start Scute Swarm Button Logic
document.getElementById("startScuteSwarm").addEventListener("click", () => {
  addToPlayingField("Scute Swarm", 1, true); // Add 1 Scute Swarm with summoning sickness
  updatePlayingFieldIndicator();
});

// Move Tokens to Playing Field
document.getElementById("moveToField").addEventListener("click", () => {
  const tokens = document.querySelectorAll("#tokens .token-wrapper");
  const playingField = document.getElementById("playingField");

  tokens.forEach((tokenWrapper) => {
    const type = tokenWrapper.dataset.type;
    const quantity = parseInt(tokenWrapper.dataset.quantity);
    const hasSickness = tokenWrapper.dataset.sickness === "true";
    addToPlayingField(type, quantity, hasSickness);
    tokenWrapper.remove();
  });

  updatePlayingFieldIndicator();
});

// Add to Playing Field
function addToPlayingField(type, quantity, hasSickness) {
  const playingField = document.getElementById("playingField");

  let existingStack = Array.from(playingField.children).find(
    (child) => child.dataset.type === type && child.dataset.sickness === (hasSickness ? "true" : "false")
  );

  if (existingStack) {
    let existingQuantity = parseInt(existingStack.dataset.quantity);
    existingQuantity += quantity;
    existingStack.dataset.quantity = existingQuantity;
    existingStack.querySelector(".quantity-indicator").textContent = `x${existingQuantity}`;
  } else {
    const tokenDiv = document.createElement("div");
    tokenDiv.className = `token-wrapper ${hasSickness ? "sick" : ""}`;
    tokenDiv.dataset.type = type;
    tokenDiv.dataset.quantity = quantity;
    tokenDiv.dataset.sickness = hasSickness ? "true" : "false";
    tokenDiv.innerHTML = `
      <div class="token">
        <img src="${type === "Insect" ? "insect_token.jpeg" : "scute_swarm.jpeg"}" alt="${type}" class="token-image">
        <span class="quantity-indicator">x${quantity}</span>
      </div>
    `;

    // Add Remove Button
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove Token";
    removeButton.className = "remove-btn";
    removeButton.addEventListener("click", () => {
      removeTokenFromStack(tokenDiv);
    });

    tokenDiv.appendChild(removeButton);
    playingField.appendChild(tokenDiv);
  }
}

// Pass Turn Button Logic
document.getElementById("passTurn").addEventListener("click", () => {
  const tokensWithSickness = document.querySelectorAll("#playingField .token-wrapper[data-sickness='true']");

  tokensWithSickness.forEach((token) => {
    const type = token.dataset.type;
    const quantity = parseInt(token.dataset.quantity);

    // Merge the tokens into the main stack without summoning sickness
    addToPlayingField(type, quantity, false);

    // Remove the token with summoning sickness
    token.remove();
  });

  updatePlayingFieldIndicator();
});

// Remove Token from Stack
function removeTokenFromStack(tokenDiv) {
  let quantity = parseInt(tokenDiv.dataset.quantity);

  if (quantity > 1) {
    quantity -= 1;
    tokenDiv.dataset.quantity = quantity;
    tokenDiv.querySelector(".quantity-indicator").textContent = `x${quantity}`;
  } else {
    tokenDiv.remove();
  }

  updatePlayingFieldIndicator();
}

// Update Playing Field Indicator
function updatePlayingFieldIndicator() {
  const insects = document.querySelectorAll("#playingField .token-wrapper[data-type='Insect']");
  const scuteSwarms = document.querySelectorAll("#playingField .token-wrapper[data-type='Scute Swarm']");

  const insectCount = Array.from(insects).reduce((sum, token) => sum + parseInt(token.dataset.quantity), 0);
  const scuteSwarmCount = Array.from(scuteSwarms).reduce((sum, token) => sum + parseInt(token.dataset.quantity), 0);

  document.getElementById("playingFieldIndicator").textContent = `Insects: ${insectCount} | Scute Swarms: ${scuteSwarmCount}`;
}
