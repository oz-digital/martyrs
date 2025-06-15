import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
async function verifyAppleIdToken(id_token) {
  // Decode the token (without verification)
  const decodedToken = jwt.decode(id_token, { complete: true });
  if (!decodedToken) {
    throw new Error('Failed to decode token.');
  }
  // Check iss claim
  if (decodedToken.payload.iss !== 'https://appleid.apple.com') {
    throw new Error('Invalid issuer.');
  }
  // Check aud claim - Replace YOUR_APP_CLIENT_ID with your client ID
  if (decodedToken.payload.aud !== process.env.APPLE_CLIENTID) {
    throw new Error('Invalid audience.');
  }
  // Ensure the token has not expired
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp > decodedToken.payload.exp) {
    throw new Error('Token has expired.');
  }
  // Fetch Apple's public keys
  const applePublicKeys = await fetch('https://appleid.apple.com/auth/keys')
    .then(response => response.json())
    .catch(err => {
      throw new Error('Failed to fetch Apple public keys.');
    });
  const appleKey = applePublicKeys.keys.find(key => key.kid === decodedToken.header.kid);
  if (!appleKey) {
    throw new Error('Invalid token key ID.');
  }
  // Convert JWK to PEM
  const pem = jwkToPem(appleKey);
  // Verify the token's signature using the PEM
  try {
    jwt.verify(id_token, pem, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
    });
  } catch (err) {
    console.log(err);
    throw new Error('Token signature verification failed.');
  }
  return decodedToken.payload; // or return the entire payload, depending on your needs
}
export { verifyAppleIdToken };
export default {
  verifyAppleIdToken,
};
