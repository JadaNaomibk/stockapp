export function addressToMapEmbed(address){
  const q = encodeURIComponent(String(address||'New York, NY'));
  return `https://www.google.com/maps?q=${q}&output=embed`;
}
