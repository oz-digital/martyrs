function parseCookie(cookieString) {
  const cookieObject = {};
  const keyValuePairs = cookieString.split('; ');
  keyValuePairs.forEach(keyValuePair => {
    const [key, value] = keyValuePair.split('=');
    cookieObject[key] = decodeURIComponent(value);
  });
  return cookieObject;
}
export default parseCookie;
