/** Returns a stable visual tone for a tag name. */
export const tagTone = tag => {
  const characters = Array.from(String(tag).toLowerCase());
  const hash = characters.reduce((value, character) => {
    return (value * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);

  return hash % 4;
};
