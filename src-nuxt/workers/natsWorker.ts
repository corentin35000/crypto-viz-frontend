self.onmessage = (event: MessageEvent): void => {
  const { message } = event.data

  if (message) {
    // Simule un traitement lourd

    // Envoie le message traité au thread principal
    self.postMessage({ message })
  }
}
