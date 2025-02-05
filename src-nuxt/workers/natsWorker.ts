self.onmessage = (event: MessageEvent): void => {
  const { message } = event.data

  if (message) {
    // Simule un traitement lourd
    const processedMessage = `[Web Workers] Processed: ${message}`

    // Envoie le message traité au thread principal
    self.postMessage({ processedMessage })
  }
}
