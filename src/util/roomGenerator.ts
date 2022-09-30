export async function generateName() {
  const length = 10;
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (var i = length; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

export async function generatePasscode() {
  return (Math.floor(Math.random() * 90000) + 10000).toString();
}
