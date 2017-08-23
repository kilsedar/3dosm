function isJSON (str) {
  try {
    JSON.parse(str);
  }
  catch (e) {
    return false;
  }
  return true;
}

function sortNumber(a, b) {
  return a-b;
}
