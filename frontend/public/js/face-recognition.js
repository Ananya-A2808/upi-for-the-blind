// Load Face-API.js models
async function loadFaceRecognitionModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]);
}

// Compare two face images
async function compareFaces(image1, image2) {
  try {
    // Convert base64 to Blob
    const blob1 = await fetch(image1).then(r => r.blob());
    const blob2 = await fetch(image2).then(r => r.blob());

    // Detect faces
    const face1 = await faceapi.detectSingleFace(
      await faceapi.bufferToImage(blob1),
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    const face2 = await faceapi.detectSingleFace(
      await faceapi.bufferToImage(blob2),
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    if (!face1 || !face2) {
      throw new Error('No face detected in one or both images');
    }

    // Compare face descriptors
    const distance = faceapi.euclideanDistance(
      face1.descriptor,
      face2.descriptor
    );

    // Distance threshold (adjust as needed)
    const threshold = 0.6;
    return distance < threshold;
  } catch (error) {
    console.error('Face comparison error:', error);
    return false;
  }
} 